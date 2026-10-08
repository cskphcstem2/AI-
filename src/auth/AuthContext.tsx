import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { type AuthUser, signInWithGoogle, signOutGoogle, watchAuth } from "@/auth/auth";
import { initFirebaseAnalytics } from "@/auth/firebase";

interface AuthApi {
  ready: boolean;
  user: AuthUser | null;
  signInGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthApi | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    void initFirebaseAnalytics();
    return watchAuth((next) => {
      setUser(next);
      setReady(true);
    });
  }, []);

  const signInGoogle = useCallback(async () => {
    const next = await signInWithGoogle();
    setUser(next);
  }, []);

  const logout = useCallback(async () => {
    await signOutGoogle();
    setUser(null);
  }, []);

  const api = useMemo<AuthApi>(
    () => ({ ready, user, signInGoogle, logout }),
    [ready, user, signInGoogle, logout],
  );

  return <AuthContext.Provider value={api}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthApi {
  const api = useContext(AuthContext);
  if (!api) throw new Error("useAuth 必須在 AuthProvider 內使用");
  return api;
}
