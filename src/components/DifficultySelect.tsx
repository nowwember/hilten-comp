function cn(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(' ');
}

const OPTIONS = [
  { value: 'EASY', label: 'Легко' },
  { value: 'MEDIUM', label: 'Средне' },
  { value: 'HARD', label: 'Сложно' }
];

export default function DifficultySelect({
  value,
  onChange,
  className,
  name
}: {
  value: string;
  onChange: (v: string) => void;
  className?: string;
  name?: string;
}) {
  return (
    <div className={cn('inline-flex rounded-xl border overflow-hidden', className)} role="group" aria-label="Выбор сложности">
      {OPTIONS.map((opt, idx) => {
        const active = value === opt.value;
        return (
          <button
            type="button"
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={cn(
              'px-4 py-2 text-sm transition',
              idx > 0 && 'border-l',
              active ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900' : 'hover:bg-slate-900/5 dark:hover:bg-white/5'
            )}
            aria-pressed={active}
          >
            {opt.label}
          </button>
        );
      })}
      {/* Hidden input to integrate with forms */}
      {name ? <input type="hidden" name={name} value={value} readOnly /> : null}
    </div>
  );
}


