import Link from 'next/link';

interface EmptyStateProps {
  title: string;
  text?: string;
  ctaHref?: string;
  ctaLabel?: string;
}

export function EmptyState({ title, text, ctaHref, ctaLabel }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center text-center gap-3 py-16 px-4">
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center font-display text-2xl"
        style={{ background: 'var(--paper-2)', color: 'var(--red)' }}
      >
        ∅
      </div>
      <h3 className="font-display text-lg font-bold" style={{ color: 'var(--ink)' }}>
        {title}
      </h3>
      {text && (
        <p className="text-sm max-w-sm" style={{ color: 'var(--ink-soft)' }}>
          {text}
        </p>
      )}
      {ctaHref && ctaLabel && (
        <Link href={ctaHref} className="btn-primary inline-block rounded-full px-6 py-2.5 mt-2 font-medium">
          {ctaLabel}
        </Link>
      )}
    </div>
  );
}

export default EmptyState;
