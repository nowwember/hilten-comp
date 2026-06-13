# HiltenComp Project Audit & CLAUDE.md Creation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fully audit the HiltenComp educational platform codebase and produce an exhaustive `CLAUDE.md` that serves as persistent project memory.

**Architecture:** Read-only codebase exploration across 4 phases (structure → key files → problem zones → documentation), culminating in a single `CLAUDE.md` file at project root. No source code modifications.

**Tech Stack:** Next.js 14, React 18, TypeScript, Prisma/PostgreSQL, NextAuth, Socket.IO, Excalidraw, Tailwind CSS, KaTeX/MathJax

---

## Research Summary (pre-computed)

All research has been completed. Key findings are documented below for reference during CLAUDE.md authoring.

### Stack
- **Framework:** Next.js 14.2.5 (Pages Router) + React 18.3.1 + TypeScript 5.5.4
- **Styling:** Tailwind CSS 3.4.10, Framer Motion, custom brand/accent color palette
- **Database:** PostgreSQL via Prisma 5.17.0
- **Auth:** NextAuth 4.24.7 (JWT strategy, Credentials provider)
- **Real-time:** Socket.IO 4.7.5 (server + client)
- **Whiteboard:** Excalidraw 0.17.6
- **Math rendering:** KaTeX 0.16.22, MathJax (via better-react-mathjax 2.3.0), remark-math, rehype-katex
- **AI:** OpenAI API (gpt-4o-mini) for task explanations
- **Data ingestion:** Playwright 1.55.0 for FIPI scraping pipeline
- **Validation:** Zod 3.23.8
- **Package manager:** npm
- **Node:** >=18

### DB Models (Prisma)
- **User** — id, name, email, passwordHash, role (USER/ADMIN), sessions, submissions
- **Task** — id, title (unique), topic, difficulty (EASY/MEDIUM/HARD), content, answer, authorId
- **Submission** — id, userId, taskId, answer, isCorrect
- **Session** — NextAuth session model
- **AiChatSession** — userId, taskId, messages (JSONB), indexed on [userId, taskId]

### Environment Variables
- `DATABASE_URL` — PostgreSQL connection
- `NEXTAUTH_SECRET` — auth secret
- `NEXTAUTH_URL` — auth callback URL
- `OPENAI_API_KEY` — OpenAI for AI explanations

### npm Scripts
- `dev` → `next dev`
- `build` → `prisma generate && prisma migrate deploy && next build`
- `start` → `next start`
- `db:migrate` → `prisma migrate dev`
- `db:generate` → `prisma generate`
- `db:seed` → `ts-node ... prisma/seed.ts`
- `ingest:fipi` → `tsx -r dotenv/config scripts/fipi/ingest.ts`
- `ingest:fipi:by-task` → `tsx scripts/fipi/ingest-by-task.ts`
- `pw:install` → `playwright install chromium`
- `fipi:mvp:check` → `tsx scripts/fipi/mvp-gate.ts`

### Feature Status
| Feature | Status | Notes |
|---------|--------|-------|
| Task database | ✅ Working | CRUD with filtering by topic/difficulty, admin-only creation |
| Math rendering | ✅ Working | KaTeX + MathJax dual rendering, `$...$` / `$$...$$` syntax |
| User profiles | ✅ Working | Profile page with solved count, activity feed |
| Admin panel | ✅ Working | Task CRUD (create/edit/delete), first user auto-promoted to ADMIN |
| Auth | ✅ Working | Registration, login, JWT sessions, role-based access |
| AI explanations | ✅ Working | GPT-4o-mini powered, Russian system prompt, per-task chat history |
| Whiteboard solo | ✅ Working | Excalidraw with localStorage persistence |
| Whiteboard shared (link) | ⚠️ Partial | Session-based sharing works, but collaborator presence/cursors stripped |
| Whiteboard real-time collab | ⚠️ Incomplete | Socket.IO room broadcast works, but no presence, no cursor sync, no conflict resolution, in-memory only |
| Exam system (OGE/EGE) | ✅ Working | Full config for OGE (25 tasks) and EGE base (21) / profile (19), timed variants |
| FIPI data pipeline | ✅ Working | GitHub Actions workflow, Playwright scraping, curate + coverage reporting |
| Social network features | 🔲 Not started | Mentioned as future direction |

