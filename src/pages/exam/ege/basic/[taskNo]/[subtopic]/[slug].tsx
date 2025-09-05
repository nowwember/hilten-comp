import TaskLayout from '@/layouts/TaskLayout'
import type { GetServerSideProps } from 'next'
import MathRenderer from '@/components/ui/MathRenderer'
import { SourceAttribution } from '@/components/tasks/SourceAttribution'
import { loadOne } from '@/lib/fipi/loaders'
import type { FipiTaskJson } from '@/lib/fipi/types'
import { EGE_BASIC_MAP } from '@/lib/fipi/ege-basic-map'
import BackLink from '@/components/ui/BackLink'

type PageProps = {
  taskNo: number
  subtopic: string
  task: FipiTaskJson | null
}

function minimalSanitizeHtml(html: string): string {
  // Минимальная очистка: вырезаем теги <script> и on* атрибуты
  // Не добавляем зависимостей
  let safe = html.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
  safe = safe.replace(/ on[a-z]+="[^"]*"/gi, '')
  safe = safe.replace(/ on[a-z]+='[^']*'/gi, '')
  return safe
}

export const getServerSideProps: GetServerSideProps<PageProps> = async (ctx) => {
  const taskNoParam = ctx.params?.taskNo
  const subtopicParam = ctx.params?.subtopic
  const slugParam = ctx.params?.slug
  const taskNo = Number(taskNoParam)
  const subtopic = typeof subtopicParam === 'string' ? subtopicParam : ''
  if (!Number.isFinite(taskNo) || taskNo <= 0 || !subtopic) {
    return { notFound: true }
  }

  // slug здесь для маршрута, задача ищется по ключам
  const task = await loadOne('ege', 'basic', taskNo, subtopic)
  return { props: { taskNo, subtopic, task: task || null } }
}

export default function EgeBasicTaskCardPage({ taskNo, subtopic, task }: PageProps) {
  const readableTitle = EGE_BASIC_MAP[taskNo]?.title || `Задание ${taskNo}`
  return (
    <TaskLayout title={task ? `${readableTitle}` : `ЕГЭ · Базовая · ${readableTitle}`}> 
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="space-y-2">
          <BackLink href={`/exam/ege/basic/${taskNo}`}>Назад</BackLink>
          <h1 className="text-2xl font-semibold">ЕГЭ · Базовая · {readableTitle}</h1>
          <p className="text-slate-500">Подтема: {subtopic}</p>
        </div>

        {!task ? (
          <div className="border rounded-xl p-6 text-slate-500">Задача не найдена для этой подтемы.</div>
        ) : (
          <div className="space-y-4">
            <div className="transition-all rounded-[26px] border border-neutral-200/60 p-4 md:p-5 bg-white">
              {task.statement_md ? (
                <MathRenderer markdown={task.statement_md} />
              ) : task.statement_html ? (
                <div
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: minimalSanitizeHtml(task.statement_html) }}
                />
              ) : (
                <div className="text-slate-500">Текст условия отсутствует.</div>
              )}
              {task.source_url && (
                <SourceAttribution url={task.source_url} accessedAt={task.accessed_at} id={task.source_id} />
              )}
            </div>
          </div>
        )}
      </div>
    </TaskLayout>
  )
}


