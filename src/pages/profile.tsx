import useSWR from 'swr';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CheckBadgeIcon, ChartBarIcon } from '@heroicons/react/24/outline';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const fadeUp = { hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } };

export default function Profile() {
  const { data: session } = useSession();
  const { data } = useSWR(session ? '/api/users/me' : null, fetcher);

  return (
    <>
      <div className="space-y-6">
        {!session ? (
          <div>
            <p>Чтобы увидеть профиль, нужно войти.</p>
            <Link className="underline" href="/auth/signin" style={{ color: 'var(--accent-from)' }}>Войти</Link>
          </div>
        ) : !data ? (
          <div style={{ color: 'var(--text-muted)' }}>Загрузка…</div>
        ) : (
          <>
            <motion.div className="grid sm:grid-cols-3 gap-4" initial="hidden" animate="show" variants={stagger}>
              <motion.div className="card-glass card-glow p-6" variants={fadeUp}>
                <div className="text-sm" style={{ color: 'var(--text-muted)' }}>Пользователь</div>
                <div className="mt-1 font-medium">{data.user?.name || data.user?.email}</div>
                <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Роль: {data.user?.role}</div>
              </motion.div>
              <motion.div className="card-glass card-glow p-6 flex items-center gap-3" variants={fadeUp}>
                <CheckBadgeIcon className="h-10 w-10" style={{ color: 'var(--status-success)' }} />
                <div>
                  <div className="text-sm" style={{ color: 'var(--text-muted)' }}>Решено задач</div>
                  <div className="text-2xl font-heading font-semibold">{data.solvedCount}</div>
                </div>
              </motion.div>
              <motion.div className="card-glass card-glow p-6 flex items-center gap-3" variants={fadeUp}>
                <ChartBarIcon className="h-10 w-10" style={{ color: 'var(--accent-from)' }} />
                <div>
                  <div className="text-sm" style={{ color: 'var(--text-muted)' }}>Активность</div>
                  <div className="text-2xl font-heading font-semibold">{Math.min(100, data.submissions.length)}</div>
                </div>
              </motion.div>
            </motion.div>
            <div className="space-y-2">
              <h2 className="font-heading font-medium text-lg">Активность</h2>
              <div className="grid gap-2">
                {data.submissions.length === 0 ? (
                  <div style={{ color: 'var(--text-muted)' }}>Нет активности</div>
                ) : (
                  data.submissions.map((s: any) => (
                    <div key={s.id} className="card-surface card-glow p-4 flex items-center justify-between">
                      <div>
                        <div className="text-sm">{s.task.title}</div>
                        <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Ответ: {s.answer}</div>
                      </div>
                      <div style={{ color: s.isCorrect ? 'var(--status-success)' : 'var(--status-error)' }}>
                        {s.isCorrect ? 'Верно' : 'Неверно'}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
