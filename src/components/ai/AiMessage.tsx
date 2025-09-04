import React from 'react';
import MathRenderer from '@/components/ui/MathRenderer';

export type Role = 'user' | 'assistant';

export default function AiMessage({ role, markdown, children }: {
  role: Role;
  markdown?: string;
  children?: React.ReactNode;
}) {
  const isUser = role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} ai-animate-in`}>
      <div
        className={`max-w-[92%] md:max-w-[70%] rounded-2xl px-4 py-3 ${
          isUser
            ? 'bg-gradient-to-r from-blue-500 to-violet-600 text-white'
            : 'bg-white border border-neutral-200/60 shadow-sm'
        }`}
      >
        {markdown ? (
          <div className="text-sm ai-message-prose">
            <MathRenderer markdown={markdown} />
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}
