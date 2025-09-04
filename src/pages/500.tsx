import Link from 'next/link';

export default function Custom500() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-red-300 mb-4">500</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Ошибка сервера</h2>
        <p className="text-gray-600 mb-8">
          Произошла внутренняя ошибка сервера. Попробуйте обновить страницу.
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          >
            Обновить страницу
          </button>
          <Link
            href="/"
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
          >
            На главную
          </Link>
        </div>
      </div>
    </div>
  );
}
