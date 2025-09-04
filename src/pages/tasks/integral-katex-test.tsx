import React, { useState } from 'react';
import fs from 'fs';
import path from 'path';
import TaskLayout from '@/layouts/TaskLayout';
import MathRenderer from '@/components/ui/MathRenderer';
import { AnswerPanel } from '@/components/ui/AnswerPanel';
import { BackLink } from '@/components/ui/BackLink';

const ACCEPTED_ANSWERS = [
  'ln 2', 'ln(2)', 'логарифм 2', 'логарифм(2)', 'логарифм по основанию e 2',
  '0.6931', '≈0.6931', '~0.6931', '0,6931', '≈0,6931', '~0,6931',
];
const NUMERIC_TOLERANCE = 0.01;

export async function getStaticProps() {
  const filePath = path.join(process.cwd(), 'src/content/tasks/integral-test.md');
  const content = fs.readFileSync(filePath, 'utf8');
  return { props: { content } };
}

export default function IntegralKatexTest({ content }: { content: string }) {
  const [answer, setAnswer] = useState('');
  const [checkResult, setCheckResult] = useState<'correct' | 'almost' | 'wrong' | null>(null);
  const [checked, setChecked] = useState(false);

  const handleCheck = () => {
    const trimmed = answer.trim().toLowerCase().replace(/\s+/g, '');
    if (ACCEPTED_ANSWERS.map(a => a.replace(/\s+/g, '').toLowerCase()).includes(trimmed)) {
      setCheckResult('correct');
    } else {
      // Числовой допуск
      const num = parseFloat(trimmed.replace(',', '.').replace('≈', '').replace('~', ''));
      if (!isNaN(num) && Math.abs(num - 0.6931) < NUMERIC_TOLERANCE) {
        setCheckResult('almost');
      } else {
        setCheckResult('wrong');
      }
    }
    setChecked(true);
  };

  return (
    <TaskLayout title="Тест рендера: интеграл">
      <div className="mb-4">
        <BackLink href="/tasks" />
        <h1 className="text-2xl font-bold mb-4">Тест рендера: интеграл</h1>
      </div>
      <div className="bg-white border rounded-xl shadow p-6 mb-6">
        <MathRenderer markdown={content} />
      </div>
      <div className="bg-white border rounded-xl shadow p-6 mb-6">
        <AnswerPanel
          value={answer}
          onChange={setAnswer}
          onCheck={handleCheck}
          taskId="test-integral"
          statement={content}
          placeholder="Введите ответ (например, ln(2) или 0.6931)"
        />
      </div>
      {checked && (
        <div className="bg-white border rounded-xl shadow p-4 mt-4">
          <h3 className="font-semibold mb-2">Результат проверки</h3>
          {checkResult === 'correct' && <div className="text-green-600 font-bold">Верно!</div>}
          {checkResult === 'almost' && <div className="text-yellow-600 font-bold">Почти верно (числовое приближение)!</div>}
          {checkResult === 'wrong' && <div className="text-red-600 font-bold">Ответ неверный</div>}
        </div>
      )}
    </TaskLayout>
  );
}
