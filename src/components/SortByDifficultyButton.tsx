import { ArrowsUpDownIcon, BarsArrowUpIcon, BarsArrowDownIcon } from '@heroicons/react/24/outline';

function cn(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(' ');
}

export type SortMode = 'none' | 'difficulty-asc' | 'difficulty-desc';

export default function SortByDifficultyButton({
  value,
  onChange,
  className
}: {
  value: SortMode;
  onChange: (next: SortMode) => void;
  className?: string;
}) {
  function cycle() {
    const next: SortMode = value === 'none' ? 'difficulty-asc' : value === 'difficulty-asc' ? 'difficulty-desc' : 'none';
    onChange(next);
  }

  const icon = value === 'difficulty-asc' ? (
    <BarsArrowUpIcon className="h-4 w-4" />
  ) : value === 'difficulty-desc' ? (
    <BarsArrowDownIcon className="h-4 w-4" />
  ) : (
    <ArrowsUpDownIcon className="h-4 w-4" />
  );

  const label = value === 'difficulty-asc' ? 'Сложность ↑' : value === 'difficulty-desc' ? 'Сложность ↓' : 'Сложность';

  return (
    <button
      type="button"
      onClick={cycle}
      aria-label="Сортировать по сложности"
      className={cn('px-4 py-2 rounded-xl border hover:bg-slate-900/5 dark:hover:bg-white/5 transition inline-flex items-center gap-2', className)}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}


