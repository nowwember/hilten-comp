import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';

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
    <>
      <div className="p-6 max-w-md mx-auto">
        <form onSubmit={onSubmit} className="space-y-4 border p-4">
          <div className="space-y-1">
            <label className="text-sm">Имя (опционально)</label>
            <input name="name" type="text" className="w-full border px-3 py-2 bg-transparent" />
          </div>
          <div className="space-y-1">
            <label className="text-sm">Email</label>
            <input name="email" type="email" required className="w-full border px-3 py-2 bg-transparent" />
          </div>
          <div className="space-y-1">
            <label className="text-sm">Пароль</label>
            <input name="password" type="password" required className="w-full border px-3 py-2 bg-transparent" />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button type="submit" disabled={loading} className="w-full py-2 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900">
            {loading ? 'Создаём…' : 'Зарегистрироваться'}
          </button>
          <p className="text-sm text-slate-500">Уже есть аккаунт? <Link href="/auth/signin" className="underline">Войти</Link></p>
        </form>
      </div>
    </>
  );
}


