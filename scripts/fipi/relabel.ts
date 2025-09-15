/*
  Relabel a single reviewed file into labeled taxonomy folder
  Usage:
    tsx scripts/fipi/relabel.ts --from="data/fipi/_review/ege/basic/0/unknown/FILE.json" --toTask=1 --toSubtopic="okruglenie-s-izbytkom"
*/

import * as fs from 'fs'
import * as path from 'path'
import type { FipiExam, FipiLevel } from '../../src/lib/fipi/types'
import { ensureDirSync } from './lib/io'

type Args = {
  from: string
  toTask: number
  toSubtopic: string
}

function parseArgs(): Args {
  const argv = process.argv.slice(2)
  const get = (k: string, def?: string) => {
    const key = `--${k}=`
    const hit = argv.find((a) => a.startsWith(key))
    return hit ? hit.slice(key.length) : def
  }
  const from = get('from')
  const toTaskStr = get('toTask')
  const toSubtopic = get('toSubtopic') || ''
  if (!from || !toTaskStr || !toSubtopic) {
    console.error('Usage: --from=PATH --toTask=NUMBER --toSubtopic=SLUG')
    process.exit(1)
  }
  const toTask = Number(toTaskStr)
  if (!Number.isFinite(toTask) || toTask <= 0) {
    console.error('Invalid --toTask')
    process.exit(1)
  }
  return { from, toTask, toSubtopic }
}

async function main() {
  const { from, toTask, toSubtopic } = parseArgs()
  const absFrom = path.isAbsolute(from) ? from : path.join(process.cwd(), from)
  if (!fs.existsSync(absFrom)) {
    console.error('File not found:', absFrom)
    process.exit(1)
  }

  const raw = JSON.parse(fs.readFileSync(absFrom, 'utf8')) as any
  const exam: FipiExam = raw.exam || 'ege'
  const level: FipiLevel = raw.level || 'basic'

  // Update fields minimally per spec
  raw.taskNo = toTask
  raw.subtopic = toSubtopic
  if (raw.status) delete raw.status

  const baseName = path.basename(absFrom)
  const outDir = path.join(process.cwd(), 'data', 'fipi', exam, level, String(toTask), toSubtopic)
  ensureDirSync(outDir)
  const outFile = path.join(outDir, baseName)

  fs.writeFileSync(outFile, JSON.stringify(raw, null, 2), 'utf8')
  fs.unlinkSync(absFrom)
  console.log('Relabeled ->', outFile)
}

main().catch((e) => { console.error(e); process.exit(1) })


