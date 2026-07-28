import * as React from 'react';
import { io } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';
import { getAccessToken } from '@/services/api-client';

const apiBaseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api/v1';

/** Keeps the inbox list and open conversation fresh as new messages/conversations arrive. */
export function useInboxSocket(workspaceId: string | undefined) {
  const queryClient = useQueryClient();

  React.useEffect(() => {
    if (!workspaceId) return;
    const token = getAccessToken();
    if (!token) return;

    const socket = io(new URL(apiBaseUrl).origin, {
      path: '/socket.io',
      auth: { token, workspaceId },
    });

    const invalidate = () => {
      void queryClient.invalidateQueries({ queryKey: ['inbox', workspaceId] });
    };

    socket.on('conversation:created', invalidate);
    socket.on('conversation:updated', invalidate);
    socket.on('message:created', invalidate);

    return () => {
      socket.disconnect();
    };
  }, [workspaceId, queryClient]);
}
