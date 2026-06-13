import React from 'react';

interface TaskLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export default function TaskLayout({ children, title }: TaskLayoutProps) {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--paper)', color: 'var(--ink)' }}>
      <main className="relative z-10 max-w-6xl mx-auto px-4 py-8 animate-fade-in-up">
        {children}
      </main>
    </div>
  );
}
