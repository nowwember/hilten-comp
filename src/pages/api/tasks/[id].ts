import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query as { id: string };

  if (req.method === 'GET') {
    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) return res.status(404).json({ error: 'Not found' });
    return res.json(task);
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session || (session.user as any).role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });

  if (req.method === 'PUT') {
    const { title, topic, difficulty, content, answer } = req.body || {};
    const task = await prisma.task.update({ where: { id }, data: { title, topic, difficulty, content, answer } });
    return res.json(task);
  }

  if (req.method === 'DELETE') {
    await prisma.submission.deleteMany({ where: { taskId: id } });
    await prisma.task.delete({ where: { id } });
    return res.status(204).end();
  }

  res.status(405).end();
}


