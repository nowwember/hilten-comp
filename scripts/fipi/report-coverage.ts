/*
  Report coverage for EGE basic over taxonomy: counts per (taskNo, subtopic), target = 2 each
  Writes:
    - scripts/fipi/reports/coverage.md (markdown summary, includes ALL taxonomy tasks even with 0)
    - scripts/fipi/reports/wanted.csv (taskNo,subtopic,haveCount,needCount)
    - scripts/fipi/reports/coverage.json (machine-readable summary)
*/

import * as fs from 'fs'
import * as path from 'path'
// taxonomy file describes all tasks and subtopics; we use it to enumerate rows (1..N)
import * as taxonomyJson from '../../src/lib/fipi/taxonomy/ege-basic.json'

type CountKey = string // `${taskNo}::${subtopic}`

// Count json files directly in data directory for each (taskNo, subtopic)
function countByPath(dataRoot: string, taskNo: number, subtopic: string): number {
  const dir = path.join(dataRoot, String(taskNo), subtopic)
  if (!fs.existsSync(dir)) return 0
  const ents = fs.readdirSync(dir, { withFileTypes: true })
  let n = 0
  for (const e of ents) {
    if (e.isFile() && e.name.endsWith('.json')) n++
  }
  return n
}

function ensureDirSync(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
}

async function main() {
  const dataRoot = path.join(process.cwd(), 'data', 'fipi', 'ege', 'basic')
  const reportDir = path.join(process.cwd(), 'scripts', 'fipi', 'reports')
  ensureDirSync(reportDir)

  // Build list of tasks and subtopics from taxonomy (sorted by numeric taskNo; preserve subtopic key order)
  const taxonomy = (taxonomyJson as any) as Record<string, { title?: string; subtopics?: Record<string, any> }>
  const taskNos = Object.keys(taxonomy)
    .map((k) => Number(k))
    .filter((n) => Number.isFinite(n))
    .sort((a, b) => a - b)

  // Build per task grouping using direct path counts, target per subtopic = 2
  const byTask = new Map<number, Array<{ subtopic: string; have: number; need: number }>>()
  for (const t of taskNos) {
    const subtopics = taxonomy[String(t)]?.subtopics || {}
    const subtopicKeys = Object.keys(subtopics)
    const rows: Array<{ subtopic: string; have: number; need: number }> = []
    for (const s of subtopicKeys) {
      const have = countByPath(dataRoot, t, s)
      const need = Math.max(0, 2 - have)
      rows.push({ subtopic: s, have, need })
    }
    byTask.set(t, rows)
  }

  // Write coverage.md
  const lines: string[] = []
  lines.push('# EGE Basic Coverage')
  lines.push('')
  const sortedTasks = Array.from(byTask.keys()).sort((a, b) => a - b)
  for (const t of sortedTasks) {
    lines.push(`## Задание ${t}`)
    const rows = (byTask.get(t) || []).sort((a, b) => a.subtopic.localeCompare(b.subtopic))
    for (const r of rows) {
      const status = r.have >= 2 ? 'OK' : r.have === 1 ? '1/2' : '0/2'
      lines.push(`- ${r.subtopic}: ${r.have}/2 (${status})`)
    }
    lines.push('')
  }
  fs.writeFileSync(path.join(reportDir, 'coverage.md'), lines.join('\n'), 'utf8')

  // Write wanted.csv (include only shortages)
  const csvLines: string[] = []
  csvLines.push('taskNo,subtopic,haveCount,needCount')
  for (const t of sortedTasks) {
    for (const r of byTask.get(t) || []) {
      if (r.need > 0) csvLines.push(`${t},${r.subtopic},${r.have},${r.need}`)
    }
  }
  fs.writeFileSync(path.join(reportDir, 'wanted.csv'), csvLines.join('\n'), 'utf8')

  // Write machine-readable JSON summary
  const jsonByTask: Record<string, Record<string, { have: number; need: number }>> = {}
  let totalHave = 0
  let totalNeed = 0
  for (const t of sortedTasks) {
    const tKey = String(t)
    jsonByTask[tKey] = {}
    for (const r of byTask.get(t) || []) {
      jsonByTask[tKey][r.subtopic] = { have: r.have, need: r.need }
      totalHave += r.have
      totalNeed += r.need
    }
  }
  const jsonOut = {
    exam: 'ege',
    level: 'basic',
    byTask: jsonByTask,
    totals: { have: totalHave, need: totalNeed },
  }
  fs.writeFileSync(path.join(reportDir, 'coverage.json'), JSON.stringify(jsonOut, null, 2), 'utf8')

  console.log('Coverage written:', {
    coverageMd: path.join('scripts', 'fipi', 'reports', 'coverage.md'),
    wantedCsv: path.join('scripts', 'fipi', 'reports', 'wanted.csv'),
    coverageJson: path.join('scripts', 'fipi', 'reports', 'coverage.json')
  })
}

main().catch((e) => { console.error(e); process.exit(1) })


