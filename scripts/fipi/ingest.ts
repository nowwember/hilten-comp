/*
  FIPI ingest script (Node + Playwright) — RAW mode
  CLI: --exam=ege --level=basic --startPage=1 --endPage=1
  Rate-limit: 1 req/s, random delay 500–1200ms, retry=3
  userAgent: process.env.INGEST_USER_AGENT
*/

import type { FipiExam, FipiLevel } from '../../src/lib/fipi/types'
import { startBrowser, closeBrowser, withRetry } from './lib/browser'
import { sanitizeHtml, extractRawFromFrame } from './lib/html'
import { openFilterPanel, setTaskNumber } from './lib/frame-utils'
import { rawTaskPageFilePath } from './lib/paths'
import { delay, ensureDirSync, downloadAssetToPublic, sha256Hex, writeJsonPretty, saveDebugHtml } from './lib/io'
import * as path from 'path'
import * as fs from 'fs'

type Args = {
  exam: FipiExam
  level: FipiLevel
  mode: 'basic' | 'byTask'
  startPage: number
  endPage: number
  limit: number
  startTask?: number
  endTask?: number
  runToCoverage?: boolean
}

function parseArgs(): Args {
  const argv = process.argv.slice(2)
  const get = (k: string, def?: string) => {
    const key = `--${k}=`
    const hit = argv.find((a) => a.startsWith(key))
    return hit ? hit.slice(key.length) : def
  }
  const has = (k: string) => argv.some((a) => a === `--${k}`)
  return {
    exam: (get('exam', 'ege') as FipiExam),
    level: (get('level', 'basic') as FipiLevel),
    mode: (get('mode', 'byTask') as 'basic' | 'byTask'),
    startPage: Number(get('startPage', '1')),
    endPage: Number(get('endPage', '1')),
    limit: Number(get('limit', '600')),
    startTask: get('startTask') ? Number(get('startTask')) : undefined,
    endTask: get('endTask') ? Number(get('endTask')) : undefined,
    runToCoverage: has('runToCoverage')
  }
}

const FIPI_BASE = process.env.FIPI_BASE || 'https://ege.fipi.ru/bank/'
const START = process.env.FIPI_EGE_BASIC_START || FIPI_BASE
const RATE = Number(process.env.INGEST_RATE || '1')
const USER_AGENT = process.env.INGEST_USER_AGENT || 'HiltenComp Ingest bot (contact@example.com)'
const randDelay = async () => { const ms = 500 + Math.floor(Math.random() * 700); await delay(ms) }

// TODO: уточнить реальные селекторы на ege.fipi.ru/bank/
const SELECTORS = {
  subjectPicker: 'TODO-[data-subject="math-basic"]',
  taskListContainer: 'TODO-.task-list',
  taskCard: 'TODO-.task-card',
  nextPage: 'TODO-.pagination-next',
}

async function navigateToMathBasic(page: any) {
  // Consent/cookies
  try {
    const consent = page.getByRole?.('button', { name: /соглас/i }) || page.locator?.('button:has-text("Соглас")')
    if (consent) { await consent.click({ timeout: 3000 }).catch(() => {}) }
  } catch {}

  // Naive navigation via text selectors
  await withRetry(async () => {
    await page.getByRole('link', { name: /егэ/i }).first().click({ timeout: 10000 })
  }, 3).catch(() => {})

  await withRetry(async () => {
    await page.getByRole('link', { name: /математик/i }).first().click({ timeout: 10000 })
  }, 3).catch(() => {})

  await withRetry(async () => {
    await page.getByRole('link', { name: /базов/i }).first().click({ timeout: 10000 })
  }, 3).catch(() => {})

  // Wait for task list container if possible
  try { await page.waitForSelector(SELECTORS.taskListContainer, { timeout: 5000 }) } catch {}
}

