import Layout from '@/components/Layout';
import { useRouter } from 'next/router';
import useSWR from 'swr';
import { useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function TaskPage() {
  const { query, push } = useRouter();
  const id = query.id as string | undefined;
  const { data: session } = useSession();
  const { data: task, mutate } = useSWR(id ? `/api/tasks/${id}` : null, fetcher);
  const [result, setResult] = useState<null | { isCorrect: boolean }>(null);
  const [error, setError] = useState<string | null>(null);
  const [aiOpen, setAiOpen] = useState(false);

  const submissionKey = useMemo(() => (id ? `/api/submissions?taskId=${id}` : null), [id]);
  const { data: latestSubmission } = useSWR(submissionKey, fetcher);

  useEffect(() => {
    if (latestSubmission) setResult({ isCorrect: latestSubmission?.isCorrect ?? false });
  }, [latestSubmission]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!id) return;
    if (!session) {
      push('/auth/signin');
      return;
    }
    setError(null);
    const f = new FormData(e.currentTarget);
    const res = await fetch('/api/submissions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taskId: id, answer: f.get('answer') })
    });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(j.error || 'Ошибка');
    } else {
      const j = await res.json();
      setResult({ isCorrect: j.isCorrect });
    }
  }

  return (
    <Layout title={task ? task.title : 'Задача'}>
      <div className="p-6 space-y-6">
        {!task ? (
          <div>Загрузка…</div>
        ) : (
          <>
            <div className="space-y-3 card border p-6 shadow-sm">
              <button onClick={() => push('/tasks')} className="text-sm inline-flex items-center gap-2 px-3 py-2 rounded-lg border hover:bg-slate-900/5 dark:hover:bg-white/5 transition">
                ← Назад
              </button>
              <div className="text-sm text-slate-500">{task.topic} · {task.difficulty}</div>
              <h1 className="text-2xl font-semibold">{task.title}</h1>
              <p className="whitespace-pre-wrap leading-relaxed text-slate-700 dark:text-slate-300">{task.content}</p>
            </div>
            <form onSubmit={onSubmit} className="grid gap-3 card border p-6">
              <input name="answer" placeholder="Ваш ответ" required className="border px-4 py-3 bg-transparent rounded-xl" />
              {error && <p className="text-sm text-red-600">{error}</p>}
              <div className="flex items-center gap-3">
                <button className="py-3 px-5 rounded-xl text-white gradient-accent shadow-soft">Проверить</button>
                <button type="button" onClick={() => setAiOpen(true)} className="py-3 px-5 rounded-xl border hover:bg-slate-900/5 dark:hover:bg-white/5 transition">Объяснение от ИИ</button>
              </div>
              {result && (
                <p className={result.isCorrect ? 'text-green-600' : 'text-red-600'}>
                  {result.isCorrect ? 'Верно! Задача зачтена.' : 'Неверно. Попробуйте ещё раз.'}
                </p>
              )}
            </form>

            {aiOpen && (
              <div className="fixed inset-0 pointer-events-none flex justify-end animate-fade-in">
                <div className="pointer-events-auto w-full max-w-md h-full bg-white dark:bg-slate-950 border-l p-4 flex flex-col">
                  <div className="flex items-center justify-between pb-2 border-b">
                    <div className="font-medium">Объяснение от ИИ</div>
                    <button className="text-sm underline" onClick={() => setAiOpen(false)}>Закрыть</button>
                  </div>
                  <div className="text-sm text-slate-500 py-2">Пока что это заглушка. В будущем сюда подключим модель и будем подмешивать контекст текущей задачи.</div>
                  <div className="flex-1 overflow-auto space-y-2" id="ai-chat-log">
                    <div className="text-sm p-2 bg-slate-50 dark:bg-slate-900">Подсказать ход решения? Опишите, где застряли.</div>
                  </div>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const f = new FormData(e.currentTarget);
                      const message = String(f.get('message') || '').trim();
                      if (!message) return;
                      const log = document.getElementById('ai-chat-log');
                      if (log) {
                        const you = document.createElement('div');
                        you.className = 'text-sm p-2 bg-blue-50 dark:bg-slate-800';
                        you.textContent = `Вы: ${message}`;
                        log.appendChild(you);
                        const bot = document.createElement('div');
                        bot.className = 'text-sm p-2 bg-slate-50 dark:bg-slate-900';
                        bot.textContent = 'ИИ: (заглушка) Подумайте над условиями задачи и разбейте её на подзадачи.';
                        log.appendChild(bot);
                        log.scrollTop = log.scrollHeight;
                      }
                      (e.currentTarget as HTMLFormElement).reset();
                    }}
                    className="mt-2 flex gap-2"
                  >
                    <input name="message" placeholder="Ваш вопрос по задаче" className="border px-3 py-2 bg-transparent flex-1" />
                    <button className="px-3 py-2 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900">Отправить</button>
                  </form>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}
