"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/app/auth-context";
import { saveBooking } from "../booking-store";
import { addToBookingCart } from "../booking-cart-store";
import { useToast } from "@/app/toast-context";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

/* ───────── TYPES ───────── */

type BookingPhotographer = {
  id: number;
  full_name: string;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  bio: string | null;
  active_area: string | null;
  avg_rating: number;
  photographer_type: string;
  verification_status?: string | null;
};

type BookingPackage = {
  id: number;
  name: string;
  price: number;
  description: string | null;
  duration: string | number | null;
  worker_count: number | null;
  max_customer_count: number | null;
  category: { id: number; name: string; slug: string; originalSlug?: string; description: string | null };
};

type BookedSlot = {
  booking_code: string;
  photographer_id: string;
  shoot_date: string;
  shoot_time: string;
  shoot_end_time?: string | null;
  availability_slot_label?: string | null;
  status: string;
};

type ApiResponse<T> = { success: boolean; message: string; data: T; error?: unknown };
type BookingOptionsData = {
  photographer: BookingPhotographer;
  packages: BookingPackage[];
  addOns?: Array<{ id: string; name: string; price: number; note?: string }>;
};

type PackageTier = {
  tier: "basic" | "standard" | "premium";
  label: string;
  price: number;
  features: string[];
  recommended?: boolean;
};

type SubTypeOption = { id: string; label: string; extra: number; image: string };

type AddonCard = { id: string; name: string; price: number; image: string; note?: string };

/* ───────── CONSTANTS ───────── */

const CATEGORY_INFO: Record<string, { label: string; icon: string; image: string }> = {
  wedding: {
    label: "Cưới hỏi",
    icon: "",
    image: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=400&q=80",
  },
  couple: {
    label: "Cặp đôi",
    icon: "",
    image: "https://images.unsplash.com/photo-1523438885200-e635ba2c371e?auto=format&fit=crop&w=400&q=80",
  },
  portrait: {
    label: "Chân dung",
    icon: "",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80",
  },
  event: {
    label: "Sự kiện",
    icon: "",
    image: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=400&q=80",
  },
  yearbook: {
    label: "Kỷ yếu",
    icon: "",
    image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=400&q=80",
  },
  travel: {
    label: "Travel",
    icon: "",
    image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=400&q=80",
  },
  food: {
    label: "Food & Product",
    icon: "",
    image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80",
  },
};

