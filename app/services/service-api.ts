import {
  serviceCategories as fallbackCategories,
  servicePackages as fallbackPackages,
} from "./service-data-fresh";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

type ApiResponse<T> = {
  success?: boolean;
  message?: string;
  data?: T;
  error?: unknown;
};

type RawCategory = {
  id?: number;
  name?: string;
  title?: string;
  slug?: string;
  description?: string | null;
};

type RawPhotographer = {
  id: number;
  full_name?: string;
  email?: string;
  phone?: string | null;
  avatar_url?: string | null;
  bio?: string | null;
  started_year?: number | null;
  active_area?: string | null;
  work_history?: string | null;
  photographer_type?: string | null;
  avg_rating?: number;
  verification_status?: string | null;
  min_price?: number;
  package_count?: number;
  categories?: string;
};

type RawServicePackage = {
  id: number;
  name: string;
  price: number;
  description: string | null;
  duration: string | number | null;
  duration_text?: string | null;
  worker_count: number | null;
  max_customer_count: number | null;

  image_url: string | null;
  portfolio_images: string[];
  add_ons: string[];
  distance_km: number;
  review_count: number;
  verified: boolean;
  next_slot: string | null;

  category: {
    id: number;
    name: string;
    slug: string;
    description: string | null;
  };

  photographer: {
    id: number;
    full_name: string;
    email: string;
    phone: string | null;
    avatar_url: string | null;
    bio: string | null;
    active_area: string | null;
    avg_rating: number;
    photographer_type: string | null;
    verification_status: string | null;
  };
};

export type ServiceSlug = string;

export type UiServiceCategory = {
  dbId?: number;
  slug: ServiceSlug;
  eyebrow: string;
  title: string;
  shortTitle: string;
  description: string;
  longDescription: string;
  startingPrice: string;
  photographerCount: string;
  photographerCountNumber: number;
  packageCount: number;
  heroImage: string;
  accentImage: string;
  tags: string[];
  mood: string;
};

export type ServicePackage = {
  id: string;
  packageId: number;
  serviceSlug: ServiceSlug;
  photographerId: string;
  photographerName: string;
  packageName: string;
  location: string;
  distanceKm: number;
  rating: number;
  reviewCount: number;
  price: number;
  duration: string;
  addOns: string[];
  nextSlot: string;
  image: string;
  portfolioImages: string[];
  verified?: boolean;
};

export type ServicesPageData = {
  categories: UiServiceCategory[];
  totalPhotographers: number;
};

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1452587925148-ce544e77e70d?auto=format&fit=crop&w=1200&q=85";

export function formatVnd(value: number) {
  return `${Number(value || 0).toLocaleString("vi-VN")} VND`;
}

function removeVietnameseTone(value: string) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
}

