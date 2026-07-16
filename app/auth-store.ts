export type UserRole = "customer" | "photographer" | "admin";

export type AuthUser = {
  id: string;
  userId?: string;
  fullName: string;
  email: string;
  phone?: string;
  role: UserRole;
  avatar_url?: string;
  photographerId?: string;
  kyc_verified?: number | boolean;
};

export type AuthSession = {
  userId: string;
  fullName: string;
  email: string;
  role: UserRole;
  avatar_url?: string;
  photographerId?: string;
  phone?: string;
  kyc_verified?: number | boolean;
};

type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data?: T;
};

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const SESSION_KEY = "sudion_session";

function normalizeRole(role: unknown): UserRole {
  if (role === "photographer") return "photographer";
  if (role === "admin") return "admin";
  return "customer";
}

function normalizeUser(raw: any): AuthUser {
  return {
    id: String(raw?.id || raw?.userId || ""),
    userId: String(raw?.userId || raw?.id || ""),
    fullName: String(raw?.fullName || raw?.full_name || ""),
    email: String(raw?.email || ""),
    phone: raw?.phone ? String(raw.phone) : "",
    role: normalizeRole(raw?.role),
    avatar_url: raw?.avatar_url || "",
    photographerId: raw?.photographerId
      ? String(raw.photographerId)
      : raw?.photographer_id
        ? String(raw.photographer_id)
        : undefined,
    kyc_verified: raw?.kyc_verified ? Number(raw.kyc_verified) : 0,
  };
}

function makeSession(user: AuthUser): AuthSession {
  return {
    userId: String(user.userId || user.id),
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    avatar_url: user.avatar_url,
    photographerId: user.photographerId,
    phone: user.phone,
    kyc_verified: user.kyc_verified,
  };
}

function writeCompatStorage(user: AuthUser, session: AuthSession, token?: string) {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  window.localStorage.setItem("sudion_user", JSON.stringify(user));
  window.localStorage.setItem("sudion_auth_user", JSON.stringify(user));
  window.localStorage.setItem("sudion_booking_email", user.email);

  if (token) {
    window.localStorage.setItem("sudion_token", token);
  }

  if (user.role === "photographer" && user.photographerId) {
    window.localStorage.setItem("sudion_photographer_id", user.photographerId);
  }
}

export function getSession(): AuthSession | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem("sudion_token");
}

export function setSession(session: AuthSession) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearSession() {
  if (typeof window === "undefined") return;

  window.localStorage.removeItem(SESSION_KEY);
  window.localStorage.removeItem("sudion_user");
  window.localStorage.removeItem("sudion_auth_user");
  window.localStorage.removeItem("sudion_photographer_id");
  window.localStorage.removeItem("sudion_token");
}

export async function registerUser(params: {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
  role: UserRole;
}) {
  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fullName: params.fullName,
        email: params.email,
        password: params.password,
        phone: params.phone,
        role: params.role === "photographer" ? "photographer" : "customer",
      }),
    });

    const result = (await response.json()) as ApiResponse<{
      user: AuthUser;
      token?: string;
    }>;

    if (!response.ok || !result.success) {
      return {
        ok: false as const,
        error: result.message || "Đăng ký thất bại.",
      };
    }

    const user = normalizeUser(result.data?.user);
    const session = makeSession(user);
    const token = result.data?.token;

    writeCompatStorage(user, session, token);

    return {
      ok: true as const,
      user,
      session,
    };
  } catch (error: any) {
    return {
      ok: false as const,
      error:
        error?.message ||
        "Không thể kết nối backend. Vui lòng kiểm tra server.",
    };
  }
}

export async function loginUser(emailInput: string, password: string) {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: emailInput,
        password,
      }),
    });

    const result = (await response.json()) as ApiResponse<{
      user: AuthUser;
      token?: string;
    }>;

    if (!response.ok || !result.success) {
      return {
        ok: false as const,
        error: result.message || "Đăng nhập thất bại.",
      };
    }

    const user = normalizeUser(result.data?.user);
    const session = makeSession(user);
    const token = result.data?.token;

    writeCompatStorage(user, session, token);

    return {
      ok: true as const,
      user,
      session,
    };
  } catch (error: any) {
    return {
      ok: false as const,
      error:
        error?.message ||
        "Không thể kết nối backend. Vui lòng kiểm tra server.",
    };
  }
}

export async function refreshSessionFromServer() {
  try {
    const token = getToken();

    if (!token) {
      return getSession();
    }

    const response = await fetch(`${API_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    const result = (await response.json()) as ApiResponse<{
      user: AuthUser;
    }>;

    if (!response.ok || !result.success || !result.data?.user) {
      return getSession();
    }

    const user = normalizeUser(result.data.user);
    const session = makeSession(user);
    writeCompatStorage(user, session);

    return session;
  } catch {
    return getSession();
  }
}
