import { useRouter } from 'next/router';
import { useState, useMemo, useRef } from 'react';
import Link from 'next/link';
import { getVariants, getCurrentMonth, Variant, ExamId, Mode, variantsByMonth, DEFAULT_DURATION_MINUTES } from '@/lib/exams/variants';

const monthOptions = Object.keys(variantsByMonth).sort().reverse();
const modeLabels: Record<'base' | 'profile', string> = {
  base: 'Базовая',
  profile: 'Профильная',
};

export default function VariantsListPage() {
  const router = useRouter();
  const { exam } = router.query;
  const queryMonth = typeof router.query.month === 'string' ? router.query.month : undefined;
  const queryMode = typeof router.query.mode === 'string' ? router.query.mode as Mode : undefined;
  const [selectedMonth, setSelectedMonth] = useState(queryMonth || getCurrentMonth());
  const [currentMode, setCurrentMode] = useState<Mode>(exam === 'ege' ? (queryMode || 'base') : undefined);
  const [monthDropdown, setMonthDropdown] = useState(false);
  const monthBtnRef = useRef<HTMLButtonElement>(null);

  // Обновление фильтров shallow-роутингом
  const updateQuery = (params: Record<string, string | undefined>) => {
    router.push({
      pathname: router.pathname,
      query: { ...router.query, ...params },
    }, undefined, { shallow: true });
  };

  // Список вариантов
  const variants = useMemo(() => {
    if (!exam || typeof exam !== 'string') return [];
    return getVariants(selectedMonth, exam as ExamId, currentMode);
  }, [exam, selectedMonth, currentMode]);

  // Заголовок
  let title = 'Варианты';
  if (exam === 'oge') title += ' — ОГЭ';
  if (exam === 'ege') title += ` — ЕГЭ ${currentMode === 'profile' ? 'профильная' : 'базовая'}`;
  title += ` — ${selectedMonth}`;

  // Время на вариант
  const duration = exam === 'oge' ? DEFAULT_DURATION_MINUTES.oge : currentMode === 'profile' ? DEFAULT_DURATION_MINUTES.ege_profile : DEFAULT_DURATION_MINUTES.ege_base;

  // Обработка клика вне дропдауна месяца
  // (минималистично, без пакетов)
  if (typeof window !== 'undefined') {
    window.onclick = (e: any) => {
      if (monthDropdown && monthBtnRef.current && !monthBtnRef.current.contains(e.target)) {
        setMonthDropdown(false);
      }
    };
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Кнопка Назад */}
      <div className="mb-4">
        <Link
          href={{ pathname: `/exams/${exam}`, query: { ...(exam === 'ege' ? { mode: currentMode } : {}), month: selectedMonth } }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border text-slate-600 border-slate-300 hover:bg-neutral-50 transition-colors font-medium"
        >
          <span className="text-lg">←</span> Назад
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <h1 className="text-2xl font-bold">{title}</h1>
        <div className="flex gap-2 items-center relative">
          {exam === 'ege' && (
            <div className="flex bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
              {(['base', 'profile'] as const).map(mode => (
                <button
                  key={mode}
                  onClick={() => { setCurrentMode(mode); updateQuery({ mode }); }}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${currentMode === mode ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'}`}
                >
                  {modeLabels[mode]}
                </button>
              ))}
            </div>
          )}
          {/* Кнопка месяца */}
          <button
            ref={monthBtnRef}
            className="ml-2 px-4 py-2 rounded-xl border bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-neutral-50 transition-colors font-medium relative"
            onClick={() => setMonthDropdown(v => !v)}
          >
            Месяц: {selectedMonth}
          </button>
          {monthDropdown && (
            <div className="absolute right-0 top-12 z-20 w-40 bg-white dark:bg-slate-800 border rounded-xl shadow-lg py-2">
              {monthOptions.slice(0, 12).map(month => (
                <button
                  key={month}
                  className={`block w-full text-left px-4 py-2 hover:bg-neutral-50 dark:hover:bg-slate-700 transition-colors ${month === selectedMonth ? 'font-bold text-red-500' : ''}`}
                  onClick={() => { setSelectedMonth(month); updateQuery({ month }); setMonthDropdown(false); }}
                >
                  {month}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {variants.length === 0 ? (
        <div className="text-center text-slate-500 py-16">Нет вариантов для выбранных фильтров.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {variants.map(variant => {
            const totalTasks = variant.picks.reduce((sum, p) => sum + p.count, 0);
            return (
              <div key={variant.id} className="group flex flex-col h-full rounded-2xl border shadow-sm hover:shadow-md overflow-hidden transition-shadow">
                <div className="p-5 flex-1 flex flex-col">
                  <h2 className="font-bold text-lg mb-2 line-clamp-2 min-h-[2.5rem]">{variant.title}</h2>
                  <div className="text-sm text-slate-500 mb-2">{variant.tags?.join(', ')}</div>
                  <div className="flex gap-4 text-xs text-slate-600 dark:text-slate-300 mb-2">
                    <span>Задач: <b>{totalTasks}</b></span>
                    <span>Время: <b>{duration} мин</b></span>
                  </div>
                  <div className="mt-auto flex gap-2 pt-2">
                    <Link
                      href={{ pathname: `/exams/${variant.exam}/variant/${variant.id}`, query: { month: variant.month, mode: variant.mode } }}
                      className="flex-1 py-2 px-4 rounded-xl text-white bg-red-500 hover:bg-red-600 transition-colors text-center font-medium"
                    >
                      Открыть
                    </Link>
                    <Link
                      href={{ pathname: `/exams/${variant.exam}/variant/${variant.id}/solve`, query: { month: variant.month, mode: variant.mode } }}
                      className="flex-1 py-2 px-4 rounded-xl border text-center font-medium hover:bg-slate-50 dark:hover:bg-slate-900 transition"
                    >
                      Начать
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
