/*
  FIPI MVP Gate — enforce 2-per-subtopic for EGE basic tasks 1..5
  Usage: tsx scripts/fipi/mvp-gate.ts
*/

import * as fs from 'fs'
import * as path from 'path'

type CountKey = string // `${taskNo}::${subtopic}`

function listJsonFiles(root: string): string[] {
  const result: string[] = []
  function walk(dir: string) {
    if (!fs.existsSync(dir)) return
    const ents = fs.readdirSync(dir, { withFileTypes: true })
    for (const e of ents) {
      const p = path.join(dir, e.name)
      if (e.isDirectory()) walk(p)
      else if (e.isFile() && e.name.endsWith('.json')) result.push(p)
    }
  }
  walk(root)
  return result
}

function getTaskNoFromPath(p: string): number | null {
  const parts = p.split(path.sep)
  const idx = parts.findIndex((seg) => seg === 'basic')
  if (idx >= 0 && parts[idx + 1]) {
    const n = Number(parts[idx + 1])
    return Number.isFinite(n) ? n : null
  }
  return null
}

function getSubtopicFromPath(p: string): string | null {
  const parts = p.split(path.sep)
  const idx = parts.findIndex((seg) => seg === 'basic')
  if (idx >= 0 && parts[idx + 2]) return parts[idx + 2]
  return null
}

function main() {
  const root = path.join(process.cwd(), 'data', 'fipi', 'ege', 'basic')
  const targets = [1, 2, 3, 4, 5]
  const counts = new Map<CountKey, number>()
  for (const t of targets) {
    const dir = path.join(root, String(t))
    const files = listJsonFiles(dir)
    for (const file of files) {
      try {
        const raw = JSON.parse(fs.readFileSync(file, 'utf8')) as any
        const taskNo = typeof raw.taskNo === 'number' ? raw.taskNo : getTaskNoFromPath(file)
        const subtopic = typeof raw.subtopic === 'string' && raw.subtopic.length > 0 ? raw.subtopic : getSubtopicFromPath(file)
        if (!taskNo || !subtopic) continue
        const key = `${taskNo}::${subtopic}`
        counts.set(key, (counts.get(key) || 0) + 1)
      } catch {}
    }
  }

  // Build report and check gate
  const needPerKey = new Map<CountKey, { have: number; need: number }>()
  for (const t of targets) {
    const tdir = path.join(root, String(t))
    if (!fs.existsSync(tdir)) continue
    const subs = fs.readdirSync(tdir, { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name)
    for (const s of subs) {
      const key = `${t}::${s}`
      const have = counts.get(key) || 0
      const need = Math.max(0, 2 - have)
      needPerKey.set(key, { have, need })
    }
  }

  let anyFail = false
  const lines: string[] = []
  lines.push('FIPI MVP Gate (EGE basic, tasks 1..5)')
  for (const t of targets) {
    lines.push(`Task ${t}`)
    const entries = Array.from(needPerKey.entries())
      .filter(([k]) => k.startsWith(`${t}::`))
      .sort((a, b) => a[0].localeCompare(b[0]))
    if (entries.length === 0) lines.push('  (no subtopics found)')
    for (const [k, v] of entries) {
      const sub = k.split('::')[1]
      lines.push(`  - ${sub}: ${v.have}/2 (need ${v.need})`)
      if (v.need > 0) anyFail = true
    }
  }

  if (anyFail) {
    console.error(`\x1b[31mFAIL\x1b[0m`)
    console.error(lines.join('\n'))
    process.exit(1)
  } else {
    console.log(`\x1b[32mPASS\x1b[0m`)
    console.log(lines.join('\n'))
    process.exit(0)
  }
}

main()


