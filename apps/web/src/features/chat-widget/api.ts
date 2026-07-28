import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api/v1';

export interface WidgetSession {
  token: string;
  conversationId: string;
  customerId: string;
}

export async function startWidgetChat(workspaceSlug: string): Promise<WidgetSession> {
  const res = await axios.post<{ data: WidgetSession }>(`${baseURL}/public/${workspaceSlug}/chat/start`, {});
  return res.data.data;
}

export async function sendWidgetMessage(
  workspaceSlug: string,
  conversationId: string,
  token: string,
  body: string,
): Promise<void> {
  await axios.post(
    `${baseURL}/public/${workspaceSlug}/chat/${conversationId}/messages`,
    { body },
    { headers: { Authorization: `Bearer ${token}` } },
  );
}

export function getSocketOrigin(): string {
  return new URL(baseURL).origin;
}
