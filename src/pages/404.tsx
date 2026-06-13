import Link from 'next/link';

export default function Custom404() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-heading font-bold text-gradient mb-4">404</h1>
        <h2 className="text-2xl font-heading font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Страница не найдена</h2>
        <p className="mb-8" style={{ color: 'var(--text-secondary)' }}>
          Запрашиваемая страница не существует или была перемещена.
        </p>
        <Link
          href="/"
          className="px-6 py-3 text-white gradient-accent btn-aurora rounded-xl transition"
        >
          Вернуться на главную
        </Link>
      </div>
    </div>
  );
}
