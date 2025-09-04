import type { NextApiRequest, NextApiResponse } from 'next';
import { TASK_EXPLANATION_SYSTEM_RU } from '@/lib/ai/systemPrompts';
import { normalizeMathMarkdown } from '@/lib/markdown/normalizeMath';

type ChatMessage = { role: 'system' | 'user' | 'assistant'; content: string };

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  // Accept two payload shapes for compatibility:
  // 1) { task, messages?, solution? }
  // 2) { taskId, statement, message? }
  let {
    task,
    messages,
    solution,
    taskId,
    statement,
    message,
  }: {
    task?: { id: string; title?: string; topic?: string; difficulty?: string; content: string };
    messages?: ChatMessage[];
    solution?: string;
    taskId?: string;
    statement?: string;
    message?: string;
  } = req.body || {};

  // Map legacy/simple payload to full task shape if needed
  if (!task && taskId && statement) {
    task = { id: taskId, title: 'Задача', topic: '', difficulty: '', content: statement };
  }

  if (!task?.id || !task?.content) {
    return res.status(400).json({ error: 'Missing task payload' });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'OPENAI_API_KEY is not configured on server' });
  }

  // Используем системный промпт из systemPrompts.ts
  const systemPrompt = TASK_EXPLANATION_SYSTEM_RU;

  const seedUser = `Задача (id=${task.id}): ${task.title || 'Задача'}\n\nУсловие: ${task.content}`;

  // Off-topic guard: только для последнего пользовательского сообщения
  if (Array.isArray(messages) && messages.length > 0) {
    const last = [...messages].reverse().find((m) => m.role === 'user');
    if (last) {
      const base = `${task.content} ${solution || ''}`.toLowerCase();
      const words = Array.from(new Set(base.split(/[^\p{L}\p{N}]+/u).filter((w) => w.length >= 3)));
      const text = last.content.toLowerCase();
      const related = words.some((w) => text.includes(w));
      if (!related) {
        return res.status(200).json({ message: { role: 'assistant', content: 'Я могу отвечать только по этой задаче' } });
      }
    }
  }

  // Первая инициализация: без history — просим пошаговое объяснение по условию.
  // Дальнейшее: включаем условие и ранее сгенерированное решение в контекст.
  // Build chat: if explicit messages provided, respect them; otherwise include single user message if provided
  const userContext = `${seedUser}${solution ? `\n\nРанее сгенерированное решение: ${solution}` : ''}`;
  const providedHistory: ChatMessage[] = Array.isArray(messages) && messages.length > 0
    ? [{ role: 'user' as const, content: userContext }, ...messages]
    : [{ role: 'user' as const, content: userContext }, ...(message ? [{ role: 'user' as const, content: message }] : [])];

  const chat: ChatMessage[] = [
    { role: 'system' as const, content: systemPrompt },
    ...providedHistory,
  ];

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: chat.map((m) => ({ role: m.role, content: m.content })),
        temperature: 0.2,
      }),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      return res.status(500).json({ error: 'OpenAI request failed', detail: text });
    }

    const data = await response.json();
    const content: string = data?.choices?.[0]?.message?.content || 'Не удалось получить ответ.';
    // Нормализуем формулы и markdown
    const markdown = normalizeMathMarkdown(content);
    // Return both modern and simple shapes for compatibility
    return res.status(200).json({ explanation: markdown, message: { role: 'assistant', content: markdown } });
  } catch (e: any) {
    return res.status(500).json({ error: 'OpenAI error', detail: e?.message || String(e) });
  }
}