import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import { getExam, groupTasksByPart, ExamId, EgeMode } from '@/lib/exams/config';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { ClockIcon, AcademicCapIcon, ChartBarIcon, MinusIcon, PlusIcon } from '@heroicons/react/24/outline';
import { getCurrentMonth, DEFAULT_DURATION_MINUTES } from '@/lib/exams/variants';
import { generateRandomVariantBySeed } from '@/lib/exams/variants';

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
      <Layout title="Загрузка...">
        <div className="p-6">
          <div className="text-center text-slate-500">Загрузка...</div>
        </div>
      </Layout>
    );
  }
  
  if (!exam || typeof exam !== 'string') {
    console.log('Exam validation failed:', { exam, type: typeof exam });
    return (
      <Layout title="Экзамен не найден">
        <div className="p-6">
          <div className="text-center text-slate-500">Экзамен не найден</div>
        </div>
      </Layout>
    );
  }

  console.log('Getting exam config for:', { exam, currentMode });
  const examConfig = getExam(exam as ExamId, exam === 'ege' ? currentMode : undefined);
  
  if (!examConfig) {
    console.log('Exam config not found for:', { exam, currentMode });
    return (
      <Layout title="Экзамен не найден">
        <div className="p-6">
          <div className="text-center text-slate-500">Экзамен не найден</div>
        </div>
      </Layout>
    );
  }

  console.log('Exam config loaded:', examConfig.name);

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}ч ${mins}мин`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400';
      case 'medium': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'hard': return 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400';
      default: return 'bg-slate-100 text-slate-700 dark:bg-slate-900/20 dark:text-slate-400';
    }
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
    
    console.log('Выбранные задания:', result);
    console.log('Общее количество заданий:', selectedTasks.reduce((sum, task) => sum + task.count, 0));
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

  return (
    <Layout title={`${examConfig.name} - ${examConfig.fullName}`}>
      <div className="p-6 space-y-8">
        {/* Заголовок экзамена */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <h1 className="text-4xl font-bold">
            <span className="text-red-500">{examConfig.name}</span>
            <span className="text-amber-400"> Математика</span>
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300">{examConfig.fullName}</p>
          <p className="text-slate-500 max-w-2xl mx-auto">{examConfig.description}</p>
        </motion.div>

        {/* Переключатель режима для ЕГЭ */}
        {exam === 'ege' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="flex justify-center"
          >
            <div className="flex bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
              <button
                onClick={() => handleModeChange('base')}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  currentMode === 'base'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                Базовая
              </button>
              <button
                onClick={() => handleModeChange('profile')}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  currentMode === 'profile'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
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
          <div className="card border p-6 text-center">
            <ClockIcon className="h-8 w-8 mx-auto mb-2 text-slate-500" />
            <div className="text-2xl font-bold">{formatDuration(examConfig.duration)}</div>
            <div className="text-sm text-slate-500">Время на экзамен</div>
          </div>
          <div className="card border p-6 text-center">
            <AcademicCapIcon className="h-8 w-8 mx-auto mb-2 text-slate-500" />
            <div className="text-2xl font-bold">{examConfig.tasks.length}</div>
            <div className="text-sm text-slate-500">Количество задач</div>
          </div>
          <div className="card border p-6 text-center">
            <ChartBarIcon className="h-8 w-8 mx-auto mb-2 text-slate-500" />
            <div className="text-2xl font-bold">{examConfig.maxScore}</div>
            <div className="text-sm text-slate-500">Максимальный балл</div>
          </div>
        </motion.div>

        {/* Панель кнопок (адаптив) */}
        <div className="w-full flex flex-col sm:flex-row gap-3 mb-8">
          <button
            onClick={handleShowRandom}
            className="flex-1 rounded-xl border border-red-500 text-red-500 px-6 py-3 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors font-medium"
            type="button"
          >
            Случайный вариант
          </button>
          <Link
            href={{ pathname: `/exams/${exam}/variants`, query: { month, ...(exam === 'ege' ? { mode: currentMode } : {}) } }}
            className="flex-1 rounded-xl bg-red-500 text-white px-6 py-3 hover:bg-red-600 transition-colors font-medium text-center"
          >
            Варианты
          </Link>
          <button
            onClick={handleCreateVariant}
            className="flex-1 rounded-xl border border-red-500 text-red-500 px-6 py-3 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors font-medium"
            type="button"
          >
            Составить вариант
          </button>
        </div>

        {/* Превью случайного варианта */}
        {showRandomPreview && randomVariant && (
          <div className="relative w-full max-w-xl mx-auto mb-8 border rounded-2xl bg-white dark:bg-slate-900/80 shadow-lg p-6 z-20">
            <div className="font-bold text-lg mb-2">Случайный вариант — {exam === 'oge' ? 'ОГЭ' : exam === 'ege' && currentMode === 'profile' ? 'ЕГЭ профильная' : 'ЕГЭ базовая'}</div>
            <div className="mb-2 text-slate-600 dark:text-slate-300 text-sm">Месяц: <b>{month}</b></div>
            <div className="mb-2 text-slate-600 dark:text-slate-300 text-sm">Время: <b>{exam === 'oge' ? DEFAULT_DURATION_MINUTES.oge : currentMode === 'profile' ? DEFAULT_DURATION_MINUTES.ege_profile : DEFAULT_DURATION_MINUTES.ege_base} мин</b></div>
            <div className="mb-4 text-slate-600 dark:text-slate-300 text-sm">Полный комплект заданий</div>
            <div className="flex gap-3">
              <button
                onClick={handleStartRandom}
                className="flex-1 rounded-xl bg-red-500 text-white px-6 py-3 hover:bg-red-600 transition-colors font-medium"
              >
                Начать
              </button>
              <button
                onClick={() => setShowRandomPreview(false)}
                className="flex-1 rounded-xl border border-red-500 text-red-500 px-6 py-3 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors font-medium"
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
            <h2 className="text-lg font-semibold mt-6 mb-2">Часть 1</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {part1.map((task, index) => (
                <motion.div
                  key={task.number}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + index * 0.02 }}
                  className="h-full"
                >
                  <div className="group rounded-2xl border shadow-sm hover:shadow-md overflow-hidden transition-shadow h-full flex flex-col">
                    {/* Карточка задания */}
                    <Link 
                      href={`/exams/${exam}/tasks/${task.number}${exam === 'ege' ? `?mode=${currentMode}` : ''}`}
                      className="p-4 flex-1 flex flex-col"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="text-lg font-bold text-slate-700 dark:text-slate-300">
                          №{task.number}
                        </div>
                        <span className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${getDifficultyColor(task.difficulty)}`}>
                          {task.difficulty === 'easy' ? 'Легко' : 
                           task.difficulty === 'medium' ? 'Средне' : 'Сложно'}
                        </span>
                      </div>
                      <h3 className="font-medium text-sm mb-1 line-clamp-2 flex-1 min-h-[2.5rem]">{task.title}</h3>
                      <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mb-3">
                        {task.description}
                      </p>
                      <div className="flex items-center justify-between text-xs text-slate-500 mt-auto">
                        <span>{task.estimatedTime} мин</span>
                        <span>{task.topics.length} тем</span>
                      </div>
                    </Link>
                    
                    {/* Счетчик задач */}
                    <div className="flex items-center justify-between bg-white/50 dark:bg-slate-900/50 border-t px-3 py-2">
                      <button
                        onClick={() => handleTaskCountChange(task.number, false)}
                        disabled={(taskCounts[getTaskCountKey(task.number)] || 0) === 0}
                        className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                      >
                        <MinusIcon className="h-3 w-3" />
                      </button>
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        {taskCounts[getTaskCountKey(task.number)] || 0}
                      </span>
                      <button
                        onClick={() => handleTaskCountChange(task.number, true)}
                        disabled={(taskCounts[getTaskCountKey(task.number)] || 0) === MAX_TASKS_PER_TYPE}
                        className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                      >
                        <PlusIcon className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Часть 2 (если есть) */}
          {part2.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold mt-6 mb-2">Часть 2</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {part2.map((task, index) => (
                  <motion.div
                    key={task.number}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + index * 0.02 }}
                    className="h-full"
                  >
                    <div className="group rounded-2xl border shadow-sm hover:shadow-md overflow-hidden transition-shadow h-full flex flex-col">
                      {/* Карточка задания */}
                      <Link 
                        href={`/exams/${exam}/tasks/${task.number}${exam === 'ege' ? `?mode=${currentMode}` : ''}`}
                        className="p-4 flex-1 flex flex-col"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="text-lg font-bold text-slate-700 dark:text-slate-300">
                            №{task.number}
                          </div>
                          <span className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${getDifficultyColor(task.difficulty)}`}>
                            {task.difficulty === 'easy' ? 'Легко' : 
                             task.difficulty === 'medium' ? 'Средне' : 'Сложно'}
                          </span>
                        </div>
                        <h3 className="font-medium text-sm mb-1 line-clamp-2 flex-1 min-h-[2.5rem]">{task.title}</h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mb-3">
                          {task.description}
                        </p>
                        <div className="flex items-center justify-between text-xs text-slate-500 mt-auto">
                          <span>{task.estimatedTime} мин</span>
                          <span>{task.topics.length} тем</span>
                        </div>
                      </Link>
                      
                      {/* Счетчик задач */}
                      <div className="flex items-center justify-between bg-white/50 dark:bg-slate-900/50 border-t px-3 py-2">
                        <button
                          onClick={() => handleTaskCountChange(task.number, false)}
                          disabled={(taskCounts[getTaskCountKey(task.number)] || 0) === 0}
                          className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                          <MinusIcon className="h-3 w-3" />
                        </button>
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          {taskCounts[getTaskCountKey(task.number)] || 0}
                        </span>
                        <button
                          onClick={() => handleTaskCountChange(task.number, true)}
                          disabled={(taskCounts[getTaskCountKey(task.number)] || 0) === MAX_TASKS_PER_TYPE}
                          className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                          <PlusIcon className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </Layout>
  );
}
