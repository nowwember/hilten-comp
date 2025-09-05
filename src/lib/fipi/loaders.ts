import type { FipiExam, FipiLevel, FipiTaskJson } from './types'

// Функции для загрузки JSON пачками/по ключу; работают и в SSG/SSR
// Используй динамический импорт JSON (Next 14 умеет), без fs в рантайме.

export async function loadAllTasks(exam: FipiExam, level: FipiLevel): Promise<FipiTaskJson[]> {
  try {
    // В Next.js 14+ можно использовать динамический импорт для JSON
    // Путь будет разрешен относительно public/data или data в корне проекта
    const dataPath = `/data/fipi/${exam}/${level}`
    
    // Для SSG/SSR нужно использовать require.context или статический импорт
    // В рантайме используем fetch для динамической загрузки
    if (typeof window !== 'undefined') {
      // Клиентская сторона - используем fetch
      const response = await fetch(`${dataPath}/index.json`)
      if (!response.ok) {
        console.warn(`Failed to load tasks for ${exam}/${level}:`, response.statusText)
        return []
      }
      return await response.json()
    } else {
      // Серверная сторона - используем require для статических данных
      try {
        const tasks = require(`../../../../data/fipi/${exam}/${level}/index.json`)
        return Array.isArray(tasks) ? tasks : []
      } catch (error) {
        console.warn(`Failed to require tasks for ${exam}/${level}:`, error)
        return []
      }
    }
  } catch (error) {
    console.error(`Error loading all tasks for ${exam}/${level}:`, error)
    return []
  }
}

export async function loadTasksByTaskNo(exam: FipiExam, level: FipiLevel, taskNo: number): Promise<FipiTaskJson[]> {
  try {
    const allTasks = await loadAllTasks(exam, level)
    return allTasks.filter(task => task.taskNo === taskNo)
  } catch (error) {
    console.error(`Error loading tasks by taskNo ${taskNo} for ${exam}/${level}:`, error)
    return []
  }
}

export async function loadOne(exam: FipiExam, level: FipiLevel, taskNo: number, subtopic: string): Promise<FipiTaskJson | null> {
  try {
    const tasks = await loadTasksByTaskNo(exam, level, taskNo)
    return tasks.find(task => task.subtopic === subtopic) || null
  } catch (error) {
    console.error(`Error loading task ${taskNo}/${subtopic} for ${exam}/${level}:`, error)
    return null
  }
}
