import type { Server as HTTPServer } from 'http';
import type { Socket } from 'net';

export type NextApiResponseServerIO = {
  socket: Socket & {
    server: HTTPServer & {
      io?: any;
    };
  };
} & import('next').NextApiResponse;


