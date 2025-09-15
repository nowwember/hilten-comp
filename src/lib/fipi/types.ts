export type FipiExam = 'ege' | 'oge'

export type FipiLevel = 'basic' | 'profile'

export type FipiTaskJson = {
  exam: FipiExam
  level: FipiLevel
  taskNo: number              // 1..21 для ЕГЭ-база
  subtopic: string            // слаг подтемы
  title: string               // например: "Задание 3. Куб"
  statement_md?: string       // Markdown с $...$/$$...$$ (если удалось)
  statement_html?: string     // sanitized HTML (fallback)
  answer?: string             // если доступно
  assets?: string[]           // пути к локальным картинкам /fipi/...
  source_url: string
  source_id?: string
  accessed_at: string         // ISO
  checksum: string            // sha256 текста+картинок
}
