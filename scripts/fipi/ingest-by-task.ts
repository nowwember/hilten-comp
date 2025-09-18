/*
  FIPI ingest by task number (EGE basic)
*/
import * as fs from 'fs'
import * as path from 'path'
import { startBrowser, closeBrowser, withRetry } from './lib/browser'
import { sanitizeHtml, getFipiIdFromStrings } from './lib/html'
import { ensureDirSync, downloadAssetToPublic, sha256Hex, writeJsonPretty, saveDebugHtml, delay } from './lib/io'
import { rawTaskPageFilePath, rawTaskPageDir } from './lib/paths'
import { openFilterPanel, setTaskNumber } from './lib/frame-utils'

const EXAM = process.env.EXAM || 'ege'
const LEVEL = process.env.LEVEL || 'basic'
const START_TASK = Number(process.env.START_TASK || '1')
const END_TASK = Number(process.env.END_TASK || '11')
const START_PAGE = Number(process.env.START_PAGE || '1')
const END_PAGE = Number(process.env.END_PAGE || '50')
const LIMIT = Number(process.env.LIMIT || '600')
const FIPI_BASE = process.env.FIPI_EGE_BASIC_START || 'https://ege.fipi.ru/bank/'
const USER_AGENT = process.env.INGEST_USER_AGENT || 'HiltenComp Ingest bot'

async function main() {
  if (EXAM !== 'ege' || LEVEL !== 'basic') {
    console.error('Only ege/basic supported')
    process.exit(1)
  }

  const { browser, page } = await startBrowser(USER_AGENT)
  try {
    await withRetry(async () => { await page.goto(FIPI_BASE, { waitUntil: 'domcontentloaded', timeout: 60000 }) }, 3)
    await page.waitForSelector('iframe#questions_container', { timeout: 20000 })
    const frame = page.frames().find((f: any) => (typeof f.name === 'function' && f.name()?.includes('questions_container')) || (typeof f.url === 'function' && f.url()?.includes('questions.php')) ) || page.frames().find((f: any) => (f as any)._name === 'questions_container')
    if (!frame) throw new Error('questions_container frame not found')

    const summary: Record<number, { pages: number; saved: number; real: number; synthetic: number }> = {}

    for (let taskNo = Math.max(1, START_TASK); taskNo <= Math.max(START_TASK, END_TASK); taskNo++) {
      summary[taskNo] = { pages: 0, saved: 0, real: 0, synthetic: 0 }
      await openFilterPanel(frame)
      await setTaskNumber(frame, taskNo)
      await delay(800)

      for (let p = Math.max(1, START_PAGE); p <= Math.max(START_PAGE, END_PAGE); p++) {
        if (summary[taskNo].saved >= LIMIT) break
        if (p === 1 && process.env.DEBUG_SAVE_HTML === '1') {
          try { const html = await frame.content(); await saveDebugHtml(path.posix.join('bytask-task'+taskNo+'-page1.html'), html) } catch {}
        }

        const html = await frame.content()
        const dom = require('jsdom'); const JSDOM = dom.JSDOM; const d = new JSDOM(html).window.document
        const cardNodes = Array.from(d.querySelectorAll('.question, .task, .b-task, .bank-card, article, .item, .q-item')) as HTMLElement[]
        if (cardNodes.length === 0 && p > 1) break

        let savedThisPage = 0
        for (let i = 0; i < cardNodes.length; i++) {
          if (summary[taskNo].saved >= LIMIT) break
          const el = cardNodes[i]
          const statement_html = sanitizeHtml(el.innerHTML)
          const statement_text = (el.textContent || '').trim()
          const idInfo = getFipiIdFromStrings(el.outerHTML, statement_text)
          if (idInfo.synthetic && process.env.DEBUG_SAVE_HTML === '1' && i < 2) {
            try { await saveDebugHtml(path.posix.join('bytask-task'+taskNo+'-p'+p+'-synthetic-'+i+'.html'), el.outerHTML) } catch {}
          }

          const assets: string[] = []
          const imgs = Array.from(el.querySelectorAll?.('img') || []) as HTMLImageElement[]
          for (const img of imgs) {
            const src = img.getAttribute('src') || ''
            try { const saved = await downloadAssetToPublic(src); if (saved) assets.push(saved) } catch {}
          }

          const fipiId = idInfo.id
          const accessed_at = new Date().toISOString()
          const checksum = sha256Hex(statement_html)
          const outFile = rawTaskPageFilePath(EXAM, LEVEL, taskNo, p, fipiId)
          ensureDirSync(path.dirname(outFile))
          const data = { exam: EXAM, level: LEVEL, taskNo, fipiId, idSynthetic: idInfo.synthetic, idMethod: idInfo.synthetic? 'hash':'detected', statement_html, statement_text, assets, answer: undefined as any, source_url: frame.url(), accessed_at, checksum }
          try { await fs.promises.access(outFile); /* skip if exists */ }
          catch { await writeJsonPretty(outFile, data); savedThisPage++; summary[taskNo].saved++; if (idInfo.synthetic) summary[taskNo].synthetic++; else summary[taskNo].real++; }
        }

        summary[taskNo].pages++
        console.log(`Task ${taskNo} – page ${p} → saved ${savedThisPage} (real ${summary[taskNo].real} / synthetic ${summary[taskNo].synthetic})`)
        if (summary[taskNo].saved >= LIMIT) break

        if (p < END_PAGE) {
          // Try click paginator inside frame
          let advanced = false
          try {
            const link = frame.locator(`text=/^${p+1}$/`).first()
            if (await link.count()) { await link.click({ timeout: 3000 }); await frame.waitForLoadState('domcontentloaded', { timeout: 15000 }); advanced = true }
          } catch {}
          if (!advanced) {
            try {
              const url = new URL(frame.url()); url.searchParams.set('page', String(p+1))
              await frame.goto(url.toString(), { waitUntil: 'domcontentloaded', timeout: 20000 }); advanced = true
            } catch {}
          }
          if (!advanced) break
        }
      }
    }

    const lines: string[] = []
    for (const [k,v] of Object.entries(summary)) {
      lines.push(`Task ${k}: pages visited ${v.pages}, cards saved ${v.saved} (real ${v.real} / synthetic ${v.synthetic})`)
    }
    console.log(lines.join('\n'))
  } finally {
    await closeBrowser(browser)
  }
}

main().catch((e)=>{ console.error(e); process.exit(1) })


