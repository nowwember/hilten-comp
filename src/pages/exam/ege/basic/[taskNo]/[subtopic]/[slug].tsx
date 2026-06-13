import TaskLayout from '@/layouts/TaskLayout'
import type { GetServerSideProps } from 'next'
import MathRenderer from '@/components/ui/MathRenderer'
import SourceAttribution from '@/components/SourceAttribution'
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
          <h1 className="text-2xl font-heading font-semibold">ЕГЭ · Базовая · {readableTitle}</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Подтема: {subtopic}</p>
        </div>

        {!task ? (
          <div className="card-surface rounded-xl p-6" style={{ color: 'var(--text-muted)' }}>Задача не найдена для этой подтемы.</div>
        ) : (
          <div className="space-y-4">
            <div className="transition-all rounded-[26px] p-4 md:p-5" style={{ border: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-surface)' }}>
              {task.statement_md ? (
                <MathRenderer markdown={task.statement_md} />
              ) : task.statement_html ? (
                <div
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: minimalSanitizeHtml(task.statement_html) }}
                />
              ) : (
                <div style={{ color: 'var(--text-muted)' }}>Текст условия отсутствует.</div>
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
