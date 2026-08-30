"use client";

import type { ReactNode } from "react";

/* ─── Base Skeleton ─── */
export function Skeleton({
  className = "",
  width,
  height,
  rounded = "lg",
}: {
  className?: string;
  width?: string;
  height?: string;
  rounded?: "sm" | "md" | "lg" | "xl" | "full" | "2xl" | "3xl";
}) {
  return (
    <div
      className={`animate-pulse bg-[#e8eaf1]/70 rounded-${rounded} ${className}`}
      style={{ width, height }}
    />
  );
}

/* ─── Card Skeleton (for booking cards, photographer cards, etc.) ─── */
export function CardSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-[22px] border border-[#e8eaf1] bg-white p-5 shadow-sm"
        >
          {/* Header */}
          <div className="flex items-center gap-4">
            <Skeleton className="h-12 w-12 shrink-0" rounded="full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
            <Skeleton className="h-8 w-24" rounded="full" />
          </div>
          {/* Body */}
          <div className="mt-5 grid grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, j) => (
              <div key={j} className="space-y-1.5">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ))}
          </div>
          {/* Footer */}
          <div className="mt-5 flex items-center justify-between border-t border-[#eef0f5] pt-4">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-10 w-28" rounded="xl" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── Page Loading Skeleton ─── */
export function PageSkeleton({ title }: { title?: string }) {
  return (
    <main className="min-h-screen bg-[#fafbfc]">
      <section className="mx-auto w-full max-w-[1180px] px-5 py-10 sm:px-6 lg:px-8 lg:py-14">
        {/* Header skeleton */}
        <div className="rounded-[28px] border border-[#e8eaf1] bg-white overflow-hidden shadow-sm">
          <div className="bg-[#111827] px-6 py-8 sm:px-8 lg:px-10">
            <div className="space-y-3">
              <Skeleton className="h-4 w-24 !bg-white/20" rounded="full" />
              <Skeleton className="h-10 w-96 !bg-white/15" rounded="xl" />
              <Skeleton className="h-4 w-64 !bg-white/10" />
            </div>
          </div>

          {/* Content skeleton */}
          <div className="px-6 py-6 lg:px-8">
            {title && (
              <h2 className="mb-6 text-xl font-black text-[#0e111d]">
                {title}
              </h2>
            )}
            <CardSkeleton count={3} />
          </div>
        </div>
      </section>
    </main>
  );
}

/* ─── Inline Spinner ─── */
export function Spinner({ size = "sm" }: { size?: "sm" | "md" | "lg" }) {
  const sizeMap = { sm: "h-4 w-4", md: "h-5 w-5", lg: "h-6 w-6" };

  return (
    <svg
      className={`animate-spin text-current ${sizeMap[size]}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

/* ─── Empty State ─── */
export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {icon || (
        <div className="mb-4 grid h-16 w-16 place-items-center rounded-full bg-[#f8f9fd]">
          <svg
            className="h-8 w-8 text-[#9ca3af]"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
        </div>
      )}
      <h3 className="text-lg font-black text-[#0e111d]">{title}</h3>
      {description && (
        <p className="mt-2 max-w-sm text-sm font-medium text-[#6b7280]">
          {description}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
