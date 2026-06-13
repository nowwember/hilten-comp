import Link from 'next/link';

export function BackLink({ href, children }: { href: string; children?: React.ReactNode }) {
  return (
    <Link href={href} className="inline-flex items-center gap-2 text-base font-medium transition hover:text-[var(--red)]" style={{ color: 'var(--ink-soft)' }}>
      <svg width="20" height="20" fill="none" viewBox="0 0 20 20"><path d="M12 15l-5-5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
      {children || 'Назад'}
    </Link>
  );
}

export default BackLink;
