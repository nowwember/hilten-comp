import dynamic from 'next/dynamic';
import { useEffect, useMemo, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import Link from 'next/link';
import { useRouter } from 'next/router';

const Excalidraw = dynamic(async () => (await import('@excalidraw/excalidraw')).Excalidraw, { ssr: false });

type SceneData = any;

function useGlobalTheme(): 'light' | 'dark' {
  const [theme, setTheme] = useState<'light' | 'dark'>(() =>
    typeof document !== 'undefined' && document.documentElement.classList.contains('dark') ? 'dark' : 'light'
  );

  useEffect(() => {
    const root = document.documentElement;
    const update = () => setTheme(root.classList.contains('dark') ? 'dark' : 'light');
    update();
    const observer = new MutationObserver(update);
    observer.observe(root, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  return theme;
}

const BRAND_STROKE_COLORS = ['#1C1714', '#E63E2B', '#DE8400', '#639922'];

export default function Whiteboard() {
  const router = useRouter();
  const taskId = (router.query.taskId as string) || 'global';
  const sessionId = (router.query.sessionId as string) || null;
  const [socket, setSocket] = useState<Socket | null>(null);
  const [initialData, setInitialData] = useState<SceneData | null>(null);
  const [onlineCount, setOnlineCount] = useState(2);
  const roomId = sessionId || `task-${taskId}`;
  const theme = useGlobalTheme();

  useEffect(() => {
    fetch('/api/socket');
    const s = io({ path: '/api/socketio' });
    setSocket(s);
    s.emit('join', roomId);
    s.on('scene', (scene: SceneData) => {
      if (scene && scene.appState && typeof (scene.appState as any).collaborators !== 'undefined') {
        const { collaborators, ...rest } = scene.appState as any;
        setInitialData({ ...scene, appState: rest });
      } else {
        setInitialData(scene);
      }
    });
    return () => { s.disconnect(); };
  }, [roomId]);

  const onChange = useMemo(() => {
    let t: any;
    return (elements: any, appState: any, files: any) => {
      if (!socket) return;
      const { collaborators, ...restAppState } = (appState || {}) as any;
      const scene = { elements, appState: restAppState, files };
      clearTimeout(t);
      t = setTimeout(() => {
        socket.emit('scene:update', { roomId, scene });
        try {
          const key = sessionId ? `board_session_${sessionId}` : `board_task_${taskId}`;
          localStorage.setItem(key, JSON.stringify(scene));
          if (sessionId) {
            fetch('/api/board-session', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: sessionId, scene }) });
          }
        } catch {}
      }, 800);
    };
  }, [socket, roomId, sessionId, taskId]);

  useEffect(() => {
    try {
      const key = sessionId ? `board_session_${sessionId}` : `board_task_${taskId}`;
      const raw = localStorage.getItem(key);
      if (raw) setInitialData(JSON.parse(raw));
      if (sessionId) {
        fetch(`/api/board-session?id=${sessionId}`)
          .then((r) => r.json())
          .then((j) => { if (j?.scene) setInitialData(j.scene); })
          .catch(() => {});
      }
    } catch {}
  }, [sessionId, taskId]);

  return (
    <div className="h-[calc(100vh-80px)] flex flex-col">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <div
            className="font-mono text-xs px-3 py-1.5 rounded-full"
            style={{ background: 'var(--paper-2)', color: 'var(--ink-soft)' }}
          >
            Комната: <b style={{ color: 'var(--ink)' }}>{roomId}</b>
          </div>
          <span className="badge" style={{ background: 'rgba(99, 153, 34, .15)', color: 'var(--green-deep)' }}>
            <span className="pulse-dot" />
            {onlineCount} онлайн
          </span>
          <div className="flex items-center -space-x-2">
            <span
              className="h-7 w-7 rounded-full flex items-center justify-center text-xs font-semibold border-2"
              style={{ background: 'var(--red)', color: '#fff', borderColor: 'var(--surface)' }}
              title="Аня"
            >А</span>
            <span
              className="h-7 w-7 rounded-full flex items-center justify-center text-xs font-semibold border-2"
              style={{ background: 'var(--amber-deep)', color: '#fff', borderColor: 'var(--surface)' }}
              title="Репетитор"
            >Р</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="btn-ghost btn-sm transition"
            onClick={async () => {
              const r = await fetch('/api/board-session', { method: 'POST' });
              const j = await r.json();
              if (j?.sessionId) router.push(`/whiteboard?sessionId=${j.sessionId}`);
            }}
          >Поделиться</button>
          <Link href="/whiteboard" className="btn-primary btn-sm transition">Сбросить</Link>
        </div>
      </div>
      <div className="flex-1 overflow-hidden" style={{ border: '1px solid var(--line)', borderRadius: 'var(--radius)' }}>
        <Excalidraw
          initialData={initialData as any}
          onChange={onChange as any}
          theme={theme}
          UIOptions={{ canvasActions: { changeViewBackgroundColor: true } }}
        />
      </div>
    </div>
  );
}
