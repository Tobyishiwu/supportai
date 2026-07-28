import type { Server as HTTPServer } from 'node:http';
import { Server as SocketIOServer } from 'socket.io';
import { verifyWidgetToken } from '../common/auth/widget-jwt.js';
import { logger } from '../config/logger.js';

let io: SocketIOServer | undefined;

export function conversationRoom(conversationId: string): string {
  return `conversation:${conversationId}`;
}

export function initSocketServer(httpServer: HTTPServer): SocketIOServer {
  io = new SocketIOServer(httpServer, {
    path: '/socket.io',
    // Widget connections come from arbitrary customer websites — auth is
    // via the widget token, not cookies, so an open origin is safe here.
    cors: { origin: true, credentials: false },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth.token as string | undefined;
    if (!token) {
      next(new Error('Missing widget token'));
      return;
    }
    try {
      const payload = verifyWidgetToken(token);
      socket.data.conversationId = payload.conversationId;
      socket.data.workspaceId = payload.workspaceId;
      next();
    } catch {
      next(new Error('Invalid or expired widget token'));
    }
  });

  io.on('connection', (socket) => {
    const conversationId = socket.data.conversationId as string;
    void socket.join(conversationRoom(conversationId));
    logger.debug({ conversationId, socketId: socket.id }, 'Widget socket connected');
  });

  return io;
}

export function getSocketServer(): SocketIOServer {
  if (!io) throw new Error('Socket.IO server has not been initialized');
  return io;
}
