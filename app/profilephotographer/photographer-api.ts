"use client";

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export type PhotographerProfile = {
  photographer_id: string | number;
  user_id: string | number;
  photographer: {
    id: string | number;
    user_id?: string | number;
    full_name?: string;
    email?: string;
    phone?: string;
    avatar_url?: string;
    bio?: string;
    active_area?: string;
    categories?: string;
    min_price?: number;
    avg_rating?: number;
    verification_status?: string;
  };
};

export type PhotographerBooking = {
  id: number;
  booking_code: string;
  service_name: string;
  customer_full_name: string;
  customer_email?: string;
  customer_phone?: string;
  location?: string | null;
  shoot_date?: string | null;
  shoot_time?: string | null;
  estimated_total: number;
  deposit_amount: number;
  remaining_amount: number;
  status: string;
  created_at: string;
};

export type PhotographerPackage = {
  id: number;
  name: string;
  price: number;
  description?: string;
  duration_text?: string;
  portfolio_images?: string[];
  category?: {
    name?: string;
    slug?: string;
  };
};

function authHeaders() {
  const token =
    typeof window !== "undefined"
      ? window.localStorage.getItem("sudion_token")
      : null;

  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function readJson<T>(response: Response): Promise<T> {
  const json = await response.json();

  if (!response.ok || !json.success) {
    throw new Error(json.message || "Không thể lấy dữ liệu.");
  }

  return json.data as T;
}

export async function getMyPhotographerProfile() {
  const response = await fetch(`${API_URL}/photographers/me`, {
    headers: authHeaders(),
    cache: "no-store",
  });

  const data = await readJson<PhotographerProfile>(response);
  const id = String(data.photographer_id || data.photographer?.id || "");

  if (id && typeof window !== "undefined") {
    window.localStorage.setItem("sudion_photographer_id", id);
  }

  return data;
}

export async function getPhotographerBookings(photographerId: string) {
  const response = await fetch(
    `${API_URL}/bookings/photographer/${encodeURIComponent(photographerId)}`,
    {
      headers: authHeaders(),
      cache: "no-store",
    },
  );

  return readJson<PhotographerBooking[]>(response);
}

export async function getPhotographerPublicProfile(photographerId: string) {
  const response = await fetch(
    `${API_URL}/photographers/${encodeURIComponent(photographerId)}/profile`,
    {
      cache: "no-store",
    },
  );

  return readJson<{
    photographer: PhotographerProfile["photographer"];
    packages: PhotographerPackage[];
    portfolio: string[];
    stats?: {
      package_count?: number;
      min_price?: number;
      avg_rating?: number;
    };
  }>(response);
}

export function formatCurrency(value: number | string | null | undefined) {
  return `${Number(value || 0).toLocaleString("vi-VN")}đ`;
}

export function formatDate(value?: string | null) {
  if (!value) return "Chưa chọn";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString("vi-VN");
}
