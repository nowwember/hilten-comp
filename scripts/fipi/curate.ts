/*
  Curate RAW → labeled/quarantine for EGE basic
  Usage: tsx scripts/fipi/curate.ts --exam=ege --level=basic --limit=200
*/

import * as fs from 'fs'
import * as path from 'path'
import type { FipiExam, FipiLevel } from '../../src/lib/fipi/types'
import { sanitizeHtml } from './lib/html'
import { ensureDirSync, sha256Hex, writeJsonPretty, mkSlug } from './lib/io'
import { labelEgeBasic } from '../../src/lib/fipi/labeler'
import { EGE_BASIC_MAP } from '../../src/lib/fipi/ege-basic-map'

type Args = { exam: FipiExam; level: FipiLevel; limit?: number }

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
    limit: get('limit') ? Number(get('limit')) : undefined,
  }
}

function stripHtmlToText(html: string): string {
  return (html || '')
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function readAllRawFiles(rawRoot: string, cap?: number): string[] {
  const out: string[] = []
  function walk(dir: string) {
    const ents = fs.existsSync(dir) ? fs.readdirSync(dir, { withFileTypes: true }) : []
    for (const e of ents) {
      if (cap != null && out.length >= cap) return
      const p = path.join(dir, e.name)
      if (e.isDirectory()) walk(p)
      else if (e.isFile() && e.name.endsWith('.json')) out.push(p)
      if (cap != null && out.length >= cap) return
    }
  }
  walk(rawRoot)
  return out
}

async function main() {
  const { exam, level, limit } = parseArgs()
  if (exam !== 'ege' || level !== 'basic') {
    console.error('Only ege/basic supported in this micro version.')
    process.exit(1)
  }

  const rawRoot = path.join(process.cwd(), 'data', 'fipi', '_raw', exam, level)
  const files = readAllRawFiles(rawRoot, limit)
  let createdLabeled = 0
  let updatedLabeled = 0
  let skippedLabeled = 0
  let savedReview = 0

  for (const file of files) {
    try {
      const raw = JSON.parse(fs.readFileSync(file, 'utf8')) as any
      const statement_html_raw = String(raw.statement_html || '')
      const statement_html = sanitizeHtml(statement_html_raw)
      const text = (raw.statement_text && String(raw.statement_text).trim()) || stripHtmlToText(statement_html)
      const labeled = labelEgeBasic(text)
      const assets: string[] = Array.isArray(raw.assets) ? raw.assets : Array.isArray(raw.assetsUrls) ? raw.assetsUrls : []
      const accessed_at: string = raw.accessed_at || new Date().toISOString()
      const source_url: string = raw.source_url || ''
      const answer: string | undefined = raw.answer || undefined
      const checksum = sha256Hex(JSON.stringify({ statement_html, assets }))

      if (labeled && labeled.confidence >= 0.6) {
        const taskNo = labeled.taskNo
        const subtopic = labeled.subtopic
        const title = (EGE_BASIC_MAP[taskNo]?.title) || `Задание ${taskNo}`
        const outDir = path.join(process.cwd(), 'data', 'fipi', exam, level, String(taskNo), subtopic)
        ensureDirSync(outDir)
        const slug = `${mkSlug(title)}-${checksum.slice(0, 8)}`
        const outFile = path.join(outDir, `${slug}.json`)
        const fipiId: string | undefined = raw.fipiId || undefined

        // Try to find existing by fipiId
        let existingPath: string | null = null
        let existing: any = null
        if (fipiId) {
          const filesInDir = fs.readdirSync(outDir).filter((n) => n.endsWith('.json'))
          for (const name of filesInDir) {
            const p = path.join(outDir, name)
            try {
              const j = JSON.parse(fs.readFileSync(p, 'utf8'))
              if (j && (j.source_id === fipiId || j.fipiId === fipiId)) {
                existingPath = p
                existing = j
                break
              }
            } catch {}
          }
        }

        const finalJson = {
          exam,
          level,
          taskNo,
          subtopic,
          title,
          statement_md: undefined,
          statement_html,
          answer,
          assets,
          source_url,
          source_id: fipiId,
          accessed_at,
          checksum,
          validation: { confidence: labeled.confidence, hits: labeled.hits }
        }
        // Dedup logic: update existing if same fipiId
        if (existingPath) {
          // Merge metadata, prefer newer accessed_at
          try {
            const existingAt = new Date(existing?.accessed_at || 0).getTime()
            const currentAt = new Date(accessed_at).getTime()
            const merged = { ...existing, ...finalJson }
            if (!isNaN(existingAt) && !isNaN(currentAt) && existingAt > currentAt) {
              merged.accessed_at = existing.accessed_at
              merged.source_url = existing.source_url || finalJson.source_url
            }
            // If no change in checksum and statement_html, skip
            const sameChecksum = existing?.checksum === finalJson.checksum
            const sameHtml = (existing?.statement_html || '') === (finalJson.statement_html || '')
            if (sameChecksum && sameHtml) {
              console.log('Skipped labeled (duplicate):', existingPath)
              skippedLabeled++
            } else {
              await writeJsonPretty(existingPath, merged)
              console.log('Updated labeled:', existingPath)
              updatedLabeled++
            }
          } catch {
            await writeJsonPretty(existingPath, finalJson)
            console.log('Updated labeled:', existingPath)
            updatedLabeled++
          }
        } else {
          await writeJsonPretty(outFile, finalJson)
          console.log('Created labeled:', outFile)
          createdLabeled++
        }
      } else {
        const taskNoFromRaw = typeof raw.taskNo === 'number' ? raw.taskNo : 0
        const taskNoGuess = taskNoFromRaw || 0
        const subtopicGuess = 'unknown'
        const outDir = path.join(process.cwd(), 'data', 'fipi', '_review', exam, level, String(taskNoGuess), subtopicGuess)
        ensureDirSync(outDir)
        const base = raw.fipiId || checksum.slice(0, 16)
        const outFile = path.join(outDir, `${base}.json`)
        const reviewJson = {
          status: 'needs_review',
          exam,
          level,
          taskNo: taskNoGuess,
          subtopic: subtopicGuess,
          title: undefined,
          statement_md: undefined,
          statement_html,
          answer,
          assets,
          source_url,
          source_id: raw.fipiId || undefined,
          accessed_at,
          checksum
        }
        await writeJsonPretty(outFile, reviewJson)
        console.log('Saved review:', outFile)
        savedReview++
      }
    } catch (e) {
      console.warn('Curate failed for', file, e)
    }
  }

  console.log('Curate summary:', { created: createdLabeled, updated: updatedLabeled, skipped: skippedLabeled, review: savedReview })
}

main().catch((e) => { console.error(e); process.exit(1) })


