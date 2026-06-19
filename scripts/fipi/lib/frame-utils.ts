import type { Frame } from 'playwright'

export async function openFilterPanel(frame: Frame) {
  const btn = frame.locator('text=/Подбор\s+задани/i')
  try { await btn.first().click({ timeout: 5000 }) } catch {}
}

export async function setTaskNumber(frame: Frame, taskNo: number) {
  // Try select near label "Номер задания"
  try {
    const label = frame.locator('text=/Номер\s+задан/i').first()
    const select = label.locator('xpath=following::*[self::select or self::input][1]')
    if (await select.count()) {
      const el = await select.elementHandle()
      const tag = await el?.evaluate((n) => (n as HTMLElement).tagName.toLowerCase())
      if (tag === 'select') {
        await (select as any).selectOption?.({ label: String(taskNo), value: String(taskNo) }).catch(async () => {
          await frame.evaluate((node: any, v: string) => { node.value = v; node.dispatchEvent(new Event('change')) }, el, String(taskNo))
        })
      } else {
        await select.fill(String(taskNo)).catch(async () => { await frame.evaluate((node:any,v:string)=>{node.value=v}, el, String(taskNo)) })
      }
    }
  } catch {}

  // Click apply button
  const applyBtn = frame.locator('text=/Применит|Показат/i').first()
  try { await applyBtn.click({ timeout: 5000 }) } catch {}
  // naive wait
  await frame.waitForLoadState('domcontentloaded', { timeout: 30000 }).catch(() => {})
}


