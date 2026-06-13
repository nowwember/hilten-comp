import useSWR from 'swr';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import SortByDifficultyButton, { SortMode } from '@/components/SortByDifficultyButton';
import DifficultySelect from '@/components/DifficultySelect';
import { EmptyState } from '@/components/ui/EmptyState';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const fadeUp = { hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } };

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

function inputStyle() {
  return {
    backgroundColor: 'var(--surface)',
    borderColor: 'var(--line-2)',
    color: 'var(--ink)',
  } as React.CSSProperties;
}

function focusRing(e: React.FocusEvent<HTMLElement>) {
  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(230,62,43,.14)';
  e.currentTarget.style.borderColor = 'var(--red)';
}

function blurRing(e: React.FocusEvent<HTMLElement>) {
  e.currentTarget.style.boxShadow = 'none';
  e.currentTarget.style.borderColor = 'var(--line-2)';
}

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
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Тема"
            className="border px-4 py-3 flex-1 rounded-xl focus:outline-none transition-shadow"
            style={inputStyle()}
            onFocus={focusRing}
            onBlur={blurRing}
          />
          <SortByDifficultyButton value={sort} onChange={setSort} />
        </div>
        {session?.user && (session.user as any).role === 'ADMIN' && (
          <div className="rounded-[var(--radius-lg)] overflow-hidden" style={{ background: 'var(--surface)', border: '1px solid var(--line)' }}>
            <button
              onClick={() => setCreating((v) => !v)}
              className="w-full p-10 text-center hover:bg-[var(--paper-2)] transition"
              style={{ color: 'var(--ink-soft)' }}
            >
              <span className="font-medium">Добавить задачу</span>
            </button>
            {creating && (
              <form className="grid gap-3 p-4" style={{ borderTop: '1px solid var(--line)' }} onSubmit={onCreate}>
                <input name="title" placeholder="Заголовок" required className="border px-4 py-3 rounded-xl focus:outline-none transition-shadow" style={inputStyle()} onFocus={focusRing} onBlur={blurRing} />
                <div className="grid grid-cols-2 gap-3">
                  <input name="topic" placeholder="Тема" required className="border px-4 py-3 rounded-xl focus:outline-none transition-shadow" style={inputStyle()} onFocus={focusRing} onBlur={blurRing} />
                  <DifficultySelect name="difficulty" value={difficulty || 'EASY'} onChange={(v) => setDifficulty(v)} className="justify-self-end" />
                </div>
                <textarea name="content" placeholder="Условие" required className="border px-4 py-3 min-h-[120px] rounded-xl focus:outline-none transition-shadow" style={inputStyle()} onFocus={focusRing} onBlur={blurRing} />
                <input name="answer" placeholder="Ответ" required className="border px-4 py-3 rounded-xl focus:outline-none transition-shadow" style={inputStyle()} onFocus={focusRing} onBlur={blurRing} />
                {error && <p className="text-sm" style={{ color: 'var(--red)' }}>{error}</p>}
                <div className="flex items-center gap-3">
                  <button className="btn-primary py-3 px-5 rounded-xl font-medium">Сохранить</button>
                </div>
              </form>
            )}
          </div>
        )}

        <motion.div className="grid gap-3" initial="hidden" animate="show" variants={stagger}>
          <motion.div variants={fadeUp}>
            <Link
              href="/tasks/integral-katex-test"
              className="block rounded-[var(--radius)] p-5 transition-all hover:-translate-y-0.5 hover:shadow-lg"
              style={{ background: 'var(--surface)', border: '1px solid var(--line)' }}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="font-medium text-lg flex-1" style={{ color: 'var(--ink)' }}>Тест: интеграл (рендер математики)</div>
                <div className="font-mono text-sm text-right min-w-[180px]" style={{ color: 'var(--ink-soft)' }}>Тест · MATH</div>
              </div>
            </Link>
          </motion.div>
          {!data ? (
            <div style={{ color: 'var(--ink-soft)' }}>Загрузка…</div>
          ) : data.length === 0 ? (
            <EmptyState
              title="Задач не найдено"
              text="Попробуйте изменить фильтры или сбросить тему поиска"
            />
          ) : (
            [...data].sort((a: any, b: any) => {
              if (sort === 'none') return 0;
              const order: Record<string, number> = { EASY: 1, MEDIUM: 2, HARD: 3 };
              return (order[a.difficulty] - order[b.difficulty]) * (sort === 'difficulty-asc' ? 1 : -1);
            }).map((t: any) => (
              <motion.div key={t.id} variants={fadeUp}>
                <Link
                  href={{ pathname: `/tasks/${t.id}`, query: { id: t.id } }}
                  className="block rounded-[var(--radius)] p-5 transition-all hover:-translate-y-0.5 hover:shadow-lg"
                  style={{ background: 'var(--surface)', border: '1px solid var(--line)' }}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="font-medium text-lg flex-1" style={{ color: 'var(--ink)' }}>{t.title}</div>
                    {t.solved && <span className="badge b-easy">Решено</span>}
                    <span className={`badge ${DIFFICULTY_BADGE[t.difficulty] || ''}`}>{DIFFICULTY_LABEL[t.difficulty] || t.difficulty}</span>
                    <div className="font-mono text-sm text-right min-w-[120px]" style={{ color: 'var(--ink-soft)' }}>{t.topic}</div>
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
