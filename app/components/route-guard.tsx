"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/app/auth-context";
import type { UserRole } from "@/app/auth-store";

/* ─── Loading skeleton shown while checking auth ─── */
function AuthLoadingSkeleton() {
  return (
    <main className="min-h-screen bg-[#fafbfc] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4 animate-pulse">
        <div className="h-12 w-12 rounded-full bg-[#e8eaf1]" />
        <div className="h-4 w-48 rounded-lg bg-[#e8eaf1]" />
        <div className="h-3 w-32 rounded-lg bg-[#e8eaf1]" />
      </div>
    </main>
  );
}

/* ─── Access denied page ─── */
function AccessDenied({ requiredRole }: { requiredRole?: string }) {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-[#fafbfc] flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-6 grid h-16 w-16 place-items-center rounded-full bg-red-50">
          <svg className="h-8 w-8 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h1 className="text-2xl font-black text-[#0e111d]">Không có quyền truy cập</h1>
        <p className="mt-3 text-sm font-medium text-[#6b7280]">
          {requiredRole === "photographer"
            ? "Trang này chỉ dành cho nhiếp ảnh gia đã đăng ký."
            : requiredRole === "admin"
              ? "Trang này chỉ dành cho quản trị viên hệ thống."
              : "Bạn không có quyền truy cập trang này."}
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-xl border border-[#e8eaf1] bg-white px-5 py-2.5 text-sm font-bold text-[#4b5563] transition hover:bg-[#f9fafb]"
          >
            Quay lại
          </button>
          <button
            type="button"
            onClick={() => router.push("/")}
            className="rounded-xl bg-[#ff8d28] px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#e67d1f]"
          >
            Trang chủ
          </button>
        </div>
      </div>
    </main>
  );
}

/* ═══════════════════════════════════════════════
   RequireAuth – wraps pages that need login
   ═══════════════════════════════════════════════ */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { session, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !session) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [isLoading, session, router, pathname]);

  if (isLoading) {
    return <AuthLoadingSkeleton />;
  }

  if (!session) {
    return <AuthLoadingSkeleton />;
  }

  return <>{children}</>;
}

/* ═══════════════════════════════════════════════
   RequireRole – checks for specific role access
   ═══════════════════════════════════════════════ */
export function RequireRole({
  children,
  role,
  fallback,
}: {
  children: ReactNode;
  role: UserRole | UserRole[];
  fallback?: ReactNode;
}) {
  const { session, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const allowedRoles = Array.isArray(role) ? role : [role];

  useEffect(() => {
    if (!isLoading && !session) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [isLoading, session, router, pathname]);

  if (isLoading) {
    return <AuthLoadingSkeleton />;
  }

  if (!session) {
    return <AuthLoadingSkeleton />;
  }

  if (!allowedRoles.includes(session.role)) {
    return fallback ?? <AccessDenied requiredRole={allowedRoles[0]} />;
  }

  return <>{children}</>;
}
