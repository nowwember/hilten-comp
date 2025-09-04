import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { prisma } from '@/lib/prisma';

type ChatRole = 'user' | 'assistant';
type ChatMsg = { id: string; role: ChatRole; content: string; createdAt: string };

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions as any);
  const userId = (session?.user as any)?.id as string | undefined;

  if (req.method === 'GET') {
    const taskId = (req.query.taskId as string) || '';
    if (!taskId) return res.status(400).json({ messages: [] });
    if (!userId) return res.status(200).json({ messages: [], updatedAt: null });
    const row = await prisma.aiChatSession.findFirst({ where: { userId, taskId } });
    return res.status(200).json({ messages: (row?.messages as ChatMsg[]) || [], updatedAt: row?.updatedAt ?? null });
  }

  if (req.method === 'POST') {
    const { taskId, messages } = (req.body || {}) as { taskId?: string; messages?: ChatMsg[] };
    if (!taskId || !Array.isArray(messages)) return res.status(400).json({ ok: false });
    if (!userId) return res.status(200).json({ ok: false }); // guests: no-op
    const row = await prisma.aiChatSession.upsert({
      where: { userId_taskId: { userId, taskId } as any },
      update: { messages },
      create: { userId, taskId, messages },
    } as any);
    return res.status(200).json({ ok: true, updatedAt: row.updatedAt });
  }

  return res.status(405).end();
}


