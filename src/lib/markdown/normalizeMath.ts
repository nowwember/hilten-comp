export function normalizeMathMarkdown(md: string): string {
  // MATH_DBG: Логируем входные данные для анализа
  if (process.env.NODE_ENV === 'development') {
    console.log('MATH_DBG: normalizeMath input length:', md.length);
    console.log('MATH_DBG: normalizeMath first 120 chars:', md.substring(0, 120));
  }

  // 1. Заменить только границы формул: \( ... \) → $...$, \[ ... \] → $$...$$
  // Используем [\s\S]*? для нежадного поиска с учетом переносов строк
  let result = md.replace(/\\\(([\s\S]*?)\\\)/g, (_m, g1) => `$${g1}$`);
  result = result.replace(/\\\[([\s\S]*?)\\\]/g, (_m, g1) => `$$${g1}$$`);
  
  // 2. Не трогать остальные backslash-команды (\frac, \int и т.д.)
  // 3. Схлопывать двойные пустые строки
  result = result.replace(/\n{3,}/g, '\n\n').trim();
  
  // MATH_DBG: Логируем результат
  if (process.env.NODE_ENV === 'development') {
    console.log('MATH_DBG: normalizeMath output length:', result.length);
    console.log('MATH_DBG: normalizeMath first 120 chars of output:', result.substring(0, 120));
  }
  
  return result;
}

// Функция для dev-самотестирования
export function devSelfCheck(): void {
  if (process.env.NODE_ENV !== 'production') {
    const testIn = '\\[\\int_0^1 \\frac{2x}{x^2+1}\\,dx\\]';
    const testOut = normalizeMathMarkdown(testIn);
    const expected = '$$\\int_0^1 \\frac{2x}{x^2+1}\\,dx$$';
    
    console.log('MATH_DBG: normalizeMath devSelfCheck:');
    console.log('  Input:', JSON.stringify(testIn));
    console.log('  Output:', JSON.stringify(testOut));
    console.log('  Expected:', JSON.stringify(expected));
    console.log('  Match:', testOut === expected);
  }
}

// Самотест (dev only)
if (process.env.NODE_ENV !== 'production') {
  const testIn = String('\\[\\int_0^1 \\frac{2x}{x^2+1}\\,dx\\]');
  const testOut = normalizeMathMarkdown(testIn);

  if (testOut !== '$$\\int_0^1 \\frac{2x}{x^2+1}\\,dx$$') {
    // eslint-disable-next-line no-console
    console.warn('[normalizeMathMarkdown] FAIL:', { testIn, testOut });
  }
}
