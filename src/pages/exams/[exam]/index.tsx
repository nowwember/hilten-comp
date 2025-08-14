import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import { getExamConfig, ExamType } from '@/lib/exams/config';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ClockIcon, AcademicCapIcon, ChartBarIcon } from '@heroicons/react/24/outline';

export default function ExamLanding() {
  const router = useRouter();
  const { exam } = router.query;
  
  if (!exam || typeof exam !== 'string') {
    return (
      <Layout title="Экзамен не найден">
        <div className="p-6">
          <div className="text-center text-slate-500">Экзамен не найден</div>
        </div>
      </Layout>
    );
  }

  const examConfig = getExamConfig(exam as ExamType);
  
  if (!examConfig) {
    return (
      <Layout title="Экзамен не найден">
        <div className="p-6">
          <div className="text-center text-slate-500">Экзамен не найден</div>
        </div>
      </Layout>
    );
  }

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

        {/* Сетка задач */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <h2 className="text-2xl font-bold text-center">Задачи экзамена</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto">
            {examConfig.tasks.map((task, index) => (
              <motion.div
                key={task.number}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
              >
                <Link 
                  href={`/exams/${exam}/tasks/${task.number}`}
                  className="block card border p-6 hover:shadow-soft hover:-translate-y-1 transition-all duration-200"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="text-2xl font-bold text-slate-700 dark:text-slate-300">
                      №{task.number}
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(task.difficulty)}`}>
                      {task.difficulty === 'easy' ? 'Легко' : 
                       task.difficulty === 'medium' ? 'Средне' : 'Сложно'}
                    </span>
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{task.title}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 line-clamp-2">
                    {task.description}
                  </p>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>{task.estimatedTime} мин</span>
                    <span>{task.topics.length} тем</span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}
