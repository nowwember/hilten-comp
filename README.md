# ХилтэнКомп - Онлайн образовательная платформа

Современная минималистичная платформа для проведения онлайн-занятий с базой задач, профилями учеников и совместной онлайн-доской.

## Функциональность

- **База заданий**: Админы могут загружать задачи с темами, сложностью и ответами
- **Проверка решений**: Студенты могут проверять свои ответы и отмечать задачи как решённые
- **Профили учеников**: Отслеживание прогресса и истории активности
- **Онлайн-доска**: Совместное рисование и решение задач в реальном времени
- **Современный UI**: Минималистичный дизайн с поддержкой светлой и тёмной темы

## Технологический стек

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS, Framer Motion
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL с Prisma ORM
- **Authentication**: NextAuth.js
- **Whiteboard**: Excalidraw
- **Real-time**: Socket.IO

## Установка и запуск

### Локальная разработка

1. **Клонируйте репозиторий**
   ```bash
   git clone https://github.com/your-username/hilten-comp.git
   cd hilten-comp
   ```

2. **Установите зависимости**
   ```bash
   npm install
   ```

3. **Настройте базу данных**
   ```bash
   # Создайте PostgreSQL базу данных
   # Затем настройте .env файл:
   DATABASE_URL="postgresql://username:password@localhost:5432/hilten_comp"
   NEXTAUTH_SECRET="your-secret-key"
   NEXTAUTH_URL="http://localhost:3000"
   ```

4. **Примените миграции и заполните базу**
   ```bash
   npx prisma migrate dev --name init
   npm run db:seed
   ```

5. **Запустите сервер разработки**
   ```bash
   npm run dev
   ```

6. **Откройте [http://localhost:3000](http://localhost:3000)**

### Развертывание на Vercel (рекомендуется)

1. **Подключите репозиторий к Vercel**
   - Перейдите на [vercel.com](https://vercel.com)
   - Подключите ваш GitHub репозиторий
   - Настройте переменные окружения в Vercel Dashboard

2. **Настройте базу данных**
   - Используйте [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres) или [Neon](https://neon.tech)
   - Добавьте `DATABASE_URL` в переменные окружения Vercel

3. **Автоматическое развертывание**
   - При каждом push в main ветку проект будет автоматически развертываться

## Вытяжка задач ФИПИ через GitHub Actions

1. Подготовка
   - Убедитесь, что файл `.github/workflows/fipi-ingest.yml` лежит в ветке `main`.
   - В репозитории GitHub зайдите в **Settings → Actions → General**:
     - Enable Actions: Allow all actions and reusable workflows
     - Workflow permissions: Read and write permissions + Allow GitHub Actions to create and approve pull requests
   - Добавьте секреты (**Settings → Secrets and variables → Actions**):
     - `FIPI_EGE_BASIC_START` = ссылка на раздел ЕГЭ (база)
     - `INGEST_USER_AGENT` = ваш User-Agent

2. Запуск
   - Откройте вкладку **Actions** → выберите **FIPI Ingest (EGE basic)** → **Run workflow**.
   - Укажите диапазон страниц (например, `startPage=1`, `endPage=10`) и `limit` (например, `400`), нажмите **Run**.

3. Результат
   - В логе сборки увидите шаги ingest → curate → coverage.
   - Если есть изменения, автоматически создастся PR из ветки `fipi-update/<timestamp>` в `main`.
   - Отчёт `coverage.md` доступен в `scripts/fipi/reports/coverage.md` (фрагмент — в Summary задачи в Actions).

4. Советы
   - Запускайте батчами (по 10–20 страниц), проверяйте покрытие и synthetic rate.
   - Не запускайте этот workflow слишком часто (уважение к ресурсу ФИПИ).
   - Для локальной отладки: `npm run ingest:fipi ...`, затем `tsx scripts/fipi/curate.ts ...` и `tsx scripts/fipi/report-coverage.ts`.

## Скрипты

- `npm run dev` - Запуск сервера разработки
- `npm run build` - Сборка для продакшена
- `npm run start` - Запуск продакшен сервера
- `npm run db:seed` - Заполнение базы тестовыми данными
- `npm run lint` - Проверка кода

## Структура проекта

```
src/
├── components/          # React компоненты
├── pages/              # Next.js страницы и API
│   ├── api/           # API endpoints
│   └── auth/          # Страницы аутентификации
├── styles/            # Глобальные стили
├── types/             # TypeScript типы
└── lib/               # Утилиты и конфигурация
```

## Дизайн

Платформа использует современный минималистичный дизайн с:
- Чистыми светлыми и тёмными темами
- Плавными анимациями (Framer Motion)
- Скруглёнными формами и мягкими тенями
- Адаптивной вёрсткой

## Вклад в проект

1. Форкните репозиторий
2. Создайте ветку для новой функции (`git checkout -b feature/amazing-feature`)
3. Зафиксируйте изменения (`git commit -m 'Add amazing feature'`)
4. Отправьте в ветку (`git push origin feature/amazing-feature`)
5. Откройте Pull Request

## Лицензия

Этот проект распространяется под лицензией MIT. См. файл `LICENSE` для подробностей.

## Автор

**ХилтэнКомп** - современная образовательная платформа для онлайн-обучения.

---



