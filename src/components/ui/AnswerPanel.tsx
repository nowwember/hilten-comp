import React from 'react';
import { useTaskAiChat } from '@/hooks/useTaskAiChat';

interface AnswerPanelProps {
  value: string;
  onChange: (value: string) => void;
  onCheck: () => void;
  taskId: string;
  statement: string;
  placeholder?: string;
  disabled?: boolean;
}

export function AnswerPanel({ 
  value, 
  onChange, 
  onCheck, 
  taskId, 
  statement, 
  placeholder = "Ваш ответ", 
  disabled = false 
}: AnswerPanelProps) {
  const { open } = useTaskAiChat();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCheck();
  };

  const handleExplain = (e: React.MouseEvent) => {
    e.preventDefault();
    open({
      taskId,
      statement,
      initialMessage: value || undefined
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-3">
      <div className="flex-1">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-4 py-3 border rounded-xl bg-transparent placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
          aria-label="Ваш ответ"
          disabled={disabled}
        />
      </div>
      <div className="flex flex-row gap-2 sm:gap-3">
        <button
          type="submit"
          disabled={disabled}
          className="px-4 py-3 rounded-xl text-white gradient-accent shadow-soft text-sm font-medium hover:shadow-lg transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Проверить
        </button>
        <button
          type="button"
          onClick={handleExplain}
          className="px-4 py-3 rounded-xl border text-blue-700 bg-white hover:bg-blue-50 transition disabled:opacity-50"
          disabled={disabled}
        >
          Объяснение от ИИ
        </button>
      </div>
    </form>
  );
}
