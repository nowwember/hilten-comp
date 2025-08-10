import { getCsrfToken, signIn } from 'next-auth/react';
import { GetServerSideProps } from 'next';
import Layout from '@/components/Layout';
import Link from 'next/link';
import { useState } from 'react';

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
    <Layout title="Войти">
      <div className="p-6 max-w-md mx-auto">
        <form onSubmit={onSubmit} className="space-y-4 border p-4">
          <input name="csrfToken" type="hidden" defaultValue={csrfToken} />
          <div className="space-y-1">
            <label className="text-sm">Email</label>
            <input name="email" type="email" required className="w-full border px-3 py-2 bg-transparent" />
          </div>
          <div className="space-y-1">
            <label className="text-sm">Пароль</label>
            <input name="password" type="password" required className="w-full border px-3 py-2 bg-transparent" />
          </div>
          <button type="submit" disabled={loading} className="w-full py-2 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900">
            {loading ? 'Входим…' : 'Войти'}
          </button>
          <p className="text-sm text-slate-500">Нет аккаунта? <Link href="/auth/register" className="underline">Зарегистрироваться</Link></p>
        </form>
      </div>
    </Layout>
  );
}


