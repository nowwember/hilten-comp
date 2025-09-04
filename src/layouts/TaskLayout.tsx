import React from 'react';

interface TaskLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export default function TaskLayout({ children, title }: TaskLayoutProps) {
  return (
    <div className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <main className="max-w-6xl mx-auto px-4 py-8 animate-fade-in-up">
        {children}
      </main>
    </div>
  );
}
