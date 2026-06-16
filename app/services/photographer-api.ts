export type Photographer = {
  id: number;
  full_name: string;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  bio: string | null;
  started_year: number | null;
  active_area: string | null;
  work_history: string | null;
  photographer_type: "freelance" | "studio" | "agency";
  avg_rating: number;
  verification_status: "pending" | "verified" | "rejected";
  min_price: number;
  package_count: number;
  categories: string;
};

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
  error?: unknown;
};

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export async function getPhotographers(params?: {
  category?: string;
  location?: string;
  keyword?: string;
  sort?: string;
}) {
  const searchParams = new URLSearchParams();

  if (params?.category) {
    searchParams.set("category", params.category);
  }

  if (params?.location) {
    searchParams.set("location", params.location);
  }

  if (params?.keyword) {
    searchParams.set("keyword", params.keyword);
  }

  if (params?.sort) {
    searchParams.set("sort", params.sort);
  }

  const res = await fetch(
    `${API_URL}/photographers?${searchParams.toString()}`,
    {
      method: "GET",
      cache: "no-store",
    }
  );

  if (!res.ok) {
    throw new Error("Không thể gọi API photographers");
  }

  const json: ApiResponse<Photographer[]> = await res.json();

  if (!json.success) {
    throw new Error(json.message || "Lỗi lấy danh sách photographer");
  }

  return json.data;
}