async function main() {
  const args = parseArgs()
  const { exam, level, mode, startPage, endPage, limit, startTask, endTask, runToCoverage } = args
  if (exam !== 'ege' || level !== 'basic') {
    console.error('Only ege/basic supported in this micro version.')
    process.exitCode = 1
    return
  }

  const from = Math.max(1, startPage)
  const to = Math.max(from, endPage)

  const { browser, page } = await startBrowser(USER_AGENT)
  try {
    await withRetry(async () => {
      await page.goto(START, { waitUntil: 'domcontentloaded', timeout: 60000 })
    }, 3)
    // Verify we are on EGE basic bank
    const contentText = await page.content()
    if (!/Открытый банк заданий ЕГЭ/i.test(contentText) || !/Математика\.\s*Базовый уровень/i.test(contentText)) {
      console.error('Unexpected landing page. Current URL:', page.url())
      throw new Error('EGE basic header not found')
    }

    // wait for iframe and get frame
    await page.waitForSelector('iframe#questions_container', { timeout: 10000 })
    const frame = page.frames().find((f: any) => (typeof f.name === 'function' && f.name()?.includes('questions_container')) || (typeof f.url === 'function' && f.url()?.includes('questions.php')) ) || page.frames().find((f: any) => (f as any)._name === 'questions_container')
    if (!frame) throw new Error('questions_container frame not found: ' + page.url())

    if (mode === 'byTask') {
      const tStart = Math.max(1, startTask || 1)
      const tEnd = Math.max(tStart, endTask || 11)
      let savedTotal = 0
      for (let taskNo = tStart; taskNo <= tEnd; taskNo++) {
        await openFilterPanel(frame)
        await setTaskNumber(frame, taskNo)
        let savedTask = 0
        for (let p = from; p <= to; p++) {
          if (savedTask >= limit) break
          const items = await extractRawFromFrame(frame)
          let real = 0, synthetic = 0
          for (let idx = 0; idx < items.length; idx++) {
            const it = items[idx]
            if (it.idSynthetic) synthetic++; else real++
            const assets: string[] = []
            for (const u of it.assetsUrls || []) {
              try { const saved = await downloadAssetToPublic(u); if (saved) assets.push(saved) } catch {}
            }
            const accessed_at = new Date().toISOString()
            const statement_html = sanitizeHtml(it.statement_html || '')
            const statement_text = (it.statement_text || '').trim()
            const checksum = sha256Hex(statement_html)
            const fipiIdRaw = it.fipiId
            const safeId = fipiIdRaw && typeof fipiIdRaw === 'string' && fipiIdRaw.length > 0 ? fipiIdRaw : `hx-${checksum.slice(0,12)}`
            const outFile = rawTaskPageFilePath('ege','basic',taskNo,p,safeId)
            ensureDirSync(path.dirname(outFile))
            const data = { exam: 'ege', level: 'basic', taskNo, fipiId: safeId, idSynthetic: !!it.idSynthetic || !fipiIdRaw, idMethod: it.idMethod || (fipiIdRaw ? 'unknown' : 'hash'), statement_html, statement_text, assets, answer: null as any, source_url: it.source_url || START, accessed_at, checksum }
            try { await fs.promises.access(outFile) }
            catch { await writeJsonPretty(outFile, data); savedTask++; savedTotal++ }
          }
          console.log(`byTask: task ${taskNo} page ${p}: real ${real} synthetic ${synthetic}`)
          if (p < to) {
            try {
              const link = await frame.$(`text=^${p+1}$`)
              if (link) { await link.click({ timeout: 3000 }); await frame.waitForLoadState('domcontentloaded', { timeout: 15000 }) }
              else {
                const url = new URL(frame.url()); url.searchParams.set('page', String(p+1)); await frame.goto(url.toString(), { waitUntil: 'domcontentloaded', timeout: 20000 })
              }
            } catch {}
          }
          if (savedTask >= limit) break
        }
        // After each task batch run curate and coverage
        try { await require('child_process').execSync('npx tsx scripts/fipi/curate.ts --exam=ege --level=basic --limit=2000', { stdio: 'inherit' }) } catch {}
        try { await require('child_process').execSync('npx tsx scripts/fipi/report-coverage.ts', { stdio: 'inherit' }) } catch {}
        if (runToCoverage) {
          // simple break condition relies on external coverage gate; no-op here
        }
      }
      console.log('byTask saved total:', savedTotal)
      return
    }

    // basic mode
    let saved = 0
    for (let p = from; p <= to; p++) {
      // Pagination: try paginator clicks in frame, then fallback to URL param
      let finalUrl = page.url()
      if (p > from) {
        try {
          await withRetry(async () => {
            // naive: click by text inside frame paginator
            const handle = await frame.$(`text=^${p}$`)
            if (handle) await handle.click({ timeout: 5000 })
          }, 3)
          await frame.waitForLoadState?.('domcontentloaded', { timeout: 60000 })
          finalUrl = frame.url()
        } catch {
          try {
            const url = new URL(frame.url())
            url.searchParams.set('page', String(p))
            await withRetry(async () => { await frame.goto(url.toString(), { waitUntil: 'domcontentloaded', timeout: 60000 }) }, 3)
            finalUrl = frame.url()
          } catch {}
        }
      }
      console.log(`Visiting page ${p} (frameURL=${finalUrl})`)

      const items = await extractRawFromFrame(frame)
      let real = 0, synthetic = 0, debugSaved = 0
      for (let idx = 0; idx < items.length; idx++) {
        const it = items[idx]
        if (it.idSynthetic) synthetic++; else real++
        const assets: string[] = []
        for (const u of it.assetsUrls || []) {
          try {
            const saved = await downloadAssetToPublic(u)
            if (saved) {
              assets.push(saved)
              // replace original src in HTML with relative path
              if (it.statement_html) {
                try {
                  const escaped = u.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
                  it.statement_html = it.statement_html.replace(new RegExp(escaped, 'g'), saved)
                } catch {}
              }
            }
          } catch (e) {
            console.warn('Asset download failed', u, e)
          }
        }

        const accessed_at = new Date().toISOString()
        const statement_html = sanitizeHtml(it.statement_html || '')
        const statement_text = (it.statement_text || '').trim()
        const checksum = sha256Hex(statement_html)
        const fipiId = it.fipiId
        const source_url = it.source_url || FIPI_BASE

        const outDir = path.join(process.cwd(), 'data', 'fipi', '_raw', 'ege', 'basic', String(p))
        ensureDirSync(outDir)
        const outFile = path.join(outDir, `${fipiId}.json`)
        const data = { fipiId, idSynthetic: !!it.idSynthetic, idMethod: it.idMethod || 'unknown', statement_html, statement_text, assets, answer: null as any, source_url, accessed_at, checksum }
        try { await fs.promises.access(outFile); console.log('Skip (exists):', outFile) } 
        catch { await writeJsonPretty(outFile, data); console.log('Saved:', outFile); saved += 1 }

        if (process.env.DEBUG_SAVE_HTML === '1' && (it.idMethod === 'hash' || it.idSynthetic)) {
          const rel = path.posix.join('debug', `card-p${p}-i${idx}-${fipiId}.html`)
          await saveDebugHtml(rel, it.statement_html || '')
          debugSaved++
        }

        await delay(1000 / Math.max(1, RATE))
        await randDelay()
      }
      console.log(`Page ${p} id stats: { real: ${real}, synthetic: ${synthetic} }, debug dumps saved: ${debugSaved} (flag=DEBUG_SAVE_HTML)`)
    }
    console.log('Saved RAW items:', saved)
    try { await require('child_process').execSync('npx tsx scripts/fipi/curate.ts --exam=ege --level=basic --limit=2000', { stdio: 'inherit' }) } catch {}
    try { await require('child_process').execSync('npx tsx scripts/fipi/report-coverage.ts', { stdio: 'inherit' }) } catch {}
  } finally {
    await closeBrowser(browser)
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})


