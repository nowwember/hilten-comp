/*
  HTML utilities. DOMPurify/jsdom are optional; we avoid hard deps until approved.
*/

export function sanitizeHtml(html: string): string {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const createDOMPurify = require('dompurify');
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { JSDOM } = require('jsdom');
    const window = new JSDOM('').window as unknown as Window;
    const DOMPurify = createDOMPurify(window as any);
    return DOMPurify.sanitize(html, { USE_PROFILES: { html: true } });
  } catch {
    // Fallback: strip scripts and event handlers
    return html
      .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
      .replace(/ on[a-z]+="[^"]*"/gi, '')
      .replace(/ on[a-z]+='[^']*'/gi, '');
  }
}

export function extractOuterHtmlBySelector(documentHtml: string, selector: string): string | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { JSDOM } = require('jsdom');
    const dom = new JSDOM(documentHtml);
    const el = dom.window.document.querySelector(selector);
    return el ? el.outerHTML : null;
  } catch {
    return null;
  }
}

export function tryExtractTex(html: string): string | null {
  const hasInline = /\$(?!\$)[\s\S]+?\$/m.test(html)
  const hasBlock = /\$\$[\s\S]+?\$\$/m.test(html)
  if (hasInline || hasBlock) {
    // В реальной реализации тут может быть конвертация HTML->MD с сохранением TeX.
    // Для каркаса вернём null, чтобы оставить HTML как есть, если не уверены.
    return null
  }
  return null
}

import { sha256Hex } from './io'

