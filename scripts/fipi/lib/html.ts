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


