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
      <div className="max-w-2xl mx-auto px-4 py-12 text-center" style={{ color: 'var(--text-secondary)' }}>
        Вариант не найден.
        <div className="mt-6">
          <Link
            href={{ pathname: `/exams/${exam}/variants`, query: { month, ...(exam === 'ege' ? { mode } : {}) } }}
            className="inline-block px-6 py-3 rounded-xl font-medium transition-colors"
            style={{ borderColor: 'var(--border-glass)', color: 'var(--text-secondary)', borderWidth: '1px', borderStyle: 'solid' }}
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
      <nav className="mb-6 text-sm flex gap-2 items-center" style={{ color: 'var(--text-secondary)' }}>
        <Link href={`/exams/${exam}${mode ? `?mode=${mode}` : ''}`} className="hover:underline">Экзамен</Link>
        <span>/</span>
        <Link href={{ pathname: `/exams/${exam}/variants`, query: { month, ...(exam === 'ege' ? { mode } : {}) } }} className="hover:underline">Варианты ({month})</Link>
        <span>/</span>
        <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{variant.title}</span>
      </nav>

      {/* Кнопка Назад */}
      <div className="mb-4">
        <Link
          href={{ pathname: `/exams/${exam}/variants`, query: { month, ...(exam === 'ege' ? { mode } : {}) } }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl transition-colors font-medium hover:bg-white/5"
          style={{ borderColor: 'var(--border-glass)', color: 'var(--text-secondary)', borderWidth: '1px', borderStyle: 'solid' }}
        >
          <span className="text-lg">←</span> Назад к вариантам
        </Link>
      </div>

      {/* Заголовок и метрики */}
      <h1 className="text-2xl font-bold font-heading mb-2">{variant.title}</h1>
      <div className="mb-4 flex flex-wrap gap-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
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
            <li key={idx} className="flex gap-2 items-center" style={{ color: 'var(--text-primary)' }}>
              <span className="font-medium">Задание №{pick.taskNumber}</span>
              <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>× {pick.count}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Кнопки */}
      <div className="flex gap-4">
        <Link
          href={{ pathname: `/exams/${exam}/variant/${variant.id}/solve`, query: { month, ...(exam === 'ege' ? { mode } : {}) } }}
          className="flex-1 py-3 px-6 rounded-xl gradient-accent btn-aurora text-white transition-colors text-center font-medium"
        >
          Начать
        </Link>
        <Link
          href={{ pathname: `/exams/${exam}/variants`, query: { month, ...(exam === 'ege' ? { mode } : {}) } }}
          className="flex-1 py-3 px-6 rounded-xl transition-colors text-center font-medium hover:bg-white/5"
          style={{ borderColor: 'var(--border-glass)', color: 'var(--text-secondary)', borderWidth: '1px', borderStyle: 'solid' }}
        >
          Назад к вариантам
        </Link>
      </div>
    </div>
  );
}
