import { getCsrfToken, signIn } from 'next-auth/react';
import { GetServerSideProps } from 'next';
import Link from 'next/link';
import { useState } from 'react';
import FloatingMathShapes from '@/components/ui/FloatingMathShapes';

export const getServerSideProps: GetServerSideProps = async (context) => {
  const csrfToken = await getCsrfToken(context);
  return { props: { csrfToken } } as any;
};

export default function SignIn({ csrfToken }: { csrfToken: string }) {
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setLoading(true);
    await signIn('credentials', {
      redirect: true,
      callbackUrl: '/',
      email: formData.get('email'),
      password: formData.get('password')
    });
    setLoading(false);
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
          <p className="text-sm" style={{ color: 'var(--ink-soft)' }}>Вход в аккаунт</p>
        </div>

        <input name="csrfToken" type="hidden" defaultValue={csrfToken} />

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

        <button type="submit" disabled={loading} className="btn-primary w-full py-3 font-medium disabled:opacity-60 transition">
          {loading ? 'Входим…' : 'Войти'}
        </button>

        <p className="text-sm text-center" style={{ color: 'var(--ink-soft)' }}>
          Нет аккаунта?{' '}
          <Link href="/auth/register" className="font-medium underline" style={{ color: 'var(--red-deep)' }}>
            Регистрация
          </Link>
        </p>
      </form>
    </div>
  );
}