### Whiteboard Collaboration Gap (critical detail)
**Where it breaks:** `src/pages/whiteboard.tsx` lines 25-26 and 39:
```typescript
// Line 25-26: Collaborator data stripped on receive
const { collaborators, ...rest } = scene.appState as any;
// Line 39: Collaborator data stripped on send
const { collaborators, ...restAppState } = (appState || {}) as any;
```
**What's missing:**
1. No presence tracking (who is in the room)
2. No cursor position sharing between users
3. No conflict resolution for simultaneous edits
4. Socket.IO server (`src/pages/api/socket.ts`) has no disconnect/cleanup handlers
5. Both `api/socket.ts` and `api/board-session.ts` use in-memory global Maps — data lost on server restart
6. No database persistence for whiteboard sessions (only runtime memory + localStorage)

### TODOs/FIXMEs in code
**None found.** Codebase is clean of TODO/FIXME/HACK markers.

### Console.log debugging (not cleaned up)
Heavy console.log usage in:
- `src/components/ai/AiExplainPanel.tsx` (~5 instances)
- `src/components/ai/AiExplainProvider.tsx` (~9 instances)
- `src/lib/exams/config.ts` (~5 instances)
- `src/components/ui/MathRenderer.tsx` (~4 instances)
- `src/lib/markdown/normalizeMath.ts` (~9 instances)
- `src/hooks/useTaskAiChat.ts` (~3 instances)
- Various exam page files

### Key Files Map
| Path | Purpose |
|------|---------|
| `prisma/schema.prisma` | Database schema (5 models) |
| `src/pages/whiteboard.tsx` | Whiteboard page with Excalidraw + Socket.IO |
| `src/pages/api/socket.ts` | Socket.IO server initialization + room handlers |
| `src/pages/api/board-session.ts` | REST API for whiteboard session persistence (in-memory) |
| `src/pages/api/tasks/index.ts` | Task list + create API |
| `src/pages/api/tasks/[id].ts` | Task CRUD by ID |
| `src/pages/api/submissions.ts` | Answer submission + validation |
| `src/pages/api/task-explanation.ts` | AI explanation via OpenAI |
| `src/pages/api/ai-chat/session.ts` | AI chat history persistence |
| `src/pages/api/auth/[...nextauth].ts` | Auth config |
| `src/pages/api/auth/register.ts` | User registration |
| `src/pages/tasks/index.tsx` | Task browser page |
| `src/pages/tasks/[id].tsx` | Task solver page |
| `src/pages/profile.tsx` | User profile page |
| `src/pages/exams/[exam]/index.tsx` | Exam landing page |
| `src/pages/exam/ege/basic/[taskNo].tsx` | EGE task browser (FIPI data) |
| `src/lib/exams/config.ts` | OGE/EGE exam definitions (~680 lines) |
| `src/lib/exams/variants.ts` | Seed-based variant generation |
| `src/lib/ai/systemPrompts.ts` | AI teacher system prompt (Russian) |
| `src/lib/ai/chatStorage.ts` | Chat history in localStorage (7-day TTL) |
| `src/lib/fipi/loaders.ts` | FIPI task loading from JSON |
| `src/lib/fipi/labeler.ts` | ML classifier for task type detection |
| `src/lib/fipi/ege-basic-map.ts` | EGE task number → title/subtopic mapping |
| `src/components/ai/AiExplainPanel.tsx` | AI chat dock panel |
| `src/components/ui/MathRenderer.tsx` | Math formula renderer |
| `src/components/Layout.tsx` | Global layout with navbar |
| `src/components/Navbar.tsx` | Navigation bar |
| `scripts/fipi/ingest.ts` | FIPI scraping entry point |
| `scripts/fipi/curate.ts` | Data curation script |
| `.github/workflows/fipi-ingest.yml` | CI workflow for FIPI ingestion |
| `data/fipi/ege/basic/` | Curated FIPI task JSON files |
| `tailwind.config.js` | Custom brand/accent colors, Inter font |

