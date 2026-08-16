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

export type PhotographerPortfolioItem = {
  id: number | string;
  image_url?: string;
  image?: string;
  url?: string;
  caption?: string;
  description?: string;
  category_name?: string;
  category?: string;
  is_featured?: boolean;
  featured?: boolean;
  sort_order?: number;
  order?: number;
  created_at?: string;
  updated_at?: string;
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

export function resolveAssetUrl(url?: string | null) {
  if (!url) return "";

  if (/^https?:\/\//i.test(url) || url.startsWith("data:") || url.startsWith("blob:")) {
    return url;
  }

  const base = API_URL.replace(/\/api\/?$/, "");
  return `${base}${url.startsWith("/") ? url : `/${url}`}`;
}

export function normalizePortfolioItems(raw: unknown): PhotographerPortfolioItem[] {
  const data = Array.isArray(raw)
    ? raw
    : Array.isArray((raw as { items?: unknown })?.items)
      ? (raw as { items: unknown[] }).items
      : Array.isArray((raw as { portfolio?: unknown })?.portfolio)
        ? (raw as { portfolio: unknown[] }).portfolio
        : [];

  return data
    .map((entry) => {
      if (!entry || typeof entry !== "object") return null;

      const item = entry as Record<string, unknown>;
      const imageUrl =
        (typeof item.image_url === "string" && item.image_url) ||
        (typeof item.image === "string" && item.image) ||
        (typeof item.url === "string" && item.url) ||
        "";

      return {
        id: (item.id as number | string) ?? (item.portfolio_id as number | string) ?? String(Math.random()),
        image_url: imageUrl,
        image: imageUrl,
        url: imageUrl,
        caption: typeof item.caption === "string" ? item.caption : (typeof item.description === "string" ? item.description : ""),
        description: typeof item.description === "string" ? item.description : (typeof item.caption === "string" ? item.caption : ""),
        category_name:
          typeof item.category_name === "string"
            ? item.category_name
            : typeof item.category === "string"
              ? item.category
              : typeof item.category === "object" && item.category && "name" in (item.category as Record<string, unknown>)
                ? String((item.category as Record<string, unknown>).name || "")
                : "",
        category:
          typeof item.category === "string"
            ? item.category
            : typeof item.category_name === "string"
              ? item.category_name
              : "",
        is_featured:
          Boolean(item.is_featured ?? item.featured ?? false) ||
          (typeof item.featured === "string" ? item.featured === "true" : false),
        featured: Boolean(item.featured ?? item.is_featured ?? false),
        sort_order:
          typeof item.sort_order === "number"
            ? item.sort_order
            : typeof item.order === "number"
              ? item.order
              : undefined,
      };
    })
    .filter(Boolean) as PhotographerPortfolioItem[];
}

export async function getMyPortfolio() {
  try {
    const response = await fetch(`${API_URL}/photographers/me/portfolio`, {
      headers: authHeaders(),
      cache: "no-store",
    });

    const json = await response.json();
    console.log("Portfolio response:", { status: response.status, json });

    if (!response.ok) {
      console.error("Portfolio API error - bad status:", response.status, json);
      throw new Error(json.message || `Server error: ${response.status}`);
    }

    if (!json.success) {
      console.error("Portfolio API error - success false:", json);
      throw new Error(json.message || "Không thể tải portfolio.");
    }

    const normalized = normalizePortfolioItems(json.data ?? []);
    return normalized;
  } catch (err) {
    console.error("Portfolio fetch error:", err);
    if (err instanceof TypeError) {
      throw new Error("Lỗi kết nối. Vui lòng kiểm tra backend API.");
    }
    // Fallback: try to get portfolio from profile endpoint
    try {
      console.log("Trying fallback: fetching from /photographers/me");
      const profileRes = await fetch(`${API_URL}/photographers/me`, {
        headers: authHeaders(),
        cache: "no-store",
      });
      const profileJson = await profileRes.json();
      if (profileJson.success && profileJson.data?.portfolio) {
        return normalizePortfolioItems(profileJson.data.portfolio);
      }
    } catch (fallbackErr) {
      console.error("Fallback fetch also failed:", fallbackErr);
    }
    throw err;
  }
}

export async function createPortfolioItem(payload: Record<string, unknown>) {
  console.log("Create portfolio item payload:", payload);
  
  const response = await fetch(`${API_URL}/photographers/me/portfolio`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify(payload),
  });

  const json = await response.json();
  console.log("Create portfolio response:", { status: response.status, json });

  if (!response.ok) {
    throw new Error(json.message || `Server error: ${response.status}`);
  }

  if (!json.success) {
    throw new Error(json.message || "Không thể thêm ảnh vào portfolio.");
  }

  return normalizePortfolioItems(json.data ?? [json.data]).at(0) ?? (json.data as PhotographerPortfolioItem);
}

export async function updatePortfolioItem(id: number | string, payload: Record<string, unknown>) {
  const response = await fetch(`${API_URL}/photographers/me/portfolio/${encodeURIComponent(String(id))}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify(payload),
  });

  const json = await response.json();

  if (!response.ok || !json.success) {
    throw new Error(json.message || "Không thể cập nhật ảnh portfolio.");
  }

  return normalizePortfolioItems(json.data ?? [json.data]).at(0) ?? (json.data as PhotographerPortfolioItem);
}

export async function deletePortfolioItem(id: number | string) {
  const response = await fetch(`${API_URL}/photographers/me/portfolio/${encodeURIComponent(String(id))}`, {
    method: "DELETE",
    headers: authHeaders(),
  });

  const json = await response.json().catch(() => ({}));

  if (!response.ok && !(json as { success?: boolean })?.success) {
    throw new Error((json as { message?: string })?.message || "Không thể xóa ảnh portfolio.");
  }
}

export async function reorderPortfolioItems(ids: Array<number | string>) {
  // Backend expects simple format with ids in order
  const payload = {
    ids: ids.map(String),
  };

  console.log("Reorder payload:", payload);

  const response = await fetch(`${API_URL}/photographers/me/portfolio/reorder`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify(payload),
  });

  const json = await response.json().catch(() => ({}));
  console.log("Reorder response:", { status: response.status, json });

  if (!response.ok) {
    throw new Error((json as { message?: string })?.message || `Server error: ${response.status}`);
  }

  if (!((json as { success?: boolean })?.success ?? true)) {
    throw new Error((json as { message?: string })?.message || "Không thể sắp xếp ảnh portfolio.");
  }

  return json as { success?: boolean; data?: unknown };
}

export function formatCurrency(value: number | string | null | undefined) {
  return `${Number(value || 0).toLocaleString("vi-VN")}đ`;
}

export function formatDate(value?: string | null) {
  if (!value) return "Chưa chọn";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString("vi-VN");
}
