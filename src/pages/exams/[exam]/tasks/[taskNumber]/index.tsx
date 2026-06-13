import { useRouter } from 'next/router';
import { getExam, ExamId, EgeMode } from '@/lib/exams/config';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeftIcon, ClockIcon, AcademicCapIcon, BookOpenIcon } from '@heroicons/react/24/outline';
import { useState, useEffect } from 'react';

const DIFFICULTY_BADGE: Record<string, string> = {
  easy: 'b-easy',
  medium: 'b-med',
  hard: 'b-hard',
};

const DIFFICULTY_LABEL: Record<string, string> = {
  easy: 'Легкая',
  medium: 'Средняя',
  hard: 'Сложная',
};

// Утилита для капитализации русских строк
const capitalizeRu = (str: string): string => {
  if (!str) return str;

  // Находим первый лексический фрагмент (до разделителя)
  const separators = ['/', '—', ',', ' ', '-'];
  let firstPart = str;
  let separator = '';

  for (const sep of separators) {
    const index = str.indexOf(sep);
    if (index > 0 && index < firstPart.length) {
      firstPart = str.substring(0, index);
      separator = sep;
      break;
    }
  }

  // Капитализируем первый фрагмент
  const capitalized = firstPart.charAt(0).toUpperCase() + firstPart.slice(1);

  // Возвращаем с остальной частью строки
  if (separator) {
    return capitalized + separator + str.substring(firstPart.length + separator.length);
  }

  return capitalized;
};

