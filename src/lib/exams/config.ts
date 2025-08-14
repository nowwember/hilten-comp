export type ExamId = 'oge' | 'ege';
export type EgeMode = 'base' | 'profile';

// Для обратной совместимости
export type ExamType = ExamId;

export interface ExamTask {
  number: number;
  title: string;
  description: string;
  topics: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedTime: number; // в минутах
  part?: 1 | 2; // часть экзамена (опционально)
}

// Для обратной совместимости
export type Task = ExamTask;

export interface ExamConfig {
  id: ExamId;
  name: string;
  fullName: string;
  description: string;
  duration: number; // в минутах
  maxScore: number;
  tasks: ExamTask[];
  mode?: EgeMode; // только для ЕГЭ
}

export const examConfigs: Record<ExamId, ExamConfig | Record<EgeMode, ExamConfig>> = {
  oge: {
    id: 'oge',
    name: 'ОГЭ',
    fullName: 'Основной государственный экзамен',
    description: 'Экзамен для выпускников 9 класса по математике',
    duration: 235, // 3 часа 55 минут
    maxScore: 32,
    tasks: [
      // Часть 1 (задания 1-19)
      {
        number: 1,
        title: 'Сараи, шины, печки',
        description: 'Практико-ориентированные задачи',
        topics: ['путешествия', 'квартиры и садовые участки', 'связь', 'шины', 'печки'],
        difficulty: 'easy',
        estimatedTime: 3,
        part: 1
      },
      {
        number: 2,
        title: 'Простейшие текстовые задачи',
        description: 'Базовые текстовые задачи',
        topics: ['путешествия', 'квартиры и садовые участки', 'шины', 'теплицы', 'бумага', 'печки'],
        difficulty: 'easy',
        estimatedTime: 4,
        part: 1
      },
      {
        number: 3,
        title: 'Прикладная геометрия: площадь',
        description: 'Задачи на вычисление площадей',
        topics: ['путешествия', 'квартиры и садовые участки', 'шины', 'теплицы', 'бумага', 'печки'],
        difficulty: 'medium',
        estimatedTime: 5,
        part: 1
      },
      {
        number: 4,
        title: 'Прикладная геометрия: расстояния',
        description: 'Задачи на вычисление расстояний',
        topics: ['путешествия', 'квартиры и садовые участки', 'шины', 'теплицы', 'бумага', 'печки'],
        difficulty: 'medium',
        estimatedTime: 6,
        part: 1
      },
      {
        number: 5,
        title: 'Выбор оптимального варианта',
        description: 'Задачи на выбор лучшего варианта',
        topics: ['путешествия', 'квартиры и садовые участки', 'шины', 'теплицы', 'бумага', 'печки', 'выбор варианта из двух возможных', 'выбор варианта из трёх возможных'],
        difficulty: 'medium',
        estimatedTime: 7,
        part: 1
      },
      {
        number: 6,
        title: 'Числа и вычисления',
        description: 'Действия с числами',
        topics: ['действия с обыкновенными дробями', 'действия с десятичными дробями', 'действия с обыкновенными и десятичными дробями', 'степени'],
        difficulty: 'easy',
        estimatedTime: 4,
        part: 1
      },
      {
        number: 7,
        title: 'Числовые неравенства, координатная прямая',
        description: 'Работа с неравенствами и координатами',
        topics: ['неравенства', 'сравнение чисел', 'числа на прямой', 'выбор верного или неверного утверждения'],
        difficulty: 'medium',
        estimatedTime: 6,
        part: 1
      },
      {
        number: 8,
        title: 'Числа, вычисления и алгебраические выражения',
        description: 'Алгебраические преобразования',
        topics: ['целые алгебраические выражения', 'рациональные алгебраические выражения', 'степени и корни'],
        difficulty: 'medium',
        estimatedTime: 8,
        part: 1
      },
      {
        number: 9,
        title: 'Уравнения, системы уравнений',
        description: 'Решение уравнений и систем',
        topics: ['линейные уравнения', 'квадратные уравнения', 'рациональные уравнения', 'системы уравнений'],
        difficulty: 'medium',
        estimatedTime: 10,
        part: 1
      },
      {
        number: 10,
        title: 'Статистика, вероятности',
        description: 'Теория вероятностей и статистика',
        topics: ['классические вероятности', 'статистика', 'теоремы о вероятностях событий'],
        difficulty: 'hard',
        estimatedTime: 12,
        part: 1
      },
      {
        number: 11,
        title: 'Графики функций',
        description: 'Чтение и анализ графиков',
        topics: ['чтение графиков функций', 'растяжения и сдвиги'],
        difficulty: 'medium',
        estimatedTime: 8,
        part: 1
      },
      {
        number: 12,
        title: 'Расчёты по формулам',
        description: 'Вычисления по заданным формулам',
        topics: ['вычисление по формуле', 'линейные уравнения', 'разные задачи'],
        difficulty: 'medium',
        estimatedTime: 9,
        part: 1
      },
      {
        number: 13,
        title: 'Неравенства, системы неравенств',
        description: 'Решение неравенств',
        topics: ['линейные', 'квадратные', 'рациональные', 'системы неравенств'],
        difficulty: 'hard',
        estimatedTime: 15,
        part: 1
      },
      {
        number: 14,
        title: 'Задачи на прогрессии',
        description: 'Арифметическая и геометрическая прогрессии',
        topics: ['арифметическая прогрессия', 'геометрическая прогрессия'],
        difficulty: 'hard',
        estimatedTime: 18,
        part: 1
      },
      {
        number: 15,
        title: 'Треугольники, четырёхугольники, многоугольники и их элементы',
        description: 'Геометрия многоугольников',
        topics: ['углы', 'треугольники общего вида', 'равнобедренные', 'прямоугольный', 'параллелограмм', 'ромб', 'трапеция', 'многоугольники'],
        difficulty: 'hard',
        estimatedTime: 20,
        part: 1
      },
      {
        number: 16,
        title: 'Окружность, круг и их элементы',
        description: 'Геометрия окружности',
        topics: ['центральные/вписанные углы', 'касательная/хорда/секущая/радиус', 'окружность', 'описанная вокруг многоугольника'],
        difficulty: 'hard',
        estimatedTime: 22,
        part: 1
      },
      {
        number: 17,
        title: 'Площади фигур',
        description: 'Вычисление площадей',
        topics: ['квадрат', 'прямоугольник', 'параллелограмм', 'треугольники общего вида', 'прямоугольный', 'равнобедренный', 'трапеция', 'площадь круга и его частей'],
        difficulty: 'hard',
        estimatedTime: 25,
        part: 1
      },
      {
        number: 18,
        title: 'Фигуры на квадратной решётке',
        description: 'Геометрия на координатной сетке',
        topics: ['расстояния', 'средняя линия', 'теорема Пифагора', 'площади', 'длины сторон'],
        difficulty: 'hard',
        estimatedTime: 28,
        part: 1
      },
      {
        number: 19,
        title: 'Анализ геометрических высказываний',
        description: 'Проверка геометрических утверждений',
        topics: ['анализ геометрических высказываний'],
        difficulty: 'hard',
        estimatedTime: 30,
        part: 1
      },
      // Часть 2 (задания 20-25)
      {
        number: 20,
        title: 'Алгебраические выражения, уравнения, неравенства и их системы',
        description: 'Сложные алгебраические задачи',
        topics: ['алгебраические выражения', 'уравнения', 'неравенства', 'системы уравнений', 'системы неравенств'],
        difficulty: 'hard',
        estimatedTime: 25,
        part: 2
      },
      {
        number: 21,
        title: 'Текстовые задачи',
        description: 'Сложные текстовые задачи',
        topics: ['проценты/сплавы/смеси', 'движение по прямой', 'движение по воде', 'совместная работа', 'разные задачи'],
        difficulty: 'hard',
        estimatedTime: 30,
        part: 2
      },
      {
        number: 22,
        title: 'Функции и их свойства, графики функций',
        description: 'Исследование функций',
        topics: ['параболы', 'гиперболы', 'кусочно-непрерывные функции', 'разные задачи'],
        difficulty: 'hard',
        estimatedTime: 35,
        part: 2
      },
      {
        number: 23,
        title: 'Геометрические задачи на вычисление',
        description: 'Сложные геометрические вычисления',
        topics: ['углы', 'треугольники', 'четырёхугольники', 'окружности'],
        difficulty: 'hard',
        estimatedTime: 35,
        part: 2
      },
      {
        number: 24,
        title: 'Геометрические задачи на доказательство',
        description: 'Геометрические доказательства',
        topics: ['правильные многоугольники', 'треугольники и их элементы', 'четырёхугольники и их элементы', 'окружности и их элементы'],
        difficulty: 'hard',
        estimatedTime: 40,
        part: 2
      },
      {
        number: 25,
        title: 'Геометрические задачи повышенной сложности',
        description: 'Задачи высшего уровня сложности',
        topics: ['треугольники', 'четырёхугольники', 'окружности', 'комбинации многоугольников и окружностей'],
        difficulty: 'hard',
        estimatedTime: 45,
        part: 2
      }
    ]
  },
  ege: {
    base: {
      id: 'ege',
      name: 'ЕГЭ',
      fullName: 'Единый государственный экзамен (базовая математика)',
      description: 'Экзамен для выпускников 11 класса по математике (базовый уровень)',
      duration: 180, // 3 часа
      maxScore: 20,
      mode: 'base',
      tasks: [
        // Все задания базового ЕГЭ в части 1
        {
          number: 1,
          title: 'Простейшие текстовые задачи',
          description: 'Базовые текстовые задачи',
          topics: ['округление с недостатком', 'округление с избытком', 'разные задачи'],
          difficulty: 'easy',
          estimatedTime: 3,
          part: 1
        },
        {
          number: 2,
          title: 'Размеры и единицы измерения',
          description: 'Работа с единицами измерения',
          topics: ['время', 'длина', 'масса', 'объём', 'площадь', 'различные единицы'],
          difficulty: 'easy',
          estimatedTime: 4,
          part: 1
        },
        {
          number: 3,
          title: 'Чтение графиков и диаграмм',
          description: 'Анализ графиков и диаграмм',
          topics: ['величина по графику', 'величина по диаграмме'],
          difficulty: 'easy',
          estimatedTime: 5,
          part: 1
        },
        {
          number: 4,
          title: 'Преобразования выражений',
          description: 'Алгебраические преобразования',
          topics: ['формулы с большим числом переменных', 'с одной/двумя переменными', 'с тремя переменными'],
          difficulty: 'medium',
          estimatedTime: 6,
          part: 1
        },
        {
          number: 5,
          title: 'Начала теории вероятностей',
          description: 'Базовые понятия вероятности',
          topics: ['классическое определение вероятности', 'теоремы о вероятностях событий'],
          difficulty: 'medium',
          estimatedTime: 7,
          part: 1
        },
        {
          number: 6,
          title: 'Выбор оптимального варианта',
          description: 'Задачи на выбор лучшего варианта',
          topics: ['подбор комплекта или комбинации', 'выбор из 2/3/4 возможных'],
          difficulty: 'medium',
          estimatedTime: 8,
          part: 1
        },
        {
          number: 7,
          title: 'Анализ графиков и диаграмм',
          description: 'Глубокий анализ графиков',
          topics: ['анализ графиков функций', 'скорость изменения величин'],
          difficulty: 'medium',
          estimatedTime: 9,
          part: 1
        },
        {
          number: 8,
          title: 'Анализ утверждений',
          description: 'Проверка математических утверждений',
          topics: ['анализ утверждений'],
          difficulty: 'medium',
          estimatedTime: 10,
          part: 1
        },
        {
          number: 9,
          title: 'Задачи на квадратной решётке',
          description: 'Геометрия на координатной сетке',
          topics: ['задачи на карте', 'план местности', 'трапеция', 'треугольник', 'ромб', 'произвольный четырёхугольник'],
          difficulty: 'medium',
          estimatedTime: 12,
          part: 1
        },
        {
          number: 10,
          title: 'Прикладная геометрия',
          description: 'Практические геометрические задачи',
          topics: ['разные задачи', 'квадрат', 'окружность', 'трапеция', 'треугольник', 'прямоугольник'],
          difficulty: 'medium',
          estimatedTime: 15,
          part: 1
        },
        {
          number: 11,
          title: 'Прикладная стереометрия',
          description: 'Практические задачи по стереометрии',
          topics: ['многогранники (рёбра/грани)', 'куб', 'прямоугольный параллелепипед', 'призма', 'пирамида', 'площадь поверхности составного', 'объём составного', 'круглые тела'],
          difficulty: 'hard',
          estimatedTime: 18,
          part: 1
        },
        {
          number: 12,
          title: 'Планиметрия',
          description: 'Задачи по планиметрии',
          topics: ['треугольники', 'четырёхугольники', 'многоугольники', 'окружность'],
          difficulty: 'hard',
          estimatedTime: 20,
          part: 1
        },
        {
          number: 13,
          title: 'Задачи по стереометрии',
          description: 'Задачи по стереометрии',
          topics: ['параллелепипед', 'призма', 'пирамида', 'цилиндр', 'конус', 'шар'],
          difficulty: 'hard',
          estimatedTime: 22,
          part: 1
        },
        {
          number: 14,
          title: 'Вычисления',
          description: 'Различные вычисления',
          topics: ['десятичные дроби', 'разные задачи', 'обыкновенные дроби'],
          difficulty: 'medium',
          estimatedTime: 8,
          part: 1
        },
        {
          number: 15,
          title: 'Простейшие текстовые задачи',
          description: 'Базовые текстовые задачи',
          topics: ['проценты', 'округление'],
          difficulty: 'easy',
          estimatedTime: 5,
          part: 1
        },
        {
          number: 16,
          title: 'Вычисления и преобразования',
          description: 'Сложные вычисления и преобразования',
          topics: ['со степенями', 'числовые иррациональные выражения', 'числовые логарифмические', 'вычисление тригонометрических', 'преобразования тригонометрических'],
          difficulty: 'hard',
          estimatedTime: 25,
          part: 1
        },
        {
          number: 17,
          title: 'Простейшие уравнения',
          description: 'Решение различных уравнений',
          topics: ['линейные/квадратные/кубические', 'иррациональные', 'показательные', 'логарифмические'],
          difficulty: 'hard',
          estimatedTime: 28,
          part: 1
        },
        {
          number: 18,
          title: 'Неравенства',
          description: 'Решение неравенств',
          topics: ['решение неравенств', 'числовые промежутки'],
          difficulty: 'hard',
          estimatedTime: 30,
          part: 1
        },
        {
          number: 19,
          title: 'Числа и их свойства',
          description: 'Свойства чисел',
          topics: ['цифровая запись числа'],
          difficulty: 'hard',
          estimatedTime: 32,
          part: 1
        },
        {
          number: 20,
          title: 'Текстовые задачи',
          description: 'Сложные текстовые задачи',
          topics: ['проценты/смеси/сплавы', 'движение по прямой/окружности/воде', 'совместная работа', 'прогрессии'],
          difficulty: 'hard',
          estimatedTime: 35,
          part: 1
        },
        {
          number: 21,
          title: 'Задачи на смекалку',
          description: 'Нестандартные задачи',
          topics: ['задачи о числах', 'планиметрия', 'текстовые задачи'],
          difficulty: 'hard',
          estimatedTime: 40,
          part: 1
        }
      ]
    },
    profile: {
      id: 'ege',
      name: 'ЕГЭ',
      fullName: 'Единый государственный экзамен (профильная математика)',
      description: 'Экзамен для выпускников 11 класса по математике (профильный уровень)',
      duration: 235, // 3 часа 55 минут
      maxScore: 32,
      mode: 'profile',
      tasks: [
        // Часть 1 (задания 1-12)
        {
          number: 1,
          title: 'Планиметрия',
          description: 'Задачи по планиметрии',
          topics: ['прямоугольный треугольник', 'равнобедренный', 'общего вида', 'параллелограммы', 'трапеция', 'центральные/вписанные углы', 'касательная/хорда/секущая', 'вписанные/описанные окружности'],
          difficulty: 'medium',
          estimatedTime: 8,
          part: 1
        },
        {
          number: 2,
          title: 'Векторы',
          description: 'Операции с векторами',
          topics: ['векторы и операции'],
          difficulty: 'medium',
          estimatedTime: 10,
          part: 1
        },
        {
          number: 3,
          title: 'Стереометрия',
          description: 'Задачи по стереометрии',
          topics: ['куб', 'прямоугольный параллелепипед', 'элементы составных многогранников', 'площадь поверхности/объём составного', 'призма', 'пирамида', 'комбинации тел', 'цилиндр', 'конус', 'шар'],
          difficulty: 'hard',
          estimatedTime: 15,
          part: 1
        },
        {
          number: 4,
          title: 'Начала теории вероятностей',
          description: 'Базовые понятия вероятности',
          topics: ['классическое определение вероятности'],
          difficulty: 'medium',
          estimatedTime: 8,
          part: 1
        },
        {
          number: 5,
          title: 'Вероятности сложных событий',
          description: 'Сложные вероятностные задачи',
          topics: ['теоремы о вероятностях событий', 'новые задания банка MathЕГЭ'],
          difficulty: 'hard',
          estimatedTime: 12,
          part: 1
        },
        {
          number: 6,
          title: 'Простейшие уравнения',
          description: 'Решение различных уравнений',
          topics: ['линейные/квадратные/кубические', 'рациональные', 'иррациональные', 'показательные', 'логарифмические', 'тригонометрические'],
          difficulty: 'hard',
          estimatedTime: 18,
          part: 1
        },
        {
          number: 7,
          title: 'Вычисления и преобразования',
          description: 'Сложные алгебраические преобразования',
          topics: ['рациональные', 'алгебраические выражения/дроби', 'степенные', 'степени', 'иррациональные (числ/букв)', 'логарифмические (числ/букв)', 'тригонометрические (числ/букв)'],
          difficulty: 'hard',
          estimatedTime: 20,
          part: 1
        },
        {
          number: 8,
          title: 'Производная и первообразная',
          description: 'Применение производной',
          topics: ['физический/геометрический смысл', 'применение к исследованию функций', 'первообразная'],
          difficulty: 'hard',
          estimatedTime: 25,
          part: 1
        },
        {
          number: 9,
          title: 'Прикладные задачи',
          description: 'Практические задачи',
          topics: ['линейные/квадратные/степенные', 'рациональные/иррациональные', 'показательные/логарифмические', 'тригонометрические', 'разные'],
          difficulty: 'hard',
          estimatedTime: 28,
          part: 1
        },
        {
          number: 10,
          title: 'Текстовые задачи',
          description: 'Сложные текстовые задачи',
          topics: ['проценты/смеси/сплавы', 'движение (прямая/окружность/вода)', 'совместная работа', 'прогрессии'],
          difficulty: 'hard',
          estimatedTime: 30,
          part: 1
        },
        {
          number: 11,
          title: 'Графики функций',
          description: 'Анализ графиков функций',
          topics: ['линейные', 'параболы', 'гиперболы', 'корни', 'показательные/логарифмические', 'тригонометрические', 'комбинированные'],
          difficulty: 'hard',
          estimatedTime: 32,
          part: 1
        },
        {
          number: 12,
          title: 'Наибольшее/наименьшее значение',
          description: 'Поиск экстремумов',
          topics: ['без производной', 'степенные/иррациональные', 'частные', 'произведения', 'показательные/логарифмические', 'тригонометрические'],
          difficulty: 'hard',
          estimatedTime: 35,
          part: 1
        },
        // Часть 2 (задания 13-19)
        {
          number: 13,
          title: 'Уравнения',
          description: 'Сложные уравнения',
          topics: ['показательные', 'рациональные', 'иррациональные', 'логарифмические', 'тригонометрические (разные виды, в т.ч. сводимые и с разложением)', 'смешанные типы'],
          difficulty: 'hard',
          estimatedTime: 40,
          part: 2
        },
        {
          number: 14,
          title: 'Стереометрическая задача',
          description: 'Сложные задачи по стереометрии',
          topics: ['расстояния/углы/сечения', 'объёмы', 'круглые тела', 'комбинации'],
          difficulty: 'hard',
          estimatedTime: 45,
          part: 2
        },
        {
          number: 15,
          title: 'Неравенства',
          description: 'Сложные неравенства',
          topics: ['радикалы', 'рациональные', 'показательные', 'логарифмические (разные виды, в т.ч. с переменным основанием/рационализация)', 'смешанные типы', 'с тригонометрией', 'с модулем'],
          difficulty: 'hard',
          estimatedTime: 50,
          part: 2
        },
        {
          number: 16,
          title: 'Финансовая математика',
          description: 'Задачи по финансовой математике',
          topics: ['вклады', 'кредиты', 'оптимальный выбор', 'разные'],
          difficulty: 'hard',
          estimatedTime: 55,
          part: 2
        },
        {
          number: 17,
          title: 'Планиметрическая задача',
          description: 'Сложные задачи по планиметрии',
          topics: ['треугольники/четырёхугольники', 'окружности (впис/опис) и их комбинации', 'разные задачи о многоугольниках'],
          difficulty: 'hard',
          estimatedTime: 60,
          part: 2
        },
        {
          number: 18,
          title: 'Задача с параметром',
          description: 'Задачи с параметрами',
          topics: ['уравнения/неравенства/системы с параметром', 'методы (симметрии, монотонность, оценки)', 'аналитические решения', 'координаты', 'окружность', 'расстояния', 'функции с параметром'],
          difficulty: 'hard',
          estimatedTime: 65,
          part: 2
        },
        {
          number: 19,
          title: 'Числа и их свойства',
          description: 'Задачи о числах',
          topics: ['числа и их свойства', 'числовые наборы', 'последовательности/прогрессии', 'сюжетные задачи (кино, театр, мотки верёвки)'],
          difficulty: 'hard',
          estimatedTime: 70,
          part: 2
        }
      ]
    }
  }
};

