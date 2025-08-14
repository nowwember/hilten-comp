import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import { getExamConfig, getTaskConfig, ExamType } from '@/lib/exams/config';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState } from 'react';
import { ArrowLeftIcon, BookOpenIcon, ChevronDownIcon, ChevronUpIcon, LightBulbIcon, AcademicCapIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

interface PracticeTask {
  id: number;
  number: number;
  content: string;
  correctAnswer: string;
  explanation?: string;
}

export default function TopicPage() {
  const router = useRouter();
  const { exam, taskNumber, topic } = router.query;
  
  const [isTheoryExpanded, setIsTheoryExpanded] = useState(false);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [explanations, setExplanations] = useState<Record<number, string>>({});
  const [isChecking, setIsChecking] = useState(false);
  const [results, setResults] = useState<{
    total: number;
    solved: number;
    correct: number;
    errors: Array<{ number: number; correctAnswer: string }>;
  } | null>(null);
  const [loadingExplanations, setLoadingExplanations] = useState<Record<number, boolean>>({});
  
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

  // Мок-данные для практических задач
  const practiceTasks: PracticeTask[] = [
    {
      id: 1,
      number: 1,
      content: 'Вычислите: 2² + 3²',
      correctAnswer: '13'
    },
    {
      id: 2,
      number: 2,
      content: 'Найдите корень уравнения: x + 5 = 12',
      correctAnswer: '7'
    },
    {
      id: 3,
      number: 3,
      content: 'Площадь квадрата равна 16 см². Найдите его периметр.',
      correctAnswer: '16'
    },
    {
      id: 4,
      number: 4,
      content: 'Решите неравенство: 2x - 3 > 5',
      correctAnswer: 'x > 4'
    },
    {
      id: 5,
      number: 5,
      content: 'Найдите значение выражения при x = 2: x² - 3x + 1',
      correctAnswer: '-1'
    }
  ];

  const handleAnswerChange = (taskId: number, value: string) => {
    setAnswers(prev => ({ ...prev, [taskId]: value }));
  };

  const handleGetExplanation = async (task: PracticeTask) => {
    if (loadingExplanations[task.id]) return;
    
    setLoadingExplanations(prev => ({ ...prev, [task.id]: true }));
    
    try {
      const response = await fetch('/api/task-explanation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task: {
            id: `${exam}-${taskNumber}-${task.id}`,
            title: `Задача ${task.number}`,
            topic: decodedTopic,
            difficulty: taskConfig.difficulty,
            content: task.content
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        setExplanations(prev => ({ ...prev, [task.id]: data.message.content }));
      } else {
        setExplanations(prev => ({ ...prev, [task.id]: 'Не удалось получить объяснение' }));
      }
    } catch (error) {
      setExplanations(prev => ({ ...prev, [task.id]: 'Ошибка при получении объяснения' }));
    } finally {
      setLoadingExplanations(prev => ({ ...prev, [task.id]: false }));
    }
  };

  const handleCheckAnswers = () => {
    setIsChecking(true);
    
    const solved = Object.keys(answers).length;
    let correct = 0;
    const errors: Array<{ number: number; correctAnswer: string }> = [];

    practiceTasks.forEach(task => {
      const userAnswer = answers[task.id]?.trim().toLowerCase();
      const correctAnswer = task.correctAnswer.trim().toLowerCase();
      
      if (userAnswer === correctAnswer) {
        correct++;
      } else if (userAnswer) {
        errors.push({ number: task.number, correctAnswer: task.correctAnswer });
      }
    });

    setResults({
      total: practiceTasks.length,
      solved,
      correct,
      errors
    });
    
    setIsChecking(false);
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
              <h1 className="text-3xl font-bold">{decodedTopic}</h1>
              <p className="text-slate-600 dark:text-slate-400">Теория и практика по теме для подготовки к {examConfig.name}</p>
            </div>
          </div>
        </motion.div>

        {/* Сворачиваемый блок теории */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-neutral-50 dark:bg-slate-900/50 border rounded-xl overflow-hidden"
        >
          <button
            onClick={() => setIsTheoryExpanded(!isTheoryExpanded)}
            className="w-full p-6 flex items-center justify-between hover:bg-neutral-100 dark:hover:bg-slate-800/50 transition"
          >
            <div className="flex items-center gap-3">
              <LightBulbIcon className="h-6 w-6 text-slate-500" />
              <h2 className="text-xl font-semibold">Теория по теме</h2>
            </div>
            {isTheoryExpanded ? (
              <ChevronUpIcon className="h-5 w-5 text-slate-500" />
            ) : (
              <ChevronDownIcon className="h-5 w-5 text-slate-500" />
            )}
          </button>
          
          {isTheoryExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="px-6 pb-6 space-y-4"
            >
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg mb-2">Основные понятия</h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    Здесь будет размещена теоретическая информация по теме "{decodedTopic}". 
                    Материал будет включать основные определения, формулы и алгоритмы решения задач.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Ключевые формулы</h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    Основные формулы и правила, необходимые для решения задач по данной теме.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Алгоритмы решения</h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    Пошаговые алгоритмы для решения типичных задач по теме "{decodedTopic}".
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Практические задачи */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-6"
        >
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <AcademicCapIcon className="h-6 w-6" />
            Практика
          </h2>
          
          <div className="space-y-6">
            {practiceTasks.map((task, index) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="card border p-6 space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-lg font-semibold text-slate-700 dark:text-slate-300">
                        №{task.number}
                      </span>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 mb-4">{task.content}</p>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Ваш ответ:
                    </label>
                    <input
                      type="text"
                      value={answers[task.id] || ''}
                      onChange={(e) => handleAnswerChange(task.id, e.target.value)}
                      placeholder="Введите ответ..."
                      className="w-full px-4 py-3 border rounded-xl bg-transparent focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={() => handleGetExplanation(task)}
                      disabled={loadingExplanations[task.id]}
                      className="px-4 py-3 rounded-xl text-white gradient-accent shadow-soft text-sm font-medium hover:shadow-lg transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loadingExplanations[task.id] ? 'Загрузка...' : 'Объяснение от ИИ'}
                    </button>
                  </div>
                </div>
                
                {explanations[task.id] && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg"
                  >
                    <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-2">Объяснение:</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-wrap">
                      {explanations[task.id]}
                    </p>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Кнопка проверки */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex justify-center pt-6"
        >
          <button
            onClick={handleCheckAnswers}
            disabled={isChecking}
            className="px-8 py-4 rounded-xl text-white gradient-accent shadow-soft text-lg font-medium hover:shadow-lg transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isChecking ? 'Проверяем...' : 'Проверить'}
          </button>
        </motion.div>

        {/* Результаты проверки */}
        {results && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-neutral-50 dark:bg-slate-900/50 border rounded-xl p-6 space-y-4"
          >
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <CheckCircleIcon className="h-6 w-6 text-green-500" />
              Результаты проверки
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-700 dark:text-slate-300">{results.total}</div>
                <div className="text-sm text-slate-500">Всего задач</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{results.solved}</div>
                <div className="text-sm text-slate-500">Решено</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{results.correct}</div>
                <div className="text-sm text-slate-500">Правильно</div>
              </div>
            </div>
            
            {results.errors.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <XCircleIcon className="h-5 w-5 text-red-500" />
                  Задачи с ошибками:
                </h4>
                <div className="space-y-2">
                  {results.errors.map((error, index) => (
                    <div key={index} className="flex items-center gap-3 text-sm">
                      <span className="font-medium">№{error.number}:</span>
                      <span className="text-slate-600 dark:text-slate-400">
                        Правильный ответ: <span className="font-medium text-green-600">{error.correctAnswer}</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

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
