"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  ReactNode,
} from "react";

export type NotificationType =
  | "booking"
  | "payment"
  | "refund"
  | "system"
  | "campaign";

export interface Notification {
  id: string | number;
  type: NotificationType;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  metadata?: {
    booking_id?: string | number;
    page_url?: string;
    campaign_id?: string | number;
    notification_kind?: string;
    [key: string]: unknown;
  };
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  loadNotifications: () => Promise<void>;
  markAsRead: (id: string | number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string | number) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const requestSeq = useRef(0);

  const API_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

  const getToken = () =>
    typeof window !== "undefined"
      ? window.localStorage.getItem("sudion_token")
      : null;

  const getSession = () => {
    if (typeof window === "undefined") return null;
    try {
      const raw = window.localStorage.getItem("sudion_session");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  };

  const authHeaders = useCallback((): Record<string, string> => {
    const token = getToken();
    return token
      ? {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        }
      : { Accept: "application/json" };
  }, []);

  const extractNotifications = (json: any): Notification[] => {
    if (Array.isArray(json?.data)) return json.data;
    if (Array.isArray(json?.data?.notifications)) return json.data.notifications;
    if (Array.isArray(json?.notifications)) return json.notifications;
    return [];
  };

  const normalizeNotification = (raw: any): Notification => {
    const rawType = String(raw?.type || raw?.metadata?.notification_kind || "system")
      .trim()
      .toLowerCase();

    let type: NotificationType = "system";
    if (rawType.includes("campaign")) type = "campaign";
    else if (rawType.includes("booking") || rawType.includes("schedule")) type = "booking";
    else if (
      rawType.includes("payment") ||
      rawType.includes("deposit") ||
      rawType.includes("paid")
    )
      type = "payment";
    else if (rawType.includes("refund") || rawType.includes("hoan")) type = "refund";

    return {
      ...raw,
      id: raw?.id,
      type,
      title: String(raw?.title || "Thông báo Sudion"),
      message: String(raw?.message || raw?.content || ""),
      is_read: Boolean(raw?.is_read),
      created_at: String(raw?.created_at || new Date().toISOString()),
      metadata:
        raw?.metadata && typeof raw.metadata === "object"
          ? raw.metadata
          : undefined,
    };
  };

  const loadNotifications = useCallback(async () => {
    const token = getToken();
    const session = getSession();

    // Notification APIs are protected. A stale UI session without JWT must not
    // query another user's legacy endpoint.
    if (!token) {
      setNotifications([]);
      setIsLoading(false);
      return;
    }

    const seq = ++requestSeq.current;
    setIsLoading(true);

    try {
      const endpoints = [
        `${API_URL}/notifications/me?limit=200`,
        session?.userId
          ? `${API_URL}/notifications/id/${encodeURIComponent(
              String(session.userId)
            )}?limit=200`
          : null,
        session?.email
          ? `${API_URL}/notifications/user/${encodeURIComponent(
              String(session.email)
            )}?limit=200`
          : null,
      ].filter(Boolean) as string[];

      // Query the canonical /me endpoint plus the two authenticated compatibility
      // endpoints. This keeps old booking notifications and new campaign
      // notifications visible even while backend rows are linked by id or email.
      const responses = await Promise.allSettled(
        [...new Set(endpoints)].map(async (endpoint) => {
          const response = await fetch(endpoint, {
            headers: authHeaders(),
            cache: "no-store",
          });
          const json = await response.json().catch(() => ({}));
          return { response, json, endpoint };
        })
      );

      const merged = new Map<string, Notification>();
      let successfulRequests = 0;
      let unauthorized = 0;

      for (const item of responses) {
        if (item.status !== "fulfilled") continue;
        const { response, json } = item.value;
        if (!response.ok) {
          if (response.status === 401) unauthorized += 1;
          continue;
        }

        successfulRequests += 1;
        for (const raw of extractNotifications(json)) {
          const notification = normalizeNotification(raw);
          const key = String(notification.id);
          if (!key || key === "undefined") continue;
          const existing = merged.get(key);
          if (!existing) {
            merged.set(key, notification);
            continue;
          }

          // Prefer the richer row when one endpoint includes metadata.
          if (!existing.metadata && notification.metadata) {
            merged.set(key, notification);
          }
        }
      }

      if (seq !== requestSeq.current) return;

      if (successfulRequests > 0) {
        const sorted = [...merged.values()].sort(
          (a, b) =>
            new Date(b.created_at).getTime() -
            new Date(a.created_at).getTime()
        );
        setNotifications(sorted);
      } else if (unauthorized === responses.length && responses.length > 0) {
        // JWT is no longer valid (for example after JWT_SECRET rotation).
        // Do not leave stale notifications on screen.
        setNotifications([]);
      }
    } catch (error) {
      console.error("Error loading notifications:", error);
    } finally {
      if (seq === requestSeq.current) setIsLoading(false);
    }
  }, [API_URL, authHeaders]);

  const markAsRead = useCallback(
    async (id: string | number) => {
      const token = getToken();
      if (!token) return;

      const endpoints = [
        `${API_URL}/notifications/me/${id}/read`,
        `${API_URL}/notifications/${id}/read`,
      ];

      try {
        let updated = false;
        for (const endpoint of endpoints) {
          const response = await fetch(endpoint, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              ...authHeaders(),
            },
          });

          if (response.ok) {
            updated = true;
            break;
          }

          // 401/403 means retrying a compatibility URL will not help.
          if (response.status === 401 || response.status === 403) break;
        }

        if (updated) {
          setNotifications((prev) =>
            prev.map((notif) =>
              String(notif.id) === String(id)
                ? { ...notif, is_read: true }
                : notif
            )
          );
        }
      } catch (error) {
        console.error("Error marking notification as read:", error);
      }
    },
    [API_URL, authHeaders]
  );

  const markAllAsRead = useCallback(async () => {
    const token = getToken();
    if (!token) return;

    try {
      const response = await fetch(`${API_URL}/notifications/read-all`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders(),
        },
      });

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((notif) => ({ ...notif, is_read: true }))
        );
      }
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  }, [API_URL, authHeaders]);

  const deleteNotification = useCallback(
    async (id: string | number) => {
      const token = getToken();
      if (!token) return;

      try {
        const response = await fetch(`${API_URL}/notifications/${id}`, {
          method: "DELETE",
          headers: authHeaders(),
        });

        if (response.ok) {
          setNotifications((prev) =>
            prev.filter((notif) => String(notif.id) !== String(id))
          );
        }
      } catch (error) {
        console.error("Error deleting notification:", error);
      }
    },
    [API_URL, authHeaders]
  );

  // Campaign scheduler works in the background, so keep the bell live without F5.
  // Five seconds stays comfortably below the backend notification rate limit.
  useEffect(() => {
    void loadNotifications();

    const intervalId = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        void loadNotifications();
      }
    }, 5000);

    const refresh = () => {
      if (document.visibilityState === "visible") {
        void loadNotifications();
      }
    };

    const onStorage = (event: StorageEvent) => {
      if (
        event.key === "sudion_token" ||
        event.key === "sudion_session" ||
        event.key === "sudion_user"
      ) {
        void loadNotifications();
      }
    };

    window.addEventListener("focus", refresh);
    window.addEventListener("storage", onStorage);
    document.addEventListener("visibilitychange", refresh);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("focus", refresh);
      window.removeEventListener("storage", onStorage);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [loadNotifications]);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isLoading,
        loadNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within NotificationProvider"
    );
  }
  return context;
}
