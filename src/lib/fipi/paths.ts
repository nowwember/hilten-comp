import type { FipiExam, FipiLevel } from './types'

// Базовые пути чтения JSON относительно /data
export const FIPI_DATA_ROOT = '/data/fipi'

export function taskJsonGlob(exam: FipiExam, level: FipiLevel) {
  return `${FIPI_DATA_ROOT}/${exam}/${level}/**/*.json`
}
