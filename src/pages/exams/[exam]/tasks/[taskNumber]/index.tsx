import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import { getExamConfig, getTaskConfig, ExamType } from '@/lib/exams/config';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeftIcon, ClockIcon, AcademicCapIcon, BookOpenIcon } from '@heroicons/react/24/outline';

export default function TaskPage() {
  const router = useRouter();
  const { exam, taskNumber } = router.query;
  
  if (!exam || !taskNumber || typeof exam !== 'string' || typeof taskNumber !== 'string') {
    return (
      <Layout title="Задача не найдена">
        <div className="p-6">
          <div className="text-center text-slate-500">Задача не найдена</div>
        </div>
      </Layout>
    );
  }

  const examConfig = getExamConfig(exam as ExamType);
  const taskConfig = getTaskConfig(exam as ExamType, parseInt(taskNumber));
  
  if (!examConfig || !taskConfig) {
    return (
      <Layout title="Задача не найдена">
        <div className="p-6">
          <div className="text-center text-slate-500">Задача не найдена</div>
        </div>
      </Layout>
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
    <Layout title={`Задача ${taskNumber} - ${examConfig.name}`}>
      <div className="p-6 space-y-6">
        {/* Навигация */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4"
        >
          <Link 
            href={`/exams/${exam}`}
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
              >
                <Link 
                  href={`/exams/${exam}/tasks/${taskNumber}/${encodeURIComponent(topic)}`}
                  className="block card border p-6 hover:shadow-soft hover:-translate-y-1 transition-all duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-lg mb-2">{topic}</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Изучите теорию и практику по теме "{topic}"
                      </p>
                    </div>
                    <div className="text-slate-400">
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
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
            href={`/whiteboard?taskId=${exam}-${taskNumber}`}
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
    </Layout>
  );
}
