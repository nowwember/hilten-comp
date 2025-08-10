import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { topic, difficulty } = req.query as { topic?: string; difficulty?: string };
    const where: any = {};
    if (topic) where.topic = { contains: topic, mode: 'insensitive' };
    if (difficulty && ['EASY', 'MEDIUM', 'HARD'].includes(difficulty)) where.difficulty = difficulty;

    const session = await getServerSession(req, res, authOptions);
    const [tasks, solvedIds] = await Promise.all([
      prisma.task.findMany({ where, orderBy: { createdAt: 'desc' } }),
      session
        ? prisma.submission.findMany({
            where: { userId: (session.user as any).id, isCorrect: true },
            select: { taskId: true }
          }).then((rows) => new Set(rows.map((r) => r.taskId)))
        : Promise.resolve(new Set<string>())
    ]);

    const data = tasks.map((t) => ({ ...t, solved: solvedIds.has(t.id) }));
    return res.json(data);
  }

  if (req.method === 'POST') {
    const session = await getServerSession(req, res, authOptions);
    if (!session || (session.user as any).role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });
    const { title, topic, difficulty, content, answer } = req.body || {};
    if (!title || !topic || !content || !answer) return res.status(400).json({ error: 'Missing fields' });
    try {
      const task = await prisma.task.create({
        data: { title, topic, difficulty: difficulty || 'EASY', content, answer, authorId: (session.user as any).id }
      });
      return res.status(201).json(task);
    } catch (e: any) {
      if (e?.code === 'P2002') {
        return res.status(409).json({ error: 'Задача с таким заголовком уже существует' });
      }
      return res.status(500).json({ error: 'Server error' });
    }
  }

  res.status(405).end();
}


