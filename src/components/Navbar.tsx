import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { MoonIcon, SunIcon, ArrowRightOnRectangleIcon, UserPlusIcon } from '@heroicons/react/24/outline';

export default function Navbar() {
  const { data: session } = useSession();
  const [theme, setTheme] = useState<'light' | 'dark'>(() =>
    (typeof window !== 'undefined' && (localStorage.getItem('theme') as 'light' | 'dark')) || 'light'
  );

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    if (typeof window !== 'undefined') localStorage.setItem('theme', theme);
  }, [theme]);

  return (
    <nav className="glass border-b sticky top-0 z-20">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="inline-block h-7 w-7 rounded-lg gradient-accent" />
          <span>
            <span className="text-red-500">Хилтэн</span>
            <span className="text-amber-400">Комп</span>
          </span>
        </Link>
        <div className="flex items-center gap-1 sm:gap-3 text-sm">
          <Link href="/tasks" className="px-3 py-2 rounded-lg hover:bg-slate-900/5 dark:hover:bg-white/5 transition">Задачи</Link>
          <Link href={{ pathname: '/whiteboard', query: typeof window !== 'undefined' ? { taskId: new URLSearchParams(window.location.search).get('id') || undefined } : {} }} className="px-3 py-2 rounded-lg hover:bg-slate-900/5 dark:hover:bg-white/5 transition">Доска</Link>
          <Link href="/profile" className="px-3 py-2 rounded-lg hover:bg-slate-900/5 dark:hover:bg-white/5 transition">Профиль</Link>
          <button
            className="px-2 py-2 rounded-lg hover:bg-slate-900/5 dark:hover:bg-white/5 transition"
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            aria-label="Переключить тему"
            title="Тема"
          >{theme === 'light' ? <MoonIcon className="h-5 w-5" /> : <SunIcon className="h-5 w-5" />}</button>
          {session ? (
            <button onClick={() => signOut()} className="px-3 py-2 rounded-lg text-white gradient-accent shadow-soft transition">
              Выйти
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/auth/signin" className="px-3 py-2 rounded-lg text-white gradient-accent shadow-soft transition inline-flex items-center gap-2">
                <ArrowRightOnRectangleIcon className="h-4 w-4" /> Войти
              </Link>
              <Link href="/auth/register" className="px-3 py-2 rounded-lg border inline-flex items-center gap-2 hover:bg-slate-900/5 dark:hover:bg-white/5 transition">
                <UserPlusIcon className="h-4 w-4" /> Регистрация
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
