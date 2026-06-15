export type UserRole = "customer" | "photographer" | "admin";

export type AuthUser = {
  id: string;
  fullName: string;
  email: string;
  password: string;
  role: UserRole;
  photographerId?: string;
};

export type AuthSession = {
  userId: string;
  fullName: string;
  email: string;
  role: UserRole;
  photographerId?: string;
};

const USERS_KEY = "sudion_users";
const SESSION_KEY = "sudion_session";

function readUsers(): AuthUser[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeUsers(users: AuthUser[]) {
  window.localStorage.setItem(USERS_KEY, JSON.stringify(users));
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

export function setSession(session: AuthSession) {
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearSession() {
  window.localStorage.removeItem(SESSION_KEY);
}

export function registerUser(params: {
  fullName: string;
  email: string;
  password: string;
  role: UserRole;
  photographerId?: string;
}) {
  const fullName = params.fullName.trim();
  const email = params.email.trim().toLowerCase();
  const password = params.password;
  const role = params.role;
  const photographerId = params.photographerId?.trim();

  const users = readUsers();

  const existed = users.some((item) => item.email.toLowerCase() === email);

  if (existed) {
    return {
      ok: false as const,
      error: "Email này đã được đăng ký.",
    };
  }

  if (role === "photographer" && !photographerId) {
    return {
      ok: false as const,
      error: "Photographer cần nhập Photographer ID để liên kết dashboard.",
    };
  }

  const user: AuthUser = {
    id: `USER_${Date.now()}`,
    fullName,
    email,
    password,
    role,
    photographerId: role === "photographer" ? photographerId : undefined,
  };

  writeUsers([...users, user]);

  return {
    ok: true as const,
    user,
  };
}

export function loginUser(emailInput: string, password: string) {
  const email = emailInput.trim().toLowerCase();
  const users = readUsers();

  const user = users.find((item) => item.email.toLowerCase() === email);

  if (!user) {
    return {
      ok: false as const,
      error: "Email chưa được đăng ký.",
    };
  }

  if (user.password !== password) {
    return {
      ok: false as const,
      error: "Mật khẩu không đúng.",
    };
  }

  const session: AuthSession = {
    userId: user.id,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    photographerId: user.photographerId,
  };

  setSession(session);

  return {
    ok: true as const,
    user,
    session,
  };
}