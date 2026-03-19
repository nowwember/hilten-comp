# ХилтэнКомп — CLAUDE.md

## Стек

- **Framework:** Next.js 14.2.5 (Pages Router) + React 18.3.1 + TypeScript 5.5.4
- **Styling:** Tailwind CSS 3.4.10 + Framer Motion (dark mode: class-based)
- **Database:** PostgreSQL через Prisma 5.17.0
- **Auth:** NextAuth 4.24.7 (JWT, Credentials provider)
- **Real-time:** Socket.IO 4.7.5
- **Whiteboard:** Excalidraw 0.17.6
- **Математика:** KaTeX 0.16.22 + MathJax (better-react-mathjax 2.3.0)
- **AI:** OpenAI API (gpt-4o-mini) — объяснения задач
- **Валидация:** Zod 3.23.8
- **Data ingestion:** Playwright 1.55.0 (скрапинг ФИПИ)
- **Package manager:** npm, Node >=18

## Команды

| Команда | Описание |
|---------|----------|
| `npm run dev` | Запуск dev-сервера |
| `npm run build` | `prisma generate` + `prisma migrate deploy` + `next build` |
| `npm run start` | Запуск production-сервера |
| `npm run db:migrate` | `prisma migrate dev` |
| `npm run db:generate` | `prisma generate` |
| `npm run db:seed` | Заполнение БД тестовыми данными |
| `npm run ingest:fipi` | Запуск скрапинга ФИПИ (требует Playwright) |
| `npm run ingest:fipi:by-task` | Скрапинг ФИПИ по конкретным задачам |
| `npm run pw:install` | Установка Chromium для Playwright |
| `npm run fipi:mvp:check` | Проверка MVP-покрытия ФИПИ |

## Архитектура

```
├── prisma/                  # Схема БД и миграции
│   ├── schema.prisma        # 5 моделей: User, Task, Submission, Session, AiChatSession
│   ├── seed.ts              # Сидинг тестовых данных
│   └── migrations/
├── src/
│   ├── pages/               # Next.js Pages Router
│   │   ├── api/             # API-маршруты (REST)
│   │   │   ├── auth/        # NextAuth + регистрация
│   │   │   ├── tasks/       # CRUD задач
│   │   │   ├── ai-chat/     # Хранение AI-чат сессий
│   │   │   ├── socket.ts    # Socket.IO сервер для whiteboard
│   │   │   ├── board-session.ts # REST-сессии whiteboard
│   │   │   ├── submissions.ts   # Проверка ответов
│   │   │   └── task-explanation.ts # AI-объяснения (OpenAI)
│   │   ├── auth/            # Страницы входа/регистрации
│   │   ├── tasks/           # Просмотр и решение задач
│   │   ├── exams/           # Экзаменационная система (ОГЭ/ЕГЭ)
│   │   ├── exam/            # ФИПИ-задачи по номерам
│   │   ├── dev/             # Debug-страницы (math-debug, ai-chat-concept)
│   │   ├── whiteboard.tsx   # Онлайн-доска
│   │   ├── profile.tsx      # Профиль пользователя
│   │   └── index.tsx        # Лендинг
│   ├── components/
│   │   ├── ai/              # AI-панель объяснений (dock + mobile sheet)
│   │   ├── tasks/           # Компоненты задач (SourceAttribution)
│   │   ├── ui/              # UI: AnswerPanel, MathRenderer, BackLink
│   │   ├── Layout.tsx       # Глобальная обёртка с навбаром
│   │   └── Navbar.tsx       # Навигация, переключение темы
│   ├── lib/
│   │   ├── ai/              # Системные промпты, chatStorage (localStorage, 7d TTL)
│   │   ├── exams/           # Конфиги ОГЭ/ЕГЭ (~680 строк), генерация вариантов
│   │   ├── fipi/            # Загрузчики, лейблер, классификаторы, карта задач
│   │   ├── markdown/        # normalizeMath: \(...\) → $...$
│   │   └── prisma.ts        # Singleton Prisma-клиента
│   ├── hooks/               # useTaskAiChat
│   ├── layouts/             # TaskLayout (обёртка страниц задач)
│   ├── styles/              # globals.css, ai-panel.css
│   └── types/               # next-auth.d.ts, socket.d.ts
├── scripts/fipi/            # Pipeline скрапинга ФИПИ (ingest, curate, coverage)
├── data/fipi/               # JSON-файлы задач ФИПИ (raw + curated)
├── .github/workflows/       # fipi-ingest.yml (GitHub Actions)
└── public/                  # Статические ассеты
```

## Схема БД (ключевые модели)

### User
- `id` (cuid), `name?`, `email` (unique), `passwordHash`, `role` (USER | ADMIN)
- Первый зарегистрированный пользователь автоматически получает роль ADMIN

