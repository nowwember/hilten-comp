import React from 'react';

interface AnswerInputProps {
  value: string;
  onChange: (v: string) => void;
  onCheck: () => void;
  onAI: () => void;
  loadingAI?: boolean;
  disabled?: boolean;
  placeholder?: string;
}

export const AnswerInput: React.FC<AnswerInputProps> = ({
  value,
  onChange,
  onCheck,
  onAI,
  loadingAI,
  disabled,
  placeholder,
}) => (
  <form
    className="flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-3"
    onSubmit={e => { e.preventDefault(); onCheck(); }}
  >
    <div className="flex-1">
      <label className="block text-sm font-medium text-slate-700 mb-2">Ваш ответ</label>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full px-4 py-3 border rounded-xl bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-200"
        placeholder={placeholder || 'Введите ответ'}
        disabled={disabled}
      />
    </div>
    <div className="flex flex-row gap-2 sm:gap-3">
      <button
        type="submit"
        className="px-4 py-3 rounded-xl text-white gradient-accent shadow-soft text-sm font-medium hover:shadow-lg transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={disabled}
      >Проверить</button>
      <button
        type="button"
        onClick={onAI}
        disabled={loadingAI || disabled}
        className="px-4 py-3 rounded-xl border text-blue-700 bg-white hover:bg-blue-50 transition disabled:opacity-50"
      >
        {loadingAI ? 'Загрузка...' : 'Объяснение от ИИ'}
      </button>
    </div>
  </form>
);
