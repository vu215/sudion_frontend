"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  clearSession,
  getSession,
  type AuthSession,
} from "./auth-store";

type AuthContextValue = {
  session: AuthSession | null;
  isLoggedIn: boolean;
  isCustomer: boolean;
  isPhotographer: boolean;
  refresh: () => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSessionState] = useState<AuthSession | null>(null);

  function refresh() {
    setSessionState(getSession());
  }

  function logout() {
    clearSession();
    setSessionState(null);
  }

  useEffect(() => {
    refresh();
  }, []);

  const value = useMemo<AuthContextValue>(() => {
    return {
      session,
      isLoggedIn: Boolean(session),
      isCustomer: session?.role === "customer",
      isPhotographer: session?.role === "photographer",
      refresh,
      logout,
    };
  }, [session]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);

  if (!value) {
    throw new Error("useAuth phải được dùng bên trong AuthProvider.");
  }

  return value;
}