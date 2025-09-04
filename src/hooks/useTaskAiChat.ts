import { useContext } from 'react';
import { useRouter } from 'next/router';
import { AiExplainContext } from '@/components/ai/AiExplainProvider';

export function useTaskAiChat() {
  const ctx = useContext(AiExplainContext);
  const router = useRouter();
  
  console.log('useTaskAiChat: context available:', !!ctx);
  
  const open = ({ taskId, statement, initialMessage }: {
    taskId: string; 
    statement: string; 
    initialMessage?: string;
  }) => {
    console.log('useTaskAiChat.open called with:', { taskId, statement, initialMessage });
    
    if (!ctx) { 
      console.error('AI_CHAT: provider missing'); 
      return; 
    }
    if (!taskId || !statement) { 
      console.error('AI_CHAT: missing args', { taskId, hasStatement: !!statement }); 
      return; 
    }
    
    console.log('useTaskAiChat.open: calling ctx.open');
    ctx.open({ taskId, statement, initialMessage });
  };
  
  return { 
    open, 
    close: ctx?.close ?? (() => {}) 
  };
}
