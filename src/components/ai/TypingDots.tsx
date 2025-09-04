import React from 'react';

export default function TypingDots() {
  return (
    <div className="flex justify-start ai-animate-in">
      <div className="bg-white text-neutral-900 rounded-2xl px-4 py-3 border border-neutral-200/60 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-neutral-500 text-sm">ИИ печатает</span>
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
