import useSWR from 'swr';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import SortByDifficultyButton, { SortMode } from '@/components/SortByDifficultyButton';
import DifficultySelect from '@/components/DifficultySelect';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function Tasks() {
  const { data: session } = useSession();
  const [query, setQuery] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const qs = useMemo(() => {
    const p = new URLSearchParams();
    if (query) p.set('topic', query);
    if (difficulty) p.set('difficulty', difficulty);
    const s = p.toString();
    return `/api/tasks${s ? `?${s}` : ''}`;
  }, [query, difficulty]);
  const { data, mutate } = useSWR(qs, fetcher);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sort, setSort] = useState<SortMode>('none');

  async function onCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formEl = e.currentTarget;
    const f = new FormData(formEl);
    const payload = {
      title: f.get('title'),
      topic: f.get('topic'),
      difficulty: f.get('difficulty'),
      content: f.get('content'),
      answer: f.get('answer')
    } as any;
    const res = await fetch('/api/tasks', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(j.error || 'Ошибка');
    } else {
      formEl.reset();
      setCreating(false);
      mutate();
    }
  }

  return (
    <>
      <div className="p-6 space-y-6">
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Тема" className="border px-4 py-3 bg-transparent flex-1 rounded-xl" />
          <SortByDifficultyButton value={sort} onChange={setSort} />
        </div>
        {session?.user && (session.user as any).role === 'ADMIN' && (
          <div className="card border p-0 overflow-hidden">
            <button
              onClick={() => setCreating((v) => !v)}
              className="w-full p-10 text-center text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 transition"
            >
              <span className="font-medium">Добавить задачу</span>
            </button>
            {creating && (
              <form className="grid gap-3 p-4 border-t" onSubmit={onCreate}>
                <input name="title" placeholder="Заголовок" required className="border px-4 py-3 bg-transparent rounded-xl" />
                <div className="grid grid-cols-2 gap-3">
                  <input name="topic" placeholder="Тема" required className="border px-4 py-3 bg-transparent rounded-xl" />
                  <DifficultySelect name="difficulty" value={difficulty || 'EASY'} onChange={(v) => setDifficulty(v)} className="justify-self-end" />
                </div>
                <textarea name="content" placeholder="Условие" required className="border px-4 py-3 bg-transparent min-h-[120px] rounded-xl" />
                <input name="answer" placeholder="Ответ" required className="border px-4 py-3 bg-transparent rounded-xl" />
                {error && <p className="text-sm text-red-600">{error}</p>}
                <div className="flex items-center gap-3">
                  <button className="py-3 px-5 rounded-xl text-white gradient-accent shadow-soft">Сохранить</button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Кнопка сортировки перенесена в верхний блок справа от поиска */}

        <motion.div className="grid gap-3" initial="hidden" animate="show" variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } } }}>
          <motion.div variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }}>
            <Link href="/tasks/integral-katex-test" className="block card border p-5 hover:shadow-soft hover:-translate-y-0.5 transition-transform">
              <div className="flex items-center justify-between gap-4">
                <div className="font-medium text-lg flex-1">Тест: интеграл (рендер математики)</div>
                <div className="text-sm text-slate-500 text-right min-w-[180px]">Тест · MATH</div>
              </div>
            </Link>
          </motion.div>
          {!data ? (
            <div>Загрузка…</div>
          ) : data.length === 0 ? (
            <div className="text-slate-500">Нет задач</div>
          ) : (
            [...data].sort((a: any, b: any) => {
              if (sort === 'none') return 0;
              const order: Record<string, number> = { EASY: 1, MEDIUM: 2, HARD: 3 };
              return (order[a.difficulty] - order[b.difficulty]) * (sort === 'difficulty-asc' ? 1 : -1);
            }).map((t: any) => (
              <motion.div key={t.id} variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }}>
                <Link href={{ pathname: `/tasks/${t.id}`, query: { id: t.id } }} className="block card border p-5 hover:shadow-soft hover:-translate-y-0.5 transition-transform">
                  <div className="flex items-center justify-between gap-4">
                    <div className="font-medium text-lg flex-1">{t.title}</div>
                    {t.solved && <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-md">Решено</span>}
                    <div className="text-sm text-slate-500 text-right min-w-[180px]">{t.topic} · {t.difficulty}</div>
                  </div>
                </Link>
              </motion.div>
            ))
          )}
        </motion.div>
      </div>
    </>
  );
}
