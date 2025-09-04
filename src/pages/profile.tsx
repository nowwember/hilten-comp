import useSWR from 'swr';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CheckBadgeIcon, ChartBarIcon } from '@heroicons/react/24/outline';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function Profile() {
  const { data: session } = useSession();
  const { data } = useSWR(session ? '/api/users/me' : null, fetcher);

  return (
    <>
      <div className="space-y-6">
        {!session ? (
          <div>
            <p>Чтобы увидеть профиль, нужно войти.</p>
            <Link className="underline" href="/auth/signin">Войти</Link>
          </div>
        ) : !data ? (
          <div>Загрузка…</div>
        ) : (
          <>
            <motion.div className="grid sm:grid-cols-3 gap-4" initial="hidden" animate="show" variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } } }}>
              <motion.div className="card border p-6 shadow-soft" variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }}>
                <div className="text-sm text-slate-500">Пользователь</div>
                <div className="mt-1 font-medium">{data.user?.name || data.user?.email}</div>
                <div className="text-xs text-slate-500 mt-1">Роль: {data.user?.role}</div>
              </motion.div>
              <motion.div className="card border p-6 shadow-soft flex items-center gap-3" variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }}>
                <CheckBadgeIcon className="h-10 w-10 text-green-600" />
                <div>
                  <div className="text-sm text-slate-500">Решено задач</div>
                  <div className="text-2xl font-semibold">{data.solvedCount}</div>
                </div>
              </motion.div>
              <motion.div className="card border p-6 shadow-soft flex items-center gap-3" variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }}>
                <ChartBarIcon className="h-10 w-10 text-brand-600" />
                <div>
                  <div className="text-sm text-slate-500">Активность</div>
                  <div className="text-2xl font-semibold">{Math.min(100, data.submissions.length)}</div>
                </div>
              </motion.div>
            </motion.div>
            <div className="space-y-2">
              <h2 className="font-medium">Активность</h2>
              <div className="grid gap-2">
                {data.submissions.length === 0 ? (
                  <div className="text-slate-500">Нет активности</div>
                ) : (
                  data.submissions.map((s: any) => (
                    <div key={s.id} className="card border p-4 flex items-center justify-between">
                      <div>
                        <div className="text-sm">{s.task.title}</div>
                        <div className="text-xs text-slate-500">Ответ: {s.answer}</div>
                      </div>
                      <div className={s.isCorrect ? 'text-green-600' : 'text-red-600'}>
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
