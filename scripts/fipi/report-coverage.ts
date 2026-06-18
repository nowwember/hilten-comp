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

// Recursively list all json files under dir
function listJsonFiles(dir: string): string[] {
  const out: string[] = []
  function walk(d: string) {
    const ents = fs.existsSync(d) ? fs.readdirSync(d, { withFileTypes: true }) : []
    for (const e of ents) {
      const p = path.join(d, e.name)
      if (e.isDirectory()) walk(p)
      else if (e.isFile() && e.name.endsWith('.json')) out.push(p)
    }
  }
  walk(dir)
  return out
}

function inferFromPath(filePath: string): { taskNo: number | null; subtopic: string | null } {
  const parts = filePath.split(path.sep)
  const idx = parts.findIndex((x) => x === 'basic')
  if (idx >= 0) {
    const taskStr = parts[idx + 1]
    const subtopic = parts[idx + 2] || null
    const taskNo = Number(taskStr)
    return { taskNo: Number.isFinite(taskNo) ? taskNo : null, subtopic }
  }
  return { taskNo: null, subtopic: null }
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

  // Collect counts by scanning labeled jsons and reading taskNo/subtopic from JSON (prefer) else path
  const labeledRoot = path.join(process.cwd(), 'data', 'fipi', 'ege', 'basic')
  const reviewRoot = path.join(process.cwd(), 'data', 'fipi', '_review', 'ege', 'basic')
  const labeledFiles = listJsonFiles(labeledRoot)
  // reviewFiles are read (glob existence) but not contributing to coverage counts for now
  void listJsonFiles(reviewRoot)

  const counts = new Map<string, number>() // key: `${taskNo}::${subtopic}`
  for (const file of labeledFiles) {
    try {
      const j = JSON.parse(fs.readFileSync(file, 'utf8'))
      let taskNo: number | null = typeof j.taskNo === 'number' ? j.taskNo : null
      let subtopic: string | null = (typeof j.subtopic === 'string' && j.subtopic) ? j.subtopic : null
      if (taskNo == null || !subtopic) {
        const inf = inferFromPath(file)
        if (taskNo == null) taskNo = inf.taskNo
        if (!subtopic) subtopic = inf.subtopic
      }
      if (taskNo && subtopic) {
        const key = `${taskNo}::${subtopic}`
        counts.set(key, (counts.get(key) || 0) + 1)
      }
    } catch {}
  }

  // Build per task grouping based on taxonomy keys
  const byTask = new Map<number, Array<{ subtopic: string; have: number; need: number }>>()
  for (const t of taskNos) {
    const subtopics = taxonomy[String(t)]?.subtopics || {}
    const rows: Array<{ subtopic: string; have: number; need: number }> = []
    for (const s of Object.keys(subtopics)) {
      const have = counts.get(`${t}::${s}`) || 0
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


