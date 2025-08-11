import type { NextApiRequest, NextApiResponse } from 'next';

type ChatMessage = { role: 'system' | 'user' | 'assistant'; content: string };

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { task, messages }: { task: { id: string; title: string; topic: string; difficulty: string; content: string }; messages?: ChatMessage[] } =
    req.body || {};
  if (!task?.id || !task?.content) return res.status(400).json({ error: 'Missing task payload' });

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'OPENAI_API_KEY is not configured on server' });

  const systemPrompt = `Ты — математический ассистент. Реши задачу, которую я тебе пришлю, пошагово и максимально понятно. 
Отвечай только по этой задаче (id=${task.id}, тема=${task.topic}, сложность=${task.difficulty}). 
Если вопрос не по теме этой задачи — отвечай: "Я могу отвечать только по этой задаче".`;

  const seedUser = `Задача (id=${task.id}): ${task.title}\n\nУсловие: ${task.content}`;

  const chat: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
    ...(Array.isArray(messages) && messages.length > 0 ? [] : [{ role: 'user', content: seedUser }]),
    ...(Array.isArray(messages) ? messages : [])
  ];

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: chat.map((m) => ({ role: m.role, content: m.content })),
        temperature: 0.2
      })
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