export default function TaskPage() {
  const router = useRouter();
  const { exam, taskNumber, mode } = router.query;

  const [isLoading, setIsLoading] = useState(true);
  const [examData, setExamData] = useState<{ exam: string; taskNumber: string; mode?: string } | null>(null);

  useEffect(() => {
    if (exam && taskNumber) {
      setExamData({ exam: exam as string, taskNumber: taskNumber as string, mode: mode as string });
      setIsLoading(false);
    }
  }, [exam, taskNumber, mode]);

  if (isLoading) {
    return (
      <>
        <div className="p-6">
          <div className="text-center" style={{ color: 'var(--ink-soft)' }}>Загрузка...</div>
        </div>
      </>
    );
  }

  if (!examData) {
    return (
      <>
        <div className="p-6">
          <div className="text-center" style={{ color: 'var(--ink-soft)' }}>Задача не найдена</div>
        </div>
      </>
    );
  }

  // Определяем режим для ЕГЭ
  let currentMode: EgeMode | undefined;
  if (examData.exam === 'ege') {
    const urlMode = examData.mode as EgeMode;
    if (urlMode && (urlMode === 'base' || urlMode === 'profile')) {
      currentMode = urlMode;
    } else {
      currentMode = 'base'; // по умолчанию базовая
    }
  }

  const examConfig = getExam(examData.exam as ExamId, currentMode);
  const taskConfig = examConfig.tasks.find(task => task.number === parseInt(examData.taskNumber));

  if (!examConfig || !taskConfig) {
    return (
      <>
        <div className="p-6">
          <div className="text-center" style={{ color: 'var(--ink-soft)' }}>Задача не найдена</div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="p-6 space-y-6">
        {/* Навигация */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4"
        >
          <Link
            href={`/exams/${examData.exam}${examData.mode ? `?mode=${examData.mode}` : ''}`}
            className="flex items-center gap-2 transition hover:text-[var(--red)]"
            style={{ color: 'var(--ink-soft)' }}
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Назад к экзамену
          </Link>
        </motion.div>

        {/* Заголовок задачи */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-4">
            <div className="font-mono text-4xl font-bold" style={{ color: 'var(--ink)' }}>
              №{taskConfig.number}
            </div>
            <span className={`badge ${DIFFICULTY_BADGE[taskConfig.difficulty] || ''}`}>
              {DIFFICULTY_LABEL[taskConfig.difficulty] || taskConfig.difficulty}
            </span>
          </div>
          <h1 className="font-display text-3xl font-bold" style={{ color: 'var(--ink)' }}>{taskConfig.title}</h1>
          <p className="text-lg max-w-3xl" style={{ color: 'var(--ink-soft)' }}>
            {taskConfig.description}
          </p>
        </motion.div>

        {/* Статистика задачи */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl"
        >
          <div className="rounded-[var(--radius)] p-4 text-center" style={{ background: 'var(--surface)', border: '1px solid var(--line)' }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center mx-auto mb-2" style={{ background: 'var(--paper-2)', color: 'var(--red)' }}>
              <ClockIcon className="h-5 w-5" />
            </div>
            <div className="font-mono text-xl font-bold" style={{ color: 'var(--ink)' }}>{taskConfig.estimatedTime} мин</div>
            <div className="text-sm mt-1" style={{ color: 'var(--ink-soft)' }}>Рекомендуемое время</div>
          </div>
          <div className="rounded-[var(--radius)] p-4 text-center" style={{ background: 'var(--surface)', border: '1px solid var(--line)' }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center mx-auto mb-2" style={{ background: 'var(--paper-2)', color: 'var(--red)' }}>
              <BookOpenIcon className="h-5 w-5" />
            </div>
            <div className="font-mono text-xl font-bold" style={{ color: 'var(--ink)' }}>{taskConfig.topics.length}</div>
            <div className="text-sm mt-1" style={{ color: 'var(--ink-soft)' }}>Тем для изучения</div>
          </div>
          <div className="rounded-[var(--radius)] p-4 text-center" style={{ background: 'var(--surface)', border: '1px solid var(--line)' }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center mx-auto mb-2" style={{ background: 'var(--paper-2)', color: 'var(--red)' }}>
              <AcademicCapIcon className="h-5 w-5" />
            </div>
            <div className="font-mono text-xl font-bold" style={{ color: 'var(--ink)' }}>1 балл</div>
            <div className="text-sm mt-1" style={{ color: 'var(--ink-soft)' }}>Максимальный балл</div>
          </div>
        </motion.div>

        {/* Темы для изучения */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          <h2 className="font-display text-2xl font-bold" style={{ color: 'var(--ink)' }}>Темы для изучения</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {taskConfig.topics.map((topic, index) => (
              <motion.div
                key={topic}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="h-full"
              >
                <Link
                  href={`/exams/${examData.exam}/tasks/${examData.taskNumber}/${encodeURIComponent(topic)}${examData.mode ? `?mode=${examData.mode}` : ''}`}
                  className="group h-full flex flex-col rounded-[var(--radius)] overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-lg"
                  style={{ background: 'var(--surface)', border: '1px solid var(--line)' }}
                >
                  <div className="p-4 flex-1 flex flex-col">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-lg mb-2 line-clamp-2 min-h-[3rem] flex-1" style={{ color: 'var(--ink)' }}>{capitalizeRu(topic)}</h3>
                      <div style={{ color: 'var(--ink-soft)' }}>
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                    <p className="text-sm line-clamp-3 flex-1" style={{ color: 'var(--ink-soft)' }}>
                      Изучите теорию и практику по теме "{capitalizeRu(topic)}"
                    </p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Кнопки действий */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col sm:flex-row gap-4 pt-4"
        >
          <Link
            href={`/whiteboard?taskId=${examData.exam}-${examData.taskNumber}${examData.mode ? `&mode=${examData.mode}` : ''}`}
            className="btn-primary flex-1 py-4 px-6 rounded-xl text-center font-medium hover:shadow-lg transition-shadow"
          >
            Открыть доску для решения
          </Link>
          <Link
            href={`/tasks?topic=${encodeURIComponent(taskConfig.topics[0])}`}
            className="btn-ghost flex-1 py-4 px-6 rounded-xl text-center font-medium transition hover:bg-[var(--paper-2)]"
          >
            Похожие задачи
          </Link>
        </motion.div>
      </div>
    </>
  );
}
