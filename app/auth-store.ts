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
  photographerRecordId?: string;
  kyc_verified?: number | boolean;
};

export type AuthSession = {
  userId: string;
  fullName: string;
  email: string;
  role: UserRole;
  avatar_url?: string;
  photographerId?: string;
  photographerRecordId?: string;
  phone?: string;
  kyc_verified?: number | boolean;
};

type AuthApiPayload = {
  user?: unknown;
  token?: string;
  accessToken?: string;
  access_token?: string;
};

type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data?: T;
  user?: unknown;
  token?: string;
  accessToken?: string;
  access_token?: string;
};

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const SESSION_KEY = "sudion_session";
const TOKEN_KEY = "sudion_token";
const COMPAT_TOKEN_KEYS = [TOKEN_KEY, "token", "accessToken", "access_token"];

function normalizeRole(role: unknown): UserRole {
  const normalized = String(role || "").trim().toLowerCase();

  if (normalized === "photographer") return "photographer";

  if (
    normalized === "admin" ||
    normalized === "administrator" ||
    normalized === "superadmin"
  ) {
    return "admin";
  }

  return "customer";
}

function normalizeUser(raw: any): AuthUser {
  const photographerRecordId =
    raw?.photographerRecordId ||
    raw?.photographer_record_id ||
    raw?.photographer_profile_id ||
    undefined;

  return {
    id: String(raw?.id || raw?.userId || raw?.user_id || ""),
    userId: String(raw?.userId || raw?.user_id || raw?.id || ""),
    fullName: String(raw?.fullName || raw?.full_name || raw?.name || ""),
    email: String(raw?.email || "").trim().toLowerCase(),
    phone: raw?.phone ? String(raw.phone) : "",
    role: normalizeRole(raw?.role),
    avatar_url: raw?.avatar_url || raw?.avatarUrl || "",
    photographerId: raw?.photographerId
      ? String(raw.photographerId)
      : raw?.photographer_id
        ? String(raw.photographer_id)
        : undefined,
    photographerRecordId: photographerRecordId
      ? String(photographerRecordId)
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
    photographerRecordId: user.photographerRecordId,
    phone: user.phone,
    kyc_verified: user.kyc_verified,
  };
}

function cleanToken(value: unknown): string {
  if (typeof value !== "string") return "";

  const token = value.trim();

  if (!token || token === "null" || token === "undefined") {
    return "";
  }

  return token;
}

function extractToken(result: ApiResponse<AuthApiPayload>): string {
  const candidates = [
    result.data?.token,
    result.data?.accessToken,
    result.data?.access_token,
    result.token,
    result.accessToken,
    result.access_token,
  ];

  for (const candidate of candidates) {
    const token = cleanToken(candidate);
    if (token) return token;
  }

  return "";
}

function extractUser(result: ApiResponse<AuthApiPayload>): AuthUser | null {
  const rawUser = result.data?.user || result.user;

  if (!rawUser) return null;

  const user = normalizeUser(rawUser);

  if (!user.id || !user.email) {
    return null;
  }

  return user;
}

function writeUserStorage(user: AuthUser, session: AuthSession) {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  window.localStorage.setItem("sudion_user", JSON.stringify(user));
  window.localStorage.setItem("sudion_auth_user", JSON.stringify(user));
  window.localStorage.setItem("sudion_booking_email", user.email);

  const photographerId = user.photographerId || user.userId || user.id;

  if (user.role === "photographer" && photographerId) {
    window.localStorage.setItem(
      "sudion_photographer_id",
      String(photographerId),
    );
  } else {
    window.localStorage.removeItem("sudion_photographer_id");
  }
}

function writeAuthenticatedStorage(
  user: AuthUser,
  session: AuthSession,
  token: string,
) {
  if (typeof window === "undefined") return;

  writeUserStorage(user, session);
  window.localStorage.setItem(TOKEN_KEY, token);

  // Xóa các key cũ để toàn bộ frontend chỉ dùng một token duy nhất.
  for (const key of COMPAT_TOKEN_KEYS) {
    if (key !== TOKEN_KEY) {
      window.localStorage.removeItem(key);
    }
  }
}

