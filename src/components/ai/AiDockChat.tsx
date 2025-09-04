import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export type Message = { 
  role: 'user' | 'assistant'; 
  content: React.ReactNode; 
  delay?: number 
};

/**
 * Props for the AiDockChat component
 */
export interface AiDockChatProps {
  /** Whether the chat panel is open */
  open: boolean;
  /** Callback to close the chat panel */
  onClose: () => void;
  /** Whether the panel is minimized to a pill button */
  minimized?: boolean;
  /** Callback when minimize state changes */
  onToggleMinimize?: (next: boolean) => void;
  /** Initial width percentage on desktop (default: 50) */
  initialWidthPct?: number;
  /** Array of messages to display */
  messages?: Message[];
  /** Callback when user sends a message */
  onSend?: (text: string) => void;
  /** Whether to show typing indicator */
  isTyping?: boolean;
}

// Компонент для анимированных точек печати
const TypingDots: React.FC = () => (
  <div className="flex space-x-1 p-3">
    <motion.div
      className="w-2 h-2 bg-neutral-400 rounded-full"
      animate={{ opacity: [0.4, 1, 0.4] }}
      transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
    />
    <motion.div
      className="w-2 h-2 bg-neutral-400 rounded-full"
      animate={{ opacity: [0.4, 1, 0.4] }}
      transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
    />
    <motion.div
      className="w-2 h-2 bg-neutral-400 rounded-full"
      animate={{ opacity: [0.4, 1, 0.4] }}
      transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
    />
  </div>
);

// Компонент для математических блоков
const MathBlock: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-3 my-2 font-mono text-sm">
    {children}
  </div>
);

// Компонент для кода
const Code: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <code className="bg-neutral-100 px-1 py-0.5 rounded text-sm font-mono">
    {children}
  </code>
);

// Компонент сообщения
const MessageComponent: React.FC<{ message: Message }> = ({ message }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), message.delay || 0);
    return () => clearTimeout(timer);
  }, [message.delay]);

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} mb-4`}
    >
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 ${
          message.role === 'user'
            ? 'bg-blue-500 text-white'
            : 'bg-neutral-50 text-neutral-900 border border-neutral-200'
        }`}
      >
        <div className="text-sm">
          {message.content}
        </div>
      </div>
    </motion.div>
  );
};

/**
 * AI Chat Panel component with dock-sheet behavior
 * 
 * Features:
 * - Desktop: Right dock-sheet with resizable width (42-65%) - FIXED
 * - Mobile: Full-width overlay
 * - Minimizable to floating pill button
 * - Framer Motion animations
 * - Keyboard shortcuts (Esc to close, Enter/Shift+Enter for input)
 */
