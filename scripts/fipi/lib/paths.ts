import * as path from 'path'

export function rawTaskPageDir(exam: string, level: string, taskNo: number, page: number): string {
  return path.join(process.cwd(), 'data', 'fipi', '_raw', exam, level, `task-${taskNo}`, `page-${page}`)
}

export function rawTaskPageFilePath(exam: string, level: string, taskNo: number, page: number, fipiId: string): string {
  return path.join(rawTaskPageDir(exam, level, taskNo, page), `${fipiId}.json`)
}


