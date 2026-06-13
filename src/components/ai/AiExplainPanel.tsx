import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAiExplain } from './AiExplainProvider';
import { getChatHistory, saveChatHistory } from '@/lib/ai/chatStorage';
import AiMessage from './AiMessage';
import TypingDots from './TypingDots';


interface QuickAction {
  label: string;
  prompt: string;
}

const QUICK_ACTIONS: QuickAction[] = [
  { label: 'Поясни проще', prompt: 'Объясни это проще, как для школьника' },
  { label: 'Другой метод', prompt: 'Покажи другой способ решения' },
  { label: 'Только формулы', prompt: 'Покажи только ключевые формулы и вычисления' },
  { label: 'Проверка себя', prompt: 'Дай мне задачу для самопроверки' },
];

function AiExplainPanel() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const { isOpen, taskId, statement, close, clearCurrent } = useAiExplain();

  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [panelWidth, setPanelWidth] = useState<number>(440);
  const isResizingRef = useRef(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isOpen]);

  useEffect(() => {
    if (loading) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [loading]);

  useEffect(() => {
    if (isOpen && taskId) {
      const history = getChatHistory(taskId);
      if (history.length > 0) {
        setMessages(history);
      } else {
        requestInitialExplanation();
      }
    }
  }, [isOpen, taskId]);

  const requestInitialExplanation = async () => {
    if (!taskId || !statement) return;

    setLoading(true);
    try {
      const response = await fetch('/api/task-explanation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId,
          statement,
          message: 'Объясни решение этой задачи'
        })
      });

      if (response.ok) {
        const data = await response.json();
        const newMessage = { role: 'assistant' as const, content: data.explanation };
        setMessages([newMessage]);
        saveChatHistory(taskId, [newMessage]);
      }
    } catch (error) {
      console.error('Failed to get initial explanation:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (content: string) => {
    if (!taskId || !statement || !content.trim()) return;

    const userMessage = { role: 'user' as const, content: content.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputValue('');
    setLoading(true);

    try {
      const response = await fetch('/api/task-explanation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId,
          statement,
          message: content.trim()
        })
      });

      if (response.ok) {
        const data = await response.json();
        const aiMessage = { role: 'assistant' as const, content: data.explanation };
        const updatedMessages = [...newMessages, aiMessage];
        setMessages(updatedMessages);
        saveChatHistory(taskId, updatedMessages);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !loading) {
      sendMessage(inputValue);
    }
  };

  const handleQuickAction = (action: QuickAction) => {
    sendMessage(action.prompt);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    } else if (e.key === 'Escape') {
      close();
    }
  };

  useEffect(() => {
    const onGlobalKey = (e: KeyboardEvent) => {
      const isQuestionHotkey = e.key === '?' || (e.key === '/' && e.shiftKey);
      if (isQuestionHotkey && isOpen) {
        e.preventDefault();
        close();
      } else if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        close();
      }
    };
    window.addEventListener('keydown', onGlobalKey);
    return () => window.removeEventListener('keydown', onGlobalKey);
  }, [isOpen, close]);

  useEffect(() => {
    const onMove = (ev: MouseEvent | TouchEvent | any) => {
      if (!isResizingRef.current) return;
      if (ev && typeof ev.preventDefault === 'function') ev.preventDefault();
      let clientX: number | undefined;
      const anyEv: any = ev;
      if (anyEv && 'touches' in anyEv && anyEv.touches && anyEv.touches[0]) {
        clientX = anyEv.touches[0].clientX;
      } else {
        clientX = (ev as MouseEvent).clientX;
      }
      if (typeof clientX !== 'number') return;
      const vw = window.innerWidth;
      const desired = vw - clientX;
      const clamped = Math.max(420, Math.min(520, desired));
      setPanelWidth(clamped);
    };
    const stop = () => {
      if (!isResizingRef.current) return;
      isResizingRef.current = false;
      if (typeof document !== 'undefined') {
        document.body.classList.remove('ai-resizing');
      }
    };
    window.addEventListener('mousemove', onMove as any);
    window.addEventListener('touchmove', onMove as any, { passive: false } as any);
    window.addEventListener('mouseup', stop as any);
    window.addEventListener('touchend', stop as any);
    return () => {
      window.removeEventListener('mousemove', onMove as any);
      window.removeEventListener('touchmove', onMove as any);
      window.removeEventListener('mouseup', stop as any);
      window.removeEventListener('touchend', stop as any);
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
  };

  const openWhiteboard = () => {
    window.open('/whiteboard', '_blank');
  };

  if (!isMounted || !isOpen) {
    return null;
  }

  return (
    <>
      {/* Desktop dock-sheet */}
      <AnimatePresence>
        {isOpen && (
          <div className="hidden md:block fixed right-0 top-0 z-[1200] pointer-events-none">
            <motion.aside
              key="desktop-dock"
              initial={{ x: 24, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 24, opacity: 0 }}
              transition={{ duration: 0.32, ease: [0.4, 0, 0.2, 1] }}
              className="pointer-events-auto h-screen rounded-l-[32px] flex flex-col"
              style={{
                width: panelWidth,
                minWidth: 420,
                maxWidth: 520,
                backgroundColor: 'var(--bg-elevated)',
                borderLeft: '1px solid var(--border-glass)',
                boxShadow: '0 24px 60px rgba(0, 0, 0, 0.30)'
              }}
            >
              {/* Resizer */}
              <div
                className="absolute left-0 top-0 bottom-0 w-[10px] cursor-col-resize ai-resizer"
                onMouseDown={(e) => { e.preventDefault(); isResizingRef.current = true; if (typeof document !== 'undefined') document.body.classList.add('ai-resizing'); }}
                onTouchStart={(e) => { e.preventDefault(); isResizingRef.current = true; if (typeof document !== 'undefined') document.body.classList.add('ai-resizing'); }}
                aria-hidden
              />

              {/* Header */}
              <div
                className="sticky top-0 z-10 flex items-center justify-between px-4 sm:px-5 py-3 backdrop-blur"
                style={{
                  backgroundColor: 'rgba(18, 18, 30, 0.90)',
                  borderBottom: '1px solid var(--border-glass)'
                }}
              >
                <div className="flex items-center gap-2">
                  <span className="inline-block w-2.5 h-2.5 rounded-full gradient-accent" />
                  <h3 className="font-heading font-semibold" style={{ color: 'var(--text-primary)' }}>Объяснение от ИИ</h3>
                </div>
                <button
                  onClick={close}
                  className="text-sm hover:underline underline-offset-4 px-2 py-1 rounded-lg"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Закрыть
                </button>
              </div>

              {/* Feed */}
              <div className="ai-panel-scroll h-[calc(100%-80px)] overflow-y-auto px-3 sm:px-4 py-4 space-y-3" style={{ backgroundColor: 'var(--bg-surface)' }}>
                {messages.map((message, index) => (
                  <AiMessage key={index} role={message.role} markdown={message.content} />
                ))}
                {loading && messages.length > 0 && <TypingDots />}
                <div ref={messagesEndRef} />
              </div>

              {/* Composer */}
              <div
                className="backdrop-blur p-3 sm:p-4"
                style={{
                  backgroundColor: 'rgba(18, 18, 30, 0.80)',
                  borderTop: '1px solid var(--border-glass)'
                }}
              >
                <form onSubmit={handleSubmit}>
                  <div className="flex items-end gap-2 sm:gap-3">
                    <textarea
                      value={inputValue}
                      onChange={handleInputChange}
                      onKeyDown={handleKeyDown}
                      placeholder="Ваш вопрос по задаче..."
                      className="flex-1 min-h-[44px] max-h-[140px] resize-none rounded-full px-4 py-2 outline-none"
                      style={{
                        backgroundColor: 'var(--bg-input)',
                        border: '1px solid var(--border-input)',
                        color: 'var(--text-primary)',
                      }}
                      rows={1}
                      disabled={loading}
                    />
                    <button
                      type="submit"
                      disabled={!inputValue.trim() || loading}
                      className="px-4 py-2 sm:px-5 sm:py-3 rounded-full text-white gradient-accent btn-aurora shadow-sm transition-colors disabled:opacity-50"
                      title="Отправить (Enter)"
                    >
                      Отправить
                    </button>
                  </div>
                </form>
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* Mobile bottom-sheet */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            key="mobile-sheet"
            initial={{ y: '8%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '8%', opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
            className="md:hidden fixed inset-x-0 bottom-0 h-[92vh] w-full z-[1200] rounded-t-[32px] flex flex-col"
            style={{ backgroundColor: 'var(--bg-elevated)' }}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="ai-panel-handle" />
            </div>

            {/* Header */}
            <div
              className="sticky top-0 z-10 flex items-center justify-between px-4 sm:px-5 py-3 backdrop-blur"
              style={{
                backgroundColor: 'rgba(18, 18, 30, 0.90)',
                borderBottom: '1px solid var(--border-glass)'
              }}
            >
              <div className="flex items-center gap-2">
                <span className="inline-block w-2.5 h-2.5 rounded-full gradient-accent" />
                <h3 className="font-heading font-semibold" style={{ color: 'var(--text-primary)' }}>Объяснение от ИИ</h3>
              </div>
              <button
                onClick={close}
                className="text-sm hover:underline underline-offset-4 px-2 py-1 rounded-lg"
                style={{ color: 'var(--text-muted)' }}
              >
                Закрыть
              </button>
              <button
                onClick={() => clearCurrent()}
                className="ml-2 text-sm hover:underline underline-offset-4 px-2 py-1 rounded-lg"
                style={{ color: 'var(--text-muted)' }}
              >
                Очистить чат
              </button>
            </div>

            {/* Feed */}
            <div className="ai-panel-scroll h-[calc(100%-80px)] overflow-y-auto px-3 sm:px-4 py-4 space-y-3" style={{ backgroundColor: 'var(--bg-surface)' }}>
              {messages.map((message, index) => (
                <AiMessage key={index} role={message.role} markdown={message.content} />
              ))}
              {loading && messages.length > 0 && <TypingDots />}
              <div ref={messagesEndRef} />
            </div>

            {/* Composer */}
            <div
              className="backdrop-blur p-3 sm:p-4"
              style={{
                backgroundColor: 'rgba(18, 18, 30, 0.80)',
                borderTop: '1px solid var(--border-glass)'
              }}
            >
              <form onSubmit={handleSubmit}>
                <div className="flex items-end gap-2 sm:gap-3">
                  <textarea
                    value={inputValue}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Ваш вопрос по задаче..."
                    className="flex-1 min-h-[44px] max-h-[140px] resize-none rounded-full px-4 py-2 outline-none"
                    style={{
                      backgroundColor: 'var(--bg-input)',
                      border: '1px solid var(--border-input)',
                      color: 'var(--text-primary)',
                    }}
                    rows={1}
                    disabled={loading}
                  />
                  <button
                    type="submit"
                    disabled={!inputValue.trim() || loading}
                    className="px-4 py-2 sm:px-5 sm:py-3 rounded-full text-white gradient-accent btn-aurora shadow-sm transition-colors disabled:opacity-50"
                    title="Отправить (Enter)"
                  >
                    Отправить
                  </button>
                </div>
              </form>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}

export default AiExplainPanel;
export { AiExplainPanel };
