export type ExamType = 'oge' | 'ege';

export interface Task {
  number: number;
  title: string;
  description: string;
  topics: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedTime: number; // в минутах
}

export interface ExamConfig {
  id: ExamType;
  name: string;
  fullName: string;
  description: string;
  duration: number; // в минутах
  maxScore: number;
  tasks: Task[];
}

export const examConfigs: Record<ExamType, ExamConfig> = {
  oge: {
    id: 'oge',
    name: 'ОГЭ',
    fullName: 'Основной государственный экзамен',
    description: 'Экзамен для выпускников 9 класса по математике',
    duration: 235, // 3 часа 55 минут
    maxScore: 32,
    tasks: [
      {
        number: 1,
        title: 'Числа и вычисления',
        description: 'Действия с числами, степени, корни',
        topics: ['Арифметика', 'Степени', 'Корни'],
        difficulty: 'easy',
        estimatedTime: 5
      },
      {
        number: 2,
        title: 'Алгебраические выражения',
        description: 'Преобразование выражений, формулы сокращенного умножения',
        topics: ['Алгебра', 'Формулы сокращенного умножения'],
        difficulty: 'easy',
        estimatedTime: 8
      },
      {
        number: 3,
        title: 'Уравнения',
        description: 'Линейные и квадратные уравнения',
        topics: ['Уравнения', 'Квадратные уравнения'],
        difficulty: 'medium',
        estimatedTime: 12
      },
      {
        number: 4,
        title: 'Неравенства',
        description: 'Линейные неравенства и системы',
        topics: ['Неравенства', 'Системы неравенств'],
        difficulty: 'medium',
        estimatedTime: 15
      },
      {
        number: 5,
        title: 'Функции',
        description: 'Линейная и квадратичная функции',
        topics: ['Функции', 'Графики'],
        difficulty: 'medium',
        estimatedTime: 18
      },
      {
        number: 6,
        title: 'Геометрия',
        description: 'Планиметрия, площади и периметры',
        topics: ['Геометрия', 'Площади', 'Периметры'],
        difficulty: 'medium',
        estimatedTime: 20
      },
      {
        number: 7,
        title: 'Статистика и вероятность',
        description: 'Статистические характеристики, вероятность',
        topics: ['Статистика', 'Вероятность'],
        difficulty: 'hard',
        estimatedTime: 25
      },
      {
        number: 8,
        title: 'Текстовые задачи',
        description: 'Задачи на движение, работу, проценты',
        topics: ['Текстовые задачи', 'Проценты'],
        difficulty: 'hard',
        estimatedTime: 30
      }
    ]
  },
  ege: {
    id: 'ege',
    name: 'ЕГЭ',
    fullName: 'Единый государственный экзамен',
    description: 'Экзамен для выпускников 11 класса по математике',
    duration: 235, // 3 часа 55 минут
    maxScore: 32,
    tasks: [
      {
        number: 1,
        title: 'Практико-ориентированные задачи',
        description: 'Задачи на проценты, округление, выбор оптимального варианта',
        topics: ['Проценты', 'Округление', 'Практические задачи'],
        difficulty: 'easy',
        estimatedTime: 8
      },
      {
        number: 2,
        title: 'Чтение графиков и диаграмм',
        description: 'Анализ графиков функций, диаграмм',
        topics: ['Графики', 'Диаграммы', 'Анализ данных'],
        difficulty: 'easy',
        estimatedTime: 10
      },
      {
        number: 3,
        title: 'Планиметрия',
        description: 'Задачи на площади, углы, окружности',
        topics: ['Планиметрия', 'Площади', 'Окружности'],
        difficulty: 'medium',
        estimatedTime: 15
      },
      {
        number: 4,
        title: 'Теория вероятностей',
        description: 'Классическое определение вероятности',
        topics: ['Теория вероятностей', 'Комбинаторика'],
        difficulty: 'medium',
        estimatedTime: 18
      },
      {
        number: 5,
        title: 'Стереометрия',
        description: 'Задачи на объемы и площади поверхностей',
        topics: ['Стереометрия', 'Объемы', 'Площади поверхностей'],
        difficulty: 'medium',
        estimatedTime: 20
      },
      {
        number: 6,
        title: 'Производная',
        description: 'Исследование функций с помощью производной',
        topics: ['Производная', 'Исследование функций'],
        difficulty: 'hard',
        estimatedTime: 25
      },
      {
        number: 7,
        title: 'Уравнения и неравенства',
        description: 'Логарифмические, показательные уравнения',
        topics: ['Логарифмы', 'Показательные функции', 'Уравнения'],
        difficulty: 'hard',
        estimatedTime: 30
      },
      {
        number: 8,
        title: 'Параметры',
        description: 'Задачи с параметрами',
        topics: ['Параметры', 'Анализ'],
        difficulty: 'hard',
        estimatedTime: 35
      }
    ]
  }
};

export function getExamConfig(examType: ExamType): ExamConfig {
  return examConfigs[examType];
}

export function getTaskConfig(examType: ExamType, taskNumber: number): Task | null {
  const exam = examConfigs[examType];
  return exam.tasks.find(task => task.number === taskNumber) || null;
}

export function getAllTopics(examType: ExamType): string[] {
  const exam = examConfigs[examType];
  const topics = new Set<string>();
  exam.tasks.forEach(task => {
    task.topics.forEach(topic => topics.add(topic));
  });
  return Array.from(topics).sort();
}
