import Layout from '@/components/Layout';
import dynamic from 'next/dynamic';
import { useEffect, useMemo, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const Excalidraw = dynamic(async () => (await import('@excalidraw/excalidraw')).Excalidraw, { ssr: false });

type SceneData = any;

export default function Whiteboard() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [initialData, setInitialData] = useState<SceneData | null>(null);
  const roomId = 'main';

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
  }, []);

  const onChange = useMemo(() => {
    let t: any;
    return (elements: any, appState: any, files: any) => {
      if (!socket) return;
      const { collaborators, ...restAppState } = (appState || {}) as any;
      const scene = { elements, appState: restAppState, files };
      clearTimeout(t);
      t = setTimeout(() => {
        socket.emit('scene:update', { roomId, scene });
      }, 200);
    };
  }, [socket]);

  return (
    <Layout title="Whiteboard">
      <div className="h-[calc(100vh-80px)]">
        <div className="h-full card border overflow-hidden">
          <Excalidraw initialData={initialData as any} onChange={onChange as any} />
        </div>
      </div>
    </Layout>
  );
}
