import TaskLayout from '@/layouts/TaskLayout';
import { useRouter } from 'next/router';
import useSWR from 'swr';
import { useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import { BackLink } from '@/components/ui/BackLink';
import { AnswerPanel } from '@/components/ui/AnswerPanel';
import MathRenderer from '@/components/ui/MathRenderer';
import { useAiExplain } from '@/components/ai/AiExplainProvider';
import { SourceAttribution } from '@/components/tasks/SourceAttribution';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const DIFFICULTY_BADGE: Record<string, string> = {
  EASY: 'b-easy',
  MEDIUM: 'b-med',
  HARD: 'b-hard',
};

const DIFFICULTY_LABEL: Record<string, string> = {
  EASY: 'Легко',
  MEDIUM: 'Средне',
  HARD: 'Сложно',
};

export default function TaskPage() {
  const { query, push } = useRouter();
  const id = query.id as string | undefined;
  const { setActiveByTaskId } = useAiExplain();
  const { data: session } = useSession();
  const [isClient, setIsClient] = useState(false);
  const { data: task, error: taskError, mutate } = useSWR(id ? `/api/tasks/${id}` : null, fetcher);
  const [result, setResult] = useState<null | { isCorrect: boolean }>(null);
  const [error, setError] = useState<string | null>(null);
  const [answer, setAnswer] = useState('');
  const [isStatementCollapsed, setIsStatementCollapsed] = useState(false);

  const submissionKey = useMemo(() => (id ? `/api/submissions?taskId=${id}` : null), [id]);
  const { data: latestSubmission } = useSWR(submissionKey, fetcher);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const key = (id != null && id !== undefined) ? String(id) : '';
    if (key) setActiveByTaskId(key);
  }, [id, setActiveByTaskId]);

  useEffect(() => {
    if (latestSubmission) setResult({ isCorrect: latestSubmission?.isCorrect ?? false });
  }, [latestSubmission]);

  async function onSubmit() {
    if (!id) return;
    if (!session) { push('/auth/signin'); return; }
    setError(null);
    const res = await fetch('/api/submissions', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ taskId: id, answer })
    });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(j.error || 'Ошибка');
    } else {
      const j = await res.json();
      setResult({ isCorrect: j.isCorrect });
    }
  }

  if (!isClient) {
    return (
      <TaskLayout title="Задача">
        <div className="max-w-2xl mx-auto">
          <div className="text-center py-8" style={{ color: 'var(--ink-soft)' }}>Загрузка…</div>
        </div>
      </TaskLayout>
    );
  }

  if (taskError) {
    return (
      <TaskLayout title="Ошибка">
        <div className="max-w-2xl mx-auto">
          <div className="text-center py-8">
            <h1 className="font-display text-2xl font-bold mb-4" style={{ color: 'var(--ink)' }}>Задача не найдена</h1>
            <BackLink href="/tasks">Вернуться к списку задач</BackLink>
          </div>
        </div>
      </TaskLayout>
    );
  }

  return (
    <TaskLayout title={task ? task.title : 'Задача'}>
      <div className="max-w-2xl mx-auto">
        {!task ? (
          <div className="text-center py-8" style={{ color: 'var(--ink-soft)' }}>Загрузка…</div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-3">
              <BackLink href="/tasks">Назад</BackLink>
              <span className={`badge ${DIFFICULTY_BADGE[task.difficulty] || ''}`}>{DIFFICULTY_LABEL[task.difficulty] || task.difficulty}</span>
              <div className="font-mono text-sm" style={{ color: 'var(--ink-soft)' }}>{task.topic}</div>
              <h1 className="font-display text-2xl md:text-3xl font-bold" style={{ color: 'var(--ink)' }}>{task.title}</h1>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsStatementCollapsed(v => !v)}
                  className="text-sm hover:underline underline-offset-4"
                  style={{ color: 'var(--red)' }}
                  aria-expanded={!isStatementCollapsed}
                >
                  {isStatementCollapsed ? 'Развернуть условие' : 'Свернуть условие'}
                </button>
              </div>
              <div
                className={
                  `transition-all duration-300 ${
                    isStatementCollapsed
                      ? 'max-h-0 p-0 border-transparent overflow-hidden'
                      : 'max-h-[42vh] overflow-auto rounded-[var(--radius-lg)] p-4 md:p-5'
                  }`
                }
                style={!isStatementCollapsed ? { backgroundColor: 'var(--surface)', border: '1px solid var(--line)' } : undefined}
              >
                {!isStatementCollapsed && (
                  <>
                    <MathRenderer markdown={task.content} />
                    {task.source_url && (
                      <SourceAttribution
                        url={task.source_url}
                        accessedAt={task.accessed_at}
                        id={task.source_id}
                      />
                    )}
                  </>
                )}
              </div>
            </div>

            <div className="rounded-[var(--radius)] p-6" style={{ background: 'var(--surface)', border: '1px solid var(--line)' }}>
              <AnswerPanel
                value={answer}
                onChange={setAnswer}
                onCheck={onSubmit}
                taskId={id || ''}
                statement={task.content}
                placeholder="Ваш ответ"
              />
              {error && <p className="text-sm mt-2" style={{ color: 'var(--red)' }}>{error}</p>}
              {result && (
                <p className="mt-2" style={{ color: result.isCorrect ? 'var(--green-deep)' : 'var(--red)' }}>
                  {result.isCorrect ? 'Верно! Задача зачтена.' : 'Неверно. Попробуйте ещё раз.'}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </TaskLayout>
  );
}
