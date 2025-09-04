import TaskLayout from '@/layouts/TaskLayout';
import { useRouter } from 'next/router';
import useSWR from 'swr';
import { useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import { BackLink } from '@/components/ui/BackLink';
import { AnswerPanel } from '@/components/ui/AnswerPanel';
import MathRenderer from '@/components/ui/MathRenderer';
import { useAiExplain } from '@/components/ai/AiExplainProvider';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

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

  // Показываем загрузку пока данные не загружены
  if (!isClient) {
    return (
      <TaskLayout title="Задача">
        <div className="max-w-2xl mx-auto">
          <div className="text-center py-8">Загрузка…</div>
        </div>
      </TaskLayout>
    );
  }

  // Показываем ошибку если задача не найдена
  if (taskError) {
    return (
      <TaskLayout title="Ошибка">
        <div className="max-w-2xl mx-auto">
          <div className="text-center py-8">
            <h1 className="text-2xl font-semibold mb-4">Задача не найдена</h1>
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
          <div className="text-center py-8">Загрузка…</div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-3">
              <BackLink href="/tasks">Назад</BackLink>
              <div className="text-sm text-slate-500">{task.topic} · {task.difficulty}</div>
              <h1 className="text-2xl font-semibold">{task.title}</h1>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsStatementCollapsed(v => !v)}
                  className="text-sm text-blue-600 hover:underline underline-offset-4"
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
                      : 'max-h-[42vh] overflow-auto rounded-[26px] border border-neutral-200/60 p-4 md:p-5 bg-white'
                  }`
                }
              >
                {!isStatementCollapsed && <MathRenderer markdown={task.content} />}
              </div>
            </div>

            <div className="bg-white border rounded-xl shadow p-6">
              <AnswerPanel
                value={answer}
                onChange={setAnswer}
                onCheck={onSubmit}
                taskId={id || ''}
                statement={task.content}
                placeholder="Ваш ответ"
              />
              {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
              {result && (
                <p className={result.isCorrect ? 'text-green-600 mt-2' : 'text-red-600 mt-2'}>
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
