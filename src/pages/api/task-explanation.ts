import type { NextApiRequest, NextApiResponse } from 'next';

type ChatMessage = { role: 'system' | 'user' | 'assistant'; content: string };

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const {
    task,
    messages,
    solution,
  }: {
    task: { id: string; title: string; topic: string; difficulty: string; content: string };
    messages?: ChatMessage[];
    solution?: string;
  } = req.body || {};

  if (!task?.id || !task?.content) {
    return res.status(400).json({ error: 'Missing task payload' });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'OPENAI_API_KEY is not configured on server' });
  }

  const systemPrompt = `Ты — математический ассистент. Перед тобой задача, которую нужно решить и объяснить пошагово.
Отвечай строго по этой задаче и её решению. Если вопрос напрямую связан с задачей — отвечай подробно.
Если вопрос не связан с задачей, напиши: "Я могу отвечать только по этой задаче".`;

  const seedUser = `Задача (id=${task.id}): ${task.title}\n\nУсловие: ${task.content}`;

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
  // Дальнее: включаем условие и ранее сгенерированное решение в контекст.
  const chat: ChatMessage[] = [
    { role: 'system' as const, content: systemPrompt },
    ...(Array.isArray(messages) && messages.length > 0
      ? [{ role: 'user' as const, content: `${seedUser}${solution ? `\n\nРанее сгенерированное решение: ${solution}` : ''}` }, ...messages]
      : [{ role: 'user' as const, content: seedUser }])
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
    return res.status(200).json({ message: { role: 'assistant', content } });
  } catch (e: any) {
    return res.status(500).json({ error: 'OpenAI error', detail: e?.message || String(e) });
  }
}