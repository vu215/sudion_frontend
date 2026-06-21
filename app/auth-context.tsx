"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import {
  clearSession,
  getSession,
  type AuthSession,
  type AuthUser,
  loginUser,
  registerUser,
  setSession,
} from "./auth-store";

type AuthContextValue = {
  session: AuthSession | null;
  isLoggedIn: boolean;
  isCustomer: boolean;
  isPhotographer: boolean;
  refresh: () => void;
  logout: () => void;
  login: (emailInput: string, passwordInput: string) => { ok: boolean; error?: string; user?: AuthUser; session?: AuthSession };
  register: (params: { fullName: string; email: string; password: string }) => { ok: boolean; error?: string; user?: AuthUser };
  isTransitioning: boolean;
  transitionTo: (targetUrl: string) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSessionState] = useState<AuthSession | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const router = useRouter();

  function refresh() {
    setSessionState(getSession());
  }

  function logout() {
    clearSession();
    setSessionState(null);
  }

  function login(emailInput: string, passwordInput: string) {
    const result = loginUser(emailInput, passwordInput);
    if (result.ok) {
      setSessionState(result.session);
    }
    return result;
  }

  function register(params: { fullName: string; email: string; password: string }) {
    const result = registerUser({
      ...params,
      role: "customer",
    });
    if (result.ok) {
      const sessionData = {
        userId: result.user.id,
        email: result.user.email,
        fullName: result.user.fullName,
        role: result.user.role,
        photographerId: result.user.photographerId,
      };
      setSession(sessionData);
      setSessionState(sessionData);
    }
    return result;
  }

  function transitionTo(targetUrl: string) {
    setIsTransitioning(true);
    setTimeout(() => {
      router.push(targetUrl);
    }, 450);
    setTimeout(() => {
      setIsTransitioning(false);
    }, 1000);
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
      login,
      register,
      isTransitioning,
      transitionTo,
    };
  }, [session, isTransitioning]);

  return (
    <AuthContext.Provider value={value}>
      {children}
      {isTransitioning && (
        <div className="fixed inset-0 z-[9999] pointer-events-auto overflow-hidden">
          <div className="w-full h-full bg-[#ff8d28] animate-slide-through" />
        </div>
      )}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const value = useContext(AuthContext);

  if (!value) {
    throw new Error("useAuth phải được dùng bên trong AuthProvider.");
  }

  return value;
}