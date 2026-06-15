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

type ToastType = "success" | "error" | "warning" | "info";

type ToastItem = {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
};

type ToastInput = Omit<ToastItem, "id">;

type ToastContextValue = {
  showToast: (toast: ToastInput) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
  redirect: (toast: ToastInput) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const PENDING_TOAST_KEY = "sudion_pending_toast";
const TOAST_EVENT_NAME = "sudion_show_toast";

const toastStyles: Record<
  ToastType,
  {
    icon: string;
    bar: string;
    border: string;
    bg: string;
    text: string;
  }
> = {
  success: {
    icon: "✓",
    bar: "bg-emerald-500",
    border: "border-emerald-200",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
  },
  error: {
    icon: "!",
    bar: "bg-red-500",
    border: "border-red-200",
    bg: "bg-red-50",
    text: "text-red-700",
  },
  warning: {
    icon: "!",
    bar: "bg-amber-500",
    border: "border-amber-200",
    bg: "bg-amber-50",
    text: "text-amber-700",
  },
  info: {
    icon: "i",
    bar: "bg-[#ff8d28]",
    border: "border-orange-200",
    bg: "bg-orange-50",
    text: "text-[#c95f13]",
  },
};

function createToastId() {
  return `toast_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function isToastInput(value: unknown): value is ToastInput {
  if (!value || typeof value !== "object") return false;

  const toast = value as Partial<ToastInput>;

  return Boolean(toast.type && toast.title);
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (toast: ToastInput) => {
      const id = createToastId();
      const duration = toast.duration ?? 3600;

      const newToast: ToastItem = {
        ...toast,
        id,
        duration,
      };

      setToasts((current) => [newToast, ...current].slice(0, 4));

      window.setTimeout(() => {
        removeToast(id);
      }, duration);
    },
    [removeToast]
  );

  const redirect = useCallback((toast: ToastInput) => {
    if (typeof window === "undefined") return;

    window.sessionStorage.setItem(PENDING_TOAST_KEY, JSON.stringify(toast));

    window.dispatchEvent(
      new CustomEvent<ToastInput>(TOAST_EVENT_NAME, {
        detail: toast,
      })
    );
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    function readPendingToast() {
      const raw = window.sessionStorage.getItem(PENDING_TOAST_KEY);

      if (!raw) return;

      try {
        const pendingToast = JSON.parse(raw) as ToastInput;

        if (isToastInput(pendingToast)) {
          showToast(pendingToast);
        }
      } catch {
        // ignore invalid toast
      } finally {
        window.sessionStorage.removeItem(PENDING_TOAST_KEY);
      }
    }

    function handleToastEvent(event: Event) {
      const customEvent = event as CustomEvent<ToastInput>;
      const toast = customEvent.detail;

      if (!isToastInput(toast)) return;

      showToast(toast);
      window.sessionStorage.removeItem(PENDING_TOAST_KEY);
    }

    readPendingToast();

    window.addEventListener(TOAST_EVENT_NAME, handleToastEvent);

    return () => {
      window.removeEventListener(TOAST_EVENT_NAME, handleToastEvent);
    };
  }, [showToast]);

  const value = useMemo<ToastContextValue>(() => {
    return {
      showToast,
      success: (title, message) => showToast({ type: "success", title, message }),
      error: (title, message) => showToast({ type: "error", title, message }),
      warning: (title, message) =>
        showToast({ type: "warning", title, message }),
      info: (title, message) => showToast({ type: "info", title, message }),
      redirect,
    };
  }, [redirect, showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}

      <div className="pointer-events-none fixed right-4 top-4 z-[9999] grid w-[calc(100%-32px)] max-w-[430px] gap-3">
        {toasts.map((toast) => (
          <ToastCard
            key={toast.id}
            toast={toast}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastCard({
  toast,
  onClose,
}: {
  toast: ToastItem;
  onClose: () => void;
}) {
  const style = toastStyles[toast.type];
  const duration = toast.duration ?? 3600;

  return (
    <div
      className={`pointer-events-auto overflow-hidden rounded-[18px] border ${style.border} ${style.bg} shadow-[0_18px_50px_rgba(15,23,42,0.16)] animate-[toastSlideIn_0.32s_ease-out]`}
      style={{
        animationName: "toastSlideIn",
      }}
    >
      <div className="flex items-start gap-3 px-4 py-3">
        <div
          className={`mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white text-[14px] font-black ${style.text}`}
        >
          {style.icon}
        </div>

        <div className="min-w-0 flex-1">
          <p className={`text-[14px] font-black leading-5 ${style.text}`}>
            {toast.title}
          </p>

          {toast.message ? (
            <p className="mt-1 text-[12px] font-semibold leading-5 text-[#475569]">
              {toast.message}
            </p>
          ) : null}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="rounded-full px-2 text-[18px] font-black leading-7 text-[#64748b] transition hover:bg-white/70"
          aria-label="Đóng thông báo"
        >
          ×
        </button>
      </div>

      <div className="h-[3px] bg-black/5">
        <div
          className={`h-full ${style.bar}`}
          style={{
            animation: `toastProgress ${duration}ms linear forwards`,
          }}
        />
      </div>

      <style jsx>{`
        @keyframes toastSlideIn {
          from {
            opacity: 0;
            transform: translateX(28px) translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateX(0) translateY(0);
          }
        }

        @keyframes toastProgress {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
    </div>
  );
}

export function useToast() {
  const value = useContext(ToastContext);

  if (!value) {
    throw new Error("useToast phải dùng bên trong ToastProvider.");
  }

  return value;
}