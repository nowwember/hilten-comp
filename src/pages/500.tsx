import Link from 'next/link';

export default function Custom500() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-heading font-bold mb-4" style={{ color: 'var(--status-error)' }}>500</h1>
        <h2 className="text-2xl font-heading font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Ошибка сервера</h2>
        <p className="mb-8" style={{ color: 'var(--text-secondary)' }}>
          Произошла внутренняя ошибка сервера. Попробуйте обновить страницу.
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 text-white gradient-accent btn-aurora rounded-xl transition"
          >
            Обновить страницу
          </button>
          <Link
            href="/"
            className="px-6 py-3 border rounded-xl hover:bg-white/5 transition"
            style={{ borderColor: 'var(--border-glass)', color: 'var(--text-secondary)' }}
          >
            На главную
          </Link>
        </div>
      </div>
    </div>
  );
}