### Task
- `id` (cuid), `title` (unique), `topic`, `difficulty` (EASY | MEDIUM | HARD), `content`, `answer`, `authorId?`

### Submission
- `id` (cuid), `userId` → User, `taskId` → Task, `answer`, `isCorrect`

### Session
- NextAuth JWT sessions

### AiChatSession
- `userId?`, `taskId`, `messages` (JSONB) — индекс на [userId, taskId]
- Хранит историю AI-объяснений по конкретным задачам

## Переменные окружения

| Переменная | Назначение |
|------------|------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | Секрет для JWT-подписи |
| `NEXTAUTH_URL` | URL callback (http://localhost:3000 для dev) |
| `OPENAI_API_KEY` | API-ключ OpenAI для AI-объяснений |

> `.env.example` отсутствует — только `.env` с реальными значениями.

## Текущий статус функций

| Функция | Статус | Заметки |
|---------|--------|---------|
| База задач | ✅ Работает | CRUD, фильтрация по теме/сложности, admin-only создание |
| Отрисовка формул | ✅ Работает | KaTeX + MathJax, синтаксис `$...$` / `$$...$$` |
| Профили | ✅ Работает | Решённые задачи, лента активности |
| Админ-панель | ✅ Работает | Создание/редактирование/удаление задач |
| Авторизация | ✅ Работает | Регистрация, вход, JWT, RBAC (USER/ADMIN) |
| AI-объяснения | ✅ Работает | GPT-4o-mini, русский промпт, история чата |
| Whiteboard соло | ✅ Работает | Excalidraw + localStorage |
| Whiteboard шаринг | ⚠️ Частично | Сессия по ссылке работает, но без presence |
| Whiteboard совместный | ⚠️ Не завершён | См. раздел «Проблемы» ниже |
| Экзамены (ОГЭ/ЕГЭ) | ✅ Работает | Полные конфиги, варианты с таймером |
| ФИПИ pipeline | ✅ Работает | GitHub Actions, Playwright, curate + coverage |
| Соцсеть | 🔲 Не начато | Заявлено как вектор развития |

## Известные проблемы и TODO

### 🔴 Whiteboard: совместная работа не завершена

**Файл:** `src/pages/whiteboard.tsx` строки 25-26, 39

Данные о collaborators **явно удаляются** из Excalidraw appState при отправке и получении:
```typescript
// строка 25-26: при получении сцены
const { collaborators, ...rest } = scene.appState;
// строка 39: при отправке сцены
const { collaborators, ...restAppState } = (appState || {});
```

**Что отсутствует:**
1. **Presence tracking** — нет отображения кто сейчас в комнате
2. **Cursor sync** — курсоры других пользователей не видны
3. **Conflict resolution** — нет обработки одновременных правок
4. **Disconnect handling** — `src/pages/api/socket.ts` не обрабатывает disconnect
5. **Персистентность** — whiteboard-данные хранятся только в памяти процесса (global Map), теряются при перезапуске
6. **Board-session** (`src/pages/api/board-session.ts`) — тоже in-memory Map

**Для реализации полного collab нужно:**
- Включить передачу collaborators в Excalidraw
- Добавить presence-протокол (join/leave/cursor) через Socket.IO
- Персистировать сцены в БД (новая модель в Prisma)
- Добавить обработку disconnect в socket-сервере

### 🟡 Отсутствует .env.example
`.env` содержит реальные значения, `.env.example` для документации отсутствует.

### 🟡 Обильный console.log в продакшен-коде
Файлы с debug-логированием (не вычищено):
- `src/components/ai/AiExplainPanel.tsx` (~5 вызовов)
- `src/components/ai/AiExplainProvider.tsx` (~9)
- `src/lib/exams/config.ts` (~5)
- `src/components/ui/MathRenderer.tsx` (~4)
- `src/lib/markdown/normalizeMath.ts` (~9)
- `src/hooks/useTaskAiChat.ts` (~3)

### 🟡 Нет тестов
В кодовой базе отсутствуют unit/integration тесты.

### 🟡 Типизация whiteboard
`src/pages/whiteboard.tsx` — активное использование `any` для типов Excalidraw и Socket.IO.

## Code style

- **Язык:** Весь UI и комментарии на русском
- **Naming:** camelCase (переменные/функции), PascalCase (компоненты)
- **Импорты:** `@/` алиас для `src/`
- **Data fetching:** SWR + fetch
- **State:** React Context (AI-панель), localStorage (чат, whiteboard)
- **API:** Next.js API Routes, проверка метода через `if (req.method === ...)`
- **Типы:** TypeScript везде, `any` встречается в whiteboard/socket коде
- **Тема:** Dark mode через class (`darkMode: 'class'` в Tailwind)
- **Шрифт:** Inter (через Tailwind config)
- **Цвета:** Кастомная палитра `brand` (голубой) и `accent` (фиолетовый)
- **Тесты:** Отсутствуют
- **Линтер:** Не настроен (нет ESLint конфига и нет `lint` скрипта в package.json)

## Важные файлы

### Ядро
| Файл | Назначение |
|------|------------|
| `prisma/schema.prisma` | Схема БД (5 моделей) |
| `src/lib/prisma.ts` | Singleton Prisma-клиента |
| `src/pages/_app.tsx` | App wrapper: SessionProvider, MathJax, AiPanel |
| `src/components/Layout.tsx` | Глобальный layout с навбаром |
| `src/components/Navbar.tsx` | Навигация, тема, ссылки |
| `tailwind.config.js` | Кастомные цвета brand/accent, шрифт Inter |
| `next.config.js` | Минимальный: только reactStrictMode |

### Whiteboard (ключевая незавершённая фича)
| Файл | Назначение |
|------|------------|
| `src/pages/whiteboard.tsx` | Excalidraw + Socket.IO клиент |
| `src/pages/api/socket.ts` | Socket.IO сервер (join, scene:update) |
| `src/pages/api/board-session.ts` | REST-сессии whiteboard (in-memory) |
| `src/types/socket.d.ts` | Типы для Socket.IO интеграции |

### Задачи и экзамены
| Файл | Назначение |
|------|------------|
| `src/pages/api/tasks/index.ts` | GET (список + фильтры) / POST (создание, ADMIN) |
| `src/pages/api/tasks/[id].ts` | GET / PUT / DELETE одной задачи |
| `src/pages/api/submissions.ts` | Проверка ответов |
| `src/pages/tasks/index.tsx` | Страница каталога задач |
| `src/pages/tasks/[id].tsx` | Страница решения задачи |
| `src/lib/exams/config.ts` | Конфиги ОГЭ (25 заданий) / ЕГЭ база (21) / профиль (19) |
| `src/lib/exams/variants.ts` | Генерация вариантов (seed-based) |

### AI-объяснения
| Файл | Назначение |
|------|------------|
| `src/pages/api/task-explanation.ts` | OpenAI API endpoint (gpt-4o-mini) |
| `src/pages/api/ai-chat/session.ts` | Хранение истории чата в БД |
| `src/lib/ai/systemPrompts.ts` | Системный промпт учителя (рус.) |
| `src/lib/ai/chatStorage.ts` | localStorage чат с TTL 7 дней |
| `src/components/ai/AiExplainPanel.tsx` | Dock-панель AI (desktop + mobile) |
| `src/components/ai/AiExplainProvider.tsx` | Context provider AI-чата |

### ФИПИ pipeline
| Файл | Назначение |
|------|------------|
| `scripts/fipi/ingest.ts` | Точка входа скрапинга |
| `scripts/fipi/curate.ts` | Курирование данных |
| `scripts/fipi/report-coverage.ts` | Отчёт покрытия |
| `scripts/fipi/mvp-gate.ts` | MVP-проверка (мин. 2 задачи на подтему) |
| `src/lib/fipi/loaders.ts` | Загрузка задач из JSON |
| `src/lib/fipi/labeler.ts` | ML-классификатор типа задач |
| `src/lib/fipi/ege-basic-map.ts` | Маппинг номеров ЕГЭ → названия |
| `data/fipi/ege/basic/` | Курированные JSON задачи |
| `.github/workflows/fipi-ingest.yml` | CI: автоматический скрапинг + PR |

## ФИПИ Pipeline (подробности)

Автоматизированный скрапинг задач с сайта ФИПИ для ОГЭ/ЕГЭ:

1. **Ingest** (`scripts/fipi/ingest.ts`) — Playwright скрапит страницы ФИПИ, сохраняет raw JSON в `data/fipi/_raw/`
2. **Curate** (`scripts/fipi/curate.ts`) — обработка raw → curated JSON в `data/fipi/ege/basic/{taskNo}/{subtopic}/`
3. **Coverage** (`scripts/fipi/report-coverage.ts`) — генерирует `scripts/fipi/reports/coverage.md`
4. **MVP Gate** (`scripts/fipi/mvp-gate.ts`) — проверяет минимум 2 задачи на подтему
5. **CI** (`.github/workflows/fipi-ingest.yml`) — запуск через GitHub Actions → авто-PR

Формат JSON задачи: `{ exam, level, taskNo, subtopic, title, statement_md, statement_html, answer, assets, source_url, checksum }`

### Локальный запуск
```bash
npm run pw:install              # установить Chromium
npm run ingest:fipi             # запустить скрапинг
tsx scripts/fipi/curate.ts      # курировать данные
tsx scripts/fipi/report-coverage.ts  # отчёт покрытия
```
