import { useRouter } from 'next/router';
import { getExam, groupTasksByPart, ExamId, EgeMode } from '@/lib/exams/config';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { ClockIcon, AcademicCapIcon, ChartBarIcon, MinusIcon, PlusIcon } from '@heroicons/react/24/outline';
import { getCurrentMonth, DEFAULT_DURATION_MINUTES } from '@/lib/exams/variants';
import { generateRandomVariantBySeed } from '@/lib/exams/variants';

const DIFFICULTY_BADGE: Record<string, string> = {
  easy: 'b-easy',
  medium: 'b-med',
  hard: 'b-hard',
};

const DIFFICULTY_LABEL: Record<string, string> = {
  easy: 'Легко',
  medium: 'Средне',
  hard: 'Сложно',
};

/* Маленький math-акцент в углу карточки */
function CornerAccent({ variant }: { variant: 'parabola' | 'triangle' | 'circle' }) {
  if (variant === 'parabola') {
    return (
      <svg className="absolute -right-2 -top-2 opacity-15" width="44" height="32" viewBox="0 0 44 32" fill="none">
        <path d="M2 28 Q22 -4 42 28" stroke="var(--red)" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    );
  }
  if (variant === 'triangle') {
    return (
      <svg className="absolute -right-1 -top-1 opacity-15" width="36" height="36" viewBox="0 0 36 36" fill="none">
        <polygon points="6,30 30,30 6,6" stroke="var(--amber-deep)" strokeWidth="2" fill="none" strokeLinejoin="round" />
      </svg>
    );
  }
  return (
    <svg className="absolute -right-2 -top-2 opacity-15" width="40" height="40" viewBox="0 0 40 40" fill="none">
      <circle cx="20" cy="20" r="14" stroke="var(--green-deep)" strokeWidth="2" fill="none" />
    </svg>
  );
}

const ACCENTS: Array<'parabola' | 'triangle' | 'circle'> = ['parabola', 'triangle', 'circle'];