function toSlugKey(value: string) {
  return removeVietnameseTone(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function normalizeServiceSlug(value: string): ServiceSlug {
  const raw = toSlugKey(value);

  const map: Record<string, string> = {
    wedding: "wedding",
    "chup-anh-cuoi": "wedding",
    "chup-cuoi": "wedding",
    "anh-cuoi": "wedding",
    cuoi: "wedding",

    couple: "couple",
    "chup-anh-doi": "couple",
    "anh-doi": "couple",
    doi: "couple",

    portrait: "portrait",
    "chup-anh-don": "portrait",
    "chup-anh-ca-nhan": "portrait",
    "chup-anh-chan-dung": "portrait",
    "anh-don": "portrait",
    "anh-ca-nhan": "portrait",
    "chan-dung": "portrait",

    event: "event",
    "chup-su-kien": "event",
    "chup-anh-su-kien": "event",
    "anh-su-kien": "event",
    "su-kien": "event",

    yearbook: "yearbook",
    "chup-ky-yeu": "yearbook",
    "chup-ki-yeu": "yearbook",
    "chup-anh-ky-yeu": "yearbook",
    "chup-anh-ki-yeu": "yearbook",
    "ky-yeu": "yearbook",
    "ki-yeu": "yearbook",

    travel: "travel",
    "chup-travel": "travel",
    "chup-anh-du-lich": "travel",
    "anh-du-lich": "travel",
    "du-lich": "travel",

    food: "food",
    product: "food",
    "food-product": "food",
    "chup-food-product": "food",
    "chup-anh-am-thuc": "food",
    "chup-anh-do-an": "food",
    "anh-am-thuc": "food",
    "do-an": "food",
    "am-thuc": "food",

    family: "family",
    "chup-anh-gia-dinh": "family",
    "anh-gia-dinh": "family",
    "gia-dinh": "family",

    fashion: "fashion",
    "chup-anh-thoi-trang": "fashion",
    "anh-thoi-trang": "fashion",
    "thoi-trang": "fashion",

    commercial: "commercial",
    "chup-anh-thuong-mai": "commercial",
    "anh-thuong-mai": "commercial",
    "thuong-mai": "commercial",
  };

  return map[raw] || raw || "portrait";
}

function getFallbackCategory(slug: ServiceSlug) {
  return fallbackCategories.find((item) => item.slug === slug);
}

function getFallbackPackages(slug: ServiceSlug) {
  return fallbackPackages.filter((item) => item.serviceSlug === slug);
}

function getFallbackMinPrice(slug: ServiceSlug) {
  const prices = getFallbackPackages(slug)
    .map((item) => Number(item.price || 0))
    .filter((price) => price > 0);

  return prices.length ? Math.min(...prices) : 0;
}

function getShortTitle(title: string) {
  return title
    .replace(/^Chụp ảnh\s+/i, "")
    .replace(/^Chụp\s+/i, "")
    .trim();
}

function titleFromSlug(slug: string) {
  const map: Record<string, string> = {
    wedding: "Cưới hỏi",
    couple: "Cặp đôi",
    portrait: "Chân dung cá nhân",
    event: "Sự kiện",
    yearbook: "Kỷ yếu",
    travel: "Travel",
    food: "Food & Product",
    family: "Gia đình",
    fashion: "Thời trang",
    commercial: "Thương mại",
  };

  return map[slug] || slug;
}

async function fetchApi<T>(path: string): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    method: "GET",
    cache: "no-store",
  });

  const json: ApiResponse<T> | T = await response.json();

  if (!response.ok) {
    throw new Error(
      (json as ApiResponse<T>)?.message || "Không thể kết nối server."
    );
  }

  if ((json as ApiResponse<T>)?.success === false) {
    throw new Error((json as ApiResponse<T>)?.message || "API trả về lỗi.");
  }

  if (Array.isArray(json)) {
    return json as T;
  }

  if ((json as ApiResponse<T>)?.data !== undefined) {
    return (json as ApiResponse<T>).data as T;
  }

  return json as T;
}

async function getCategoriesFromDb() {
  try {
    return await fetchApi<RawCategory[]>("/categories");
  } catch (error) {
    console.warn("Lấy categories từ API thất bại, sử dụng fallback:", error);
    return fallbackCategories.map((item) => ({
      name: item.title,
      slug: item.slug,
      description: item.description,
    }));
  }
}

async function getPhotographers() {
  try {
    return await fetchApi<RawPhotographer[]>("/photographers");
  } catch (error) {
    console.warn("Lấy photographers từ API thất bại, sử dụng fallback:", error);
    return [];
  }
}

async function getAllPackages() {
  try {
    return await fetchApi<RawServicePackage[]>("/service-packages?category=all");
  } catch (error) {
    console.warn("Không lấy được service packages, dùng mảng rỗng:", error);
    return [];
  }
}

function mapCategoryToUi(
  category: RawCategory,
  stats: {
    photographerCount: number;
    packageCount: number;
    minPrice: number;
  }
): UiServiceCategory {
  const slug = normalizeServiceSlug(
    category.slug || category.name || category.title || ""
  );

  const fallback = getFallbackCategory(slug);
  const title = category.name || category.title || fallback?.title || titleFromSlug(slug);

  const description =
    category.description ||
    fallback?.description ||
    "Dịch vụ chụp ảnh chuyên nghiệp trên STUDION.";

  const fallbackMinPrice = getFallbackMinPrice(slug);

  return {
    dbId: category.id,
    slug,
    eyebrow: fallback?.eyebrow || "Photography service",
    title,
    shortTitle: fallback?.shortTitle || getShortTitle(title),
    description,
    longDescription:
      category.description || fallback?.longDescription || description,

    startingPrice:
      stats.minPrice > 0
        ? `Từ ${formatVnd(stats.minPrice)}`
        : fallbackMinPrice > 0
        ? `Từ ${formatVnd(fallbackMinPrice)}`
        : "Chưa có gói",

    photographerCount:
      stats.photographerCount > 0
        ? `${stats.photographerCount}+ photographer`
        : fallback?.photographerCount || "0 photographer",

    photographerCountNumber: stats.photographerCount,
    packageCount:
      stats.packageCount > 0 ? stats.packageCount : getFallbackPackages(slug).length,

    heroImage: fallback?.heroImage || FALLBACK_IMAGE,
    accentImage: fallback?.accentImage || fallback?.heroImage || FALLBACK_IMAGE,
    tags: fallback?.tags || [getShortTitle(title)],
    mood: fallback?.mood || "Chuyên nghiệp, sáng tạo",
  };
}

