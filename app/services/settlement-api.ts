const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export type SettlementStatus = "pending" | "ready" | "paid" | "cancelled";

export type BookingSettlement = {
  id: number;
  booking_id: number;
  booking_code: string;

  customer_id?: number | null;
  photographer_id?: number | null;

  total_amount: number;
  deposit_amount: number;
  final_amount: number;

  platform_fee_rate: number;
  platform_fee_amount: number;
  photographer_payout_amount: number;

  status: SettlementStatus;
  note?: string | null;
  paid_at?: string | null;

  created_at?: string;
  updated_at?: string;

  booking_status?: string | null;
  payment_status?: string | null;
  customer_full_name?: string | null;
  customer_email?: string | null;
  service_name?: string | null;

  photographer_name?: string | null;
  photographer_email?: string | null;
};

export type SettlementSummary = {
  total_settlements: number;
  ready_count: number;
  paid_count: number;
  total_revenue: number;
  total_platform_fee: number;
  total_photographer_payout: number;
};

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
  error?: string;
};

function getToken() {
  if (typeof window === "undefined") return "";

  const possibleKeys = [
    "sudion_token",
    "sudion_auth_token",
    "auth_token",
    "token",
    "accessToken",
  ];

  for (const key of possibleKeys) {
    const value = window.localStorage.getItem(key);
    if (value) return value;
  }

  const sessionKeys = [
    "sudion_session",
    "sudion_user",
    "auth",
    "user",
  ];

  for (const key of sessionKeys) {
    const raw = window.localStorage.getItem(key);

    if (!raw) continue;

    try {
      const parsed = JSON.parse(raw);

      const token =
        parsed?.token ||
        parsed?.accessToken ||
        parsed?.data?.token ||
        parsed?.user?.token;

      if (token) return token;
    } catch {
      // bỏ qua
    }
  }

  return "";
}

async function requestApi<T>(path: string, options: RequestInit = {}) {
  const token = getToken();

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  const json: ApiResponse<T> = await response.json().catch(() => {
    throw new Error("Backend không trả JSON hợp lệ.");
  });

  if (!response.ok || !json.success) {
    throw new Error(json.message || json.error || "Có lỗi xảy ra.");
  }

  return json;
}

export async function getSettlementSummary() {
  const json = await requestApi<SettlementSummary>("/admin/settlements/summary");
  return json.data;
}

export async function getSettlements(params?: {
  status?: string;
  keyword?: string;
}) {
  const searchParams = new URLSearchParams();

  if (params?.status) searchParams.set("status", params.status);
  if (params?.keyword) searchParams.set("keyword", params.keyword);

  const query = searchParams.toString();
  const path = query
    ? `/admin/settlements?${query}`
    : "/admin/settlements";

  const json = await requestApi<BookingSettlement[]>(path);
  return json.data || [];
}

export async function syncSettlementByBooking(bookingCode: string) {
  const json = await requestApi<BookingSettlement>(
    `/admin/settlements/sync/${encodeURIComponent(bookingCode)}`,
    {
      method: "POST",
    }
  );

  return json.data;
}

export async function markSettlementPaid(id: number | string, note = "") {
  const json = await requestApi<BookingSettlement>(
    `/admin/settlements/${id}/mark-paid`,
    {
      method: "PATCH",
      body: JSON.stringify({ note }),
    }
  );

  return json.data;
}