### Code Style Observations
- Language: Russian for all user-facing text, comments mixed (mostly Russian)
- Naming: camelCase for variables/functions, PascalCase for components
- Imports: `@/` alias for `src/`
- API routes: standard Next.js pattern with method checking
- State: SWR for data fetching, React context for AI panel state
- Types: TypeScript throughout, `any` used in whiteboard/socket code
- No ESLint config file found, no `lint` script in package.json
- No test files found in the codebase
- Dark mode: class-based (`darkMode: 'class'` in Tailwind)
- Dev pages: `src/pages/dev/` contains debug/concept pages (math-debug, ai-chat-concept)

---

## Task 1: Write CLAUDE.md — Stack & Commands Section

**Files:**
- Create: `CLAUDE.md` (project root)

- [ ] **Step 1: Create CLAUDE.md with header, stack, and commands sections**

Write the file with the following content (using the research data above):

```markdown
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
```

- [ ] **Step 2: Verify file was created**

Run: `head -30 CLAUDE.md`
Expected: File exists with correct header and sections

---

## Task 2: Write CLAUDE.md — Architecture Section

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 1: Append architecture section to CLAUDE.md**

```markdown
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
```

---

## Task 3: Write CLAUDE.md — DB Schema Section

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 1: Append DB schema section**

```markdown
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
```

---

## Task 4: Write CLAUDE.md — Environment, Feature Status, Known Issues

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 1: Append environment variables section**

```markdown
## Переменные окружения

| Переменная | Назначение |
|------------|------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | Секрет для JWT-подписи |
| `NEXTAUTH_URL` | URL callback (http://localhost:3000 для dev) |
| `OPENAI_API_KEY` | API-ключ OpenAI для AI-объяснений |

> ⚠️ `.env.example` отсутствует — только `.env` с реальными значениями.
```

- [ ] **Step 2: Append feature status table**

```markdown
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
```

- [ ] **Step 3: Append known issues section**

```markdown
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
```

---

## Task 5: Write CLAUDE.md — Code Style, Key Files, FIPI Pipeline

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 1: Append code style section**

```markdown
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
```

- [ ] **Step 2: Append key files section**

```markdown
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
```

- [ ] **Step 3: Append FIPI pipeline section**

```markdown
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
```

---

## Task 6: Commit CLAUDE.md

**Files:**
- Commit: `CLAUDE.md`

- [ ] **Step 1: Stage and commit**

```bash
git add CLAUDE.md
git commit -m "docs: add CLAUDE.md — initial project audit"
```

- [ ] **Step 2: Verify commit**

```bash
git log --oneline -1
```

Expected: commit with message "docs: add CLAUDE.md — initial project audit"

---

## Task 7: Output Summary

- [ ] **Step 1: Print summary to user**

Output the following summary in Russian:

1. **Стек:** Next.js 14 + React 18 + TypeScript, Prisma/PostgreSQL, Socket.IO, Excalidraw, KaTeX/MathJax
2. **Главная нерешённая проблема:** Whiteboard — совместная работа. Данные collaborators явно удаляются из Excalidraw (`whiteboard.tsx:25-26,39`), нет presence/cursor sync, нет обработки disconnect, данные хранятся только в памяти процесса
3. **Что нужно сделать первым для whiteboard:** Перестать стрипать `collaborators` из appState, добавить presence-протокол через Socket.IO, персистировать сцены в БД
4. **Неожиданное:** (a) Нет ни одного TODO/FIXME в коде — при этом фича явно не завершена; (b) Нет тестов вообще; (c) Первый зарегистрированный пользователь автоматически становится ADMIN; (d) Обширная система экзаменов ОГЭ/ЕГЭ с полным конфигом ~680 строк
