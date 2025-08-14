import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import { getExamConfig, getTaskConfig, ExamType } from '@/lib/exams/config';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeftIcon, BookOpenIcon, LightBulbIcon, AcademicCapIcon, ClockIcon } from '@heroicons/react/24/outline';

export default function TopicPage() {
  const router = useRouter();
  const { exam, taskNumber, topic } = router.query;
  
  if (!exam || !taskNumber || !topic || typeof exam !== 'string' || typeof taskNumber !== 'string' || typeof topic !== 'string') {
    return (
      <Layout title="Тема не найдена">
        <div className="p-6">
          <div className="text-center text-slate-500">Тема не найдена</div>
        </div>
      </Layout>
    );
  }

  const examConfig = getExamConfig(exam as ExamType);
  const taskConfig = getTaskConfig(exam as ExamType, parseInt(taskNumber));
  const decodedTopic = decodeURIComponent(topic);
  
  if (!examConfig || !taskConfig || !taskConfig.topics.includes(decodedTopic)) {
    return (
      <Layout title="Тема не найдена">
        <div className="p-6">
          <div className="text-center text-slate-500">Тема не найдена</div>
        </div>
      </Layout>
    );
  }

  // Заглушка данных для теории
  const theoryData = {
    title: decodedTopic,
    description: `Теория по теме "${decodedTopic}" для подготовки к ${examConfig.name}`,
    sections: [
      {
        title: 'Основные понятия',
        content: 'Здесь будут основные определения и понятия по данной теме. Материал структурирован для лучшего понимания.',
        examples: ['Пример 1: Базовое применение', 'Пример 2: Типичная задача']
      },
      {
        title: 'Формулы и правила',
        content: 'Ключевые формулы, которые необходимо знать для решения задач по этой теме.',
        examples: ['Формула 1: Основная формула', 'Формула 2: Дополнительная формула']
      },
      {
        title: 'Алгоритмы решения',
        content: 'Пошаговые алгоритмы для решения типичных задач по данной теме.',
        examples: ['Алгоритм 1: Стандартный подход', 'Алгоритм 2: Альтернативный метод']
      }
    ]
  };

  // Заглушка данных для практики
  const practiceData = {
    tasks: [
      {
        id: 1,
        title: 'Базовое задание',
        difficulty: 'easy',
        estimatedTime: 5,
        description: 'Простое задание для закрепления основных понятий'
      },
      {
        id: 2,
        title: 'Среднее задание',
        difficulty: 'medium',
        estimatedTime: 10,
        description: 'Задание средней сложности с применением формул'
      },
      {
        id: 3,
        title: 'Сложное задание',
        difficulty: 'hard',
        estimatedTime: 15,
        description: 'Комплексное задание, требующее глубокого понимания темы'
      }
    ]
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
    <Layout title={`${decodedTopic} - Задача ${taskNumber} - ${examConfig.name}`}>
      <div className="p-6 space-y-6">
        {/* Навигация */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4"
        >
          <Link 
            href={`/exams/${exam}/tasks/${taskNumber}`}
            className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Назад к задаче {taskNumber}
          </Link>
        </motion.div>

        {/* Заголовок темы */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-4">
            <BookOpenIcon className="h-8 w-8 text-slate-500" />
            <div>
              <h1 className="text-3xl font-bold">{theoryData.title}</h1>
              <p className="text-slate-600 dark:text-slate-400">{theoryData.description}</p>
            </div>
          </div>
        </motion.div>

        {/* Теория */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <LightBulbIcon className="h-6 w-6" />
            Теория
          </h2>
          
          <div className="grid gap-6">
            {theoryData.sections.map((section, index) => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="card border p-6"
              >
                <h3 className="text-xl font-semibold mb-4">{section.title}</h3>
                <p className="text-slate-600 dark:text-slate-400 mb-4">{section.content}</p>
                <div className="space-y-2">
                  {section.examples.map((example, idx) => (
                    <div key={idx} className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg text-sm">
                      {example}
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Практика */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-6"
        >
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <AcademicCapIcon className="h-6 w-6" />
            Практика
          </h2>
          
          <div className="grid gap-4">
            {practiceData.tasks.map((task, index) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="card border p-6 hover:shadow-soft transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">{task.title}</h3>
                    <p className="text-slate-600 dark:text-slate-400 mb-3">{task.description}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(task.difficulty)}`}>
                    {task.difficulty === 'easy' ? 'Легко' : 
                     task.difficulty === 'medium' ? 'Средне' : 'Сложно'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <ClockIcon className="h-4 w-4" />
                    {task.estimatedTime} мин
                  </div>
                  <button className="px-4 py-2 rounded-lg text-white gradient-accent shadow-soft text-sm font-medium hover:shadow-lg transition-shadow">
                    Начать решение
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Кнопки действий */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 pt-6"
        >
          <Link 
            href={`/whiteboard?taskId=${exam}-${taskNumber}&topic=${encodeURIComponent(decodedTopic)}`}
            className="flex-1 py-4 px-6 rounded-xl text-white gradient-accent shadow-soft text-center font-medium hover:shadow-lg transition-shadow"
          >
            Открыть доску для практики
          </Link>
          <Link 
            href={`/tasks?topic=${encodeURIComponent(decodedTopic)}`}
            className="flex-1 py-4 px-6 rounded-xl border text-center font-medium hover:bg-slate-50 dark:hover:bg-slate-900 transition"
          >
            Больше задач по теме
          </Link>
        </motion.div>
      </div>
    </Layout>
  );
}
