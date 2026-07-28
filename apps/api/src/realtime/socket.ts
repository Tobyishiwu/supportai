import type { Server as HTTPServer } from 'node:http';
import { Server as SocketIOServer } from 'socket.io';
import { verifyWidgetToken } from '../common/auth/widget-jwt.js';
import { verifyAccessToken } from '../common/auth/jwt.js';
import { getActiveMembership } from '../modules/workspaces/workspace.service.js';
import { logger } from '../config/logger.js';

let io: SocketIOServer | undefined;

export function conversationRoom(conversationId: string): string {
  return `conversation:${conversationId}`;
}

export function workspaceRoom(workspaceId: string): string {
  return `workspace:${workspaceId}`;
}

export function initSocketServer(httpServer: HTTPServer): SocketIOServer {
  io = new SocketIOServer(httpServer, {
    path: '/socket.io',
    // Widget connections come from arbitrary customer websites — auth is
    // via bearer tokens (widget or dashboard access token), never cookies,
    // so an open origin is safe here.
    cors: { origin: true, credentials: false },
  });

  io.use((socket, next) => {
    const { token, workspaceId } = socket.handshake.auth as { token?: string; workspaceId?: string };
    if (!token) {
      next(new Error('Missing authentication token'));
      return;
    }

    try {
      const widgetPayload = verifyWidgetToken(token);
      socket.data.kind = 'widget';
      socket.data.conversationId = widgetPayload.conversationId;
      next();
      return;
    } catch {
      // Not a widget token — fall through and try dashboard agent auth below.
    }

    if (!workspaceId) {
      next(new Error('workspaceId is required for dashboard connections'));
      return;
    }

    try {
      const accessPayload = verifyAccessToken(token);
      getActiveMembership(workspaceId, accessPayload.sub)
        .then((membership) => {
          if (!membership) {
            next(new Error('Not a member of this workspace'));
            return;
          }
          socket.data.kind = 'agent';
          socket.data.workspaceId = workspaceId;
          next();
        })
        .catch(() => next(new Error('Failed to verify workspace membership')));
    } catch {
      next(new Error('Invalid or expired token'));
    }
  });

  io.on('connection', (socket) => {
    if (socket.data.kind === 'widget') {
      void socket.join(conversationRoom(socket.data.conversationId as string));
    } else if (socket.data.kind === 'agent') {
      void socket.join(workspaceRoom(socket.data.workspaceId as string));
    }
    logger.debug({ socketId: socket.id, kind: socket.data.kind }, 'Socket connected');
  });

  return io;
}

export function getSocketServer(): SocketIOServer {
  if (!io) throw new Error('Socket.IO server has not been initialized');
  return io;
}

/** Broadcasts to every agent socket in a workspace. No-op if the socket server isn't up yet. */
export function broadcastToWorkspace(workspaceId: string, event: string, payload: unknown): void {
  if (!io) return;
  io.to(workspaceRoom(workspaceId)).emit(event, payload);
}