export function getExam(examId: ExamId, mode?: EgeMode): ExamConfig {
  console.log('getExam called with:', { examId, mode });
  
  if (examId === 'oge') {
    console.log('Returning OGE config');
    return examConfigs.oge as ExamConfig;
  }
  
  if (examId === 'ege') {
    console.log('Getting EGE config for mode:', mode || 'base');
    const egeConfigs = examConfigs.ege as Record<EgeMode, ExamConfig>;
    const config = egeConfigs[mode || 'base'];
    console.log('EGE config found:', !!config);
    return config;
  }
  
  console.error('Unknown exam:', examId);
  throw new Error(`Unknown exam: ${examId}`);
}

// Для обратной совместимости
export function getExamConfig(examType: ExamType): ExamConfig {
  return getExam(examType);
}

export function getTaskConfig(examType: ExamType, taskNumber: number): Task | null {
  const exam = getExam(examType);
  return exam.tasks.find(task => task.number === taskNumber) || null;
}

export function groupTasksByPart(tasks: ExamTask[]): { part1: ExamTask[], part2: ExamTask[] } {
  const part1: ExamTask[] = [];
  const part2: ExamTask[] = [];
  
  tasks.forEach(task => {
    if (task.part === 2) {
      part2.push(task);
    } else {
      part1.push(task);
    }
  });
  
  return { part1, part2 };
}

export function getTasksByPart(examId: ExamId, part: 1 | 2, mode?: EgeMode): ExamTask[] {
  const exam = getExam(examId, mode);
  return exam.tasks.filter(task => task.part === part);
}

export function getAllTopics(examId: ExamId, mode?: EgeMode): string[] {
  const exam = getExam(examId, mode);
  const topics = new Set<string>();
  exam.tasks.forEach(task => {
    task.topics.forEach(topic => topics.add(topic));
  });
  return Array.from(topics).sort();
}
