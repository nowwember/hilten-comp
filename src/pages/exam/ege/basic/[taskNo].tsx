import TaskLayout from '@/layouts/TaskLayout'
import Link from 'next/link'
import type { GetServerSideProps } from 'next'
import { loadTasksByTaskNo } from '@/lib/fipi/loaders'
import type { FipiTaskJson } from '@/lib/fipi/types'
import { EGE_BASIC_MAP } from '@/lib/fipi/ege-basic-map'

type PageProps = {
  taskNo: number
  groups: Array<{ subtopic: string; count: number; examples: Array<{ slug: string }> }>
}

function slugifyTask(task: FipiTaskJson): string {
  const base = task.checksum || task.source_id || task.title || 'task'
  return String(base)
    .toLowerCase()
    .replace(/[^a-z0-9а-яё]+/gi, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

export const getServerSideProps: GetServerSideProps<PageProps> = async (ctx) => {
  const taskNoParam = ctx.params?.taskNo
  const taskNo = Number(taskNoParam)
  if (!Number.isFinite(taskNo) || taskNo <= 0) {
    return { notFound: true }
  }

  const tasks = await loadTasksByTaskNo('ege', 'basic', taskNo)
  const bySub: Record<string, FipiTaskJson[]> = {}
  for (const t of tasks) {
    const key = t.subtopic || 'unknown'
    if (!bySub[key]) bySub[key] = []
    bySub[key].push(t)
  }

  const groups = Object.entries(bySub)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([subtopic, arr]) => ({
      subtopic,
      count: arr.length,
      examples: arr.slice(0, 3).map((t) => ({ slug: slugifyTask(t) })),
    }))

  return { props: { taskNo, groups } }
}

export default function EgeBasicTaskListPage({ taskNo, groups }: PageProps) {
  const readableTitle = EGE_BASIC_MAP[taskNo]?.title || `Задание ${taskNo}`
  return (
    <TaskLayout title={`ЕГЭ · Базовая · ${readableTitle}`}>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-heading font-semibold">ЕГЭ · Базовая · {readableTitle}</h1>
          <p className="mt-1" style={{ color: 'var(--text-secondary)' }}>Подтемы и количество импортированных задач</p>
        </div>

        {groups.length === 0 ? (
          <div className="card-surface rounded-xl p-6" style={{ color: 'var(--text-muted)' }}>Пока нет импортированных задач для этого номера.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
            {groups.map((g) => (
              <div
                key={g.subtopic}
                className="h-full card-surface card-glow rounded-xl p-4 transition"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="text-base font-medium leading-snug">{g.subtopic}</div>
                  <div className="text-sm whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>{g.count} шт.</div>
                </div>
                <div className="mt-3 flex flex-wrap gap-3">
                  {g.examples.map((ex, idx) => (
                    <Link
                      key={idx}
                      href={`/exam/ege/basic/${taskNo}/${encodeURIComponent(g.subtopic)}/${encodeURIComponent(ex.slug)}`}
                      className="text-sm hover:underline"
                      style={{ color: 'var(--accent-from)' }}
                    >
                      Открыть пример {idx + 1}
                    </Link>
                  ))}
                  {g.examples.length === 0 && (
                    <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Нет примеров</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </TaskLayout>
  )
}
