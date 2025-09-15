/*
  Read wanted.csv and print human hints for next ingest steps
  Usage: tsx scripts/fipi/pick-needed.ts
*/

import * as fs from 'fs'
import * as path from 'path'

function main() {
  const reportDir = path.join(process.cwd(), 'scripts', 'fipi', 'reports')
  const csvPath = path.join(reportDir, 'wanted.csv')
  if (!fs.existsSync(csvPath)) {
    console.error('wanted.csv not found. Run report-coverage first.')
    process.exit(1)
  }
  const rows = fs.readFileSync(csvPath, 'utf8').trim().split(/\r?\n/).slice(1)
  const needs = rows.map(line => {
    const [taskNoStr, subtopic, needStr] = line.split(',')
    return { taskNo: Number(taskNoStr), subtopic, need: Number(needStr) }
  }).filter(r => r.need > 0)

  if (needs.length === 0) {
    console.log('All subtopics covered: 2/2 each. Nothing to pick.')
    return
  }

  console.log('Still needed:')
  for (const n of needs) {
    console.log(`- Task ${n.taskNo} / ${n.subtopic}: need ${n.need}`)
  }

  console.log('\nSuggested flow:')
  console.log('- Run RAW ingest over a few pages, e.g.:')
  console.log('  npm run ingest:fipi -- --exam=ege --level=basic --startPage=1 --endPage=3')
  console.log('- Then curate:')
  console.log('  tsx scripts/fipi/curate.ts --exam=ege --level=basic --limit=200')
  console.log('- Re-run coverage:')
  console.log('  tsx scripts/fipi/report-coverage.ts')
}

main()


