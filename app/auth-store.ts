export type UserRole = "client" | "photographer";

export type User = {
  id: string;
  fullName: string;
  email: string;
  password: string;
  role: UserRole;
  createdAt: string;
};

export type AuthSession = {
  userId: string;
  email: string;
  fullName: string;
  role: UserRole;
};

const USERS_KEY = "studion-users";
const SESSION_KEY = "studion-session";

function canUseStorage() {
  return typeof window !== "undefined" && Boolean(window.localStorage);
}

export function getUsers(): User[] {
  if (!canUseStorage()) return [];
  try { return JSON.parse(localStorage.getItem(USERS_KEY) || "[]"); }
  catch { return []; }
}

export function findUserByEmail(email: string): User | undefined {
  return getUsers().find((u) => u.email.toLowerCase() === email.toLowerCase());
}

export function getSession(): AuthSession | null {
  if (!canUseStorage()) return null;
  try { return JSON.parse(localStorage.getItem(SESSION_KEY) || "null"); }
  catch { return null; }
}

export function setSession(session: AuthSession): void {
  if (!canUseStorage()) return;
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearSession(): void {
  if (!canUseStorage()) return;
  localStorage.removeItem(SESSION_KEY);
}

export function registerUser(
  fullName: string, email: string, password: string, role: UserRole
): { ok: true; user: User } | { ok: false; error: string } {
  if (findUserByEmail(email)) return { ok: false, error: "Email đã được sử dụng." };
  const user: User = { id: crypto.randomUUID(), fullName, email, password, role, createdAt: new Date().toISOString() };
  const users = getUsers();
  users.push(user);
  if (canUseStorage()) localStorage.setItem(USERS_KEY, JSON.stringify(users));
  return { ok: true, user };
}

export function loginUser(
  email: string, password: string
): { ok: true; session: AuthSession } | { ok: false; error: string } {
  const user = findUserByEmail(email);
  if (!user) return { ok: false, error: "Email không tồn tại." };
  if (user.password !== password) return { ok: false, error: "Mật khẩu không đúng." };
  const session: AuthSession = { userId: user.id, email: user.email, fullName: user.fullName, role: user.role };
  setSession(session);
  return { ok: true, session };
}
