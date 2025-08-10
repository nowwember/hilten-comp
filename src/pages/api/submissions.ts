import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth/[...nextauth]';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: 'Unauthorized' });
  const userId = (session.user as any).id as string;

  if (req.method === 'POST') {
    const { taskId, answer } = req.body || {};
    if (!taskId || typeof answer !== 'string') return res.status(400).json({ error: 'Invalid payload' });
    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) return res.status(404).json({ error: 'Task not found' });
    const normalize = (s: string) => s.trim().toLowerCase();
    const isCorrect = normalize(answer) === normalize(task.answer);
    const submission = await prisma.submission.create({ data: { userId, taskId, answer, isCorrect } });
    return res.status(201).json({ submission, isCorrect });
  }

  if (req.method === 'GET') {
    const { taskId } = req.query as { taskId?: string };
    if (taskId) {
      const latest = await prisma.submission.findFirst({
        where: { userId, taskId },
        orderBy: { createdAt: 'desc' }
      });
      return res.json(latest ?? null);
    }
    const submissions = await prisma.submission.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, include: { task: true } });
    return res.json(submissions);
  }

  res.status(405).end();
}