export function getFipiId(node: Element): { id: string; synthetic: boolean; method: string } {
  // a) Text like "Номер: XXXXX" or "Номер задачи: XXXXX"
  const text = (node.textContent || '').trim()
  const mText = /(Номер|Номер\s+задачи)\s*:\s*([A-Z0-9]+)/i.exec(text)
  if (mText) {
    return { id: mText[2].toUpperCase(), synthetic: false, method: 'text' }
  }

  // b) Attributes
  const attrCandidates = ['data-id', 'data-task', 'id', 'name']
  for (const a of attrCandidates) {
    const v = node.getAttribute(a)
    if (v && /^[A-Z0-9]{4,}$/i.test(v)) {
      return { id: v.toUpperCase(), synthetic: false, method: 'attr' }
    }
  }

  // c) Links inside card
  const links = Array.from(node.querySelectorAll('a')) as HTMLAnchorElement[]
  for (const a of links) {
    const href = a.getAttribute('href') || ''
    const mHref = /[?&]id=([A-Za-z0-9]+)/i.exec(href) || /view\.php\?id=([A-Za-z0-9]+)/i.exec(href)
    if (mHref) {
      return { id: mHref[1].toUpperCase(), synthetic: false, method: 'href' }
    }
  }

  // d) Fallback synthetic: hash of normalized HTML
  const outer = (node as HTMLElement).outerHTML || ''
  // strip inline styles, collapse whitespace
  const normalized = outer
    .replace(/\sstyle=\"[^\"]*\"/gi, '')
    .replace(/\sstyle='[^']*'/gi, '')
    .replace(/\s+/g, ' ')
    .trim()
  const id = 'hx-' + sha256Hex(normalized).slice(0, 12).toUpperCase()
  return { id, synthetic: true, method: 'hash' }
}

// RAW card extractor: read current page's DOM and yield simple records with minimal fields.
export async function extractRawCard(page: any): Promise<Array<{ fipiId?: string; idSynthetic?: boolean; idMethod?: string; statement_html?: string; statement_text?: string; assetsUrls?: string[]; answer?: string; source_url?: string }>> {
  try {
    const html = await page.content()
    const { JSDOM } = require('jsdom')
    const dom = new JSDOM(html)
    const d = dom.window.document

    // TODO: заменить на реальные селекторы карточек
    let cards = Array.from(d.querySelectorAll('.task-card, .bank-card, .question, .item, article, .task, .b-task'))
    const items: any[] = []
    for (const el of cards) {
      const statement = el.querySelector('.statement, .body, .content, .task-body') as HTMLElement | null
      const statement_html = statement ? statement.outerHTML : el.outerHTML
      const statement_text = (statement ? statement.textContent : el.textContent) || ''
      const imgs = Array.from(el.querySelectorAll('img')) as HTMLImageElement[]
      const assetsUrls = imgs.map(img => img.getAttribute('src')).filter(Boolean) as string[]
      const idInfo = getFipiId(el)
      const answerEl = el.querySelector('.answer, .solution, .correct') as HTMLElement | null
      const answer = answerEl ? (answerEl.textContent || '').trim() : undefined
      items.push({ fipiId: idInfo.id, idSynthetic: idInfo.synthetic, idMethod: idInfo.method, statement_html, statement_text, assetsUrls, answer, source_url: page.url() })
    }
    if (items.length === 0) {
      // Fallback: treat the whole main content as one item
      const main = d.querySelector('main') || d.body
      const statement_html = main?.outerHTML || html
      const statement_text = (main?.textContent || '').trim()
      const imgs = Array.from(main?.querySelectorAll?.('img') || []) as HTMLImageElement[]
      const assetsUrls = imgs.map(img => img.getAttribute('src')).filter(Boolean) as string[]
      const idInfo = getFipiId(main as Element)
      items.push({ fipiId: idInfo.id, idSynthetic: idInfo.synthetic, idMethod: idInfo.method, statement_html, statement_text, assetsUrls, answer: undefined, source_url: page.url() })
    }
    return items
  } catch (e) {
    console.warn('extractRawCard failed', e)
    return []
  }
}

export function getFipiIdFromStrings(html: string, text: string): { id: string; synthetic: boolean; method: string } {
  // text-based patterns
  let m = /(?:Номер|Номер\s+задачи|№\s*задания|№)\s*[:#]?\s*([A-Z0-9\-]{4,})/i.exec(text || '')
  if (m) return { id: m[1].toUpperCase(), synthetic: false, method: 'frame-text' }

  // href-based
  m = /questions\.php\?[^#]*?(?:id|qid|tid)=([A-Za-z0-9\-]{4,})/i.exec(html || '') || /view\.php\?[^#]*?(?:id|qid|tid)=([A-Za-z0-9\-]{4,})/i.exec(html || '')
  if (m) return { id: m[1].toUpperCase(), synthetic: false, method: 'frame-href' }

  // attr-based
  m = /data-(?:task(?:-)?id|id)=["']([A-Za-z0-9\-]{4,})["']/i.exec(html || '') || /id=["']task-([A-Za-z0-9\-]{4,})["']/i.exec(html || '')
  if (m) return { id: m[1].toUpperCase(), synthetic: false, method: 'frame-attr' }

  // onclick openTask('XXXX')
  m = /openTask\(['"]([A-Za-z0-9\-]{4,})['"]\)/i.exec(html || '')
  if (m) return { id: m[1].toUpperCase(), synthetic: false, method: 'frame-onclick' }

  // hidden inputs
  m = /<input[^>]*type=["']hidden["'][^>]*name=["']q(?:id)?["'][^>]*value=["']([A-Za-z0-9\-]{4,})["'][^>]*>/i.exec(html || '')
  if (m) return { id: m[1].toUpperCase(), synthetic: false, method: 'frame-hidden' }

  const normalized = (html || '')
    .replace(/\sstyle=\"[^\"]*\"/gi, '')
    .replace(/\sstyle='[^']*'/gi, '')
    .replace(/\s+/g, ' ')
    .trim()
  const id = 'hx-' + sha256Hex(normalized).slice(0, 12).toUpperCase()
  return { id, synthetic: true, method: 'hash' }
}

export async function extractRawFromFrame(frame: any): Promise<Array<{ fipiId?: string; idSynthetic?: boolean; idMethod?: string; statement_html?: string; statement_text?: string; assetsUrls?: string[]; answer?: string; source_url?: string }>> {
  try {
    const html = await frame.content()
    const { JSDOM } = require('jsdom')
    const dom = new JSDOM(html)
    const d = dom.window.document

    // Пробуем найти карточки задач внутри фрейма
    let cards = Array.from(d.querySelectorAll('.question, .task, .b-task, .bank-card, article, .item, .q-item'))
    const items: any[] = []
    for (const el of cards) {
      const statement = el.querySelector('.statement, .body, .content, .task-body, .q-body, .question-body') as HTMLElement | null
      const statement_html = statement ? statement.innerHTML : el.innerHTML
      const statement_text = (statement ? statement.textContent : el.textContent) || ''
      const imgs = Array.from(el.querySelectorAll('img')) as HTMLImageElement[]
      const assetsUrls = imgs.map(img => img.getAttribute('src')).filter(Boolean) as string[]
      const idInfo = getFipiId(el)
      const answerEl = el.querySelector('.answer, .solution, .correct, .q-answer') as HTMLElement | null
      const answer = answerEl ? (answerEl.textContent || '').trim() : undefined
      items.push({ fipiId: idInfo.id, idSynthetic: idInfo.synthetic, idMethod: idInfo.method, statement_html, statement_text, assetsUrls, answer, source_url: frame.url() })
    }
    if (items.length === 0) {
      const body = d.body
      const statement_html = body?.innerHTML || html
      const statement_text = (body?.textContent || '').trim()
      const imgs = Array.from(body?.querySelectorAll?.('img') || []) as HTMLImageElement[]
      const assetsUrls = imgs.map(img => img.getAttribute('src')).filter(Boolean) as string[]
      const idInfo = getFipiId(body as Element)
      items.push({ fipiId: idInfo.id, idSynthetic: idInfo.synthetic, idMethod: idInfo.method, statement_html, statement_text, assetsUrls, answer: undefined, source_url: frame.url() })
    }
    return items
  } catch (e) {
    console.warn('extractRawFromFrame failed', e)
    return []
  }
}

export async function extractRawCardFromFrame(frame: any, cardEl: any): Promise<{ html: string; text: string }> {
  try {
    const html = await frame.evaluate((el: any) => el.outerHTML, cardEl)
    const text = await frame.evaluate((el: any) => (el as HTMLElement).innerText || '', cardEl)
    return { html, text }
  } catch (e) {
    return { html: '', text: '' }
  }
}


