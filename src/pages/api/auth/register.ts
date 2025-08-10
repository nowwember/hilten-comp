import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  const { name, email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return res.status(409).json({ error: 'User already exists' });

  const hash = await bcrypt.hash(password, 10);

  const adminExists = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
  const user = await prisma.user.create({
    data: {
      name: name || null,
      email,
      passwordHash: hash,
      role: adminExists ? 'USER' : 'ADMIN'
    }
  });

  return res.status(201).json({ id: user.id, email: user.email, role: user.role });
}


