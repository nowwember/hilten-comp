// src/lib/exams/variants.ts
export type VariantId = string;
export type MonthKey = string; // 'YYYY-MM'
export type ExamId = 'oge' | 'ege';
export type Mode = 'base' | 'profile' | undefined;

export type Variant = {
  id: VariantId;
  month: MonthKey;
  exam: ExamId;
  mode?: Mode;
  title: string;
  picks: Array<{ taskNumber: number; count: number }>;
  tags?: string[];
  seed?: string;
};

// Время на вариант по экзамену/режиму (MVP, можно скорректировать)
export const DEFAULT_DURATION_MINUTES: Record<string, number> = {
  oge: 235, // 3ч 55м
  ege_base: 180, // 3ч
  ege_profile: 235, // 3ч 55м
};

export function getCurrentMonth(): MonthKey {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

const currentMonth = getCurrentMonth();

// Полный набор для проверки (ОГЭ: 25, ЕГЭ base: 21, ЕГЭ profile: 19)
const OGE_FULL = Array.from({ length: 25 }, (_, i) => ({ taskNumber: i + 1, count: 1 }));
const EGE_BASE_FULL = Array.from({ length: 21 }, (_, i) => ({ taskNumber: i + 1, count: 1 }));
const EGE_PROFILE_FULL = Array.from({ length: 19 }, (_, i) => ({ taskNumber: i + 1, count: 1 }));

function makeVariants(exam: ExamId, mode: Mode, month: MonthKey, baseTitle: string, picks: { taskNumber: number; count: number }[], n: number): Variant[] {
  return Array.from({ length: n }, (_, i) => ({
    id: `${exam}${mode ? '-' + mode : ''}-${month}-v${i + 1}`,
    month,
    exam,
    mode,
    title: `${baseTitle} №${i + 1}`,
    picks,
    tags: [month],
    seed: `${month}:${exam}:${mode || 'default'}:${i + 1}`,
  }));
}

export const variantsByMonth: Record<MonthKey, Variant[]> = {
  [currentMonth]: [
    ...makeVariants('oge', undefined, currentMonth, 'Вариант (ОГЭ)', OGE_FULL, 20),
    ...makeVariants('ege', 'base', currentMonth, 'Вариант (ЕГЭ базовая)', EGE_BASE_FULL, 20),
    ...makeVariants('ege', 'profile', currentMonth, 'Вариант (ЕГЭ профильная)', EGE_PROFILE_FULL, 20),
  ],
};

export function getVariants(month: MonthKey, exam: ExamId, mode?: Mode): Variant[] {
  const all = variantsByMonth[month] || [];
  return all.filter(v => v.exam === exam && (exam === 'oge' || !mode || v.mode === mode));
}

// Простая hash-функция для seed (детерминированный id)
function hashSeed(seed: string): string {
  let h = 5381;
  for (let i = 0; i < seed.length; i++) {
    h = ((h << 5) + h) + seed.charCodeAt(i);
  }
  return Math.abs(h).toString(16);
}

/**
 * Генерирует случайный вариант по seed (полный комплект заданий для экзамена/режима)
 * @param params { month, exam, mode, seed }
 */
export function generateRandomVariantBySeed(params: { month: MonthKey; exam: ExamId; mode?: Mode; seed: string }): Variant {
  const { month, exam, mode, seed } = params;
  let picks: { taskNumber: number; count: number }[] = [];
  if (exam === 'oge') {
    picks = Array.from({ length: 25 }, (_, i) => ({ taskNumber: i + 1, count: 1 }));
  } else if (exam === 'ege' && mode === 'base') {
    picks = Array.from({ length: 21 }, (_, i) => ({ taskNumber: i + 1, count: 1 }));
  } else if (exam === 'ege' && mode === 'profile') {
    picks = Array.from({ length: 19 }, (_, i) => ({ taskNumber: i + 1, count: 1 }));
  }
  return {
    id: `rnd-${hashSeed(seed).slice(0, 8)}`,
    month,
    exam,
    mode,
    title: 'Случайный вариант',
    picks,
    tags: [month],
    seed,
  };
}
