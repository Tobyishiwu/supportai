export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  isEmailVerified: boolean;
  status: 'active' | 'suspended';
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  industry: string | null;
  logoUrl: string | null;
}

export interface WorkspaceMembership {
  id: string;
  workspace: Workspace;
  role: { id: string; name: string; permissions: { id: string; key: string }[] };
  status: 'invited' | 'active' | 'removed';
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  workspaceName: string;
  industry?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}
