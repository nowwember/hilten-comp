import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import FloatingMathShapes from '@/components/ui/FloatingMathShapes';

export default function Register() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.get('name'),
        email: form.get('email'),
        password: form.get('password')
      })
    });
    setLoading(false);
    if (res.ok) {
      router.push('/auth/signin');
    } else {
      const json = await res.json().catch(() => ({}));
      setError(json.error || 'Ошибка регистрации');
    }
  }

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center overflow-hidden px-4 py-12">
      <FloatingMathShapes density="subtle" cursors={false} />

      <form
        onSubmit={onSubmit}
        className="relative z-10 w-full max-w-md p-8 sm:p-10 space-y-6 border"
        style={{ background: 'var(--surface)', borderColor: 'var(--line)', borderRadius: 'var(--radius-lg)' }}
      >
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="inline-block h-10 w-10 rounded-xl" style={{ background: 'var(--brand)' }} />
          <h1 className="font-display text-2xl font-bold">ХилтэнКомп</h1>
          <p className="text-sm" style={{ color: 'var(--ink-soft)' }}>Создание аккаунта</p>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium" htmlFor="name">Имя (опционально)</label>
          <input
            id="name"
            name="name"
            type="text"
            className="w-full border px-4 py-3 bg-transparent focus:outline-none focus:ring-2 transition"
            style={{ borderColor: 'var(--line-2)', '--tw-ring-color': 'var(--red)' } as React.CSSProperties}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium" htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="w-full border px-4 py-3 bg-transparent focus:outline-none focus:ring-2 transition"
            style={{ borderColor: 'var(--line-2)', '--tw-ring-color': 'var(--red)' } as React.CSSProperties}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium" htmlFor="password">Пароль</label>
          <input
            id="password"
            name="password"
            type="password"
            required
            className="w-full border px-4 py-3 bg-transparent focus:outline-none focus:ring-2 transition"
            style={{ borderColor: 'var(--line-2)', '--tw-ring-color': 'var(--red)' } as React.CSSProperties}
          />
        </div>

        {error && (
          <p className="text-sm font-mono" style={{ color: 'var(--red)' }}>{error}</p>
        )}

        <button type="submit" disabled={loading} className="btn-primary w-full py-3 font-medium disabled:opacity-60 transition">
          {loading ? 'Создаём…' : 'Зарегистрироваться'}
        </button>

        <p className="text-sm text-center" style={{ color: 'var(--ink-soft)' }}>
          Уже есть аккаунт?{' '}
          <Link href="/auth/signin" className="font-medium underline" style={{ color: 'var(--red-deep)' }}>
            Войти
          </Link>
        </p>
      </form>
    </div>
  );
}
