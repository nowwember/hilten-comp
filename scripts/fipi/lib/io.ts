import { createHash } from 'crypto'
import * as fs from 'fs'
import * as path from 'path'

export function delay(ms: number) {
  return new Promise((res) => setTimeout(res, ms))
}

export function ensureDirSync(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
}

export async function downloadBinary(url: string, filePath: string, fetchImpl?: typeof fetch) {
  const f = fetchImpl || (globalThis.fetch as typeof fetch)
  const res = await f(url)
  if (!res.ok) throw new Error(`Failed to download ${url}: ${res.status} ${res.statusText}`)
  const buf = Buffer.from(await res.arrayBuffer())
  ensureDirSync(path.dirname(filePath))
  await fs.promises.writeFile(filePath, buf)
}

export function sha256Hex(input: string | Buffer): string {
  return createHash('sha256').update(input).digest('hex')
}

export async function writeJsonPretty(filePath: string, data: unknown) {
  ensureDirSync(path.dirname(filePath))
  await fs.promises.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8')
}

export function mkSlug(str: string): string {
  const map: Record<string, string> = { а:'a',б:'b',в:'v',г:'g',д:'d',е:'e',ё:'e',ж:'zh',з:'z',и:'i',й:'y',к:'k',л:'l',м:'m',н:'n',о:'o',п:'p',р:'r',с:'s',т:'t',у:'u',ф:'f',х:'h',ц:'c',ч:'ch',ш:'sh',щ:'shch',ъ:'',ы:'y',ь:'',э:'e',ю:'yu',я:'ya' }
  const lower = (str || '').toLowerCase()
  let out = ''
  for (const ch of lower) {
    if (/[a-z0-9]/.test(ch)) { out += ch; continue }
    if (map[ch] != null) { out += map[ch]; continue }
    out += '-'
  }
  return out.replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
}

export async function downloadAssetToPublic(url: string): Promise<string> {
  const ext = path.extname(url).split('?')[0] || '.png'
  const hash = sha256Hex(url)
  const rel = path.posix.join('fipi', `${hash}${ext}`)
  const abs = path.join(process.cwd(), 'public', rel)
  if (!fs.existsSync(abs)) {
    await downloadBinary(url, abs)
  }
  return `/${rel}`
}


