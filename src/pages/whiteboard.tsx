import Layout from '@/components/Layout';
import dynamic from 'next/dynamic';
import { useEffect, useMemo, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import Link from 'next/link';
import { useRouter } from 'next/router';

const Excalidraw = dynamic(async () => (await import('@excalidraw/excalidraw')).Excalidraw, { ssr: false });

type SceneData = any;

export default function Whiteboard() {
  const router = useRouter();
  const taskId = (router.query.taskId as string) || 'global';
  const sessionId = (router.query.sessionId as string) || null;
  const [socket, setSocket] = useState<Socket | null>(null);
  const [initialData, setInitialData] = useState<SceneData | null>(null);
  const roomId = sessionId || `task-${taskId}`;

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
    <Layout title="Whiteboard">
      <div className="h-[calc(100vh-80px)]">
        <div className="mb-2 flex items-center justify-between">
          <div className="text-sm text-slate-500">Комната: {roomId}</div>
          <div className="flex items-center gap-2">
            <button
              className="px-3 py-2 rounded-xl border hover:bg-slate-900/5 dark:hover:bg-white/5 transition"
              onClick={async () => {
                const r = await fetch('/api/board-session', { method: 'POST' });
                const j = await r.json();
                if (j?.sessionId) router.push(`/whiteboard?sessionId=${j.sessionId}`);
              }}
            >Поделиться</button>
            <Link href="/whiteboard" className="px-3 py-2 rounded-xl border hover:bg-slate-900/5 dark:hover:bg-white/5 transition">Сбросить</Link>
          </div>
        </div>
        <div className="h-full card border overflow-hidden">
          <Excalidraw initialData={initialData as any} onChange={onChange as any} />
        </div>
      </div>
    </Layout>
  );
}