export function getServiceMetaBySlug(slugValue: string) {
  const slug = normalizeServiceSlug(slugValue);
  const fallback = getFallbackCategory(slug);

  if (fallback) {
    return {
      ...fallback,
      slug,
    };
  }

  const title = titleFromSlug(slug);

  return {
    slug,
    eyebrow: "Photography service",
    title,
    shortTitle: getShortTitle(title),
    description: "Dịch vụ chụp ảnh chuyên nghiệp trên STUDION.",
    longDescription:
      "Danh sách photographer và gói dịch vụ được lấy trực tiếp từ database.",
    startingPrice: "Chưa có gói",
    photographerCount: "0 photographer",
    heroImage: FALLBACK_IMAGE,
    accentImage: FALLBACK_IMAGE,
    tags: [getShortTitle(title)],
    mood: "Chuyên nghiệp, sáng tạo",
  };
}

export function getOtherServiceMetas(slugValue: string) {
  const currentSlug = normalizeServiceSlug(slugValue);

  return fallbackCategories.filter((item) => item.slug !== currentSlug);
}

export async function getServicesPageData(): Promise<ServicesPageData> {
  const categoriesFromDb = await getCategoriesFromDb();
  const photographers = await getPhotographers();
  const packages = await getAllPackages();

  const categories = categoriesFromDb.map((category) => {
    const slug = normalizeServiceSlug(
      category.slug || category.name || category.title || ""
    );

    const matchedPackages = packages.filter((item) => {
      const packageSlug = normalizeServiceSlug(
        item.category?.slug || item.category?.name || ""
      );

      return packageSlug === slug;
    });

    const photographerIds = new Set(
      matchedPackages.map((item) => String(item.photographer?.id || ""))
    );

    const prices = matchedPackages
      .map((item) => Number(item.price || 0))
      .filter((price) => price > 0);

    return mapCategoryToUi(category, {
      photographerCount: photographerIds.size,
      packageCount: matchedPackages.length,
      minPrice: prices.length ? Math.min(...prices) : 0,
    });
  });

  return {
    categories,
    totalPhotographers: photographers.length,
  };
}

function mapPackageToUi(item: RawServicePackage): ServicePackage {
  const slug = normalizeServiceSlug(item.category?.slug || item.category?.name || "");
  const fallback = getFallbackPackages(slug)[0];
  const fallbackCategory = getFallbackCategory(slug);

  const image =
    item.image_url ||
    item.photographer?.avatar_url ||
    fallback?.image ||
    fallbackCategory?.heroImage ||
    FALLBACK_IMAGE;

  const portfolioImages =
    item.portfolio_images?.length > 0
      ? item.portfolio_images
      : fallback?.portfolioImages?.length
      ? fallback.portfolioImages
      : [image];

  const addOns =
    item.add_ons?.length > 0
      ? item.add_ons
      : fallback?.addOns?.length
      ? fallback.addOns
      : fallbackCategory?.tags || [];

  return {
    id: String(item.id),
    packageId: Number(item.id),
    serviceSlug: slug,
    photographerId: String(item.photographer.id),
    photographerName: item.photographer.full_name,
    packageName: item.name,
    location:
      item.photographer.active_area ||
      fallback?.location ||
      "Chưa cập nhật khu vực",
    distanceKm: Number(item.distance_km || fallback?.distanceKm || 0),
    rating: Number(item.photographer.avg_rating || fallback?.rating || 0),
    reviewCount: Number(item.review_count || fallback?.reviewCount || 0),
    price: Number(item.price || 0),
    duration:
      item.duration_text ||
      String(item.duration || fallback?.duration || "Theo gói"),
    addOns,
    nextSlot: item.next_slot || fallback?.nextSlot || "Liên hệ để chọn lịch",
    image,
    portfolioImages,
    verified:
      Boolean(item.verified) ||
      item.photographer.verification_status === "verified" ||
      fallback?.verified ||
      false,
  };
}

export async function getPackagesByServiceSlug(slugValue: string) {
  const slug = normalizeServiceSlug(slugValue);

  try {
    const query = new URLSearchParams({
      category: slug,
      sort: "popular",
    });

    const packages = await fetchApi<RawServicePackage[]>(
      `/service-packages?${query.toString()}`
    );

    return packages.map(mapPackageToUi);
  } catch (error) {
    console.warn(`Lấy gói chụp cho ${slug} từ API thất bại, sử dụng fallback:`, error);
    return getFallbackPackages(slug).map((item) => ({
      ...item,
      packageId: Number(item.id) || 0,
    }));
  }
}