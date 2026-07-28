import { createFileRoute, Navigate, Outlet } from '@tanstack/react-router';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/providers/auth-provider';
import { WorkspaceProvider } from '@/features/workspace/workspace-provider';
import { DashboardLayout } from '@/layouts/dashboard-layout';

export const Route = createFileRoute('/dashboard')({
  component: DashboardRoute,
});

function DashboardRoute() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-background">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return (
    <WorkspaceProvider>
      <DashboardLayout>
        <Outlet />
      </DashboardLayout>
    </WorkspaceProvider>
  );
}
