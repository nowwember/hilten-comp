import { RussianStemmer } from 'snowball-stemmers'

const stemmer = new RussianStemmer()

export function normalize(text: string): string {
  const s = (text || '').toLowerCase().replace(/ё/g, 'е')
  return s.replace(/[\u2000-\u206F\u2E00-\u2E7F'"`~!@#$%^&*()_+=\[\]{}|\\:;<>,.?/]/g, ' ')
}

export function stemTokens(text: string): string[] {
  const n = normalize(text)
  const parts = n.split(/[^a-zа-я0-9]+/i).filter(Boolean)
  const out: string[] = []
  for (const p of parts) {
    if (/^[а-я]+$/i.test(p)) {
      try { out.push(stemmer.stemWord(p)) } catch { out.push(p) }
    } else {
      out.push(p)
    }
  }
  return out
}

export type UnitCounts = { length: number; mass: number; time: number; area: number; volume: number }

export function hasUnits(text: string): UnitCounts {
  const t = (text || '').toLowerCase()
  const length = (t.match(/\b(мм|см|дм|м|км)\b/g) || []).length
  const mass = (t.match(/\b(мг|г|кг|т)\b/g) || []).length
  const time = (t.match(/\b(сек|\bс\b|мин|\bч\b|час|сут|дн[яей])\b/g) || []).length
  const area = (t.match(/\b(см2|см²|м2|м²|км2|км²|мм2|мм²|га)\b/g) || []).length
  const volume = (t.match(/\b(л|мл|м3|м³|см3|см³)\b/g) || []).length
  return { length, mass, time, area, volume }
}

export function hasGraphCues(text: string): boolean {
  return /(график|диаграмм|рисунк|ось|по график|по диаграмм)/i.test(text || '')
}

export function hasFormulaCues(text: string): boolean {
  return /(формул|подстав|выразит|упрости|значени[ея] переменн|раскройте скобки)/i.test(text || '')
}

export function hasProbabilityCues(text: string): boolean {
  return /(вероят|событи|монет|кубик|урн|шар|лотер|карточк|исход)/i.test(text || '')
}

export function hasOptimizationCues(text: string): boolean {
  return /(тариф|выгодн|оптимальн|абонентск|пакет|стоимост|вариант)/i.test(text || '')
}

export function countVars(text: string): number {
  const m = (text || '').match(/[a-zа-я]\d?/gi)
  return m ? m.length : 0
}

export interface Detections {
  units: UnitCounts
  graph: boolean
  formula: boolean
  probability: boolean
  optimization: boolean
  varsCount: number
  tokens: string[]
}

export function detectAll(text: string): Detections {
  return {
    units: hasUnits(text),
    graph: hasGraphCues(text),
    formula: hasFormulaCues(text),
    probability: hasProbabilityCues(text),
    optimization: hasOptimizationCues(text),
    varsCount: countVars(text),
    tokens: stemTokens(text),
  }
}


