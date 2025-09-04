export type ChatMessage = { role: 'user' | 'assistant'; content: string };

export interface ChatHistory {
  messages: ChatMessage[];
  lastUpdated: number;
}

const TTL_DAYS = 7;
const TTL_MS = TTL_DAYS * 24 * 60 * 60 * 1000;

export function getChatHistory(taskId: string): ChatMessage[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const key = `ai:task:${taskId}`;
    const stored = localStorage.getItem(key);
    if (!stored) return [];
    
    const history: ChatHistory = JSON.parse(stored);
    const now = Date.now();
    
    // Проверяем TTL
    if (now - history.lastUpdated > TTL_MS) {
      localStorage.removeItem(key);
      return [];
    }
    
    return history.messages || [];
  } catch {
    return [];
  }
}

export function saveChatHistory(taskId: string, messages: ChatMessage[]): void {
  if (typeof window === 'undefined') return;
  
  try {
    const key = `ai:task:${taskId}`;
    const history: ChatHistory = {
      messages,
      lastUpdated: Date.now()
    };
    localStorage.setItem(key, JSON.stringify(history));
  } catch {
    // Игнорируем ошибки localStorage
  }
}

export function clearChatHistory(taskId: string): void {
  if (typeof window === 'undefined') return;
  
  try {
    const key = `ai:task:${taskId}`;
    localStorage.removeItem(key);
  } catch {
    // Игнорируем ошибки localStorage
  }
}

export function cleanupExpiredChats(): void {
  if (typeof window === 'undefined') return;
  
  try {
    const now = Date.now();
    const keys = Object.keys(localStorage);
    
    keys.forEach(key => {
      if (key.startsWith('ai:task:')) {
        try {
          const stored = localStorage.getItem(key);
          if (stored) {
            const history: ChatHistory = JSON.parse(stored);
            if (now - history.lastUpdated > TTL_MS) {
              localStorage.removeItem(key);
            }
          }
        } catch {
          // Удаляем поврежденные записи
          localStorage.removeItem(key);
        }
      }
    });
  } catch {
    // Игнорируем ошибки
  }
}
