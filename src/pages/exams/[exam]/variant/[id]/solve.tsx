import { useRouter } from 'next/router';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { getVariants, getCurrentMonth, ExamId, Mode, DEFAULT_DURATION_MINUTES, generateRandomVariantBySeed } from '@/lib/exams/variants';

function formatTime(sec: number) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return [h, m, s].map(n => String(n).padStart(2, '0')).join(':');
}

export default function SolveVariantPage() {
  const router = useRouter();
  const { exam, id } = router.query;
  const month = typeof router.query.month === 'string' ? router.query.month : getCurrentMonth();
  const mode = typeof router.query.mode === 'string' ? router.query.mode as Mode : undefined;
  const seed = typeof router.query.seed === 'string' ? router.query.seed : undefined;

  // Получаем вариант (по id или по seed)
  let variant;
  if (seed && exam && typeof exam === 'string') {
    variant = generateRandomVariantBySeed({ month, exam: exam as ExamId, mode, seed });
  } else if (exam && id && typeof exam === 'string' && typeof id === 'string') {
    variant = getVariants(month, exam as ExamId, mode).find(v => v.id === id);
  }

  // Время на вариант
  const duration = exam === 'oge' ? DEFAULT_DURATION_MINUTES.oge : mode === 'profile' ? DEFAULT_DURATION_MINUTES.ege_profile : DEFAULT_DURATION_MINUTES.ege_base;
  const [secondsLeft, setSecondsLeft] = useState(duration * 60);
  const [paused, setPaused] = useState(false);
  const [finished, setFinished] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (paused || finished) return;
    intervalRef.current = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          setFinished(true);
          clearInterval(intervalRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current!);
  }, [paused, finished]);

  // Блокировка ввода (MVP: просто показываем сообщение)
  const isBlocked = finished;

  if (!variant) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center" style={{ color: 'var(--text-secondary)' }}>
        Вариант не найден.
        <div className="mt-6">
          <Link
            href={{ pathname: `/exams/${exam}/variants`, query: { month, ...(exam === 'ege' ? { mode } : {}) } }}
            className="inline-block px-6 py-3 rounded-xl font-medium transition-colors hover:bg-white/5"
            style={{ borderColor: 'var(--border-glass)', color: 'var(--text-secondary)', borderWidth: '1px', borderStyle: 'solid' }}
          >
            ← Назад к вариантам
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Таймер (sticky) */}
      <div
        className="sticky top-0 z-10 py-4 mb-6 flex items-center gap-4"
        style={isBlocked
          ? { backgroundColor: 'var(--status-error-bg)', borderColor: 'var(--status-error)', borderBottomWidth: '1px', borderBottomStyle: 'solid' }
          : { backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-subtle)', borderBottomWidth: '1px', borderBottomStyle: 'solid' }
        }
      >
        <span
          className="text-2xl font-bold"
          style={{ color: isBlocked ? 'var(--status-error)' : 'var(--text-primary)' }}
        >
          Осталось: {formatTime(secondsLeft)}
        </span>
        <button
          onClick={() => setPaused(p => !p)}
          className="ml-4 px-4 py-2 rounded-xl transition-colors font-medium hover:bg-white/5"
          style={{ borderColor: 'var(--border-glass)', color: 'var(--text-secondary)', borderWidth: '1px', borderStyle: 'solid' }}
          disabled={isBlocked}
        >
          {paused ? 'Продолжить' : 'Пауза'}
        </button>
        {isBlocked && <span className="ml-4 font-semibold" style={{ color: 'var(--status-error)' }}>Время вышло</span>}
        <div className="ml-auto">
          <Link
            href={seed
              ? { pathname: `/exams/${exam}/variants`, query: { month, ...(exam === 'ege' ? { mode } : {}) } }
              : { pathname: `/exams/${exam}/variant/${variant.id}`, query: { month, ...(exam === 'ege' ? { mode } : {}) } }
            }
            className="px-4 py-2 rounded-xl font-medium transition-colors hover:bg-white/5"
            style={{ borderColor: 'var(--border-glass)', color: 'var(--text-secondary)', borderWidth: '1px', borderStyle: 'solid' }}
          >
            Назад к вариантам
          </Link>
        </div>
      </div>

      <h1 className="text-2xl font-bold font-heading mb-4">{variant.title}</h1>
      <div className="mb-8 flex gap-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
        <span>Месяц: <b>{variant.month}</b></span>
        <span>Время: <b>{duration} мин</b></span>
      </div>
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
      {isBlocked && (
        <div
          className="p-6 rounded-xl text-center font-semibold text-lg"
          style={{ backgroundColor: 'var(--status-error-bg)', borderColor: 'var(--status-error)', borderWidth: '1px', borderStyle: 'solid', color: 'var(--status-error)' }}
        >
          Время вышло. Решение заблокировано.
        </div>
      )}
      {/* Здесь будет форма для ответов (Meso-3) */}
    </div>
  );
}