export function AiDockChat({
  open,
  onClose,
  minimized = false,
  onToggleMinimize,
  initialWidthPct = 50,
  messages = [],
  onSend,
  isTyping: externalIsTyping = false
}: AiDockChatProps) {
  const [inputValue, setInputValue] = useState('');
  const [internalIsTyping, setInternalIsTyping] = useState(false);
  
  // Используем внешний isTyping или внутренний
  const isTyping = externalIsTyping || internalIsTyping;
  const [widthPct, setWidthPct] = useState(initialWidthPct);
  const [isResizing, setIsResizing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll при новых сообщениях
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-focus на инпут при открытии
  useEffect(() => {
    if (open && !minimized) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [open, minimized]);

  // Обработка горячих клавиш
  useEffect(() => {
    if (!open || minimized) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, minimized, onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || !onSend) return;

    onSend(inputValue.trim());
    setInputValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (e.shiftKey) {
        // Shift+Enter - перенос строки (ничего не делаем, textarea обработает)
        return;
      } else {
        // Enter - отправка
        e.preventDefault();
        handleSubmit(e as any);
      }
    }
  };

  const handleResizeStart = () => setIsResizing(true);
  const handleResizeEnd = () => setIsResizing(false);

  const handleResize = (e: React.MouseEvent) => {
    if (!isResizing) return;
    
    const container = e.currentTarget.parentElement;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const newWidthPct = ((rect.right - e.clientX) / rect.width) * 100;
    
    if (newWidthPct >= 42 && newWidthPct <= 65) {
      setWidthPct(newWidthPct);
    }
  };

  // Минимизированная "пилюля"
  if (minimized) {
    return (
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed bottom-6 right-6 z-[1200]"
          >
            <button
              onClick={() => onToggleMinimize?.(false)}
              className="bg-blue-500 hover:bg-blue-600 text-white rounded-full p-4 shadow-lg transition-colors"
              title="Открыть чат"
            >
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Desktop: правый dock-sheet */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="hidden md:block fixed inset-y-0 right-0 z-[1200] pointer-events-none"
            style={{ width: `${widthPct}%` }}
          >
            <div className="pointer-events-auto h-full bg-white border-l border-neutral-200/60 shadow-xl/10 rounded-l-2xl flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-neutral-200/60">
                <h3 className="font-semibold text-lg text-neutral-900">Объяснение от ИИ</h3>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => onToggleMinimize?.(true)}
                    className="p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
                    title="Свернуть"
                  >
                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={onClose}
                    className="text-sm text-neutral-600 hover:text-neutral-900 underline transition-colors"
                  >
                    Закрыть
                  </button>
                </div>
              </div>

              {/* Resize handle */}
              <div
                className="absolute left-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-200 transition-colors"
                onMouseDown={handleResizeStart}
                onMouseMove={handleResize}
                onMouseUp={handleResizeEnd}
                onMouseLeave={handleResizeEnd}
              />

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((message, index) => (
                  <MessageComponent key={index} message={message} />
                ))}
                
                {isTyping && <TypingDots />}

                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-6 border-t border-neutral-200/60">
                <form onSubmit={handleSubmit} className="space-y-3">
                  <textarea
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ваш вопрос... (Enter для отправки, Shift+Enter для новой строки)"
                    className="w-full px-4 py-3 border border-neutral-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-200 text-sm"
                    rows={1}
                    disabled={!onSend}
                  />
                  <button
                    type="submit"
                    disabled={!inputValue.trim() || !onSend}
                    className="w-full px-4 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                  >
                    Отправить
                  </button>
                </form>
              </div>
            </div>
          </motion.div>

          {/* Mobile: bottom sheet (только на мобильных) - TEMPORARILY DISABLED */}
          {/* <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="block md:hidden fixed inset-0 z-[1200] pointer-events-none"
          > */}
            <div className="absolute inset-0 bg-black/20 pointer-events-auto" onClick={onClose} />
            <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl pointer-events-auto max-h-[90vh] flex flex-col">
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-12 h-1 bg-neutral-300 rounded-full" />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-neutral-200/60">
                <h3 className="font-semibold text-lg text-neutral-900">Объяснение от ИИ</h3>
                <button
                  onClick={onClose}
                  className="text-sm text-neutral-600 hover:text-neutral-900 underline transition-colors"
                >
                  Закрыть
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((message, index) => (
                  <MessageComponent key={index} message={message} />
                ))}
                
                {isTyping && <TypingDots />}

                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-6 border-t border-neutral-200/60">
                <form onSubmit={handleSubmit} className="space-y-3">
                  <textarea
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ваш вопрос... (Enter для отправки, Shift+Enter для новой строки)"
                    className="w-full px-4 py-3 border border-neutral-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-200 text-sm"
                    rows={1}
                    disabled={!onSend}
                  />
                  <button
                    type="submit"
                    disabled={!inputValue.trim() || !onSend}
                    className="w-full px-4 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                  >
                    Отправить
                  </button>
                </form>
              </div>
            </div>
          {/* </motion.div> */}
        </>
      )}
    </AnimatePresence>
  );
}

// Экспорт по умолчанию
export default AiDockChat;