export function getSession(): AuthSession | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as AuthSession;

    if (!parsed?.userId || !parsed?.email || !parsed?.role) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;

  for (const key of COMPAT_TOKEN_KEYS) {
    const token = cleanToken(window.localStorage.getItem(key));

    if (token) {
      if (key !== TOKEN_KEY) {
        window.localStorage.setItem(TOKEN_KEY, token);
        window.localStorage.removeItem(key);
      }

      return token;
    }
  }

  return null;
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
  window.localStorage.removeItem("sudion_booking_email");
  window.localStorage.removeItem("sudion_photographer_id");

  for (const key of COMPAT_TOKEN_KEYS) {
    window.localStorage.removeItem(key);
  }
}

async function readApiResponse<T>(response: Response): Promise<ApiResponse<T>> {
  const text = await response.text();

  if (!text) {
    return {
      success: false,
      message: `Backend không trả dữ liệu (HTTP ${response.status}).`,
    };
  }

  try {
    return JSON.parse(text) as ApiResponse<T>;
  } catch {
    return {
      success: false,
      message: `Backend trả dữ liệu không hợp lệ (HTTP ${response.status}).`,
    };
  }
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
        fullName: params.fullName.trim(),
        email: params.email.trim().toLowerCase(),
        password: params.password,
        phone: params.phone?.trim(),
        role: params.role === "photographer" ? "photographer" : "customer",
      }),
    });

    const result = await readApiResponse<AuthApiPayload>(response);

    if (!response.ok || !result.success) {
      return {
        ok: false as const,
        error: result.message || "Đăng ký thất bại.",
      };
    }

    const user = extractUser(result);
    const token = extractToken(result);

    if (!user || !token) {
      clearSession();

      return {
        ok: false as const,
        error:
          "Backend đăng ký thành công nhưng không trả đủ user hoặc token đăng nhập.",
      };
    }

    const session = makeSession(user);
    writeAuthenticatedStorage(user, session, token);

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
        email: emailInput.trim().toLowerCase(),
        password,
      }),
    });

    const result = await readApiResponse<AuthApiPayload>(response);

    if (!response.ok || !result.success) {
      return {
        ok: false as const,
        error: result.message || "Đăng nhập thất bại.",
      };
    }

    const user = extractUser(result);
    const token = extractToken(result);

    /*
      Không tạo session giả khi backend không trả token.
      Đây là nguyên nhân cũ khiến avatar vẫn hiện nhưng API báo chưa đăng nhập.
    */
    if (!user || !token) {
      clearSession();

      return {
        ok: false as const,
        error:
          "Đăng nhập chưa hoàn tất vì backend không trả đủ user hoặc token.",
      };
    }

    const session = makeSession(user);
    writeAuthenticatedStorage(user, session, token);

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
  const token = getToken();

  /*
    Có session nhưng không có token là phiên đăng nhập hỏng.
    Không được giữ session cũ vì UI sẽ hiện avatar trong khi API trả 401.
  */
  if (!token) {
    clearSession();
    return null;
  }

  try {
    const response = await fetch(`${API_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    const result = await readApiResponse<AuthApiPayload>(response);

    if (!response.ok || !result.success) {
      if (response.status === 401 || response.status === 403) {
        clearSession();
        return null;
      }

      // Backend tạm lỗi nhưng token vẫn tồn tại: giữ phiên local để không đá user ra.
      return getSession();
    }

    const user = extractUser(result);

    if (!user) {
      return getSession();
    }

    const session = makeSession(user);
    writeUserStorage(user, session);

    return session;
  } catch {
    // Mất kết nối tạm thời: giữ session local nếu vẫn có token.
    return getSession();
  }
}
