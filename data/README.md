# Структура данных ФИПИ

## Организация файлов

```
/data/fipi/
├── ege/
│   ├── basic/
│   │   ├── 1/
│   │   │   ├── geometry/
│   │   │   │   └── cube-task.json
│   │   │   └── algebra/
│   │   │       └── equation-task.json
│   │   ├── 2/
│   │   └── ...
│   └── profile/
│       ├── 1/
│       └── ...
└── oge/
    ├── basic/
    └── profile/
```

## Структура JSON файла

Каждый файл задачи содержит:

```json
{
  "exam": "ege",
  "level": "basic", 
  "taskNo": 3,
  "subtopic": "geometry",
  "title": "Задание 3. Куб",
  "statement_md": "Найдите объем куба...",
  "statement_html": "<p>Найдите объем куба...</p>",
  "answer": "64",
  "assets": ["/fipi/abc123.png"],
  "source_url": "https://fipi.ru/...",
  "source_id": "fipi_2024_001",
  "accessed_at": "2024-01-15T10:30:00Z",
  "checksum": "sha256:abc123..."
}
```

## Медиафайлы

Картинки хранятся в `/public/fipi/` с хеш-именами:
- `/public/fipi/abc123.png`
- `/public/fipi/def456.jpg`

## Правила

- Все тексты — "as is" с ФИПИ
- Формулы в Markdown (`$...$` / `$$...$$`) или HTML
- Обязательно `source_url` и `accessed_at`
- `checksum` — SHA256 от текста + картинок
