"use client";

import {
  createContext,
  useCallback,
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
  refreshSessionFromServer,
  registerUser,
  setSession,
} from "./auth-store";
import { clearCart, clearBuyNow } from "./cart-store";
import { clearBookingCart } from "./booking-cart-store";

type AuthResult = {
  ok: boolean;
  error?: string;
  user?: AuthUser;
  session?: AuthSession;
};

type AuthContextValue = {
  session: AuthSession | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  isCustomer: boolean;
  isPhotographer: boolean;
  isAdmin: boolean;
  refresh: () => Promise<void>;
  logout: () => void;
  login: (emailInput: string, passwordInput: string) => Promise<AuthResult>;
  register: (params: {
    fullName: string;
    email: string;
    password: string;
    phone?: string;
  }) => Promise<AuthResult>;
  isTransitioning: boolean;
  transitionTo: (targetUrl: string) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSessionState] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const router = useRouter();

  const refresh = useCallback(async () => {
    const localSession = getSession();
    setSessionState(localSession);
    setIsLoading(false);

    const serverSession = await refreshSessionFromServer();
    setSessionState(serverSession);
  }, []);

  const logout = useCallback(() => {
    clearCart();
    clearBuyNow();
    clearBookingCart();
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("sudion_booking_draft");
      window.sessionStorage.removeItem("sudion-last-order");
    }
    clearSession();
    setSessionState(null);
  }, []);

  const login = useCallback(async (emailInput: string, passwordInput: string) => {
    const result = await loginUser(emailInput, passwordInput);

    if (result.ok && result.session) {
      setSessionState(result.session);
      try {
        router.push("/");
      } catch (err) {
        // ignore routing errors
      }
    }

    return result;
  }, []);


  const register = useCallback(async (params: {
    fullName: string;
    email: string;
    password: string;
    phone?: string;
  }) => {
    const result = await registerUser({
      ...params,
      role: "customer",
    });

    if (result.ok && result.user) {
      const sessionData: AuthSession = {
        userId: String(result.user.userId || result.user.id),
        email: result.user.email,
        fullName: result.user.fullName,
        role: result.user.role,
        photographerId: result.user.photographerId,
      };

      setSession(sessionData);
      setSessionState(sessionData);

      return {
        ...result,
        session: sessionData,
      };
    }

    return result;
  }, []);

  const transitionTo = useCallback((targetUrl: string) => {
    setIsTransitioning(true);

    setTimeout(() => {
      router.push(targetUrl);
    }, 450);

    setTimeout(() => {
      setIsTransitioning(false);
    }, 1000);
  }, [router]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const value = useMemo<AuthContextValue>(() => {
    return {
      session,
      isLoading,
      isLoggedIn: Boolean(session),
      isCustomer: session?.role === "customer",
      isPhotographer: session?.role === "photographer",
      isAdmin: session?.role === "admin",
      refresh,
      logout,
      login,
      register,
      isTransitioning,
      transitionTo,
    };
  }, [session, isLoading, isTransitioning, refresh, logout, login, register, transitionTo]);

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
