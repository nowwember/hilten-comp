import { useRouter } from 'next/router';
import { getExam, ExamId, EgeMode } from '@/lib/exams/config';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeftIcon, ClockIcon, AcademicCapIcon, BookOpenIcon } from '@heroicons/react/24/outline';
import { useState, useEffect } from 'react';

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
  
  console.log('Router query:', router.query);
  console.log('Exam, taskNumber, mode:', { exam, taskNumber, mode });
  
  const [isLoading, setIsLoading] = useState(true);
  const [examData, setExamData] = useState<{ exam: string; taskNumber: string; mode?: string } | null>(null);
  
  useEffect(() => {
    console.log('useEffect triggered:', { exam, taskNumber, mode });
    if (exam && taskNumber) {
      console.log('Setting exam data:', { exam, taskNumber, mode });
      setExamData({ exam: exam as string, taskNumber: taskNumber as string, mode: mode as string });
      setIsLoading(false);
    }
  }, [exam, taskNumber, mode]);
  
  if (isLoading) {
    return (
      <>
        <div className="p-6">
          <div className="text-center text-slate-500">Загрузка...</div>
        </div>
      </>
    );
  }
  
  if (!examData) {
    return (
      <>
        <div className="p-6">
          <div className="text-center text-slate-500">Задача не найдена</div>
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

  console.log('Task page debug:', { exam: examData.exam, taskNumber: examData.taskNumber, mode: examData.mode, currentMode });

  const examConfig = getExam(examData.exam as ExamId, currentMode);
  console.log('Exam config:', { name: examConfig.name, tasksCount: examConfig.tasks.length });
  console.log('Available task numbers:', examConfig.tasks.map(t => t.number));
  
  const taskConfig = examConfig.tasks.find(task => task.number === parseInt(examData.taskNumber));
  console.log('Task config found:', !!taskConfig, { taskNumber: parseInt(examData.taskNumber), foundTask: taskConfig?.title });
  
  if (!examConfig || !taskConfig) {
    console.log('Task not found:', { examConfig: !!examConfig, taskConfig: !!taskConfig });
    return (
      <>
        <div className="p-6">
          <div className="text-center text-slate-500">Задача не найдена</div>
          <div className="text-center text-xs text-slate-400 mt-2">
            Debug: exam={examData.exam}, taskNumber={examData.taskNumber}, mode={examData.mode}
          </div>
        </div>
      </>
    );
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400';
      case 'medium': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'hard': return 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400';
      default: return 'bg-slate-100 text-slate-700 dark:bg-slate-900/20 dark:text-slate-400';
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'Легкая';
      case 'medium': return 'Средняя';
      case 'hard': return 'Сложная';
      default: return 'Неизвестно';
    }
  };

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
            className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition"
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
            <div className="text-4xl font-bold text-slate-700 dark:text-slate-300">
              №{taskConfig.number}
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(taskConfig.difficulty)}`}>
              {getDifficultyText(taskConfig.difficulty)}
            </span>
          </div>
          <h1 className="text-3xl font-bold">{taskConfig.title}</h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-3xl">
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
          <div className="card border p-4 text-center">
            <ClockIcon className="h-6 w-6 mx-auto mb-2 text-slate-500" />
            <div className="text-xl font-bold">{taskConfig.estimatedTime} мин</div>
            <div className="text-sm text-slate-500">Рекомендуемое время</div>
          </div>
          <div className="card border p-4 text-center">
            <BookOpenIcon className="h-6 w-6 mx-auto mb-2 text-slate-500" />
            <div className="text-xl font-bold">{taskConfig.topics.length}</div>
            <div className="text-sm text-slate-500">Тем для изучения</div>
          </div>
          <div className="card border p-4 text-center">
            <AcademicCapIcon className="h-6 w-6 mx-auto mb-2 text-slate-500" />
            <div className="text-xl font-bold">1 балл</div>
            <div className="text-sm text-slate-500">Максимальный балл</div>
          </div>
        </motion.div>

        {/* Темы для изучения */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          <h2 className="text-2xl font-bold">Темы для изучения</h2>
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
                  className="group h-full flex flex-col rounded-2xl border shadow-sm hover:shadow-md overflow-hidden transition-shadow"
                >
                  <div className="p-4 flex-1 flex flex-col">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-lg mb-2 line-clamp-2 min-h-[3rem] flex-1">{capitalizeRu(topic)}</h3>
                      <div className="text-slate-400">
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3 flex-1">
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
            className="flex-1 py-4 px-6 rounded-xl text-white gradient-accent shadow-soft text-center font-medium hover:shadow-lg transition-shadow"
          >
            Открыть доску для решения
          </Link>
          <Link 
            href={`/tasks?topic=${encodeURIComponent(taskConfig.topics[0])}`}
            className="flex-1 py-4 px-6 rounded-xl border text-center font-medium hover:bg-slate-50 dark:hover:bg-slate-900 transition"
          >
            Похожие задачи
          </Link>
        </motion.div>
      </div>
    </>
  );
}
