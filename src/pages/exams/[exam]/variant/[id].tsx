import { useRouter } from 'next/router';
import Link from 'next/link';
import { getVariants, getCurrentMonth, Variant, ExamId, Mode, DEFAULT_DURATION_MINUTES } from '@/lib/exams/variants';

export default function VariantViewPage() {
  const router = useRouter();
  const { exam, id } = router.query;
  const month = typeof router.query.month === 'string' ? router.query.month : getCurrentMonth();
  const mode = typeof router.query.mode === 'string' ? router.query.mode as Mode : undefined;

  // Получаем вариант
  let variant: Variant | undefined;
  if (exam && id && typeof exam === 'string' && typeof id === 'string') {
    const found = getVariants(month, exam as ExamId, mode).find(v => v.id === id);
    if (found) variant = found;
  }

  // Время на вариант
  const duration = exam === 'oge' ? DEFAULT_DURATION_MINUTES.oge : mode === 'profile' ? DEFAULT_DURATION_MINUTES.ege_profile : DEFAULT_DURATION_MINUTES.ege_base;

  if (!variant) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center text-slate-500">
        Вариант не найден.
        <div className="mt-6">
          <Link
            href={{ pathname: `/exams/${exam}/variants`, query: { month, ...(exam === 'ege' ? { mode } : {}) } }}
            className="inline-block px-6 py-3 rounded-xl border text-red-500 border-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 font-medium transition-colors"
          >
            ← Назад к вариантам
          </Link>
        </div>
      </div>
    );
  }

  const totalTasks = variant.picks.reduce((sum, p) => sum + p.count, 0);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Хлебные крошки */}
      <nav className="mb-6 text-sm text-slate-500 flex gap-2 items-center">
        <Link href={`/exams/${exam}${mode ? `?mode=${mode}` : ''}`} className="hover:underline">Экзамен</Link>
        <span>/</span>
        <Link href={{ pathname: `/exams/${exam}/variants`, query: { month, ...(exam === 'ege' ? { mode } : {}) } }} className="hover:underline">Варианты ({month})</Link>
        <span>/</span>
        <span className="text-slate-700 dark:text-slate-200 font-medium">{variant.title}</span>
      </nav>

      {/* Кнопка Назад */}
      <div className="mb-4">
        <Link
          href={{ pathname: `/exams/${exam}/variants`, query: { month, ...(exam === 'ege' ? { mode } : {}) } }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border text-slate-600 border-slate-300 hover:bg-neutral-50 transition-colors font-medium"
        >
          <span className="text-lg">←</span> Назад к вариантам
        </Link>
      </div>

      {/* Заголовок и метрики */}
      <h1 className="text-2xl font-bold mb-2">{variant.title}</h1>
      <div className="mb-4 flex flex-wrap gap-4 text-slate-600 dark:text-slate-300 text-sm">
        <span>Месяц: <b>{variant.month}</b></span>
        <span>Задач: <b>{totalTasks}</b></span>
        <span>Время: <b>{duration} мин</b></span>
        {variant.tags && variant.tags.length > 0 && (
          <span>Теги: {variant.tags.join(', ')}</span>
        )}
      </div>

      {/* Состав варианта */}
      <div className="mb-8">
        <h2 className="font-semibold text-lg mb-3">Состав варианта</h2>
        <ul className="space-y-2">
          {variant.picks.map((pick, idx) => (
            <li key={idx} className="flex gap-2 items-center text-slate-700 dark:text-slate-200">
              <span className="font-medium">Задание №{pick.taskNumber}</span>
              <span className="text-xs text-slate-500">× {pick.count}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Кнопки */}
      <div className="flex gap-4">
        <Link
          href={{ pathname: `/exams/${exam}/variant/${variant.id}/solve`, query: { month, ...(exam === 'ege' ? { mode } : {}) } }}
          className="flex-1 py-3 px-6 rounded-xl text-white bg-red-500 hover:bg-red-600 transition-colors text-center font-medium"
        >
          Начать
        </Link>
        <Link
          href={{ pathname: `/exams/${exam}/variants`, query: { month, ...(exam === 'ege' ? { mode } : {}) } }}
          className="flex-1 py-3 px-6 rounded-xl border text-red-500 border-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors text-center font-medium"
        >
          Назад к вариантам
        </Link>
      </div>
    </div>
  );
}
