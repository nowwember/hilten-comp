/*
  Playwright browser helpers (optional). We use dynamic require so the repo compiles without the package.
  Install after approval: pnpm add -D -E playwright
*/

export type PWBrowser = any;
export type PWPage = any;

export async function startBrowser(userAgent: string): Promise<{ browser: PWBrowser; page: PWPage }> {
  // Lazy-load playwright only when running the script
  let chromium: any;
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const pw = require('playwright');
    chromium = pw.chromium;
  } catch (e) {
    throw new Error(
      'Playwright is not installed. After approval, install with: pnpm add -D -E playwright' +
        `\nOriginal error: ${String(e)}`
    );
  }

  const headlessEnv = process.env.INGEST_HEADLESS
  const headless = headlessEnv ? headlessEnv === 'true' : false
  let browser: any
  try {
    browser = await chromium.launch({ channel: 'chrome', headless, args: ['--disable-blink-features=AutomationControlled', '--no-sandbox'] });
  } catch {
    browser = await chromium.launch({ headless, args: ['--disable-blink-features=AutomationControlled', '--no-sandbox'] });
  }
  const context = await browser.newContext({
    userAgent,
    viewport: { width: 1366, height: 900 },
    locale: process.env.INGEST_LOCALE || 'ru-RU',
    extraHTTPHeaders: {
      'Accept-Language': process.env.INGEST_ACCEPT_LANGUAGE || 'ru-RU,ru;q=0.9,en;q=0.8'
    }
  });
  const page = await context.newPage();
  try {
    // Extend default timeouts for slow external site
    if (typeof page.setDefaultTimeout === 'function') page.setDefaultTimeout(120000)
    if (typeof page.setDefaultNavigationTimeout === 'function') page.setDefaultNavigationTimeout(120000)
  } catch {}
  return { browser, page };
}

export async function closeBrowser(browser: PWBrowser) {
  if (browser && typeof browser.close === 'function') {
    await browser.close();
  }
}

export async function withContext<T>(userAgent: string, fn: (page: PWPage) => Promise<T>): Promise<T> {
  const { browser, page } = await startBrowser(userAgent)
  try { return await fn(page) } finally { await closeBrowser(browser) }
}

export function throttle<T extends (...args: any[]) => Promise<any>>(fn: T, rps = 1): T {
  let last = 0
  return (async (...args: any[]) => {
    const now = Date.now()
    const wait = Math.max(0, last + Math.ceil(1000 / Math.max(1, rps)) - now)
    if (wait) await new Promise(r => setTimeout(r, wait))
    last = Date.now()
    return fn(...args)
  }) as T
}

export async function withRetry<T>(fn: () => Promise<T>, times = 3): Promise<T> {
  let lastErr: unknown
  for (let i = 0; i < times; i++) {
    try { return await fn() } catch (e) { lastErr = e }
  }
  throw lastErr
}


