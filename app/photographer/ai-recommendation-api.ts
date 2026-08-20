import { getToken } from "@/app/auth-store";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://sudion-backend-production-453b.up.railway.app/api";

export type AiRecommendationPriority =
  | "balanced"
  | "style"
  | "rating"
  | "price"
  | "location";

export type AiRecommendationRequest = {
  message: string;
  category?: string;
  location?: string;
  budgetMax?: number | null;
  styles?: string[];
  priority?: AiRecommendationPriority;
  shootDate?: string;
  maxResults?: number;
};

export type AiScoreBreakdownItem = {
  key: string;
  label: string;
  weight: number;
  score: number;
  points: number;
};

export type AiMatchedPackage = {
  id: number;
  name: string;
  price: number;
  categoryId: number;
  categoryName: string;
  duration: number | null;
};

export type AiPhotographerRecommendation = {
  id: number;
  full_name: string;
  avatar_url: string | null;
  bio: string | null;
  active_area: string | null;
  photographer_type: string;
  avg_rating: number;
  verification_status: string;
  min_price: number;
  package_count: number;
  categories: string[];
  matchScore: number;
  matchPercent: number;
  reason: string;
  reasons: string[];
  scoreBreakdown: AiScoreBreakdownItem[];
  matchedPackage: AiMatchedPackage | null;
};

export type AiRecommendationResponseData = {
  intent: {
    category: { id: number; name: string; slug: string | null } | null;
    location: string | null;
    budgetMax: number | null;
    styles: string[];
    priority: AiRecommendationPriority;
    shootDate: string | null;
  };
  intentSummary: string;
  ai: {
    provider: "gemini" | "fallback" | string;
    model: string | null;
    used: boolean;
    scoringModel: string;
    scoreFormula: Record<string, number>;
    persisted: boolean;
  };
  recommendations: AiPhotographerRecommendation[];
};

type ApiEnvelope<T> = {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
};

export async function requestAiPhotographerRecommendations(
  payload: AiRecommendationRequest,
): Promise<AiRecommendationResponseData> {
  const token = getToken();

  const response = await fetch(`${API_URL}/ai/photographer-recommendations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  const json = (await response.json().catch(() => null)) as
    | ApiEnvelope<AiRecommendationResponseData>
    | null;

  if (!response.ok || !json?.success || !json.data) {
    throw new Error(
      json?.message ||
        json?.error ||
        "Không thể lấy đề xuất photographer từ AI.",
    );
  }

  return json.data;
}
