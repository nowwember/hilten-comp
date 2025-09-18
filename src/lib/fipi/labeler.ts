import taxonomy from './taxonomy/ege-basic.json'
import { detectAll } from './classifier/detectors'

export type Labeled = { taskNo: number; subtopic: string; confidence: number; hits: string[] }

type SubtopicRules = { title: string; rules: string[] }
type TaskEntry = { title: string; subtopics: Record<string, SubtopicRules> }

const THRESHOLD = 0.55

export function labelEgeBasic(text: string): Labeled | null {
  const t = (text || '').toLowerCase()
  const tasks = taxonomy as unknown as Record<string, TaskEntry>
  const det = detectAll(text || '')

  let best: Labeled | null = null

  for (const [taskNoStr, task] of Object.entries(tasks)) {
    const taskNo = Number(taskNoStr)
    for (const [subtopic, cfg] of Object.entries(task.subtopics)) {
      const hits: string[] = []

      // Taxonomy keyword hits (+1 each). Consider both rules and optional keywords
      let keywordHits = 0
      for (const term of cfg.rules) {
        const re = new RegExp(term, 'i')
        if (re.test(t)) { keywordHits++; hits.push(term) }
      }
      const kwList: string[] = (cfg as any).keywords || []
      for (const term of kwList) {
        const re = new RegExp(term, 'i')
        if (re.test(t)) { keywordHits++; hits.push(term) }
      }

      // Heuristic scoring per task/subtopic
      let rulesScore = 0
      switch (taskNo) {
        case 1: { // округления/проценты
          if (/\bокругл/i.test(t)) rulesScore += 2
          if (/с\s+недостатком/i.test(t) && subtopic.includes('nedostat')) rulesScore += 2
          if (/с\s+избытком/i.test(t) && subtopic.includes('izbyt')) rulesScore += 2
          if (/%/.test(text)) rulesScore += 2
          if (/(стоил|стал|рубл)/i.test(t)) rulesScore += 1
          break
        }
        case 2: { // единицы измерения
          const u = det.units
          const unitCats = [u.length, u.mass, u.time, u.area, u.volume].filter((x) => x > 0).length
          if (unitCats >= 2) rulesScore += 3
          if (/(переведит|выразит|в единиц)/i.test(t)) rulesScore += 3
          rulesScore += Math.min(2, (u.length>0?1:0)+(u.mass>0?1:0)+(u.time>0?1:0)+(u.area>0?1:0)+(u.volume>0?1:0))
          break
        }
        case 3: { // графики/диаграммы
          if (det.graph) rulesScore += 4
          if (/(значение функции|по оси)/i.test(t)) rulesScore += 1
          break
        }
        case 4: { // формулы
          if (det.formula) rulesScore += 5
          if (det.varsCount >= 2) rulesScore += 1
          break
        }
        case 5: { // вероятность
          if (det.probability) rulesScore += 4
          if (/(классическ|благоприятн|исход)/i.test(t)) rulesScore += 1
          break
        }
        case 6: { // оптимизация/тарифы
          if (det.optimization) rulesScore += 4
          if (/(выберите вариант|наиболее)/i.test(t)) rulesScore += 1
          break
        }
        case 7: { // анализ графиков
          if (det.graph) rulesScore += 2
          if (/(скорост|изменени)/i.test(t)) rulesScore += 2
          break
        }
      }

      const keywordScore = keywordHits
      const taskDetectorScore = rulesScore
      const blended = 0.7 * keywordScore + 0.3 * taskDetectorScore
      const score = blended
      const confidence = Math.min(1, blended / 6)
      if (score <= 0) continue
      const candidate: Labeled = { taskNo, subtopic, confidence, hits }

      if (!best || candidate.confidence > best.confidence) {
        best = candidate
      } else if (candidate.confidence === best.confidence && best) {
        if (candidate.hits.length > best.hits.length) best = candidate
      }
    }
  }

  if (!best || best.confidence < THRESHOLD) {
    // Fallback: suggest task-level based on detectors if strong signals
    const signals: Array<{ taskNo: number; score: number }> = []
    for (const [taskNoStr] of Object.entries(tasks)) {
      const tn = Number(taskNoStr)
      let s = 0
      switch (tn) {
        case 2: s = (det.units.length>0?1:0)+(det.units.time>0?1:0)+(det.units.area>0?1:0)+(det.units.mass>0?1:0)+(det.units.volume>0?1:0); break
        case 3: s = det.graph ? 2 : 0; break
        case 4: s = det.formula ? 3 : 0; break
        case 5: s = det.probability ? 3 : 0; break
        case 6: s = det.optimization ? 3 : 0; break
        case 7: s = det.graph ? 2 : 0; break
        default: s = 0
      }
      if (s > 0) signals.push({ taskNo: tn, score: s })
    }
    signals.sort((a,b)=>b.score-a.score)
    if (signals.length > 0 && signals[0].score >= 3) {
      const tn = signals[0].taskNo
      return { taskNo: tn, subtopic: 'unknown', confidence: 0.5, hits: [] }
    }
    return null
  }
  return best
}


