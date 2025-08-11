import type { NextApiRequest, NextApiResponse } from 'next';

const globalState = global as unknown as { _boardSessions?: Map<string, any> };
if (!globalState._boardSessions) globalState._boardSessions = new Map();

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    // create new session id
    const id = Math.random().toString(36).slice(2, 10);
    globalState._boardSessions!.set(id, null);
    return res.status(201).json({ sessionId: id });
  }
  if (req.method === 'GET') {
    const { id } = req.query as { id?: string };
    if (!id) return res.status(400).json({ error: 'Missing id' });
    const scene = globalState._boardSessions!.get(id) ?? null;
    return res.json({ scene });
  }
  if (req.method === 'PUT') {
    const { id, scene } = req.body || {};
    if (!id) return res.status(400).json({ error: 'Missing id' });
    globalState._boardSessions!.set(id, scene ?? null);
    return res.status(204).end();
  }
  return res.status(405).end();
}


