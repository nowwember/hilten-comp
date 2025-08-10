import type { NextApiRequest } from 'next';
import type { NextApiResponseServerIO } from '@/types/socket';

type Scene = any;

const globalState = global as unknown as { _rooms?: Map<string, Scene> };
if (!globalState._rooms) globalState._rooms = new Map();

export default function handler(req: NextApiRequest, res: NextApiResponseServerIO) {
  if (!res.socket.server.io) {
    const { Server } = require('socket.io');
    const io = new Server(res.socket.server, { path: '/api/socketio' });
    res.socket.server.io = io;

    io.on('connection', (socket: any) => {
      socket.on('join', (roomId: string) => {
        socket.join(roomId);
        const scene = globalState._rooms!.get(roomId) ?? null;
        socket.emit('scene', scene);
      });

      socket.on('scene:update', ({ roomId, scene }: { roomId: string; scene: Scene }) => {
        globalState._rooms!.set(roomId, scene);
        socket.to(roomId).emit('scene', scene);
      });
    });
  }
  res.end();
}


