import taxonomy from './taxonomy/ege-basic.json'

export type Labeled = { taskNo: number; subtopic: string; confidence: number; hits: string[] }

type SubtopicRules = { title: string; rules: string[] }
type TaskEntry = { title: string; subtopics: Record<string, SubtopicRules> }

export function labelEgeBasic(text: string): Labeled | null {
  const t = (text || '').toLowerCase()
  const tasks = taxonomy as unknown as Record<string, TaskEntry>

  let best: Labeled | null = null

  for (const [taskNoStr, task] of Object.entries(tasks)) {
    const taskNo = Number(taskNoStr)
    for (const [subtopic, cfg] of Object.entries(task.subtopics)) {
      const hits: string[] = []
      let weighted = 0
      for (const term of cfg.rules) {
        const re = new RegExp(term, 'i')
        if (re.test(t)) {
          hits.push(term)
          const weight = /\\w|\(|\)|\|/.test(term) ? 1.2 : 1.0
          weighted += weight
          if (weighted >= 3) break
        }
      }
      if (hits.length === 0) continue
      const confidence = Math.min(1, weighted / 3)
      const candidate: Labeled = { taskNo, subtopic, confidence, hits }

      if (!best || candidate.confidence > best.confidence) {
        best = candidate
      } else if (candidate.confidence === best.confidence && best) {
        if (candidate.hits.length > best.hits.length) best = candidate
      }
    }
  }

  if (!best || best.confidence < 0.6) return null
  return best
}


