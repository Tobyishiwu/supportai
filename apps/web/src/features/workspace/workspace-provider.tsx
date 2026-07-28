import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchMyWorkspaces } from './api';
import { useAuth } from '@/providers/auth-provider';
import type { Workspace, WorkspaceMembership } from '@/features/auth/types';

interface WorkspaceContextValue {
  workspace: Workspace | null;
  membership: WorkspaceMembership | null;
  memberships: WorkspaceMembership[];
  isLoading: boolean;
  hasPermission: (key: string) => boolean;
}

const WorkspaceContext = React.createContext<WorkspaceContextValue | null>(null);
const ACTIVE_WORKSPACE_KEY = 'supportai-active-workspace';

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  const { data: memberships, isLoading } = useQuery({
    queryKey: ['workspaces', 'mine'],
    queryFn: fetchMyWorkspaces,
    enabled: Boolean(user),
  });

  const activeMembership = React.useMemo(() => {
    if (!memberships?.length) return null;
    const storedId = window.localStorage.getItem(ACTIVE_WORKSPACE_KEY);
    return memberships.find((m) => m.workspace.id === storedId) ?? memberships[0]!;
  }, [memberships]);

  React.useEffect(() => {
    if (activeMembership) {
      window.localStorage.setItem(ACTIVE_WORKSPACE_KEY, activeMembership.workspace.id);
    }
  }, [activeMembership]);

  const hasPermission = React.useCallback(
    (key: string) => activeMembership?.role.permissions.some((p) => p.key === key) ?? false,
    [activeMembership],
  );

  const value = React.useMemo(
    () => ({
      workspace: activeMembership?.workspace ?? null,
      membership: activeMembership ?? null,
      memberships: memberships ?? [],
      isLoading,
      hasPermission,
    }),
    [activeMembership, memberships, isLoading, hasPermission],
  );

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspace(): WorkspaceContextValue {
  const ctx = React.useContext(WorkspaceContext);
  if (!ctx) throw new Error('useWorkspace must be used within a WorkspaceProvider');
  return ctx;
}
