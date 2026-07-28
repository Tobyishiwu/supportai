import * as React from 'react';
import { fetchMe, loginRequest, logoutRequest, refreshSession, registerRequest } from '@/features/auth/api';
import { registerUnauthorizedHandler } from '@/services/api-client';
import type { LoginPayload, RegisterPayload, User } from '@/features/auth/types';

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = React.createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    registerUnauthorizedHandler(() => setUser(null));
  }, []);

  React.useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      try {
        await refreshSession();
        const me = await fetchMe();
        if (!cancelled) setUser(me);
      } catch {
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void bootstrap();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = React.useCallback(async (payload: LoginPayload) => {
    const me = await loginRequest(payload);
    setUser(me);
  }, []);

  const register = React.useCallback(async (payload: RegisterPayload) => {
    const me = await registerRequest(payload);
    setUser(me);
  }, []);

  const logout = React.useCallback(async () => {
    await logoutRequest();
    setUser(null);
  }, []);

  const value = React.useMemo(
    () => ({ user, isLoading, login, register, logout }),
    [user, isLoading, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
