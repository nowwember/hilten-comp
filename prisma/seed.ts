import { PrismaClient, Difficulty } from '@prisma/client';
// Use require to avoid TS typings issues when running via ts-node
// eslint-disable-next-line @typescript-eslint/no-var-requires
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const adminEmail = 'admin@example.com';
  const adminPass = 'admin1234';
  const hash = await bcrypt.hash(adminPass, 10);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: { email: adminEmail, passwordHash: hash, role: 'ADMIN', name: 'Admin' }
  });

  const tasks: Array<{ title: string; topic: string; difficulty: Difficulty; content: string; answer: string }> = [
    { title: 'Сложение чисел', topic: 'Математика', difficulty: Difficulty.EASY, content: 'Сколько будет 2+2?', answer: '4' },
    { title: 'Столица Франции', topic: 'География', difficulty: Difficulty.EASY, content: 'Назовите столицу Франции', answer: 'Париж' }
  ];

  for (const t of tasks) {
    await prisma.task.upsert({
      where: { title: t.title },
      update: {},
      create: { ...t }
    });
  }

  console.log('Seed done. Admin:', adminEmail, 'pass:', adminPass);
}

main().finally(async () => {
  await prisma.$disconnect();
});


