"use client";
import React, { createContext, useContext, useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { clearChatHistory } from '@/lib/ai/chatStorage';

export type ChatRole = 'user' | 'assistant';
export type ChatMsg = { id: string; role: ChatRole; content: string; createdAt: string };
export type ChatSession = { taskId: string; messages: ChatMsg[]; updatedAt: string };
export type SessionsMap = Record<string, ChatSession>;

export interface AiExplainCtx {
  isOpen: boolean;
  taskId?: string;
  statement?: string;
  open(p: { taskId: string; statement: string; initialMessage?: string }): void;
  close(): void;
  // New API (non-breaking additions)
  setActiveByTaskId(taskId: string): void;
  clearCurrent(): void;
  send(message: string): Promise<void>;
  messages: ChatMsg[];
}

export const AiExplainContext = createContext<AiExplainCtx>({
  isOpen: false,
  taskId: undefined,
  statement: undefined,
  open: () => {},
  close: () => {},
  setActiveByTaskId: () => {},
  clearCurrent: () => {},
  send: async () => {},
  messages: [],
});

export function useAiExplain() {
  const context = useContext(AiExplainContext);
  if (!context) {
    throw new Error('useAiExplain must be used within AiExplainProvider');
  }
  return context;
}

export function AiExplainProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [taskId, setTaskId] = useState<string | undefined>(undefined);
  const [statement, setStatement] = useState<string | undefined>(undefined);
  const [sessions, setSessions] = useState<SessionsMap>({});
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Временные логи для отладки
  console.log('AiExplainProvider state:', { isOpen, taskId, statement, activeTaskId });

  const LS_KEY = useMemo(() => {
    const userId = (session as any)?.user?.id || (session as any)?.user?.email || 'anon';
    return `aiChat.sessions.v1:${userId}`;
  }, [session]);

  // Load sessions from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const parsed: SessionsMap = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          setSessions(parsed);
        }
      }
    } catch {}
  }, [LS_KEY]);

  // Debounced save
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      try {
        localStorage.setItem(LS_KEY, JSON.stringify(sessions));
      } catch {}
    }, 300);
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [sessions, LS_KEY]);

  const open = useCallback(({ taskId, statement, initialMessage }: { 
    taskId: string; 
    statement: string; 
    initialMessage?: string 
  }) => {
    console.log('AiExplainProvider.open called with:', { taskId, statement, initialMessage });
    
    if (!taskId || !statement) {
      console.log('AiExplainProvider.open: missing required params');
      return;
    }

    setTaskId(taskId);
    setActiveTaskId(taskId);
    setStatement(statement);
    setIsOpen(true);
    console.log('AiExplainProvider.open: state updated, isOpen = true');

    // Добавляем параметр в URL только если его нет
    const currentAi = router.query.ai;
    if (currentAi !== '1') {
      const newQuery = { ...router.query, ai: '1' };
      router.replace({ 
        pathname: router.pathname, 
        query: newQuery 
      }, undefined, { shallow: true });
      console.log('AiExplainProvider.open: URL updated with ai=1');
    }
  }, [router]);

  const close = useCallback(() => {
    console.log('AiExplainProvider.close called');
    
    setIsOpen(false);
    setTaskId(undefined);
    setStatement(undefined);
    setActiveTaskId(null);
    console.log('AiExplainProvider.close: state updated, isOpen = false');

    // Убираем параметр из URL только если он есть
    const currentAi = router.query.ai;
    if (currentAi === '1') {
      const newQuery = { ...router.query };
      delete newQuery.ai;
      router.replace({ 
        pathname: router.pathname, 
        query: newQuery 
      }, undefined, { shallow: true });
      console.log('AiExplainProvider.close: URL updated, ai removed');
    }
  }, [router]);

  // Закрываем панель при смене маршрута
  useEffect(() => {
    const handleRouteChange = () => {
      if (isOpen) {
        console.log('AiExplainProvider: route change detected, closing panel');
        close();
      }
    };

    router.events.on('routeChangeStart', handleRouteChange);
    return () => {
      router.events.off('routeChangeStart', handleRouteChange);
    };
  }, [isOpen, close, router.events]);

  // Горячая клавиша ? для открытия/закрытия панели
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '?' && taskId && statement) {
        e.preventDefault();
        if (isOpen) {
          close();
        } else {
          open({ taskId, statement });
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, taskId, statement, open, close]);

  const setActiveByTaskId = useCallback((tid: string) => {
    const key = String(tid || '').trim();
    if (!key) return;
    setActiveTaskId(key);
    const userId = (session as any)?.user?.id || (session as any)?.user?.email;
    if (!userId) return; // гости — только LS
    fetch(`/api/ai-chat/session?taskId=${encodeURIComponent(key)}`)
      .then(r => r.ok ? r.json() : null)
      .then((data) => {
        if (!data) return;
        const serverMessages = Array.isArray(data.messages) ? (data.messages as ChatMsg[]) : [];
        setSessions(prev => {
          const existing = prev[key]?.messages || [];
          const merged = serverMessages.length > existing.length ? serverMessages : existing;
          return {
            ...prev,
            [key]: { taskId: key, messages: merged, updatedAt: new Date().toISOString() }
          };
        });
      })
      .catch(() => {});
  }, [session]);

  const clearCurrent = useCallback(() => {
    const tid = activeTaskId || taskId;
    if (!tid) return;
    // clear local provider state
    setSessions(prev => {
      const next = { ...prev };
      next[tid] = { taskId: tid, messages: [], updatedAt: new Date().toISOString() };
      return next;
    });
    // clear legacy per-task storage used by panel
    clearChatHistory(tid);
  }, [activeTaskId, taskId]);

  const send = useCallback(async (content: string) => {
    const tid = activeTaskId || taskId;
    if (!tid || !content.trim()) return;
    const newMsg: ChatMsg = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      role: 'user',
      content: content.trim(),
      createdAt: new Date().toISOString(),
    };
    setSessions(prev => {
      const existing = prev[tid]?.messages || [];
      const next: SessionsMap = {
        ...prev,
        [tid]: {
          taskId: tid,
          messages: [...existing, newMsg],
          updatedAt: new Date().toISOString(),
        }
      };
      return next;
    });
    // debounce server sync for authorized users
    const userId = (session as any)?.user?.id || (session as any)?.user?.email;
    if (!userId) return;
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      const msgs = (sessions[tid]?.messages || []).concat([newMsg]);
      fetch('/api/ai-chat/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId: tid, messages: msgs })
      }).catch(() => {});
    }, 800);
  }, [activeTaskId, taskId, session, sessions]);

  const messages = useMemo(() => {
    const tid = activeTaskId || taskId;
    return tid ? (sessions[tid]?.messages ?? []) : [];
  }, [sessions, activeTaskId, taskId]);

  const value: AiExplainCtx = {
    isOpen,
    taskId,
    statement,
    open,
    close,
    setActiveByTaskId,
    clearCurrent,
    send,
    messages,
  };

  return (
    <AiExplainContext.Provider value={value}>
      {children}
    </AiExplainContext.Provider>
  );
}
