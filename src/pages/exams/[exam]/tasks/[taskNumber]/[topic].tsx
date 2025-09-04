import { useRouter } from 'next/router';
import TaskLayout from '@/layouts/TaskLayout';
import { getExam, ExamId, EgeMode } from '@/lib/exams/config';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState } from 'react';
import { ArrowLeftIcon, BookOpenIcon, ChevronDownIcon, ChevronUpIcon, LightBulbIcon, AcademicCapIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import MathRenderer from '@/components/ui/MathRenderer';
import { normalizeMathMarkdown } from '@/lib/markdown/normalizeMath';
import { AnswerPanel } from '@/components/ui/AnswerPanel';
import { BackLink } from '@/components/ui/BackLink';

// Утилита для капитализации русских строк
const capitalizeRu = (str: string): string => {
  if (!str) return str;
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
  const capitalized = firstPart.charAt(0).toUpperCase() + firstPart.slice(1);
  if (separator) {
    return capitalized + separator + str.substring(firstPart.length + separator.length);
  }
  return capitalized;
};

interface PracticeTask {
  id: number;
  number: number;
  content: string;
  correctAnswer: string;
  explanation?: string;
}

export default function TopicPage() {
  const router = useRouter();
  const { exam, taskNumber, topic, mode } = router.query;
  
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
      <TaskLayout title="Тема не найдена">
        <div className="text-center text-slate-500">Тема не найдена</div>
      </TaskLayout>
    );
  }

  // Определяем режим для ЕГЭ
  let currentMode: EgeMode | undefined;
  if (exam === 'ege') {
    const urlMode = mode as EgeMode;
    if (urlMode && (urlMode === 'base' || urlMode === 'profile')) {
      currentMode = urlMode;
    } else {
      currentMode = 'base'; // по умолчанию базовая
    }
  }

  const examConfig = getExam(exam as ExamId, currentMode);
  const taskConfig = examConfig.tasks.find(task => task.number === parseInt(taskNumber));
  const decodedTopic = decodeURIComponent(topic);
  
  if (!examConfig || !taskConfig || !taskConfig.topics.includes(decodedTopic)) {
    return (
      <TaskLayout title="Тема не найдена">
        <div className="text-center text-slate-500">Тема не найдена</div>
      </TaskLayout>
    );
  }

  // Мок-данные для практических задач
  const practiceTasks: PracticeTask[] = [
    { id: 1, number: 1, content: 'Вычислите: 2² + 3²', correctAnswer: '13' },
    { id: 2, number: 2, content: 'Найдите корень уравнения: x + 5 = 12', correctAnswer: '7' },
    { id: 3, number: 3, content: 'Площадь квадрата равна 16 см². Найдите его периметр.', correctAnswer: '16' },
    { id: 4, number: 4, content: 'Решите неравенство: 2x - 3 > 5', correctAnswer: 'x > 4' },
    { id: 5, number: 5, content: 'Найдите значение выражения при x = 2: x² - 3x + 1', correctAnswer: '-1' },
  ];

  const handleAnswerChange = (taskId: number, value: string) => {
    setAnswers(prev => ({ ...prev, [taskId]: value }));
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
    setResults({ total: practiceTasks.length, solved, correct, errors });
    setIsChecking(false);
  };

  return (
    <TaskLayout title={`${decodedTopic} - Задача ${taskNumber} - ${examConfig.name}`}>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Навигация */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4">
          <BackLink href={`/exams/${exam}/tasks/${taskNumber}${mode ? `?mode=${mode}` : ''}`}>Назад к задаче {taskNumber}</BackLink>
        </motion.div>

        {/* Заголовок темы */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-4">
          <div className="flex items-center gap-4">
            <BookOpenIcon className="h-8 w-8 text-slate-500" />
            <div>
              <h1 className="text-3xl font-bold">№{taskNumber}. {capitalizeRu(decodedTopic)}</h1>
              <p className="text-slate-600 dark:text-slate-400">Теория и практика по теме для подготовки к {examConfig.name}</p>
            </div>
          </div>
        </motion.div>

        {/* Сворачиваемый блок теории */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-neutral-50 dark:bg-slate-900/50 border rounded-xl overflow-hidden">
          <button onClick={() => setIsTheoryExpanded(!isTheoryExpanded)} className="w-full p-6 flex items-center justify-between hover:bg-neutral-100 dark:hover:bg-slate-800/50 transition">
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
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="px-6 pb-6 space-y-4">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg mb-2">Основные понятия</h3>
                  <MathRenderer markdown={normalizeMathMarkdown(`Здесь будет размещена теоретическая информация по теме "${decodedTopic}". Формула Байеса: $$P(A|B) = \\frac{P(B|A)P(A)}{P(B)}$$`)} />
                  <button className="mt-2 px-3 py-1 rounded bg-blue-100 hover:bg-blue-200 text-blue-700 transition" onClick={() => router.push(`/whiteboard?taskId=${exam}-${taskNumber}`)}>Открыть на доске</button>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Практические задачи */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="space-y-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <AcademicCapIcon className="h-6 w-6" />
            Практика
          </h2>
          <div className="space-y-6">
            {practiceTasks.map((task, index) => (
              <motion.div key={task.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 + index * 0.1 }} className="bg-white border rounded-xl shadow p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-lg font-semibold text-slate-700 dark:text-slate-300">№{task.number}</span>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 mb-4">{task.content}</p>
                  </div>
                </div>
                <AnswerPanel
                  value={answers[task.id] || ''}
                  onChange={v => handleAnswerChange(task.id, v)}
                  onCheck={() => {}}
                  taskId={`${exam}-${taskNumber}-${task.id}`}
                  statement={task.content}
                  placeholder="Введите ответ..."
                />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Кнопка проверки */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="flex justify-center pt-6">
          <button onClick={handleCheckAnswers} disabled={isChecking} className="px-8 py-4 rounded-xl text-white gradient-accent shadow-soft text-lg font-medium hover:shadow-lg transition-shadow disabled:opacity-50 disabled:cursor-not-allowed">
            {isChecking ? 'Проверяем...' : 'Проверить'}
          </button>
        </motion.div>

        {/* Результаты проверки */}
        {results && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-neutral-50 dark:bg-slate-900/50 border rounded-xl p-6 space-y-4">
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
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="flex flex-col sm:flex-row gap-4 pt-6">
          <Link href={`/whiteboard?taskId=${exam}-${taskNumber}&topic=${encodeURIComponent(decodedTopic)}${mode ? `&mode=${mode}` : ''}`} className="flex-1 py-4 px-6 rounded-xl text-white gradient-accent shadow-soft text-center font-medium hover:shadow-lg transition-shadow">Открыть доску для практики</Link>
          <Link href={`/tasks?topic=${encodeURIComponent(decodedTopic)}`} className="flex-1 py-4 px-6 rounded-xl border text-center font-medium hover:bg-slate-50 dark:hover:bg-slate-900 transition">Больше задач по теме</Link>
        </motion.div>
      </div>
    </TaskLayout>
  );
}