const WEDDING_SUBTYPES: SubTypeOption[] = [
  { id: "pre-wedding", label: "Chụp ảnh cưới", extra: 0, image: "https://i.pinimg.com/736x/d5/39/3f/d5393f1c798379d5dfdf1b85563074dc.jpg" },
  { id: "phong-su", label: "Phóng sự cưới", extra: 2500000, image: "https://i.pinimg.com/736x/6d/c5/19/6dc519d3bd5450d7e06a71e0e5a2a845.jpg" },
  { id: "gia-tien", label: "Lễ gia tiên", extra: 800000, image: "https://i.pinimg.com/736x/88/f0/a4/88f0a43b271ad694a8e10c7eeaf76ea4.jpg" },
  { id: "an-hoi", label: "Lễ ăn hỏi", extra: 800000, image: "https://i.pinimg.com/736x/26/e9/6c/26e96c6c35a006344570ac3fdcb44c41.jpg" },
  { id: "tiec-cuoi", label: "Tiệc cưới", extra: 2000000, image: "https://i.pinimg.com/1200x/ac/88/59/ac88598c891cad0cbe1920807b14187e.jpg" },
  { id: "studio-cuoi", label: "Chụp studio cưới", extra: 1000000, image: "https://images.unsplash.com/photo-1606800052052-a08af7148866?w=400&q=80&fit=crop" },
  { id: "le-cuoi", label: "Chụp lễ cưới", extra: 1500000, image: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=400&q=80" },
  { id: "full-day", label: "Chụp full wedding day", extra: 5000000, image: "https://i.pinimg.com/1200x/18/33/4d/18334d20531bae69b882960af71a6113.jpg" },
];

const PEOPLE_OPTIONS_MAP: Record<string, { label: string; extra: number }[]> = {
  couple: [
    { label: "2 người", extra: 0 },
    { label: "3-5 người", extra: 500000 },
    { label: "6-10 người", extra: 1000000 },
  ],
  portrait: [
    { label: "1 người", extra: 0 },
  ],
  event: [
    { label: "Dưới 30 khách", extra: 0 },
    { label: "30-80 khách", extra: 700000 },
    { label: "80-150 khách", extra: 1500000 },
    { label: "Trên 150 khách", extra: 2800000 },
  ],
  yearbook: [
    { label: "10-20 người", extra: 0 },
    { label: "21-40 người", extra: 800000 },
    { label: "41-60 người", extra: 1600000 },
    { label: "Trên 60 người", extra: 2600000 },
  ],
  travel: [
    { label: "1 người", extra: 0 },
    { label: "2 người", extra: 300000 },
    { label: "3-6 người", extra: 900000 },
    { label: "Nhóm trên 6 người", extra: 1800000 },
  ],
  food: [
    { label: "1-5 sản phẩm", extra: 0 },
    { label: "6-15 sản phẩm", extra: 600000 },
    { label: "16-30 sản phẩm", extra: 1400000 },
    { label: "Trên 30 sản phẩm", extra: 2400000 },
  ],
  _default: [
    { label: "Mặc định (1 người / sản phẩm)", extra: 0 },
  ],
};

const PACKAGE_TIERS: Record<string, PackageTier[]> = {
  wedding: [
    { tier: "basic", label: "Basic", price: 8000000, features: ["4 giờ chụp", "1 Photographer", "300 ảnh gốc", "30 ảnh chỉnh sửa", "Giao ảnh trong 7 ngày"] },
    { tier: "standard", label: "Standard", price: 12000000, recommended: true, features: ["8 giờ chụp", "2 Photographer", "500 ảnh gốc", "70 ảnh chỉnh sửa", "Giao ảnh trong 5 ngày"] },
    { tier: "premium", label: "Premium", price: 18000000, features: ["12 giờ chụp", "2 Photographer + 1 Videographer", "800 ảnh gốc", "120 ảnh chỉnh sửa", "Giao ảnh trong 3 ngày"] },
  ],
};

const ADDON_CARDS: AddonCard[] = [
  { id: "flycam", name: "Flycam quay phim", price: 2000000, image: "https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=400&q=80&fit=crop", note: "Góc quay trên cao" },
  { id: "album-premium", name: "Album cao cấp", price: 3000000, image: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=400&q=80&fit=crop", note: "Thiết kế + in ấn" },
  { id: "gate-photo", name: "Ảnh cổng 80×120", price: 900000, image: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=400&q=80&fit=crop", note: "Ép gỗ chất lượng cao" },
  { id: "photobook", name: "Photobook phóng sự", price: 2500000, image: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=400&q=80&fit=crop", note: "30 trang thiết kế" },
  { id: "makeup", name: "Makeup Artist", price: 1500000, image: "https://images.unsplash.com/photo-1487412912498-0447578fcca8?w=400&q=80&fit=crop", note: "Đi cùng buổi chụp" },
  { id: "video", name: "Video highlight", price: 3000000, image: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=400&q=80&fit=crop", note: "Clip ngắn hậu kỳ" },
  { id: "retouch", name: "Retouch nâng cao", price: 1200000, image: "https://images.unsplash.com/photo-1542744094-24638eff58bb?w=400&q=80&fit=crop", note: "Chỉnh sửa chuyên sâu" },
  { id: "raw-files", name: "File gốc RAW", price: 500000, image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&q=80&fit=crop", note: "Nhận toàn bộ file gốc" },
];

const TIME_SLOTS = [
  "08:00 - 12:00",
  "09:00 - 13:00",
  "13:00 - 17:00",
  "14:00 - 18:00",
  "16:00 - 20:00",
  "08:00 - 16:00 (Cả ngày)",
];

const MONTH_NAMES = [
  "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
  "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12",
];

const DAY_HEADERS = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

/* ───────── UTILITY FUNCTIONS ───────── */

function formatCurrency(value: number) {
  return `${Number(value || 0).toLocaleString("vi-VN")}đ`;
}

function toSlugKey(value: string) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeServiceFilter(value: string) {
  const key = toSlugKey(value);

  if (key.includes("wedding") || key.includes("cuoi")) return "wedding";
  if (key.includes("couple") || key.includes("doi")) return "couple";
  if (key.includes("portrait") || key.includes("chan-dung") || key.includes("don") || key.includes("ca-nhan") || key.includes("fashion") || key.includes("thoi-trang")) return "portrait";
  if (key.includes("event") || key.includes("su-kien")) return "event";
  if (key.includes("yearbook") || key.includes("ky-yeu") || key.includes("ki-yeu") || key.includes("graduation")) return "yearbook";
  if (key.includes("travel") || key.includes("du-lich")) return "travel";
  if (key.includes("food") || key.includes("product") || key.includes("am-thuc") || key.includes("do-an") || key.includes("commercial") || key.includes("thuong-mai")) return "food";

  const map: Record<string, string> = {
    wedding: "wedding", "chup-anh-cuoi": "wedding", "chup-cuoi": "wedding", "anh-cuoi": "wedding", "cuoi-hoi": "wedding", cuoi: "wedding",
    couple: "couple", "chup-anh-doi": "couple", "anh-doi": "couple", doi: "couple",
    portrait: "portrait", "chup-anh-don": "portrait", "chup-anh-ca-nhan": "portrait", "chup-anh-chan-dung": "portrait", "chan-dung": "portrait",
    event: "event", "chup-su-kien": "event", "chup-anh-su-kien": "event", "su-kien": "event",
    yearbook: "yearbook", "chup-ky-yeu": "yearbook", "chup-ki-yeu": "yearbook", "ky-yeu": "yearbook", graduation: "yearbook",
    travel: "travel", "chup-travel": "travel", "chup-anh-du-lich": "travel", "du-lich": "travel",
    food: "food", product: "food", "food-product": "food", "chup-anh-am-thuc": "food", "am-thuc": "food", commercial: "food", "thuong-mai": "food",
  };
  return map[key] || key;
}

function normalizeDate(v: string) { return String(v || "").slice(0, 10); }
function normalizeTime(v: string) { return String(v || "").slice(0, 5); }

function parseTimeToMinutes(timeStr: string): number {
  const parts = timeStr.split(":");
  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1] || "0", 10);
  return hours * 60 + minutes;
}

function parseSlotRangeToMinutes(timeSlot: string) {
  let slotStartMin = 0;
  let slotEndMin = 24 * 60;

  const rangeMatch = timeSlot.match(/(\d{1,2}:\d{2})\s*(?:-|–|—|đến|to)\s*(\d{1,2}:\d{2})/i);

  if (rangeMatch) {
    slotStartMin = parseTimeToMinutes(rangeMatch[1]);
    slotEndMin = parseTimeToMinutes(rangeMatch[2]);
    return { slotStartMin, slotEndMin };
  }

  const singleMatch = timeSlot.match(/(\d{1,2}:\d{2})/);

  if (singleMatch) {
    slotStartMin = parseTimeToMinutes(singleMatch[1]);
    slotEndMin = slotStartMin + 240;
  }

  return { slotStartMin, slotEndMin };
}

function isSlotBooked(bookedSlots: BookedSlot[], date: string, timeSlot: string) {
  const targetDate = normalizeDate(date);
  const { slotStartMin, slotEndMin } = parseSlotRangeToMinutes(timeSlot);

  return bookedSlots.some((s) => {
    if (normalizeDate(s.shoot_date) !== targetDate) return false;

    const bookedStartText = normalizeTime(s.shoot_time);
    const bookedEndText = s.shoot_end_time
      ? normalizeTime(s.shoot_end_time)
      : s.availability_slot_label
        ? normalizeTime(s.availability_slot_label.split("-")[1] || "")
        : "";

    const bookedStartMin = parseTimeToMinutes(bookedStartText);
    const bookedEndMin = bookedEndText
      ? parseTimeToMinutes(bookedEndText)
      : bookedStartMin + 240;

    return slotStartMin < bookedEndMin && slotEndMin > bookedStartMin;
  });
}

function getCalendarDays(year: number, month: number): (number | null)[] {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const startPad = first.getDay(); // Sunday = 0
  const days: (number | null)[] = [];
  for (let i = 0; i < startPad; i++) days.push(null);
  for (let d = 1; d <= last.getDate(); d++) days.push(d);
  return days;
}

function getAddonImage(id: string, category: string, name = ""): string {
  const cleanId = id.toLowerCase();
  const cleanName = name.toLowerCase();
  const combined = `${cleanId} ${cleanName}`;

  if (combined.includes("flycam") || combined.includes("drone") || combined.includes("bay"))
    return "https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=400&q=80&fit=crop";
  if (combined.includes("album"))
    return "https://images.unsplash.com/photo-1544717305-2782549b5136?w=400&q=80&fit=crop";
  if (combined.includes("photobook") || combined.includes("photo book") || combined.includes("phóng sự"))
    return "https://images.unsplash.com/photo-1544717305-2782549b5136?w=400&q=80&fit=crop";
  if (combined.includes("cổng") || combined.includes("cong") || combined.includes("80x") || combined.includes("80×") || combined.includes("frame") || combined.includes("print"))
    return "https://images.unsplash.com/photo-1544717305-2782549b5136?w=400&q=80&fit=crop";
  if (combined.includes("makeup") || combined.includes("trang điểm") || combined.includes("trang diem"))
    return "https://images.unsplash.com/photo-1487412912498-0447578fcca8?w=400&q=80&fit=crop";
  if (combined.includes("video") || combined.includes("highlight") || combined.includes("clip"))
    return "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=400&q=80&fit=crop";
  if (combined.includes("retouch") || combined.includes("edit") || combined.includes("chỉnh sửa") || combined.includes("nâng cao"))
    return "https://images.unsplash.com/photo-1542744094-24638eff58bb?w=400&q=80&fit=crop";
  if (combined.includes("raw") || combined.includes("file gốc") || combined.includes("file goc"))
    return "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&q=80&fit=crop";
  if (combined.includes("book") || combined.includes("sách") || combined.includes("sach"))
    return "https://images.unsplash.com/photo-1544717305-2782549b5136?w=400&q=80&fit=crop";

  return CATEGORY_INFO[category]?.image || "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&q=80&fit=crop";
}

/* ───────── API ───────── */

async function getBookingOptions(photographerId: string, categorySlug?: string | null) {
  const catParam = categorySlug ? `?category=${encodeURIComponent(categorySlug)}` : "";
  const res = await fetch(`${API_URL}/photographers/${photographerId}/booking-options${catParam}`, { cache: "no-store" });
  const json: ApiResponse<BookingOptionsData> = await res.json();
  if (!res.ok || !json.success) throw new Error(json.message || "Không thể lấy dịch vụ.");
  return json.data;
}

async function getBookedSlots(photographerId: string) {
  const res = await fetch(`${API_URL}/photographers/${photographerId}/booked-slots`, { cache: "no-store" });
  const json: ApiResponse<BookedSlot[]> = await res.json();
  if (!res.ok || !json.success) throw new Error(json.message || "Không thể lấy lịch.");
  return json.data;
}

/* ───────── PAGE ───────── */

export default function BookingPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-[#fafbfc]" />}>
      <BookingContent />
    </Suspense>
  );
}

/* ───────── MAIN COMPONENT ───────── */

function BookingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { session } = useAuth();
  const toast = useToast();

  const rawPhotographerId = searchParams.get("photographer") || "";
  const photographerId = useMemo(() => {
    const slugMap: Record<string, string> = {
      "binh-nguyen": "3",
      "hao-le": "2",
      "may-studio": "28",
      "linh-hoa": "17",
      "studio-k": "20",
      "minh-anh": "8",
      "nha-bep": "13",
      "anh-travel": "14",
      "hoang-anh": "4",
      "hung-trinh": "11",

      // Kỷ yếu (Yearbook)
      "thu-hien": "12",
      "linh-anh": "21",
      "hoa-mai": "30",

      // Travel
      "tu-anh": "23",
      "duc-long": "32",

      // Food & Product
      "viet-hung": "22",
      "thu-trang": "31",

      // Sự kiện (Event)
      "quang-viet": "26",
    };
    return slugMap[rawPhotographerId] || rawPhotographerId;
  }, [rawPhotographerId]);
  const serviceQuery = searchParams.get("service")?.trim() || "";

  // ── Core state ──
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [photographer, setPhotographer] = useState<BookingPhotographer | null>(null);
  const [packages, setPackages] = useState<BookingPackage[]>([]);
  const [allPackages, setAllPackages] = useState<BookingPackage[]>([]);
  const [bookedSlots, setBookedSlots] = useState<BookedSlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // ── Voucher state ──
  const [voucherInput, setVoucherInput] = useState("");
  const [appliedVoucher, setAppliedVoucher] = useState<{ id: number; code: string; name: string; discount_amount: number; campaign_id?: number } | null>(null);
  const [voucherError, setVoucherError] = useState("");
  const [isApplyingVoucher, setIsApplyingVoucher] = useState(false);
  const [activeVouchers, setActiveVouchers] = useState<any[]>([]);
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [dismissedCampaignPackageId, setDismissedCampaignPackageId] = useState<string | null>(null);

  // ── Selection state ──
  const [selectedCategory, setSelectedCategory] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      const search = new URLSearchParams(window.location.search);
      const service = search.get("service")?.trim();
      return service ? normalizeServiceFilter(service) : null;
    }
    return null;
  });
  const [selectedSubType, setSelectedSubType] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const search = new URLSearchParams(window.location.search);
      const sub = search.get("wedding_subtype")?.trim();
      return sub || "pre-wedding";
    }
    return "pre-wedding";
  });
  const [selectedTier, setSelectedTier] = useState<"basic" | "standard" | "premium">("standard");
  const [selectedPeopleScale, setSelectedPeopleScale] = useState("");
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);
  const [apiAddOns, setApiAddOns] = useState<Array<{ id: string; name: string; price: number; note?: string }>>([]);
  const [showMoreAddons, setShowMoreAddons] = useState(false);
  const [showMoreSubTypes, setShowMoreSubTypes] = useState(false);

  // ── Booking info state ──
  const [location, setLocation] = useState("Hồ Chí Minh");
  const [shootDate, setShootDate] = useState("");
  const [shootTime, setShootTime] = useState("09:00 - 13:00");
  const [phone, setPhone] = useState("");
  const [specialRequest, setSpecialRequest] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("momo");
  const [depositPercent, setDepositPercent] = useState<30 | 50 | 100>(30);

  // ── Calendar state ──
  const [calMonth, setCalMonth] = useState(() => new Date().getMonth());
  const [calYear, setCalYear] = useState(() => new Date().getFullYear());

  // ── Derived data ──
  const availableCategories = useMemo(() => {
    const slugs = new Set(allPackages.map((p) => p.category.slug));
    return Object.entries(CATEGORY_INFO)
      .filter(([slug]) => slugs.has(slug))
      .map(([slug, info]) => ({ slug, ...info }));
  }, [allPackages]);

  const otherServiceOptions = useMemo(() => {
    if (!allPackages.length) return [];

    const uniqueBySlug = new Map<string, BookingPackage>();
    allPackages.forEach((pkg) => {
      if (!uniqueBySlug.has(pkg.category.slug) && pkg.category.slug !== selectedCategory) {
        uniqueBySlug.set(pkg.category.slug, pkg);
      }
    });

    return Array.from(uniqueBySlug.values()).map((pkg) => ({
      slug: pkg.category.slug,
      label: CATEGORY_INFO[pkg.category.slug]?.label || pkg.category.name || "Dịch vụ khác",
      name: pkg.name,
      price: pkg.price,
      image: CATEGORY_INFO[pkg.category.slug]?.image || pkg.category.name,
    }));
  }, [allPackages, selectedCategory]);

  const photographerTags = useMemo(() => availableCategories.map((c) => c.label), [availableCategories]);

  const isServiceScoped = useMemo(() => {
    const VALID_CATEGORIES = ["wedding", "couple", "portrait", "event", "yearbook", "travel", "food"];
    return Boolean(serviceQuery && VALID_CATEGORIES.includes(serviceQuery.toLowerCase()));
  }, [serviceQuery]);

  // auto-select category from URL
  const resolvedCategory = useMemo(() => {
    if (selectedCategory) return selectedCategory;
    if (serviceQuery) return normalizeServiceFilter(serviceQuery);
    return null;
  }, [selectedCategory, serviceQuery]);

  const tiers = useMemo(() => {
    if (!resolvedCategory) return [];
    return PACKAGE_TIERS[resolvedCategory] || [];
  }, [resolvedCategory]);

  const currentTier = useMemo(() => {
    if (resolvedCategory !== "wedding" || !tiers.length) return null;
    return tiers.find((t) => t.tier === selectedTier) || tiers.find((t) => t.recommended) || tiers[0] || null;
  }, [tiers, selectedTier, resolvedCategory]);

  const currentSubType = useMemo(
    () => (resolvedCategory === "wedding" ? WEDDING_SUBTYPES.find((s) => s.id === selectedSubType) || WEDDING_SUBTYPES[0] : null),
    [resolvedCategory, selectedSubType]
  );

  // People scale options for non-wedding categories
  const currentPeopleOptions = useMemo(() => {
    if (!resolvedCategory || resolvedCategory === "wedding") return [];
    return PEOPLE_OPTIONS_MAP[resolvedCategory] || PEOPLE_OPTIONS_MAP._default;
  }, [resolvedCategory]);

  const selectedPeopleOption = useMemo(() => {
    if (resolvedCategory === "wedding") return null;
    return currentPeopleOptions.find((o) => o.label === selectedPeopleScale) || currentPeopleOptions[0] || null;
  }, [currentPeopleOptions, selectedPeopleScale, resolvedCategory]);

  const selectedTimeBooked = useMemo(() => isSlotBooked(bookedSlots, shootDate, shootTime), [bookedSlots, shootDate, shootTime]);

  // Find a matching packageId from the API data for submission
  const matchedPackage = useMemo(() => {
    if (!resolvedCategory || !packages.length) return null;
    return packages.find((p) => p.category.slug === resolvedCategory) || packages[0] || null;
  }, [resolvedCategory, packages]);

  const matchedPackageId = useMemo(() => {
    return matchedPackage?.id || 0;
  }, [matchedPackage]);

  const fullServiceName = useMemo(() => {
    if (resolvedCategory === "wedding") {
      const subLabel = currentSubType?.label || "Chụp pre-wedding";
      const tierLabel = currentTier?.label ? ` - Gói ${currentTier.label}` : "";
      return `Dịch vụ cưới: ${subLabel}${tierLabel}`;
    }
    const baseName = matchedPackage?.name || CATEGORY_INFO[resolvedCategory || "all"]?.label || "Gói dịch vụ";
    const scaleLabel = selectedPeopleOption?.label && selectedPeopleOption.label !== "Mặc định" ? ` (${selectedPeopleOption.label})` : "";
    return `${baseName}${scaleLabel}`;
  }, [resolvedCategory, currentSubType, currentTier, matchedPackage, selectedPeopleOption]);

  // ── Price calculation ──
  const basePrice = useMemo(() => {
    if (resolvedCategory === "wedding") {
      return currentTier?.price || 0;
    }
    return matchedPackage?.price || 0;
  }, [resolvedCategory, currentTier, matchedPackage]);

  const subTypeExtra = useMemo(() => {
    if (resolvedCategory === "wedding") {
      return currentSubType?.extra || 0;
    }
    return selectedPeopleOption?.extra || 0;
  }, [resolvedCategory, currentSubType, selectedPeopleOption]);

  const addOnTotal = useMemo(() => {
    return apiAddOns.filter((a) => selectedAddOns.includes(a.id)).reduce((sum, a) => sum + a.price, 0);
  }, [selectedAddOns, apiAddOns]);

  const estimatedTotal = useMemo(() => {
    return basePrice + subTypeExtra + addOnTotal;
  }, [basePrice, subTypeExtra, addOnTotal]);

  const voucherDiscount = useMemo(() => {
    return appliedVoucher ? appliedVoucher.discount_amount : 0;
  }, [appliedVoucher]);

  const finalTotal = useMemo(() => {
    return Math.max(estimatedTotal - voucherDiscount, 0);
  }, [estimatedTotal, voucherDiscount]);

  const depositAmount = useMemo(() => {
    return Math.round(finalTotal * depositPercent / 100);
  }, [finalTotal, depositPercent]);

  const selectedAddOnsDetails = useMemo(
    () => apiAddOns.filter((a) => selectedAddOns.includes(a.id)).map((a) => ({ id: a.id, name: a.name, price: a.price })),
    [selectedAddOns, apiAddOns]
  );

  // ── Effects ──
  // Load draft if it exists on mount
  useEffect(() => {
    try {
      const draftStr = localStorage.getItem("sudion_booking_draft");
      if (draftStr) {
        const draft = JSON.parse(draftStr);
        if (draft.photographerId === photographerId) {
          if (draft.selectedCategory) setSelectedCategory(draft.selectedCategory);
          if (draft.selectedSubType) setSelectedSubType(draft.selectedSubType);
          if (draft.selectedTier) setSelectedTier(draft.selectedTier);
          if (draft.selectedPeopleScale) setSelectedPeopleScale(draft.selectedPeopleScale);
          if (draft.selectedAddOns) setSelectedAddOns(draft.selectedAddOns);
          if (draft.location) setLocation(draft.location);
          if (draft.shootDate) setShootDate(draft.shootDate);
          if (draft.shootTime) setShootTime(draft.shootTime);
          if (draft.specialRequest) setSpecialRequest(draft.specialRequest);
          if (draft.fullName) setFullName(draft.fullName);
          if (draft.email) setEmail(draft.email);
          if (draft.phone) setPhone(draft.phone);
          if (draft.paymentMethod) setPaymentMethod(draft.paymentMethod);
          if ([30, 50, 100].includes(Number(draft.depositPercent))) setDepositPercent(Number(draft.depositPercent) as 30 | 50 | 100);
        }
        localStorage.removeItem("sudion_booking_draft");
      }
    } catch (e) {
      console.error("Lỗi khôi phục draft đặt lịch:", e);
    }
  }, [photographerId]);

  useEffect(() => {
    if (!session) return;
    setFullName((c) => c || session.fullName);
    setEmail((c) => c || session.email);
  }, [session]);

  // Đồng bộ state khi URL thay đổi query params (ví dụ từ gợi ý quay lại trang booking)
  useEffect(() => {
    const service = searchParams.get("service")?.trim();
    if (service) {
      setSelectedCategory(normalizeServiceFilter(service));
    }
    const subtype = searchParams.get("wedding_subtype")?.trim();
    if (subtype) {
      setSelectedSubType(subtype);
    }
  }, [searchParams]);

  // Load booked slots
  useEffect(() => {
    if (!photographerId) return;
    (async () => {
      try {
        const slots = await getBookedSlots(photographerId);
        setBookedSlots(slots);
      } catch (err) {
        console.error("Lỗi lấy lịch bận:", err);
      }
    })();
  }, [photographerId]);

  // Load photographer and ALL packages on mount
  useEffect(() => {
    if (!photographerId) return;

    let active = true;
    (async () => {
      try {
        setIsLoading(true);
        setError("");
        // Fetch with null category to get ALL packages
        const data = await getBookingOptions(photographerId, null);

        if (!active) return;
        setPhotographer(data.photographer);

        if (!data.packages || !data.packages.length) {
          throw new Error("Photographer này chưa có gói dịch vụ.");
        }

        // Normalize package category slugs and save original ones
        const normalizedPackages = data.packages.map((p) => ({
          ...p,
          category: {
            ...p.category,
            originalSlug: p.category.slug,
            slug: normalizeServiceFilter(p.category.slug),
          },
        }));

        setAllPackages(normalizedPackages);

        // Determine initial category
        let initialCat = selectedCategory;
        if (!initialCat) {
          if (serviceQuery) {
            initialCat = normalizeServiceFilter(serviceQuery);
          } else if (normalizedPackages.length > 0) {
            initialCat = normalizedPackages[0].category.slug;
          }
        }

        // Ensure the initial category is valid
        if (initialCat && !normalizedPackages.some(p => p.category.slug === initialCat)) {
          initialCat = normalizedPackages[0].category.slug;
        }

        if (initialCat) {
          setSelectedCategory(initialCat);

          // Set default scale for non-wedding
          if (initialCat !== "wedding") {
            const opts = PEOPLE_OPTIONS_MAP[initialCat] || PEOPLE_OPTIONS_MAP._default;
            setSelectedPeopleScale((curr) => curr || opts[0]?.label || "");
          }
        }

        // Set initial date to today
        const today = new Date();
        setShootDate((curr) => curr || `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`);

      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Không thể tải dữ liệu.");
      } finally {
        if (active) setIsLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [photographerId]);

  // Filter packages locally and load add-ons when selected category changes
  useEffect(() => {
    if (!photographerId || !selectedCategory || !allPackages.length) return;

    // Filter packages locally
    const filtered = allPackages.filter((p) => p.category.slug === selectedCategory);
    setPackages(filtered);

    // Fetch add-ons for the selected category
    let active = true;
    (async () => {
      try {
        const data = await getBookingOptions(photographerId, selectedCategory);
        if (!active) return;
        setApiAddOns(data.addOns || []);
      } catch (err) {
        console.error("Lỗi tải add-ons:", err);
      }
    })();

    return () => {
      active = false;
    };
  }, [photographerId, selectedCategory, allPackages]);

  // Handle changing category
  const handleSelectCategory = useCallback((slug: string) => {
    setSelectedCategory(slug);
    setSelectedSubType("pre-wedding");
    setSelectedTier("standard");
    setSelectedAddOns([]);
    const opts = PEOPLE_OPTIONS_MAP[slug] || PEOPLE_OPTIONS_MAP._default;
    setSelectedPeopleScale(opts[0]?.label || "");
  }, []);

  const toggleAddon = useCallback((id: string) => {
    setSelectedAddOns((c) => (c.includes(id) ? c.filter((x) => x !== id) : [...c, id]));
  }, []);

  const applyVoucherCode = async (code: string) => {
    if (!code.trim()) return;
    setIsApplyingVoucher(true);
    setVoucherError("");
    try {
      const res = await fetch(`${API_URL}/vouchers/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: code.trim(),
          photographerId: photographer?.id,
          bookingValue: estimatedTotal,
          packageId: matchedPackageId,
          targetType: "SERVICE",
          targetId: matchedPackageId ? String(matchedPackageId) : undefined,
          userEmail: email || session?.email
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Không thể áp dụng voucher.");
      }
      setAppliedVoucher(data.data);
      setVoucherInput("");
      setVoucherError("");
    } catch (err: any) {
      setVoucherError(err.message || "Lỗi áp dụng voucher.");
      setAppliedVoucher(null);
    } finally {
      setIsApplyingVoucher(false);
    }
  };

  const handleApplyVoucher = () => {
    applyVoucherCode(voucherInput);
  };

  const handleRemoveVoucher = () => {
    if (appliedVoucher?.campaign_id && matchedPackageId) {
      // User explicitly removed the auto campaign voucher. Do not immediately
      // auto-apply it again for the same package.
      setDismissedCampaignPackageId(String(matchedPackageId));
    }
    setAppliedVoucher(null);
    setVoucherError("");
    setVoucherInput("");
  };

  // Fetch active vouchers for selection
  useEffect(() => {
    if (!photographer?.id) return;

    async function loadActiveVouchers() {
      try {
        const queryParams = new URLSearchParams({
          photographerId: String(photographer.id)
        });
        const userMail = email || session?.email;
        if (userMail) {
          queryParams.append("userEmail", userMail);
        }
        const res = await fetch(`${API_URL}/vouchers/active?${queryParams.toString()}`);
        const result = await res.json();
        if (result.success && Array.isArray(result.data)) {
          setActiveVouchers(result.data);
        }
      } catch (err) {
        console.error("Lỗi tải active vouchers:", err);
      }
    }

    loadActiveVouchers();
  }, [photographer?.id, email, session?.email]);

  // A campaign promotion dismissed by the user is only suppressed for the current package.
  useEffect(() => {
    setDismissedCampaignPackageId(null);
  }, [matchedPackageId]);

  // Auto-reset voucher if estimated total or photographer changes
  useEffect(() => {
    if (appliedVoucher) {
      setAppliedVoucher(null);
      setVoucherError("Lượng tạm tính thay đổi, vui lòng áp dụng lại voucher.");
    }
  }, [estimatedTotal, photographerId]);

  // Tự áp dụng promotion đang ACTIVE của chiến dịch AI.
  // Backend vẫn xác thực lại voucher khi tạo booking nên FE không quyết định giá cuối cùng.
  useEffect(() => {
    if (
      !matchedPackageId ||
      estimatedTotal <= 0 ||
      appliedVoucher ||
      dismissedCampaignPackageId === String(matchedPackageId)
    ) return;

    let active = true;
    const timer = window.setTimeout(async () => {
      try {
        const res = await fetch(`${API_URL}/campaigns/promotions/quote`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            targetType: "SERVICE",
            targetId: String(matchedPackageId),
            baseAmount: estimatedTotal,
          }),
        });
        const result = await res.json().catch(() => ({}));
        const quote = result?.data;
        const promotion = quote?.promotion;

        if (
          active &&
          res.ok &&
          result?.success &&
          promotion?.code &&
          Number(quote?.discountAmount || 0) > 0
        ) {
          setAppliedVoucher({
            id: Number(promotion.voucher_id || promotion.id || 0),
            code: String(promotion.code),
            name: String(promotion.name || promotion.campaign_name || "Ưu đãi chiến dịch"),
            discount_amount: Number(quote.discountAmount || 0),
            campaign_id: Number(promotion.campaign_id || 0) || undefined,
          });
          setVoucherError("");
        }
      } catch (err) {
        // Promotion là tiện ích bổ sung; lỗi quote không được chặn booking bình thường.
        console.warn("Không thể tự áp dụng promotion chiến dịch:", err);
      }
    }, 250);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [matchedPackageId, estimatedTotal, appliedVoucher, dismissedCampaignPackageId]);

  // Keep an already-applied campaign promotion honest while this page stays open.
  // When the campaign ends, is disabled, or no longer targets this package, remove it visually too.
  useEffect(() => {
    if (!appliedVoucher?.campaign_id || !matchedPackageId || estimatedTotal <= 0) return;

    let active = true;
    const verify = async () => {
      try {
        const res = await fetch(`${API_URL}/campaigns/promotions/quote`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            targetType: "SERVICE",
            targetId: String(matchedPackageId),
            baseAmount: estimatedTotal,
          }),
          cache: "no-store",
        });
        const result = await res.json().catch(() => ({}));
        const promotion = result?.data?.promotion;
        const stillSamePromotion =
          res.ok &&
          result?.success &&
          promotion?.code &&
          String(promotion.code).toUpperCase() === String(appliedVoucher.code).toUpperCase();

        if (active && !stillSamePromotion) {
          setAppliedVoucher(null);
          setVoucherInput("");
          setVoucherError("Ưu đãi chiến dịch đã kết thúc hoặc không áp dụng cho gói này.");
        }
      } catch {
        // Network hiccup must not erase a valid voucher; backend validates again on submit.
      }
    };

    const intervalId = window.setInterval(() => void verify(), 10000);
    void verify();
    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, [API_URL, appliedVoucher?.campaign_id, appliedVoucher?.code, matchedPackageId, estimatedTotal]);

  const handleCalPrev = () => {
    if (calMonth === 0) { setCalMonth(11); setCalYear((y) => y - 1); }
    else setCalMonth((m) => m - 1);
  };

  const handleCalNext = () => {
    if (calMonth === 11) { setCalMonth(0); setCalYear((y) => y + 1); }
    else setCalMonth((m) => m + 1);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!photographer) { setSubmitError("Vui lòng chọn đầy đủ thông tin."); return; }
    if (resolvedCategory === "wedding" && !currentTier) { setSubmitError("Vui lòng chọn gói dịch vụ."); return; }
    if (selectedTimeBooked) { setSubmitError("Khung giờ này đã được book."); return; }

    const phoneClean = phone.replace(/\D/g, "");
    const phoneRegex = /^(0[3|5|7|8|9])[0-9]{8}$/;
    if (!phoneRegex.test(phoneClean)) {
      setSubmitError("Số điện thoại không đúng định dạng. Vui lòng nhập số điện thoại Việt Nam hợp lệ gồm 10 chữ số (ví dụ: 0912345678).");
      return;
    }

    // Check authentication. If guest, save draft and prompt modal
    if (!session) {
      const draft = {
        photographerId,
        selectedCategory,
        selectedSubType,
        selectedTier,
        selectedPeopleScale,
        selectedAddOns,
        location,
        shootDate,
        shootTime,
        specialRequest,
        fullName,
        email,
        phone,
        paymentMethod,
        depositPercent,
      };
      localStorage.setItem("sudion_booking_draft", JSON.stringify(draft));
      setShowLoginModal(true);
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitError("");

      const payload = {
        photographerId: photographer.id,
        packageId: matchedPackageId,
        serviceName: fullServiceName,
        packageName: fullServiceName,
        categorySlug: matchedPackage?.category?.originalSlug || resolvedCategory,
        availabilitySlotLabel: shootTime,
        location, shootDate, shootTime,
        peopleScale: resolvedCategory === "wedding" ? (currentSubType?.label || "Chụp pre-wedding") : (selectedPeopleOption?.label || "Mặc định"),
        peopleExtra: subTypeExtra,
        addOnTotal: addOnTotal,
        addOns: selectedAddOnsDetails,
        concept: specialRequest,
        budget: String(finalTotal),
        scene: "",
        paymentMethod,
        depositPercent,
        voucherCode: appliedVoucher ? appliedVoucher.code : undefined,
        customer: {
          fullName: fullName || session?.fullName || "Khách vãng lai",
          phone,
          email: email || session?.email || "guest@sudion.vn",
          contactChannel: "Zalo"
        },
      };

      const res = await fetch(`${API_URL}/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message || "Không thể tạo booking.");

      const bookingCode = json.data.booking_code;

      if (appliedVoucher?.campaign_id) {
        fetch(`${API_URL}/campaigns/${appliedVoucher.campaign_id}/track`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ metric: "booking" }),
          keepalive: true,
        }).catch(() => undefined);
      }

      saveBooking({
        id: bookingCode,
        status: "awaiting_payment",
        createdAt: json.data.created_at || new Date().toISOString(),
        serviceId: String(matchedPackageId),
        serviceName: json.data.service_name || currentSubType?.label || resolvedCategory || "",
        basePrice,
        photographerId: String(photographer.id),
        photographerName: json.data.photographer_name || photographer.full_name,
        availabilitySlotId: "", availabilitySlotLabel: "",
        location, shootDate, shootTime,
        peopleScale: resolvedCategory === "wedding" ? (currentSubType?.label || "Chụp pre-wedding") : (selectedPeopleOption?.label || "Mặc định"),
        peopleExtra: subTypeExtra,
        scene: "", concept: specialRequest, budget: String(finalTotal),
        estimatedTotal: Number(json.data.estimated_total || finalTotal),
        addOnTotal,
        addOns: selectedAddOnsDetails,
        referenceFileName: "", paymentMethod,
        customer: {
          fullName: fullName || session?.fullName || "Khách vãng lai",
          phone,
          email: email || session?.email || "guest@sudion.vn",
          contactChannel: "Zalo"
        },
      });

      toast.redirect({ type: "success", title: "Đã gửi yêu cầu đặt lịch", message: "Booking đã được gửi. Vui lòng chờ xác nhận." });
      router.push(`/booking-request-success/${encodeURIComponent(bookingCode)}`);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Có lỗi xảy ra.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Calendar data ──
  const calendarDays = useMemo(() => getCalendarDays(calYear, calMonth), [calYear, calMonth]);
  const todayStr = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }, []);

  const visibleAddons = useMemo(() => {
    if (apiAddOns && apiAddOns.length > 0) {
      return showMoreAddons ? apiAddOns : apiAddOns.slice(0, 4);
    }
    return showMoreAddons ? ADDON_CARDS : ADDON_CARDS.slice(0, 4);
  }, [apiAddOns, showMoreAddons]);

  // ── Loading / Error states ──
  if (isLoading) return <main className="min-h-screen bg-[#fafbfc]" />;

  if (error) {
    return (
      <main className="min-h-screen bg-[#fafbfc] text-[#0e111d]">
        <section className="mx-auto grid w-full max-w-[860px] gap-5 px-6 py-20">
          <p className="text-xs font-black uppercase tracking-widest text-[#ff8d28]">Không thể đặt lịch</p>
          <h1 className="text-4xl font-black leading-tight">{error}</h1>
          <Link href="/photographer" className="mt-4 inline-flex rounded-lg bg-[#ff8d28] px-5 py-3 text-sm font-bold text-white shadow hover:bg-[#e67d1f]">
            Chọn photographer khác
          </Link>
        </section>
      </main>
    );
  }

  if (!photographer) return null;

  const visibleSubTypes = showMoreSubTypes ? WEDDING_SUBTYPES : WEDDING_SUBTYPES.slice(0, 5);

  // ──────────── JSX ────────────
  return (
    <main className="min-h-screen bg-[#fafbfc] text-[#0e111d] font-sans antialiased">
      <section className="mx-auto w-full max-w-[1200px] px-4 py-8 md:px-6 lg:px-8 lg:py-10 overflow-hidden">
        <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">

          {/* ════════ COLUMN LEFT: Main content ════════ */}
          <div className="grid gap-6">

            {/* ──── SECTION 1: Chọn dịch vụ ──── */}
            <section className="rounded-2xl border border-[#e8eaf1] bg-white p-5 shadow-[0_12px_36px_rgba(20,21,31,0.03)] sm:p-6">
              <h2 className="text-lg font-black text-[#0e111d] flex items-center gap-3">
                <span className="grid h-7 w-7 place-items-center rounded-full bg-[#ff8d28] text-xs font-black text-white">1</span>
                Chọn dịch vụ
              </h2>

              {/* ── Photographer Card (compact – like screenshot 4) ── */}
              <div className="mt-5 flex items-center gap-4 rounded-xl border border-[#e8eaf1] bg-[#fafbfc] p-4">
                <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-[#f3f4f6]">
                  {photographer.avatar_url ? (
                    <Image src={photographer.avatar_url} alt={photographer.full_name} fill className="object-cover" sizes="48px" />
                  ) : (
                    <span className="grid h-full w-full place-items-center text-lg font-black text-[#ff8d28]">
                      {photographer.full_name.charAt(0)}
                    </span>
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-black text-[#0e111d]">{photographer.full_name}</span>
                    <svg className="h-4 w-4 shrink-0 text-[#ff8d28]" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-[#6b7280]">
                    <span className="flex items-center gap-1">
                      <svg className="h-3.5 w-3.5 text-[#facc15] fill-current" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="font-bold text-[#0e111d]">{photographer.avg_rating || "5.0"}</span>
                      <span className="text-[#9ca3af]">({photographer.verification_status === "verified" ? "128" : "0"} đánh giá)</span>
                    </span>
                    <span>• {photographer.active_area || "TP. Hồ Chí Minh"}</span>
                  </div>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {photographerTags.map((tag) => (
                      <span key={tag} className="rounded-full border border-[#e8eaf1] bg-white px-2.5 py-0.5 text-[11px] font-semibold text-[#4b5563]">{tag}</span>
                    ))}
                  </div>
                </div>
                <Link href={`/photographer-profile/${photographer.id}`} className="shrink-0 rounded-lg border border-[#e8eaf1] px-3 py-2 text-xs font-bold text-[#4b5563] transition hover:bg-[#f3f4f6] whitespace-nowrap">
                  Xem profile →
                </Link>
              </div>

              {/* ── Category selector: Vertical portrait cards ── */}
              {!isServiceScoped && (
                <div className="mt-6">
                  <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                    {availableCategories.map((cat) => {
                      const active = resolvedCategory === cat.slug;
                      return (
                        <button key={cat.slug} type="button" onClick={() => handleSelectCategory(cat.slug)}
                          className={`group flex flex-col items-center rounded-xl border p-2.5 text-center transition-all ${active ? "border-[#ff8d28] bg-[#fff4eb] shadow-sm" : "border-[#e8eaf1] bg-white hover:border-[#ffb970]"
                            }`}>
                          <span className="relative aspect-square w-full overflow-hidden rounded-lg bg-[#f3f4f6]">
                            <Image src={cat.image} alt={cat.label} fill className="object-cover" sizes="160px" />
                          </span>
                          <span className={`mt-2 text-[12px] font-bold leading-tight ${active ? "text-[#ff8d28]" : "text-[#4b5563]"}`}>
                            {cat.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ── Sub-type selector (wedding): 3-column compact cards ── */}
              {resolvedCategory === "wedding" && (
                <div className="mt-6">
                  <p className="text-[13px] font-black text-[#0e111d]">Loại hình chụp ảnh</p>
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {visibleSubTypes.map((sub) => {
                      const active = selectedSubType === sub.id;
                      return (
                        <button key={sub.id} type="button" onClick={() => setSelectedSubType(sub.id)}
                          className={`group flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left transition-all ${active ? "border-[#ff8d28] bg-[#fff4eb]" : "border-[#e8eaf1] bg-white hover:border-[#ffb970]"
                            }`}>
                          {/* Radio */}
                          <span className={`h-4 w-4 shrink-0 rounded-full border-2 flex items-center justify-center transition-all ${active ? "border-[#ff8d28]" : "border-[#d1d5db]"}`}>
                            {active && <span className="h-2 w-2 rounded-full bg-[#ff8d28]" />}
                          </span>
                          {/* Image */}
                          <div className="relative h-10 w-12 shrink-0 overflow-hidden rounded-lg bg-[#f3f4f6]">
                            <Image src={sub.image} alt={sub.label} fill className="object-cover" sizes="48px" unoptimized />
                          </div>
                          {/* Text */}
                          <div className="min-w-0 flex-1">
                            <span className={`block text-[11px] font-bold leading-tight ${active ? "text-[#ff8d28]" : "text-[#0e111d]"}`}>
                              {sub.label}
                            </span>
                            <span className="block text-[10px] font-semibold text-[#ff8d28] mt-0.5">
                              {sub.extra > 0 ? `+${formatCurrency(sub.extra)}` : "Giá gốc"}
                            </span>
                          </div>
                        </button>
                      );
                    })}

                    {/* Xem thêm / Thu gọn */}
                    {WEDDING_SUBTYPES.length > 5 && (
                      <button type="button" onClick={() => setShowMoreSubTypes(!showMoreSubTypes)}
                        className="flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-[#d1d5db] bg-white px-3 py-2.5 text-center transition hover:border-[#ff8d28] hover:bg-[#fff4eb]">
                        <svg className={`h-3 w-3 text-[#ff8d28] transition-transform duration-200 ${showMoreSubTypes ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                        <span className="text-[11px] font-bold text-[#4b5563]">
                          {showMoreSubTypes ? "Thu gọn" : `Xem thêm (${WEDDING_SUBTYPES.length - 5})`}
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* ── Dropdown Quy mô (Non-Wedding) ── */}
              {resolvedCategory && resolvedCategory !== "wedding" && currentPeopleOptions.length > 0 && (
                <div className="mt-6">
                  <p className="text-[13px] font-black text-[#0e111d]">Quy mô (Số lượng người / sản phẩm)</p>
                  <div className="mt-3 relative">
                    <select
                      value={selectedPeopleScale}
                      onChange={(e) => setSelectedPeopleScale(e.target.value)}
                      className="w-full bg-white border border-[#e8eaf1] rounded-xl px-4 py-3 text-xs font-bold text-[#4b5563] focus:border-[#ff8d28] focus:ring-1 focus:ring-[#ff8d28] focus:outline-none appearance-none cursor-pointer"
                    >
                      {currentPeopleOptions.map((o) => (
                        <option key={o.label} value={o.label}>
                          {o.label} {o.extra > 0 ? `(+${formatCurrency(o.extra)})` : ""}
                        </option>
                      ))}
                    </select>
                    <svg className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 h-3 w-3 text-[#9ca3af]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              )}

              {/* ── Package Tier selector (Wedding) ── */}
              {resolvedCategory === "wedding" && tiers.length > 0 && (
                <div className="mt-6">
                  <p className="text-[13px] font-black text-[#0e111d]">Chọn gói dịch vụ</p>
                  <div className="mt-3 grid gap-3 sm:grid-cols-3">
                    {tiers.map((tier) => {
                      const active = selectedTier === tier.tier;
                      return (
                        <div key={tier.tier}
                          className={`relative rounded-xl border transition-all flex flex-col ${active ? "border-[#ff8d28] bg-[#fff4eb] shadow-[0_8px_20px_rgba(255,141,40,0.08)]" : "border-[#e8eaf1] bg-white hover:border-[#ffb970]"
                            }`}>
                          {tier.recommended && (
                            <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-[#ff8d28] px-3 py-0.5 text-[9px] font-black text-white whitespace-nowrap uppercase tracking-wider">
                              Popular
                            </span>
                          )}
                          <div className="p-4 flex-1">
                            <span className={`block text-xs font-black uppercase tracking-wider ${active ? "text-[#ff8d28]" : "text-[#6b7280]"}`}>{tier.label}</span>
                            <span className="block mt-1 text-lg font-black text-[#ff8d28]">{formatCurrency(tier.price)}</span>
                            <ul className="mt-3 grid gap-1.5 border-t border-[#f1f3f7] pt-3">
                              {tier.features.map((f) => (
                                <li key={f} className="flex items-start gap-1.5 text-[11px] font-semibold text-[#4b5563]">
                                  <svg className="h-3.5 w-3.5 text-[#ff8d28] shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                  </svg>
                                  {f}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div className="p-4 pt-0">
                            <button type="button" onClick={() => setSelectedTier(tier.tier)}
                              className={`w-full rounded-lg py-2.5 text-xs font-bold transition-all ${active
                                ? "bg-[#ff8d28] text-white shadow"
                                : "border border-[#e8eaf1] bg-white text-[#4b5563] hover:border-[#ff8d28] hover:text-[#ff8d28]"
                                }`}>
                              {active ? "Đã chọn" : "Chọn gói"}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ── Add-on cards (horizontal compact) ── */}
              {resolvedCategory && (
                <div className="mt-6">
                  <p className="text-[13px] font-black text-[#0e111d]">
                    Dịch vụ bổ sung <span className="font-semibold text-[#9ca3af]">(Tùy chọn)</span>
                  </p>
                  <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {visibleAddons.map((addon) => {
                      const active = selectedAddOns.includes(addon.id);
                      const addonImage = getAddonImage(addon.id, resolvedCategory || "all", addon.name);
                      return (
                        <button key={addon.id} type="button" onClick={() => toggleAddon(addon.id)}
                          className={`group flex items-center gap-3 rounded-xl border p-3 text-left transition-all ${active ? "border-[#ff8d28] bg-[#fff4eb]" : "border-[#e8eaf1] bg-white hover:border-[#ffb970]"
                            }`}>
                          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-[#f3f4f6]">
                            <Image src={addonImage} alt={addon.name} fill className="object-cover" sizes="40px" unoptimized />
                          </div>
                          <div className="min-w-0 flex-1">
                            <span className={`block text-[12px] font-bold ${active ? "text-[#ff8d28]" : "text-[#0e111d]"}`}>{addon.name}</span>
                            <span className="block text-[10px] font-semibold text-[#ff8d28]">+{formatCurrency(addon.price)}</span>
                          </div>
                          <span className={`h-4 w-4 shrink-0 rounded border flex items-center justify-center transition-all ${active ? "border-[#ff8d28] bg-[#ff8d28] text-white" : "border-[#d1d5db] bg-white"
                            }`}>
                            {active && (
                              <svg className="h-2.5 w-2.5" fill="none" stroke="currentColor" strokeWidth="3.5" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  {apiAddOns.length > 4 && (
                    <button type="button" onClick={() => setShowMoreAddons(!showMoreAddons)}
                      className="mt-2 flex items-center justify-center gap-2 rounded-xl border border-dashed border-[#d1d5db] bg-white py-2.5 w-full transition hover:border-[#ff8d28]">
                      <svg className={`h-3 w-3 text-[#ff8d28] transition-transform duration-200 ${showMoreAddons ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                      <span className="text-xs font-bold text-[#4b5563]">{showMoreAddons ? "Thu gọn" : "Xem thêm"}</span>
                    </button>
                  )}
                </div>
              )}
            </section>

            {/* ──── SECTION 2: Chọn thời gian ──── */}
            <section className="rounded-2xl border border-[#e8eaf1] bg-white p-5 shadow-[0_12px_36px_rgba(20,21,31,0.03)] sm:p-6">
              <h2 className="text-lg font-black text-[#0e111d] flex items-center gap-3">
                <span className="grid h-7 w-7 place-items-center rounded-full bg-[#ff8d28] text-xs font-black text-white">2</span>
                Chọn thời gian
              </h2>

              {/* Calendar + Time slots side by side */}
              <div className="mt-4 grid gap-5 sm:grid-cols-[1fr_1fr]">
                {/* Calendar */}
                <div className="rounded-xl border border-[#e8eaf1] bg-[#fafbfc] p-4">
                  {/* Month nav */}
                  <div className="flex items-center justify-between">
                    <button type="button" onClick={handleCalPrev} className="grid h-7 w-7 place-items-center rounded-lg border border-[#e8eaf1] bg-white text-xs font-bold text-[#4b5563] transition hover:bg-[#f3f4f6]">
                      <svg className="h-3 w-3 text-[#4b5563]" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <span className="text-xs font-black text-[#0e111d]">{MONTH_NAMES[calMonth]}, {calYear}</span>
                    <button type="button" onClick={handleCalNext} className="grid h-7 w-7 place-items-center rounded-lg border border-[#e8eaf1] bg-white text-xs font-bold text-[#4b5563] transition hover:bg-[#f3f4f6]">
                      <svg className="h-3 w-3 text-[#4b5563]" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                  {/* Day headers */}
                  <div className="mt-3 grid grid-cols-7 gap-1">
                    {DAY_HEADERS.map((d) => (
                      <span key={d} className="py-1 text-center text-[10px] font-bold text-[#9ca3af]">{d}</span>
                    ))}
                  </div>
                  {/* Day cells */}
                  <div className="mt-1 grid grid-cols-7 gap-1">
                    {calendarDays.map((day, i) => {
                      if (day === null) return <span key={`e-${i}`} />;
                      const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                      const isSelected = dateStr === shootDate;
                      const isPast = dateStr < todayStr;
                      const isToday = dateStr === todayStr;
                      return (
                        <button key={dateStr} type="button" disabled={isPast}
                          onClick={() => setShootDate(dateStr)}
                          className={`grid h-8 w-full place-items-center rounded-lg text-xs font-bold transition-all ${isSelected
                            ? "bg-[#ff8d28] text-white shadow"
                            : isToday
                              ? "border border-[#ff8d28] bg-white text-[#ff8d28]"
                              : isPast
                                ? "cursor-not-allowed text-[#d1d5db]"
                                : "text-[#374151] hover:bg-[#fff4eb]"
                            }`}>
                          {day}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Time slots */}
                <div>
                  <p className="text-[12px] font-bold text-[#6b7280] mb-3">Khung giờ chụp</p>
                  <div className="grid grid-cols-2 gap-2">
                    {TIME_SLOTS.map((time) => {
                      const active = shootTime === time;
                      const booked = isSlotBooked(bookedSlots, shootDate, time);
                      return (
                        <button key={time} type="button" disabled={booked}
                          onClick={() => { setShootTime(time); setSubmitError(""); }}
                          className={`rounded-xl border py-2.5 text-center text-xs font-bold transition-all ${booked
                            ? "cursor-not-allowed border-red-200 bg-red-50 text-red-300 line-through"
                            : active
                              ? "border-[#ff8d28] bg-[#ff8d28] text-white shadow-sm"
                              : "border-[#e8eaf1] bg-white text-[#374151] hover:border-[#ffb970]"
                            }`}>
                          {time}
                        </button>
                      );
                    })}
                  </div>
                  {selectedTimeBooked && (
                    <div className="mt-3 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2">
                      <svg className="h-4 w-4 text-red-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                      <p className="text-xs font-bold text-red-600">
                        Khung giờ này đã được book. Vui lòng chọn giờ khác.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {otherServiceOptions.length > 0 && (
              <section className="order-4 rounded-2xl border border-[#e8eaf1] bg-white p-5 shadow-[0_12px_36px_rgba(20,21,31,0.03)] sm:p-6">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-lg font-black text-[#0e111d]">Dịch vụ khác của photographer</h2>
                  <span className="rounded-full border border-[#e8eaf1] bg-[#fafbfc] px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-[#6b7280]">
                    {otherServiceOptions.length}
                  </span>
                </div>

                <div className="mt-4 grid gap-3">
                  {otherServiceOptions.map((service) => (
                    <button
                      key={service.slug}
                      type="button"
                      onClick={() => handleSelectCategory(service.slug)}
                      className="group flex items-center gap-3 rounded-xl border border-[#e8eaf1] bg-[#fafbfc] p-3 text-left transition hover:border-[#ff8d28] hover:bg-[#fff4eb]"
                    >
                      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-[#f3f4f6]">
                        {service.image ? (
                          <Image src={service.image} alt={service.label} fill className="object-cover" sizes="56px" unoptimized />
                        ) : null}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="text-[12px] font-black text-[#0e111d]">{service.label}</div>
                        <div className="mt-0.5 truncate text-[11px] font-medium text-[#6b7280]">{service.name}</div>
                      </div>

                      <div className="text-right">
                        <div className="text-[11px] font-black text-[#ff8d28]">
                          {service.price ? formatCurrency(service.price) : "Liên hệ"}
                        </div>
                        <div className="mt-0.5 text-[10px] font-semibold text-[#9ca3af]">Chọn ngay</div>
                      </div>
                    </button>
                  ))}
                </div>
              </section>
            )}

            {/* ──── SECTION 3: Thông tin đặt lịch ──── */}
            <section className="order-3 rounded-2xl border border-[#e8eaf1] bg-white p-5 shadow-[0_12px_36px_rgba(20,21,31,0.03)] sm:p-6">
              <h2 className="text-lg font-black text-[#0e111d] flex items-center gap-3">
                <span className="grid h-7 w-7 place-items-center rounded-full bg-[#ff8d28] text-xs font-black text-white">3</span>
                Thông tin đặt lịch
              </h2>
              <div className="mt-4 grid gap-4">
                {/* 2-column row */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Địa điểm chụp *">
                    <div className="relative">
                      <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9ca3af] pointer-events-none" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Nhập địa chỉ hoặc tên studio..." className="w-full border border-[#e8eaf1] rounded-xl !pl-10 pr-3 py-2.5 text-xs font-medium focus:border-[#ff8d28] focus:outline-none" />
                    </div>
                  </Field>
                  <Field label="Số điện thoại liên hệ *">
                    <div className="relative">
                      <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9ca3af] pointer-events-none" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                        placeholder="0912345678 (10 chữ số VN)"
                        required
                        maxLength={10}
                        className="w-full border border-[#e8eaf1] rounded-xl !pl-10 pr-3 py-2.5 text-xs font-medium focus:border-[#ff8d28] focus:outline-none"
                      />
                    </div>
                  </Field>
                </div>
                <Field label="Yêu cầu đặc biệt">
                  <div className="relative">
                    <textarea value={specialRequest} onChange={(e) => setSpecialRequest(e.target.value.slice(0, 500))}
                      placeholder="Ghi chú thêm cho photographer về phong cách, trang phục hoặc lưu ý khác..." rows={3} maxLength={500} className="w-full border border-[#e8eaf1] rounded-xl px-3 py-2.5 text-xs font-medium focus:border-[#ff8d28] focus:outline-none resize-none" />
                    <span className="absolute bottom-2 right-3 text-[10px] font-semibold text-[#9ca3af]">{specialRequest.length}/500</span>
                  </div>
                </Field>
              </div>
            </section>
          </div>

          {/* ════════ COLUMN RIGHT: Sticky Sidebar ════════ */}
          <aside className="rounded-2xl border border-[#e8eaf1] bg-white p-5 shadow-[0_12px_36px_rgba(20,21,31,0.04)] lg:sticky lg:top-[100px] min-w-0 overflow-hidden">
            <h3 className="text-sm font-black text-[#0e111d]">Chi tiết đặt lịch</h3>

            {/* Service summary card */}
            {resolvedCategory && (
              <div className="mt-4 flex items-start gap-3 rounded-xl border border-[#f1f3f7] bg-[#fafbfc] p-3">
                <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-[#f3f4f6]">
                  {photographer.avatar_url ? (
                    <Image src={photographer.avatar_url} alt="" fill className="object-cover" sizes="48px" />
                  ) : (
                    <Image src={CATEGORY_INFO[resolvedCategory]?.image || ""} alt="" fill className="object-cover" sizes="48px" />
                  )}
                </span>
                <div className="min-w-0">
                  <p className="text-[13px] font-black text-[#0e111d] truncate">
                    {resolvedCategory === "wedding"
                      ? (currentSubType?.label || "Chụp pre-wedding")
                      : (matchedPackage?.name || CATEGORY_INFO[resolvedCategory]?.label)}
                  </p>
                  <p className="mt-0.5 text-[11px] font-semibold text-[#6b7280]">{photographer.full_name}</p>
                  {resolvedCategory === "wedding" && currentTier && (
                    <p className="mt-0.5 text-[11px] font-bold text-[#ff8d28]">GÓI {currentTier.label.toUpperCase()}</p>
                  )}
                </div>
              </div>
            )}

            {/* Booking details */}
            <div className="mt-4 grid gap-2.5">
              {shootDate && (
                <div className="flex items-center gap-2 text-xs text-[#4b5563]">
                  <svg className="h-4 w-4 text-[#9ca3af] shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="font-semibold">{shootDate.split("-").reverse().join("/")}</span>
                </div>
              )}
              {shootTime && (
                <div className="flex items-center gap-2 text-xs text-[#4b5563]">
                  <svg className="h-4 w-4 text-[#9ca3af] shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-semibold">{shootTime}</span>
                </div>
              )}
              {location && (
                <div className="flex items-center gap-2 text-xs text-[#4b5563]">
                  <svg className="h-4 w-4 text-[#9ca3af] shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="font-semibold">{location}</span>
                </div>
              )}
            </div>

            {/* Voucher Input */}
            <div className="mt-4 border-t border-[#f1f3f7] pt-3">
              <p className="text-[11px] font-black text-[#6b7280] mb-2 uppercase tracking-wider">Mã giảm giá (Voucher)</p>
              {!appliedVoucher ? (
                <div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={voucherInput}
                      onChange={(e) => setVoucherInput(e.target.value)}
                      placeholder="Nhập mã voucher..."
                      className="flex-1 border border-[#e8eaf1] rounded-xl px-3 py-2 text-xs font-semibold focus:border-[#ff8d28] focus:outline-none uppercase"
                    />
                    <button
                      type="button"
                      onClick={handleApplyVoucher}
                      disabled={isApplyingVoucher || !voucherInput.trim()}
                      className="bg-[#ff8d28] text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-[#e67d1f] disabled:opacity-50 transition"
                    >
                      {isApplyingVoucher ? "Đang áp..." : "Áp dụng"}
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowVoucherModal(true)}
                    className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-bold text-[#ff8d28] hover:text-[#e67d1f] hover:underline transition whitespace-nowrap cursor-pointer"
                  >
                    <svg className="h-4 w-4 shrink-0 text-[#ff8d28]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z" />
                    </svg>
                    <span>Chọn từ danh sách voucher {activeVouchers.length > 0 ? `(${activeVouchers.length})` : ""}</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-3 py-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <svg className="h-4 w-4 text-green-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-xs font-black text-green-800 truncate">{appliedVoucher.code}</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveVoucher}
                    className="text-xs font-bold text-red-600 hover:text-red-800"
                  >
                    Gỡ bỏ
                  </button>
                </div>
              )}
              {voucherError && (
                <p className="mt-1.5 text-[10px] font-bold text-red-600">
                  {voucherError}
                </p>
              )}
            </div>

            {/* Price breakdown */}
            <div className="mt-4 border-t border-[#f1f3f7] pt-3 grid gap-2">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-[#6b7280]">Tạm tính</span>
                <span className="font-bold text-[#0e111d]">{formatCurrency(estimatedTotal)}</span>
              </div>
              {addOnTotal > 0 && (
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-[#6b7280]">Phí dịch vụ</span>
                  <span className="font-bold text-[#0e111d]">{formatCurrency(addOnTotal)}</span>
                </div>
              )}
              {appliedVoucher && (
                <div className="flex justify-between text-xs text-green-600">
                  <span className="font-semibold">Giảm giá ({appliedVoucher.code})</span>
                  <span className="font-bold">-{formatCurrency(voucherDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between text-base border-t border-[#f1f3f7] pt-2">
                <span className="font-black text-[#0e111d]">Tổng tiền</span>
                <span className="font-black text-lg text-[#ff8d28]">{formatCurrency(finalTotal)}</span>
              </div>
            </div>

            {/* Deposit */}
            <div className="mt-4 rounded-xl border border-[#fff4eb] bg-[#fffaf5] p-3">
              <p className="mb-2 text-[11px] font-bold text-[#6b7280]">Chọn mức thanh toán trước</p>
              <div className="mb-3 grid grid-cols-3 gap-2">
                {([30, 50, 100] as const).map((percent) => (
                  <button key={percent} type="button" onClick={() => setDepositPercent(percent)} className={`rounded-lg border px-2 py-2 text-xs font-black transition ${depositPercent === percent ? "border-[#ff8d28] bg-[#ff8d28] text-white" : "border-orange-200 bg-white text-slate-600 hover:border-[#ff8d28]"}`}>
                    {percent}%
                  </button>
                ))}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-[#6b7280]">Thanh toán trước ({depositPercent}%)</span>
                <span className="text-sm font-black text-[#ff8d28]">{formatCurrency(depositAmount)}</span>
              </div>
              <p className="mt-1 text-[10px] text-[#9ca3af]">{depositPercent === 100 ? "Thanh toán toàn bộ giá trị booking" : `Thanh toán nốt ${100 - depositPercent}% sau khi hoàn thành buổi chụp`}</p>
            </div>

            {/* Submit error */}
            {submitError && (
              <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-center text-xs font-bold text-red-600">
                {submitError}
              </p>
            )}

            {/* CTA buttons */}
            <button type="submit" disabled={isSubmitting || selectedTimeBooked || !resolvedCategory}
              className="mt-4 w-full rounded-xl bg-[#ff8d28] px-5 py-3.5 text-sm font-black text-white shadow-[0_8px_18px_rgba(255,141,40,0.15)] transition-all hover:translate-y-[-1px] hover:bg-[#e67d1f] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 flex items-center justify-center gap-2">
              {isSubmitting ? "Đang gửi yêu cầu..." : "Tiếp tục thanh toán"}
              {!isSubmitting && (
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              )}
            </button>

            <button
              type="button"
              disabled={selectedTimeBooked || !resolvedCategory}
              onClick={() => {
                if (!session) {
                  const draft = {
                    photographerId, selectedCategory, selectedSubType, selectedTier,
                    selectedPeopleScale, selectedAddOns, location, shootDate, shootTime,
                    specialRequest, fullName, email, phone, paymentMethod, depositPercent,
                  };
                  localStorage.setItem("sudion_booking_draft", JSON.stringify(draft));
                  toast.info("Cần đăng nhập", "Vui lòng đăng nhập để thêm booking vào giỏ hàng.");
                  const returnUrl = `${window.location.pathname}${window.location.search}`;
                  router.push(`/login?redirect=${encodeURIComponent(returnUrl)}`);
                  return;
                }
                if (!photographer) {
                  setSubmitError("Vui lòng chọn đầy đủ thông tin.");
                  return;
                }
                try {
                  addToBookingCart({
                    photographerId: String(photographer.id),
                    photographerName: photographer.full_name,
                    packageId: String(matchedPackageId),
                    packageName: fullServiceName,
                    packageImage: (resolvedCategory && CATEGORY_INFO[resolvedCategory]?.image) || photographer.avatar_url || "",
                    categorySlug: matchedPackage?.category?.originalSlug || resolvedCategory,
                    basePrice,
                    shootDate,
                    shootTime,
                    location,
                    peopleScale: resolvedCategory === "wedding" ? (currentSubType?.label || "Chụp pre-wedding") : (selectedPeopleOption?.label || "Mặc định"),
                    peopleExtra: subTypeExtra,
                    scene: "",
                    concept: specialRequest,
                    budget: String(finalTotal),
                    addOns: selectedAddOnsDetails,
                    estimatedTotal: finalTotal,
                    depositPercent,
                    depositAmount,
                    remainingAmount: finalTotal - depositAmount,
                  });
                  toast.success("Đã thêm vào Giỏ Booking", "Bạn có thể tiếp tục chọn thêm dịch vụ hoặc tới Giỏ hàng để thanh toán gom.");
                } catch (err: any) {
                  toast.error("Trùng lịch trong giỏ", err.message || "Buổi chụp này đã có trong giỏ hàng.");
                }
              }}
              className="mt-2 w-full rounded-xl border border-[#ff8d28] bg-orange-50/50 px-5 py-3 text-sm font-black text-[#ff8d28] shadow-sm transition-all hover:bg-orange-100 disabled:opacity-60 flex items-center justify-center gap-2"
            >
              Thêm vào Giỏ Booking
            </button>

            <button type="button" onClick={() => router.back()}
              className="mt-2 w-full rounded-xl border border-[#e8eaf1] bg-white px-5 py-3 text-sm font-bold text-[#4b5563] transition hover:bg-[#fafbfc]">
              Quay lại
            </button>

            {/* Notes */}
            <div className="mt-4 grid gap-2">
              <p className="flex items-center gap-2 text-[11px] font-semibold text-[#6b7280]">
                <svg className="h-4 w-4 text-[#ff8d28] shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89" />
                </svg>
                Hủy miễn phí trước 48h
              </p>
              <p className="flex items-center gap-2 text-[11px] font-semibold text-[#6b7280]">
                <svg className="h-4 w-4 text-[#ff8d28] shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Bảo mật thông tin khách hàng
              </p>
            </div>
          </aside>
        </form>
      </section>

      {/* ── MODAL ĐĂNG NHẬP (POPUP NỔI) ── */}
      {showLoginModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm transition-all duration-300">
          <div className="w-full max-w-[420px] rounded-2xl border border-[#e5deed] bg-white p-6 shadow-[0_24px_64px_rgba(20,16,35,0.18)] ring-1 ring-black/5">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#fff3eb] text-[#ff8d28]">

              </span>
              <h3 className="text-[17px] font-black text-[#14151f]">
                Yêu cầu đăng nhập
              </h3>
            </div>

            <p className="mt-4 text-[13px] font-medium leading-relaxed text-[#5d5b68]">
              Để tiếp tục gửi yêu cầu đặt lịch chụp và thanh toán cọc, bạn cần đăng nhập tài khoản khách hàng. Hệ thống đã tự động lưu lại toàn bộ các lựa chọn hiện tại của bạn.
            </p>

            <div className="mt-6 flex items-center justify-end gap-2.5 border-t border-[#f1eef6] pt-4">
              <button
                type="button"
                onClick={() => setShowLoginModal(false)}
                className="rounded-xl border border-[#ddd8e8] bg-white px-4 py-2.5 text-[11px] font-black text-[#6c6878] transition hover:bg-[#fafbfc]"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={() => {
                  const currentUrl = window.location.pathname + window.location.search;
                  router.push(`/login?redirect=${encodeURIComponent(currentUrl)}`);
                }}
                className="rounded-xl bg-[#ff8d28] px-5 py-2.5 text-[11px] font-black text-white shadow-sm transition hover:bg-[#e67d1f]"
              >
                Đăng nhập ngay
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL CHỌN VOUCHER (POPUP NỔI) ── */}
      {showVoucherModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm transition-all duration-300">
          <div className="w-full max-w-[480px] rounded-2xl border border-[#e5deed] bg-white p-6 shadow-[0_24px_64px_rgba(20,16,35,0.18)] ring-1 ring-black/5 flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between border-b border-[#f1eef6] pb-4">
              <div className="flex items-center gap-2.5">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-[#fff3eb] text-[#ff8d28]">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z" />
                  </svg>
                </span>
                <h3 className="text-[16px] font-black text-[#14151f]">
                  Danh sách mã giảm giá (Voucher)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowVoucherModal(false)}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mt-4 flex-1 overflow-y-auto pr-1 py-1 space-y-3">
              {activeVouchers.length === 0 ? (
                <div className="text-center py-8 text-gray-500 font-semibold text-xs">
                  Hiện không có mã giảm giá nào khả dụng cho bạn.
                </div>
              ) : (
                activeVouchers.map((v) => {
                  const isMeetMinVal = estimatedTotal >= Number(v.min_booking_value);
                  const isUsed = v.has_used;
                  const isEligible = isMeetMinVal && !isUsed;

                  return (
                    <div
                      key={v.id}
                      className={`relative flex border rounded-xl overflow-hidden min-h-[96px] transition-all duration-200 ${isEligible
                        ? "border-[#ffe2c4] bg-[#fffbf7] shadow-sm hover:shadow"
                        : "border-gray-200 bg-gray-50/50 opacity-65"
                        }`}
                    >
                      {/* Ticket Left Part - Visual Cutout */}
                      <div className={`w-[8px] flex flex-col justify-between py-2 shrink-0 ${isEligible ? "bg-[#ff8d28]/10" : "bg-gray-200/50"
                        }`}>
                        <div className="w-1.5 h-1.5 rounded-full bg-white -ml-0.5 border border-transparent shadow-[inset_-1px_0_0_rgba(0,0,0,0.05)]" />
                        <div className="w-1.5 h-1.5 rounded-full bg-white -ml-0.5 border border-transparent shadow-[inset_-1px_0_0_rgba(0,0,0,0.05)]" />
                        <div className="w-1.5 h-1.5 rounded-full bg-white -ml-0.5 border border-transparent shadow-[inset_-1px_0_0_rgba(0,0,0,0.05)]" />
                      </div>

                      {/* Main Ticket Card Content */}
                      <div className="flex-1 p-3 flex items-center justify-between gap-3 min-w-0">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${isEligible
                              ? "bg-[#ff8d28] text-white"
                              : "bg-gray-300 text-gray-600"
                              }`}>
                              {v.code}
                            </span>
                            <span className="text-[10px] font-bold text-gray-400">
                              {v.type === "platform" ? "Sàn" : "Shop"}
                            </span>
                          </div>

                          <h4 className={`text-xs font-black mt-1.5 truncate ${isEligible ? "text-[#0e111d]" : "text-gray-500"
                            }`}>
                            {v.name}
                          </h4>

                          {v.description && (
                            <p className="text-[10px] text-gray-500 font-semibold mt-0.5 leading-normal line-clamp-1">
                              {v.description}
                            </p>
                          )}

                          <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[9.5px] font-bold text-gray-400">
                            <span>Đơn tối thiểu: {Number(v.min_booking_value).toLocaleString("vi-VN")}đ</span>
                            {v.max_discount_amount && (
                              <>
                                <span>•</span>
                                <span>Tối đa: {Number(v.max_discount_amount).toLocaleString("vi-VN")}đ</span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Right Part: Value & CTA Button */}
                        <div className="flex flex-col items-end justify-between shrink-0 gap-2 h-full min-w-[100px]">
                          <span className={`text-xs font-black text-right ${isEligible ? "text-[#ff8d28]" : "text-gray-400"
                            }`}>
                            {v.discount_type === "percentage"
                              ? `Giảm ${Number(v.discount_value)}%`
                              : `Giảm ${Number(v.discount_value).toLocaleString("vi-VN")}đ`
                            }
                          </span>

                          {isUsed ? (
                            <span className="rounded-lg bg-gray-200 px-3 py-1 text-[10px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                              Đã dùng
                            </span>
                          ) : !isMeetMinVal ? (
                            <span className="text-[9px] font-bold text-red-500 text-right leading-tight max-w-[90px] whitespace-normal">
                              Thiếu {(Number(v.min_booking_value) - estimatedTotal).toLocaleString("vi-VN")}đ
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                applyVoucherCode(v.code);
                                setShowVoucherModal(false);
                              }}
                              className="rounded-lg bg-[#ff8d28] px-3.5 py-1 text-[10px] font-black text-white hover:bg-[#e67d1f] shadow-sm transition-all uppercase tracking-wider whitespace-nowrap"
                            >
                              Áp dụng
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="mt-5 flex items-center justify-end gap-2.5 border-t border-[#f1eef6] pt-4">
              <button
                type="button"
                onClick={() => setShowVoucherModal(false)}
                className="rounded-xl border border-[#ddd8e8] bg-white px-5 py-2.5 text-[11px] font-black text-[#6c6878] transition hover:bg-[#fafbfc]"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

/* ───────── HELPER COMPONENTS ───────── */

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="grid gap-1.5 text-[12px] font-extrabold text-[#0e111d]">
      {label}
      <span className="booking-field">{children}</span>
    </label>
  );
}
