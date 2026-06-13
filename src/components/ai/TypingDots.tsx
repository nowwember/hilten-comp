import React from 'react';

export default function TypingDots() {
  return (
    <div className="flex justify-start ai-animate-in">
      <div className="rounded-2xl px-4 py-3" style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
        <div className="flex items-center gap-2">
          <span className="text-sm" style={{ color: 'var(--text-muted)' }}>ИИ печатает</span>
          <div className="flex items-center gap-1.5">
            <span className="ai-typing-dot" />
            <span className="ai-typing-dot" />
            <span className="ai-typing-dot" />
          </div>
        </div>
      </div>
    </div>
  );
}