export default function ExamLanding() {
  const router = useRouter();
  const { exam, mode } = router.query;

  const [currentMode, setCurrentMode] = useState<EgeMode>('base');
  const [taskCounts, setTaskCounts] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const MAX_TASKS_PER_TYPE = 5;

  const [showRandomPreview, setShowRandomPreview] = useState(false);
  const [randomSeed, setRandomSeed] = useState<string | null>(null);
  const [randomVariant, setRandomVariant] = useState<any>(null);
  const month = getCurrentMonth();

  // Инициализация режима из URL
  useEffect(() => {
    if (exam === 'ege') {
      const urlMode = mode as EgeMode;
      if (urlMode && (urlMode === 'base' || urlMode === 'profile')) {
        setCurrentMode(urlMode);
      } else {
        setCurrentMode('base');
      }
    }
    setIsLoading(false);
  }, [exam, mode]);

  // Показываем загрузку пока router.query не готов
  if (isLoading || !router.isReady) {
    return (
      <>
        <div className="p-6">
          <div className="text-center" style={{ color: 'var(--ink-soft)' }}>Загрузка...</div>
        </div>
      </>
    );
  }

  if (!exam || typeof exam !== 'string') {
    return (
      <>
        <div className="p-6">
          <div className="text-center" style={{ color: 'var(--ink-soft)' }}>Экзамен не найден</div>
        </div>
      </>
    );
  }

  const examConfig = getExam(exam as ExamId, exam === 'ege' ? currentMode : undefined);

  if (!examConfig) {
    return (
      <>
        <div className="p-6">
          <div className="text-center" style={{ color: 'var(--ink-soft)' }}>Экзамен не найден</div>
        </div>
      </>
    );
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}ч ${mins}мин`;
  };

  const getTaskCountKey = (taskNumber: number) => {
    if (exam === 'ege') {
      return `${exam}:${currentMode}:${taskNumber}`;
    }
    return `${exam}:default:${taskNumber}`;
  };

  const handleTaskCountChange = (taskNumber: number, increment: boolean) => {
    const key = getTaskCountKey(taskNumber);
    const currentCount = taskCounts[key] || 0;
    const newCount = increment
      ? Math.min(currentCount + 1, MAX_TASKS_PER_TYPE)
      : Math.max(currentCount - 1, 0);

    setTaskCounts(prev => ({
      ...prev,
      [key]: newCount
    }));
  };

  const handleModeChange = (newMode: EgeMode) => {
    setCurrentMode(newMode);
    // Обновляем URL без перезагрузки страницы
    router.push({
      pathname: router.pathname,
      query: { ...router.query, mode: newMode }
    }, undefined, { shallow: true });
  };

  const handleCreateVariant = () => {
    const selectedTasks = Object.entries(taskCounts)
      .filter(([key, count]) => {
        const [examKey, modeKey] = key.split(':');
        return count > 0 && examKey === exam &&
               (exam === 'oge' ? modeKey === 'default' : modeKey === currentMode);
      })
      .map(([key, count]) => {
        const taskNumber = parseInt(key.split(':')[2]);
        return { taskNumber, count };
      });

    const result = {
      exam: exam as ExamId,
      mode: exam === 'ege' ? currentMode : undefined,
      picks: selectedTasks
    };

    return result;
  };

  const handleShowRandom = () => {
    const seed = `${month}:${exam}:${exam === 'ege' ? currentMode : 'default'}:${Date.now()}`;
    setRandomSeed(seed);
    setRandomVariant(generateRandomVariantBySeed({ month, exam: exam as any, mode: exam === 'ege' ? currentMode : undefined, seed }));
    setShowRandomPreview(true);
  };
  const handleStartRandom = () => {
    if (!randomSeed) return;
    router.push({
      pathname: `/exams/${exam}/variant/_/solve`,
      query: { month, ...(exam === 'ege' ? { mode: currentMode } : {}), seed: randomSeed },
    });
  };

  const { part1, part2 } = groupTasksByPart(examConfig.tasks);

  const renderTaskGrid = (tasks: typeof part1) => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
      {tasks.map((task, index) => (
        <motion.div
          key={task.number}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 + index * 0.02 }}
          className="h-full"
        >
          <div
            className="group relative rounded-[var(--radius)] overflow-hidden transition-all h-full flex flex-col hover:-translate-y-0.5 hover:shadow-lg"
            style={{ background: 'var(--surface)', border: '1px solid var(--line)' }}
          >
            <CornerAccent variant={ACCENTS[index % ACCENTS.length]} />
            {/* Карточка задания */}
            <Link
              href={`/exams/${exam}/tasks/${task.number}${exam === 'ege' ? `?mode=${currentMode}` : ''}`}
              className="p-4 flex-1 flex flex-col relative z-10"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="font-mono text-lg font-bold" style={{ color: 'var(--ink)' }}>
                  №{task.number}
                </div>
                <span className={`badge ${DIFFICULTY_BADGE[task.difficulty] || ''}`}>
                  {DIFFICULTY_LABEL[task.difficulty] || task.difficulty}
                </span>
              </div>
              <h3 className="font-medium text-sm mb-1 line-clamp-2 flex-1 min-h-[2.5rem]" style={{ color: 'var(--ink)' }}>{task.title}</h3>
              <p className="text-xs line-clamp-2 mb-3" style={{ color: 'var(--ink-soft)' }}>
                {task.description}
              </p>
              <div className="flex items-center justify-between font-mono text-xs mt-auto" style={{ color: 'var(--ink-soft)' }}>
                <span>{task.estimatedTime} мин</span>
                <span>{task.topics.length} тем</span>
              </div>
            </Link>

            {/* Счетчик задач */}
            <div className="flex items-center justify-between px-3 py-2 relative z-10" style={{ background: 'var(--paper-2)', borderTop: '1px solid var(--line)' }}>
              <button
                onClick={() => handleTaskCountChange(task.number, false)}
                disabled={(taskCounts[getTaskCountKey(task.number)] || 0) === 0}
                className="w-6 h-6 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center border hover:border-[var(--red)]"
                style={{ borderColor: 'var(--line-2)', background: 'var(--surface)' }}
              >
                <MinusIcon className="h-3 w-3" />
              </button>
              <span className="font-mono text-sm font-medium" style={{ color: 'var(--ink)' }}>
                {taskCounts[getTaskCountKey(task.number)] || 0}
              </span>
              <button
                onClick={() => handleTaskCountChange(task.number, true)}
                disabled={(taskCounts[getTaskCountKey(task.number)] || 0) === MAX_TASKS_PER_TYPE}
                className="w-6 h-6 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center border hover:border-[var(--red)]"
                style={{ borderColor: 'var(--line-2)', background: 'var(--surface)' }}
              >
                <PlusIcon className="h-3 w-3" />
              </button>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );

  return (
    <>
      <div className="p-6 space-y-8">
        {/* Заголовок экзамена */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <h1 className="font-display text-4xl md:text-5xl font-extrabold">
            <span style={{ color: 'var(--red)' }}>{examConfig.name}</span>
            <span style={{ color: 'var(--amber-deep)' }}> Математика</span>
          </h1>
          <p className="text-xl" style={{ color: 'var(--ink-soft)' }}>{examConfig.fullName}</p>
          <p className="max-w-2xl mx-auto" style={{ color: 'var(--ink-soft)' }}>{examConfig.description}</p>
        </motion.div>

        {/* Переключатель режима для ЕГЭ */}
        {exam === 'ege' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="flex justify-center"
          >
            <div className="flex rounded-xl p-1" style={{ background: 'var(--paper-2)' }}>
              <button
                onClick={() => handleModeChange('base')}
                className="px-6 py-3 rounded-lg font-medium transition-colors"
                style={currentMode === 'base'
                  ? { background: 'var(--surface)', color: 'var(--ink)', boxShadow: '0 2px 8px rgba(0,0,0,.06)' }
                  : { color: 'var(--ink-soft)' }
                }
              >
                Базовая
              </button>
              <button
                onClick={() => handleModeChange('profile')}
                className="px-6 py-3 rounded-lg font-medium transition-colors"
                style={currentMode === 'profile'
                  ? { background: 'var(--surface)', color: 'var(--ink)', boxShadow: '0 2px 8px rgba(0,0,0,.06)' }
                  : { color: 'var(--ink-soft)' }
                }
              >
                Профильная
              </button>
            </div>
          </motion.div>
        )}

        {/* Статистика экзамена */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto"
        >
          <div className="rounded-[var(--radius)] p-6 text-center" style={{ background: 'var(--surface)', border: '1px solid var(--line)' }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3" style={{ background: 'var(--paper-2)', color: 'var(--red)' }}>
              <ClockIcon className="h-5 w-5" />
            </div>
            <div className="font-mono text-2xl font-bold" style={{ color: 'var(--ink)' }}>{formatDuration(examConfig.duration)}</div>
            <div className="text-sm mt-1" style={{ color: 'var(--ink-soft)' }}>Время на экзамен</div>
          </div>
          <div className="rounded-[var(--radius)] p-6 text-center" style={{ background: 'var(--surface)', border: '1px solid var(--line)' }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3" style={{ background: 'var(--paper-2)', color: 'var(--red)' }}>
              <AcademicCapIcon className="h-5 w-5" />
            </div>
            <div className="font-mono text-2xl font-bold" style={{ color: 'var(--ink)' }}>{examConfig.tasks.length}</div>
            <div className="text-sm mt-1" style={{ color: 'var(--ink-soft)' }}>Количество задач</div>
          </div>
          <div className="rounded-[var(--radius)] p-6 text-center" style={{ background: 'var(--surface)', border: '1px solid var(--line)' }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3" style={{ background: 'var(--paper-2)', color: 'var(--red)' }}>
              <ChartBarIcon className="h-5 w-5" />
            </div>
            <div className="font-mono text-2xl font-bold" style={{ color: 'var(--ink)' }}>{examConfig.maxScore}</div>
            <div className="text-sm mt-1" style={{ color: 'var(--ink-soft)' }}>Максимальный балл</div>
          </div>
        </motion.div>

        {/* Панель кнопок (адаптив) */}
        <div className="w-full flex flex-col sm:flex-row gap-3 mb-8">
          <button
            onClick={handleShowRandom}
            className="btn-ghost flex-1 rounded-xl px-6 py-3 transition-colors font-medium hover:bg-[var(--paper-2)]"
            type="button"
          >
            Случайный вариант
          </button>
          <Link
            href={{ pathname: `/exams/${exam}/variants`, query: { month, ...(exam === 'ege' ? { mode: currentMode } : {}) } }}
            className="btn-primary flex-1 rounded-xl px-6 py-3 transition-transform hover:scale-[1.02] font-medium text-center"
          >
            Варианты
          </Link>
          <button
            onClick={handleCreateVariant}
            className="btn-ghost flex-1 rounded-xl px-6 py-3 transition-colors font-medium hover:bg-[var(--paper-2)]"
            type="button"
          >
            Составить вариант
          </button>
        </div>

        {/* Превью случайного варианта */}
        {showRandomPreview && randomVariant && (
          <div className="relative w-full max-w-xl mx-auto mb-8 rounded-[var(--radius-lg)] p-6 z-20" style={{ background: 'var(--surface)', border: '1px solid var(--line)' }}>
            <div className="font-display font-bold text-lg mb-2" style={{ color: 'var(--ink)' }}>Случайный вариант — {exam === 'oge' ? 'ОГЭ' : exam === 'ege' && currentMode === 'profile' ? 'ЕГЭ профильная' : 'ЕГЭ базовая'}</div>
            <div className="mb-2 text-sm" style={{ color: 'var(--ink-soft)' }}>Месяц: <b>{month}</b></div>
            <div className="mb-2 text-sm" style={{ color: 'var(--ink-soft)' }}>Время: <b>{exam === 'oge' ? DEFAULT_DURATION_MINUTES.oge : currentMode === 'profile' ? DEFAULT_DURATION_MINUTES.ege_profile : DEFAULT_DURATION_MINUTES.ege_base} мин</b></div>
            <div className="mb-4 text-sm" style={{ color: 'var(--ink-soft)' }}>Полный комплект заданий</div>
            <div className="flex gap-3">
              <button
                onClick={handleStartRandom}
                className="btn-primary flex-1 rounded-xl px-6 py-3 transition-transform hover:scale-[1.02] font-medium"
              >
                Начать
              </button>
              <button
                onClick={() => setShowRandomPreview(false)}
                className="btn-ghost flex-1 rounded-xl px-6 py-3 transition-colors font-medium hover:bg-[var(--paper-2)]"
              >
                Отмена
              </button>
            </div>
          </div>
        )}

        {/* Сетка задач */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-8"
        >
          {/* Часть 1 */}
          <div className="space-y-4">
            <h2 className="font-display text-lg font-bold mt-6 mb-2" style={{ color: 'var(--ink)' }}>Часть 1</h2>
            {renderTaskGrid(part1)}
          </div>

          {/* Часть 2 (если есть) */}
          {part2.length > 0 && (
            <div className="space-y-4">
              <h2 className="font-display text-lg font-bold mt-6 mb-2" style={{ color: 'var(--ink)' }}>Часть 2</h2>
              {renderTaskGrid(part2)}
            </div>
          )}
        </motion.div>
      </div>
    </>
  );
}
