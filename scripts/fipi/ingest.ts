/*
  FIPI ingest script (Node + Playwright)
  CLI: --exam=ege --level=basic --perSubtopic=2 --taskNos=1,2,3 --limit=120
  Rate-limit: 1 req/s, random delay 500–1200ms, retry=3
  userAgent: process.env.INGEST_USER_AGENT
*/

import { EGE_BASIC_MAP, eachDesiredPick } from '../../src/lib/fipi/ege-basic-map'
import type { FipiTaskJson, FipiExam, FipiLevel } from '../../src/lib/fipi/types'
import { startBrowser, closeBrowser, withRetry, throttle } from './lib/browser'
import { sanitizeHtml, extractOuterHtmlBySelector, tryExtractTex } from './lib/html'
import { delay, ensureDirSync, downloadAssetToPublic, sha256Hex, writeJsonPretty, mkSlug } from './lib/io'
import * as fs from 'fs'
import * as path from 'path'

type Args = {
  exam: FipiExam
  level: FipiLevel
  perSubtopic: number
  limit?: number
  taskNos?: number[]
}

function parseArgs(): Args {
  const argv = process.argv.slice(2)
  const get = (k: string, def?: string) => {
    const key = `--${k}=`
    const hit = argv.find((a) => a.startsWith(key))
    return hit ? hit.slice(key.length) : def
  }
  return {
    exam: (get('exam', 'ege') as FipiExam),
    level: (get('level', 'basic') as FipiLevel),
    perSubtopic: Number(get('perSubtopic', process.env.MAX_PER_SUBTOPIC || '2')),
    limit: get('limit') ? Number(get('limit')) : undefined,
    taskNos: get('taskNos')?.split(',').map((s) => Number(s.trim())).filter((n) => Number.isFinite(n)),
  }
}

const FIPI_BASE = process.env.FIPI_BASE || 'https://ege.fipi.ru/bank/'
const RATE = Number(process.env.INGEST_RATE || '1')
const USER_AGENT = process.env.INGEST_USER_AGENT || 'HiltenComp Ingest bot (contact@example.com)'
const randDelay = async () => { const ms = 500 + Math.floor(Math.random() * 700); await delay(ms) }

// TODO: уточнить реальные селекторы на ege.fipi.ru/bank/
const SELECTORS = {
  subjectPicker: 'TODO-[data-subject="math-basic"]',
  taskListContainer: 'TODO-.task-list',
  taskCard: 'TODO-.task-card',
  statementContainer: 'TODO-.statement, .task-body',
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
  const { exam, level, perSubtopic, limit, taskNos } = args
  if (exam !== 'ege' || level !== 'basic') {
    console.error('Only ege/basic supported in this micro version.')
    process.exitCode = 1
    return
  }

  let picks = eachDesiredPick(perSubtopic)
  if (taskNos && taskNos.length) {
    const set = new Set(taskNos)
    picks = picks.filter(p => set.has(p.taskNo))
  }
  const cap = typeof limit === 'number' && isFinite(limit) ? limit : Infinity

  // Fast exit for CI/dry-run: do not require Playwright when nothing to ingest
  if (cap === 0) {
    console.log('Ingest dry-run: limit=0, skipping browser and network work.')
    return
  }

  const { browser, page } = await startBrowser(USER_AGENT)
  try {
    await withRetry(async () => {
      await page.goto(FIPI_BASE, { waitUntil: 'domcontentloaded', timeout: 60000 })
    }, 3)
    // navigate to EGE -> math -> basic with consent handling
    await navigateToMathBasic(page)

    let saved = 0
    for (const pick of picks) {
      if (saved >= cap) break

      // TODO: навигация до списка задач по pick.subtopic
      // await page.click(...)
      // await page.waitForSelector(SELECTORS.taskListContainer)

      // Троттлинг + рандом
      await delay(1000 / Math.max(1, RATE))
      await randDelay()

      // Заглушка: предполагаем, что получили HTML списка задач
      const listHtml: string = await page.content()
      // TODO: найти в listHtml карточки задач по селектору SELECTORS.taskCard

      // Здесь вместо реального парсинга — демонстрация схемы. В реале нужно пройтись по карточкам.
      const statementOuterHtml = extractOuterHtmlBySelector(listHtml, SELECTORS.statementContainer) || ''

      // Сбор изображений (упрощённо): ищем src в img
      const imageSrcRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi
      const assets: string[] = []
      let m: RegExpExecArray | null
      while ((m = imageSrcRegex.exec(statementOuterHtml)) != null) {
        const src = m[1]
        try {
          const staticPath = await downloadAssetToPublic(src)
          assets.push(staticPath)
        } catch (e) {
          console.warn('Failed to fetch image', src, e)
        }
      }

      // Подготовка полей
      const accessed_at = new Date().toISOString()
      const statement_html = sanitizeHtml(statementOuterHtml)
      const maybeMd = tryExtractTex(statement_html)
      const statement_md = maybeMd || undefined

      const checksum = sha256Hex(
        JSON.stringify({ statement_html, statement_md, assets })
      )

      const source_url = FIPI_BASE // TODO: заменить на конкретный URL задачи
      const title = EGE_BASIC_MAP[pick.taskNo]?.title || `Задание ${pick.taskNo}`

      const json: FipiTaskJson = {
        exam, level,
        taskNo: pick.taskNo,
        subtopic: pick.subtopic,
        title,
        statement_md,
        statement_html,
        assets,
        source_url,
        source_id: undefined,
        accessed_at,
        checksum,
        answer: undefined,
      }

      // Путь сохранения
      const outDir = path.join(process.cwd(), 'data', 'fipi', exam, level, String(pick.taskNo), pick.subtopic)
      ensureDirSync(outDir)
      const outFile = path.join(outDir, `${mkSlug(title)}-${checksum.slice(0, 8)}.json`)
      // дедуп по checksum: если файл с таким именем уже есть — пропустим
      try {
        await fs.promises.access(outFile)
        console.log('Skip (exists):', outFile)
      } catch {
        await writeJsonPretty(outFile, json)
        console.log('Saved:', outFile)
      }
      saved += 1
      if (saved >= cap) break
    }
    console.log('Saved items:', saved)
  } finally {
    await closeBrowser(browser)
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})


