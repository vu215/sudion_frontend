const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
  error?: unknown;
};

export type BookingStatus =
  | "awaiting_payment"
  | "accepted"
  | "confirmed"
  | "completed"
  | "fully_paid"
  | "rejected"
  | "cancelled"
  | string;

export type BookingItem = {
  id: number;
  booking_code: string;
  service_name: string;
  shoot_date: string | null;
  shoot_time: string | null;
  location: string | null;
  estimated_total: number;
  status: BookingStatus;
  customer_full_name: string;
  customer_phone: string;
  customer_email: string;
};

export type ReviewItem = {
  id: number;
  booking_code: string;
  customer_name: string;
  rating: number;
  comment: string;
  created_at: string;
};

export type PhotographerProfile = {
  id: string;
  displayName: string;
  title: string;
  location: string;
  email: string;
  phone: string;
  bio: string;
  services: string[];
  isProfileActive: boolean;
  acceptMessages: boolean;
  noticeBeforeBooking: string;
  maxBookingsPerDay: number;
  bufferMinutes: number;
  priceFrom: number;
  priceTo: number;
  payoutAccount: string;
  payoutName: string;
  notifications: {
    bookingRequests: boolean;
    messages: boolean;
    reviews: boolean;
    promotions: boolean;
  };
};

export type PhotographerService = {
  id: string | number;
  name: string;
  category: string;
  duration: string;
  price: number;
  description: string;
  active: boolean;
};

export type PortfolioItem = {
  id: string | number;
  url: string;
  caption: string;
};

function buildUrl(path: string) {
  return `${API_URL}${path}`;
}

async function parseResponse<T>(response: Response, fallbackMessage: string): Promise<T> {
  const json = await response.json().catch(() => null);
  if (!response.ok) {
    const message = json?.message || fallbackMessage;
    throw new Error(message);
  }
  if (json && typeof json === "object" && (json as ApiResponse<T>).success === false) {
    throw new Error((json as ApiResponse<T>).message || fallbackMessage);
  }
  if (json && typeof json === "object" && (json as ApiResponse<T>).data !== undefined) {
    return (json as ApiResponse<T>).data as T;
  }
  return json as T;
}

export async function getBookingsByPhotographer(photographerId: string) {
  const res = await fetch(buildUrl(`/bookings/photographer/${encodeURIComponent(photographerId)}`), {
    method: "GET",
    cache: "no-store",
  });
  return parseResponse<BookingItem[]>(res, "Không thể tải booking.");
}

export async function getReviewsByPhotographer(photographerId: string) {
  const res = await fetch(buildUrl(`/photographers/${encodeURIComponent(photographerId)}/reviews`), {
    method: "GET",
    cache: "no-store",
  });
  return parseResponse<ReviewItem[]>(res, "Không thể tải đánh giá.");
}

export async function getPhotographerProfile(photographerId: string) {
  const res = await fetch(buildUrl(`/photographers/${encodeURIComponent(photographerId)}`), {
    method: "GET",
    cache: "no-store",
  });
  return parseResponse<PhotographerProfile>(res, "Không thể tải hồ sơ.");
}

export async function updatePhotographerProfile(photographerId: string, payload: Partial<PhotographerProfile> & { password?: string }) {
  const res = await fetch(buildUrl(`/photographers/${encodeURIComponent(photographerId)}`), {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return parseResponse<PhotographerProfile>(res, "Không thể cập nhật hồ sơ.");
}

export async function getServicesByPhotographer(photographerId: string) {
  const res = await fetch(buildUrl(`/photographers/${encodeURIComponent(photographerId)}/services`), {
    method: "GET",
    cache: "no-store",
  });
  return parseResponse<PhotographerService[]>(res, "Không thể tải danh sách dịch vụ.");
}

export async function createPhotographerService(photographerId: string, service: Omit<PhotographerService, "id">) {
  const res = await fetch(buildUrl(`/photographers/${encodeURIComponent(photographerId)}/services`), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(service),
  });
  return parseResponse<PhotographerService>(res, "Không thể tạo dịch vụ.");
}

export async function updatePhotographerService(serviceId: string, service: Partial<PhotographerService>) {
  const res = await fetch(buildUrl(`/services/${encodeURIComponent(serviceId)}`), {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(service),
  });
  return parseResponse<PhotographerService>(res, "Không thể cập nhật dịch vụ.");
}

export async function deletePhotographerService(serviceId: string) {
  const res = await fetch(buildUrl(`/services/${encodeURIComponent(serviceId)}`), {
    method: "DELETE",
  });
  return parseResponse<{ success: boolean }>(res, "Không thể xoá dịch vụ.");
}

export async function getPortfolioByPhotographer(photographerId: string) {
  const res = await fetch(buildUrl(`/photographers/${encodeURIComponent(photographerId)}/portfolio`), {
    method: "GET",
    cache: "no-store",
  });
  return parseResponse<PortfolioItem[]>(res, "Không thể tải portfolio.");
}

export async function uploadPortfolioItem(photographerId: string, formData: FormData) {
  const res = await fetch(buildUrl(`/photographers/${encodeURIComponent(photographerId)}/portfolio`), {
    method: "POST",
    body: formData,
  });
  return parseResponse<PortfolioItem>(res, "Không thể tải ảnh lên.");
}

export async function updatePortfolioItemCaption(itemId: string, caption: string) {
  const res = await fetch(buildUrl(`/portfolio/${encodeURIComponent(itemId)}`), {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ caption }),
  });
  return parseResponse<PortfolioItem>(res, "Không thể cập nhật chú thích.");
}

export async function deletePortfolioItem(itemId: string) {
  const res = await fetch(buildUrl(`/portfolio/${encodeURIComponent(itemId)}`), {
    method: "DELETE",
  });
  return parseResponse<{ success: boolean }>(res, "Không thể xoá ảnh portfolio.");
}
