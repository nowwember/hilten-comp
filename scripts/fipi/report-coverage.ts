/*
  Report coverage for EGE basic: counts per (taskNo, subtopic), target = 2 each
  Writes:
    - scripts/fipi/reports/coverage.md (markdown summary)
    - scripts/fipi/reports/wanted.csv (taskNo,subtopic,needCount)
*/

import * as fs from 'fs'
import * as path from 'path'
import { eachDesiredPick } from '../../src/lib/fipi/ege-basic-map'

type CountKey = string // `${taskNo}::${subtopic}`

function scanCounts(root: string): Map<CountKey, number> {
  const counts = new Map<CountKey, number>()
  function walk(dir: string) {
    if (!fs.existsSync(dir)) return
    const ents = fs.readdirSync(dir, { withFileTypes: true })
    for (const e of ents) {
      const p = path.join(dir, e.name)
      if (e.isDirectory()) walk(p)
      else if (e.isFile() && e.name.endsWith('.json')) {
        try {
          const j = JSON.parse(fs.readFileSync(p, 'utf8'))
          const taskNo: number | undefined = j?.taskNo
          const subtopic: string | undefined = j?.subtopic
          if (typeof taskNo === 'number' && subtopic && subtopic.length > 0) {
            const key = `${taskNo}::${subtopic}`
            counts.set(key, (counts.get(key) || 0) + 1)
          }
        } catch {}
      }
    }
  }
  walk(root)
  return counts
}

function ensureDirSync(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
}

async function main() {
  const dataRoot = path.join(process.cwd(), 'data', 'fipi', 'ege', 'basic')
  const reportDir = path.join(process.cwd(), 'scripts', 'fipi', 'reports')
  ensureDirSync(reportDir)

  const counts = scanCounts(dataRoot)
  const desired = eachDesiredPick(2) // wanted per subtopic = 2

  // Build per task grouping
  const byTask = new Map<number, Array<{ subtopic: string; have: number; need: number }>>()
  for (const pick of desired) {
    const key = `${pick.taskNo}::${pick.subtopic}`
    const have = counts.get(key) || 0
    const need = Math.max(0, pick.wanted - have)
    const arr = byTask.get(pick.taskNo) || []
    arr.push({ subtopic: pick.subtopic, have, need })
    byTask.set(pick.taskNo, arr)
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

  // Write wanted.csv (include haveCount per requirement)
  const csvLines: string[] = []
  csvLines.push('taskNo,subtopic,haveCount,needCount')
  for (const t of sortedTasks) {
    for (const r of byTask.get(t) || []) {
      if (r.need > 0) csvLines.push(`${t},${r.subtopic},${r.have},${r.need}`)
    }
  }
  fs.writeFileSync(path.join(reportDir, 'wanted.csv'), csvLines.join('\n'), 'utf8')

  console.log('Coverage written:', {
    coverageMd: path.join('scripts', 'fipi', 'reports', 'coverage.md'),
    wantedCsv: path.join('scripts', 'fipi', 'reports', 'wanted.csv')
  })
}

main().catch((e) => { console.error(e); process.exit(1) })


