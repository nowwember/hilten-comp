import React, { useEffect } from 'react';
import MathRenderer from '../../components/ui/MathRenderer';
import { normalizeMathMarkdown } from '../../lib/markdown/normalizeMath';

export default function MathDebugPage() {
  useEffect(() => {
    // Тестируем контент из integral-test.md
    const originalContent = `**Условие**

Вычислите определённый интеграл:

$$
I=\int_{0}^{1}\frac{2x}{x^2+1}\,dx.
$$

Подсказка: сделайте замену $u=x^2+1$, тогда $du=2x\,dx$ и

$$
I=\int_{1}^{2}\frac{1}{u}\,du.
$$`;

    console.log('=== MATH DEBUG START ===');
    console.log('Original content length:', originalContent.length);
    console.log('Original content first 200 chars:', originalContent.substring(0, 200));
    
    const normalizedContent = normalizeMathMarkdown(originalContent);
    console.log('Normalized content length:', normalizedContent.length);
    console.log('Normalized content first 200 chars:', normalizedContent.substring(0, 200));
    console.log('=== MATH DEBUG END ===');
  }, []);

  const testContent = `**Условие**

Вычислите определённый интеграл:

$$
I=\int_{0}^{1}\frac{2x}{x^2+1}\,dx.
$$

Подсказка: сделайте замену $u=x^2+1$, тогда $du=2x\,dx$ и

$$
I=\int_{1}^{2}\frac{1}{u}\,du.
$$`;

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Math Debug Test</h1>
      
      <div className="mb-8 p-4 border rounded">
        <h3 className="font-semibold mb-2">Test Content</h3>
        <div className="bg-gray-100 p-2 mb-2 text-sm font-mono">
          {JSON.stringify(testContent)}
        </div>
        <div className="border-t pt-2">
          <MathRenderer markdown={testContent} />
        </div>
      </div>
    </div>
  );
}
