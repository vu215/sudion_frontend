"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { type AuthSession, clearSession, getSession } from "./auth-store";

type AuthContextType = {
  session: AuthSession | null;
  loading: boolean;
  logout: () => void;
  refresh: () => void;
};

const AuthContext = createContext<AuthContextType>({
  session: null, loading: true, logout: () => {}, refresh: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [loading, setLoading] = useState(true);

  function loadSession() {
    setSession(getSession());
    setLoading(false);
  }

  useEffect(() => { loadSession(); }, []);

  function logout() {
    clearSession();
    setSession(null);
    window.location.href = "/";
  }

  return (
    <AuthContext.Provider value={{ session, loading, logout, refresh: loadSession }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
