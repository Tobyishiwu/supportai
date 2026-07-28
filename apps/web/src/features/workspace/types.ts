export interface Role {
  id: string;
  name: string;
  permissions: { id: string; key: string; description: string }[];
}

export interface Member {
  id: string;
  user: { id: string; name: string; email: string; avatarUrl: string | null; status: string };
  role: { id: string; name: string };
  status: 'invited' | 'active' | 'removed';
}
