import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: 'Unauthorized' });
  const userId = (session.user as any).id as string;

  const [user, solvedCount, submissions] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { id: true, email: true, name: true, role: true, createdAt: true } }),
    prisma.submission.count({ where: { userId, isCorrect: true } }),
    prisma.submission.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, include: { task: true }, take: 50 })
  ]);

  return res.json({ user, solvedCount, submissions });
}


