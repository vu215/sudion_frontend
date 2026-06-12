"use client";

import { Suspense, useMemo, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { generateBookingId, saveBooking } from "../booking-store";
import { servicePackages, type ServiceSlug } from "../services/service-data-fresh";

const services = [
  {
    id: "wedding",
    name: "Chụp ảnh cưới",
    price: " 5.000.000 VND",
    basePrice: 5000000,
    peopleOptions: [
      { label: "Pre-Wedding - Cơ bản", price: 5000000 },
      { label: "Pre-Wedding - Tiêu chuẩn", price: 8000000 },
      { label: "Pre-Wedding - Cao cấp", price: 12000000 },
      { label: "Pre-Wedding - Premium", price: 20000000, priceLabel: "20.000.000+ VND" },
      { label: "Ăn hỏi - Cơ bản", price: 3000000 },
      { label: "Ăn hỏi - Tiêu chuẩn", price: 5000000 },
      { label: "Ăn hỏi - Cao cấp", price: 8000000 },
      { label: "Lễ cưới - Cơ bản", price: 5000000 },
      { label: "Lễ cưới - Tiêu chuẩn", price: 8000000 },
      { label: "Lễ cưới - Cao cấp", price: 12000000 },
      { label: "Tiệc cưới - Dưới 100 khách", price: 5000000 },
      { label: "Tiệc cưới - 100-300 khách", price: 8000000 },
      { label: "Tiệc cưới - Trên 300 khách", price: 12000000, priceLabel: "12.000.000+ VND" },
    ],
    image:
      "https://i.pinimg.com/736x/26/e9/6c/26e96c6c35a006344570ac3fdcb44c41.jpg",
  },
  {
    id: "portrait",
    name: "Chụp ảnh đơn",
    price: " 2.500.000 VND",
    basePrice: 2500000,
    peopleOptions: [
      { label: "1 người", price: 2500000 },
    ],
    image:
      "https://i.pinimg.com/736x/9d/4d/50/9d4d50b9b37526003d3a2ce6b799f907.jpg",
  },
  {
    id: "fashion",
    name: "Fashion",
    price: "2.500.000 VND",
    basePrice: 2500000,
    peopleOptions: [
      { label: "1 mẫu", price: 2500000 },
      { label: "2-4 mẫu", price: 4000000 },
      { label: "5+ mẫu", price: 6000000 },
    ],
    image:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=640&q=82",
  },
  {
    id: "couple",
    name: "Chụp ảnh đôi",
    price: " 1.500.000 VND",
    basePrice: 1500000,
    peopleOptions: [
      { label: "2 người", price: 1500000 },
    ],
    image:
      "https://i.pinimg.com/736x/5b/59/1b/5b591b25939e47f8ef1e58e7d19ce2f1.jpg",
  },
  {
    id: "yearbook",
    name: "Chụp kỉ yếu",
    price: "Từ 2.000.000 VND",
    basePrice: 2000000,
    peopleOptions: [
      { label: "10-20 người", price: 2000000 },
      { label: "21-40 người", price: 2800000 },
      { label: "41-60 người", price: 3600000 },
      { label: "60+ người", price: 4600000 },
    ],
    image:
      "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=640&q=82",
  },
  {
    id: "event",
    name: "Sự kiện",
    price: " 1.000.000 VND/giờ",
    basePrice: 1000000,
    peopleOptions: [
      { label: "Dưới 30 khách", price: 1000000 },
      { label: "30-80 khách", price: 1700000 },
      { label: "80-150 khách", price: 2500000 },
      { label: "150+ khách", price: 3800000 },
    ],
    image:
      "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=640&q=82",
  },
  {
    id: "product",
    name: "Food & Product",
    price: " 1.500.000 VND/concept",
    basePrice: 1500000,
    peopleOptions: [
      { label: "1-5 sản phẩm", price: 1500000 },
      { label: "6-15 sản phẩm", price: 3000000 },
      { label: "16-30 sản phẩm", price: 5000000 },
      { label: "30+ sản phẩm - Liên hệ", price: 5000000, priceLabel: "Liên hệ" },
    ],
    image:
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=640&q=82",
  },
  {
    id: "travel",
    name: "Chụp travel",
    price: " 2.000.000 VND",
    basePrice: 2000000,
    peopleOptions: [
      { label: "1 người", price: 2000000 },
      { label: "2 người", price: 2500000 },
      { label: "3-6 người", price: 3500000 },
      { label: "Trên 6 người", price: 5000000 },
    ],
    image:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=640&q=82",
  },
];

const serviceAliases: Record<string, string> = {
  "chụp ảnh đơn": "portrait",
  "ảnh đơn": "portrait",
  portrait: "portrait",
  "chụp ảnh cá nhân": "portrait",
  "chân dung cá nhân": "portrait",
  "chụp ảnh sự kiện": "event",
  "ảnh sự kiện": "event",
  "chụp ảnh kỷ yếu": "yearbook",
  "chụp ảnh kỉ yếu": "yearbook",
  "chụp ảnh ẩm thực": "product",
  "ảnh ẩm thực": "product",
  food: "product",
};

const bookingServiceBySlug: Record<ServiceSlug, string> = {
  wedding: "wedding",
  couple: "couple",
  portrait: "portrait",
  event: "event",
  yearbook: "yearbook",
  travel: "travel",
  food: "product",
};

function resolveServiceId(serviceQuery: string) {
  const normalizedService = serviceQuery.trim().toLowerCase();
  if (!normalizedService) return null;

  const aliasMatch = serviceAliases[normalizedService];
  if (aliasMatch) return aliasMatch;

  const matchedService = services.find(
    (item) =>
      item.id === normalizedService ||
      item.name.toLowerCase() === normalizedService ||
      item.name.toLowerCase().includes(normalizedService),
  );

  return matchedService?.id ?? null;
}

function getPhotographerServiceIds(photographerId: string) {
  const ids = new Set(
    servicePackages
      .filter((item) => item.photographerId === photographerId)
      .map((item) => bookingServiceBySlug[item.serviceSlug]),
  );

  return ids.size ? ids : new Set(services.map((item) => item.id));
}

const timeRanges = [
  { id: "morning", name: "Sáng", label: "Sáng (07:00 - 11:30)", start: "07:00", end: "11:30" },
  { id: "afternoon", name: "Chiều", label: "Chiều (13:00 - 17:30)", start: "13:00", end: "17:30" },
  { id: "evening", name: "Tối", label: "Tối (18:00 - 21:00)", start: "18:00", end: "21:00" },
];

function timeToMinutes(time: string) {
  const [hours = "0", minutes = "0"] = time.split(":");
  return Number(hours) * 60 + Number(minutes);
}

function getTimeRangeId(time: string) {
  if (timeRanges.some((range) => range.id === time)) return time;
  const value = timeToMinutes(time);
  return timeRanges.find((range) => value >= timeToMinutes(range.start) && value <= timeToMinutes(range.end))?.id ?? "";
}

function getTimeRangeLabel(rangeId: string) {
  return timeRanges.find((range) => range.id === rangeId)?.label ?? "";
}

function formatDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function dateFromKey(dateKey: string) {
  return new Date(`${dateKey}T00:00:00`);
}

function formatDayLabel(dateKey: string) {
  return dateFromKey(dateKey).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
  });
}

function getFirstSlotForDateRange(
  slots: Array<{ id: string; date: string; time: string; location: string; label: string }>,
  date: string,
  rangeId: string,
  todayKey: string,
) {
  return [...slots]
    .filter((slot) => slot.date === date && slot.date >= todayKey && getTimeRangeId(slot.time) === rangeId)
    .sort((a, b) => a.time.localeCompare(b.time))[0] ?? null;
}

const contactChannels = ["Zalo", "Điện thoại", "Email"];

const sceneOptions = [
  "Studio",
  "Ngoài trời",
  "Quán cà phê",
  "Bãi biển",
  "Resort / khách sạn",
  "Địa điểm sự kiện",
];

const photographerProfiles = [
  {
    id: "binh-nguyen",
    name: "Bình Nguyễn",
    addOns: ["makeup", "video", "album", "retouch"],
    availableSlots: [
      { id: "binh-0612-am", date: "2026-06-12", time: "09:00", location: "Quận 1, TP.HCM", label: "12/06 · 09:00" },
      { id: "binh-0614-pm", date: "2026-06-14", time: "14:30", location: "Thảo Điền, TP.HCM", label: "14/06 · 14:30" },
      { id: "binh-0618-am", date: "2026-06-18", time: "08:30", location: "Studio trung tâm", label: "18/06 · 08:30" },
    ],
  },
  {
    id: "hao-le",
    name: "Hào Lê",
    addOns: ["makeup", "video", "flycam", "album"],
    availableSlots: [
      { id: "hao-0611-am", date: "2026-06-11", time: "07:30", location: "Đồi cỏ hồng Đà Lạt", label: "11/06 · 07:30" },
      { id: "hao-0615-pm", date: "2026-06-15", time: "15:00", location: "Hồ Xuân Hương", label: "15/06 · 15:00" },
      { id: "hao-0620-am", date: "2026-06-20", time: "08:00", location: "Studio Đà Lạt", label: "20/06 · 08:00" },
    ],
  },
  {
    id: "studio-k",
    name: "Studio K",
    addOns: ["retouch", "stylist"],
    availableSlots: [
      { id: "studiok-0610-am", date: "2026-06-10", time: "10:00", location: "Cầu Giấy, Hà Nội", label: "10/06 · 10:00" },
      { id: "studiok-0613-pm", date: "2026-06-13", time: "13:30", location: "Studio K Hà Nội", label: "13/06 · 13:30" },
      { id: "studiok-0619-am", date: "2026-06-19", time: "09:30", location: "Tây Hồ, Hà Nội", label: "19/06 · 09:30" },
    ],
  },
  {
    id: "hung-trinh",
    name: "Hưng Trịnh",
    addOns: ["makeup", "retouch", "stylist"],
    availableSlots: [
      { id: "hung-0612-pm", date: "2026-06-12", time: "16:00", location: "Vĩnh Long", label: "12/06 · 16:00" },
      { id: "hung-0616-am", date: "2026-06-16", time: "08:00", location: "TP.HCM", label: "16/06 · 08:00" },
      { id: "hung-0621-pm", date: "2026-06-21", time: "14:00", location: "Cần Thơ", label: "21/06 · 14:00" },
    ],
  },
  {
    id: "hoang-anh",
    name: "Hoàng Anh",
    addOns: ["makeup", "video", "flycam"],
    availableSlots: [
      { id: "hoang-0613-am", date: "2026-06-13", time: "07:00", location: "Mỹ Khê, Đà Nẵng", label: "13/06 · 07:00" },
      { id: "hoang-0617-pm", date: "2026-06-17", time: "15:30", location: "Sơn Trà, Đà Nẵng", label: "17/06 · 15:30" },
      { id: "hoang-0622-am", date: "2026-06-22", time: "09:00", location: "Studio Đà Nẵng", label: "22/06 · 09:00" },
    ],
  },
  {
    id: "cong-tuan",
    name: "Công Tuấn",
    addOns: ["retouch", "album"],
    availableSlots: [
      { id: "tuan-0614-am", date: "2026-06-14", time: "08:30", location: "Huế", label: "14/06 · 08:30" },
      { id: "tuan-0618-pm", date: "2026-06-18", time: "14:00", location: "Đại Nội Huế", label: "18/06 · 14:00" },
      { id: "tuan-0623-am", date: "2026-06-23", time: "09:00", location: "Studio Huế", label: "23/06 · 09:00" },
    ],
  },
  {
    id: "studion-match",
    name: "STUDION Match",
    addOns: ["makeup", "video", "album", "retouch"],
    availableSlots: [
      { id: "match-0610-am", date: "2026-06-10", time: "09:00", location: "Hồ Chí Minh", label: "10/06 · 09:00" },
      { id: "match-0612-pm", date: "2026-06-12", time: "14:00", location: "Hồ Chí Minh", label: "12/06 · 14:00" },
      { id: "match-0615-am", date: "2026-06-15", time: "08:30", location: "Hồ Chí Minh", label: "15/06 · 08:30" },
    ],
  },
];

const addOnServices = [
  {
    id: "wedding-makeup",
    name: "Makeup cô dâu",
    note: "Makeup cho gói cưới",
    priceLabel: "1.000.000 - 3.000.000 VND",
    minBudget: 1000000,
    services: ["wedding"],
  },
  {
    id: "fashion-makeup",
    name: "Makeup",
    note: "Makeup cho buổi chụp fashion",
    priceLabel: "500.000 - 1.500.000 VND",
    minBudget: 500000,
    services: ["fashion"],
  },
  {
    id: "travel-makeup",
    name: "Makeup",
    note: "Makeup cho buổi chụp travel",
    priceLabel: "500.000 - 1.200.000 VND",
    minBudget: 500000,
    services: ["travel"],
  },
  {
    id: "wedding-video",
    name: "Quay phim",
    note: "Quay phim cho gói cưới",
    priceLabel: "2.000.000 - 10.000.000 VND",
    minBudget: 2000000,
    services: ["wedding"],
  },
  {
    id: "product-video",
    name: "Video ngắn sản phẩm",
    note: "Video ngắn cho sản phẩm",
    priceLabel: "500.000 - 2.000.000 VND",
    minBudget: 500000,
    services: ["product"],
  },
  {
    id: "fashion-video",
    name: "Quay video lookbook",
    note: "Video lookbook cho fashion",
    priceLabel: "2.000.000 - 10.000.000 VND",
    minBudget: 2000000,
    services: ["fashion"],
  },
  {
    id: "wedding-flycam",
    name: "Flycam",
    note: "Flycam cho gói cưới",
    priceLabel: "1.000.000 - 3.000.000 VND",
    minBudget: 1000000,
    services: ["wedding"],
  },
  {
    id: "travel-flycam",
    name: "Flycam",
    note: "Flycam cho lịch trình travel",
    priceLabel: "800.000 - 1.500.000 VND",
    minBudget: 800000,
    services: ["travel"],
  },
  {
    id: "album",
    name: "Album in ấn",
    note: "Thiết kế và in album",
    priceLabel: "1.500.000 - 5.000.000 VND",
    minBudget: 1500000,
    services: ["wedding"],
  },
  {
    id: "travel-retouch",
    name: "Chỉnh sửa ảnh nâng cao",
    note: "Tính theo ảnh travel",
    priceLabel: "50.000 - 100.000 VND/ảnh",
    minBudget: 50000,
    services: ["travel"],
  },
  {
    id: "product-retouch",
    name: "Retouch cao cấp",
    note: "Tính theo ảnh sản phẩm",
    priceLabel: "50.000 - 200.000 VND/ảnh",
    minBudget: 50000,
    services: ["product"],
  },
  {
    id: "fashion-retouch",
    name: "Chỉnh sửa cao cấp",
    note: "Tính theo ảnh fashion",
    priceLabel: "100.000 - 300.000 VND/ảnh",
    minBudget: 100000,
    services: ["fashion"],
  },
  {
    id: "product-concept",
    name: "Setup concept riêng",
    note: "Setup concept riêng cho sản phẩm",
    priceLabel: "500.000 - 3.000.000 VND",
    minBudget: 500000,
    services: ["product"],
  },
  {
    id: "wedding-concept",
    name: "Concept riêng",
    note: "Concept riêng cho gói cưới",
    priceLabel: "1.000.000 - 10.000.000 VND",
    minBudget: 1000000,
    services: ["wedding"],
  },
  {
    id: "wedding-outside-city",
    name: "Ngoại tỉnh",
    note: "Phụ phí di chuyển ngoại tỉnh cho gói cưới",
    priceLabel: "1.000.000 - 5.000.000 VND",
    minBudget: 1000000,
    services: ["wedding"],
  },
  {
    id: "travel-outside-city",
    name: "Di chuyển ngoại tỉnh",
    note: "Phụ phí di chuyển cho lịch trình travel",
    priceLabel: "500.000 - 1.500.000 VND",
    minBudget: 500000,
    services: ["travel"],
  },
  {
    id: "overnight",
    name: "Qua đêm",
    note: "Chi phí lưu trú theo ngày",
    priceLabel: "1.000.000 VND/ngày",
    minBudget: 1000000,
    services: ["travel"],
  },
  {
    id: "flight-ticket",
    name: "Vé máy bay",
    note: "Khách thanh toán trực tiếp",
    priceLabel: "Khách thanh toán",
    minBudget: 0,
    services: ["travel"],
  },
  {
    id: "entrance-ticket",
    name: "Vé tham quan",
    note: "Khách thanh toán trực tiếp",
    priceLabel: "Khách thanh toán",
    minBudget: 0,
    services: ["travel"],
  },
  {
    id: "extra-product",
    name: "Sản phẩm phát sinh",
    note: "Tính theo từng sản phẩm thêm",
    priceLabel: "150.000 - 300.000 VND/sp",
    minBudget: 150000,
    services: ["product"],
  },
  {
    id: "product-360",
    name: "Chụp 360°",
    note: "Chụp xoay sản phẩm",
    priceLabel: "300.000 - 800.000 VND/sp",
    minBudget: 300000,
    services: ["product"],
  },
  {
    id: "extra-model",
    name: "Mẫu phát sinh",
    note: "Tính theo người mẫu thêm",
    priceLabel: "300.000 - 500.000 VND/người",
    minBudget: 300000,
    services: ["fashion"],
  },
  {
    id: "hair-stylist",
    name: "Hair stylist",
    note: "Hỗ trợ tóc trong buổi chụp",
    priceLabel: "300.000 - 1.000.000 VND",
    minBudget: 300000,
    services: ["fashion"],
  },
  {
    id: "studio-rental",
    name: "Thuê studio",
    note: "Chi phí thuê không gian chụp",
    priceLabel: "500.000 - 3.000.000 VND",
    minBudget: 500000,
    services: ["fashion"],
  },
  {
    id: "wedding-dress",
    name: "Trang phục cưới",
    note: "Thuê trang phục cưới",
    priceLabel: "1.000.000 - 5.000.000 VND",
    minBudget: 1000000,
    services: ["wedding"],
  },
];

function parseBudget(value: string) {
  return Number(value.replace(/\D/g, "")) || 0;
}

function formatCurrency(value: number) {
  return `${value.toLocaleString("vi-VN")} VND`;
}

function getOptionPriceLabel(option: { price?: number; priceLabel?: string }) {
  return option.priceLabel ?? (typeof option.price === "number" ? formatCurrency(option.price) : "");
}

export default function BookingPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-[#fafbfc]" />}>
      <BookingContent />
    </Suspense>
  );
}

function BookingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const photographerId = searchParams.get("photographer") || "studion-match";
  const serviceQuery = searchParams.get("service")?.trim() || "";
  const datesQuery = searchParams.get("dates")?.trim() || "";
  const todayKey = useMemo(() => formatDateKey(new Date()), []);
  const initialShootDate = useMemo(() => {
    const firstDate = datesQuery.split(",").find(Boolean);
    return firstDate && firstDate >= todayKey ? firstDate : "";
  }, [datesQuery, todayKey]);
  const requestedServiceId = useMemo(() => resolveServiceId(serviceQuery), [serviceQuery]);
  const availableServiceIds = useMemo(() => getPhotographerServiceIds(photographerId), [photographerId]);
  const visibleServices = useMemo(
    () => services.filter((item) => availableServiceIds.has(item.id)),
    [availableServiceIds],
  );
  const initialServiceId =
    requestedServiceId && availableServiceIds.has(requestedServiceId)
      ? requestedServiceId
      : visibleServices[0]?.id ?? services[0].id;
  const [selectedService, setSelectedService] = useState(initialServiceId);
  const preferredServiceLabel = serviceQuery && !requestedServiceId ? serviceQuery : null;
  const [peopleByService, setPeopleByService] = useState(() =>
    Object.fromEntries(services.map((item) => [item.id, item.peopleOptions[0].label])),
  );
  const [location, setLocation] = useState("Hồ Chí Minh");
  const [shootDate, setShootDate] = useState(initialShootDate);
  const [shootTime, setShootTime] = useState("");
  const [budget, setBudget] = useState("5.000.000");
  const [scene, setScene] = useState(sceneOptions[0]);
  const [referenceFileName, setReferenceFileName] = useState("");
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);
  const [concept, setConcept] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [contactChannel, setContactChannel] = useState(contactChannels[0]);
  const [selectedSlotId, setSelectedSlotId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("momo");

  const service = useMemo(
    () => services.find((item) => item.id === selectedService) || services[0],
    [selectedService],
  );

  const photographerProfile = useMemo(
    () =>
      photographerProfiles.find((item) => item.id === photographerId) ||
      photographerProfiles[photographerProfiles.length - 1],
    [photographerId],
  );
  const selectedTimeRangeId = getTimeRangeId(shootTime);
  const selectedSlot =
    photographerProfile.availableSlots.find((slot) => slot.id === selectedSlotId) || null;

  const budgetValue = useMemo(() => parseBudget(budget), [budget]);
  const selectedPeopleScale = peopleByService[selectedService] || service.peopleOptions[0].label;
  const selectedPeopleOption =
    service.peopleOptions.find((item) => item.label === selectedPeopleScale) ||
    service.peopleOptions[0];
  const selectedOptionPricing = selectedPeopleOption as { price?: number; extra?: number };
  const selectedPackagePrice = selectedOptionPricing.price ?? service.basePrice + (selectedOptionPricing.extra ?? 0);
  const selectedPackagePriceLabel =
    "priceLabel" in selectedPeopleOption ? selectedPeopleOption.priceLabel : undefined;

  const availableAddOns = useMemo(
    () =>
      addOnServices
        .map((item) => {
          const isOfferedByPhotographer = photographerProfile.addOns.includes(item.id);
          const isWithinBudget = budgetValue >= item.minBudget;
          const isCompatibleService = item.services.includes(selectedService);

          return {
            ...item,
            isOfferedByPhotographer,
            isWithinBudget,
            isVisible: isCompatibleService && (isOfferedByPhotographer || isWithinBudget),
          };
        })
        .filter((item) => item.isVisible),
    [budgetValue, photographerProfile.addOns, selectedService],
  );

  const selectedAddOnsDetails = availableAddOns
    .filter((item) => selectedAddOns.includes(item.id))
    .map((item) => ({ id: item.id, name: item.name, price: item.minBudget, priceLabel: item.priceLabel }));

  const addOnTotal = 0;
  const selectedAddOnNames = selectedAddOnsDetails.map((item) => item.name);
  const estimatedTotal = selectedPackagePrice;
  const selectedTimeRangeLabel = getTimeRangeLabel(selectedTimeRangeId);
  const selectedScheduleLabel =
    shootDate && selectedTimeRangeLabel
      ? `${formatDayLabel(shootDate)} · ${selectedTimeRangeLabel}`
      : "";

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!shootDate || !selectedTimeRangeId) {
      return;
    }

    const bookingId = generateBookingId();
    saveBooking({
      id: bookingId,
      status: "awaiting_payment",
      createdAt: new Date().toISOString(),
      serviceId: service.id,
      serviceName: service.name,
      basePrice: selectedPackagePrice,
      photographerId,
      photographerName: photographerProfile.name,
      availabilitySlotId: selectedSlot?.id ?? `${photographerId}-${shootDate}-${selectedTimeRangeId}`,
      availabilitySlotLabel: selectedSlot?.label ?? selectedScheduleLabel,
      location,
      shootDate,
      shootTime: selectedTimeRangeLabel || shootTime,
      peopleScale: selectedPeopleScale,
      peopleExtra: 0,
      scene,
      concept,
      budget,
      estimatedTotal,
      addOnTotal,
      addOns: selectedAddOnsDetails,
      referenceFileName,
      paymentMethod,
      customer: {
        fullName,
        phone,
        email,
        contactChannel,
      },
    });

    router.push(`/booking-success?id=${encodeURIComponent(bookingId)}`);
  };

  const paymentMethods = [
    { id: "momo", name: "MoMo", mark: "M" },
    { id: "vnpay", name: "VNPay", mark: "QR" },
    { id: "bank", name: "Chuyển khoản", mark: "B" },
  ];

  const depositAmount = Math.round(estimatedTotal * 0.5);
  const remainingAmount = estimatedTotal - depositAmount;
  const canSubmit = Boolean(shootDate && selectedTimeRangeId);

  const toggleAddOn = (id: string) => {
    setSelectedAddOns((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  };

  return (
    <main className="min-h-screen bg-[#fafbfc] text-[#0e111d]">
      <section className="mx-auto w-full max-w-[1440px] px-4 py-8 sm:px-6 sm:py-12 md:px-12 lg:px-20 lg:py-16">
        <div className="grid gap-3">
          <p data-reveal className="text-[12px] font-black uppercase tracking-[0.18em] text-[#ff8d28]">
            Booking request
          </p>
          <h1 data-reveal data-reveal-delay="80" className="max-w-[760px] text-[32px] font-black leading-[1.08] text-[#0e111d] sm:text-[46px]">
            Đặt lịch chụp
          </h1>
         
        </div>

        <form onSubmit={handleSubmit} className="mt-7 grid gap-5 sm:mt-10 sm:gap-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start xl:grid-cols-[minmax(0,1fr)_400px]">
          <div className="grid gap-5 sm:gap-6">
            <section data-reveal data-reveal-delay="220" className="booking-panel rounded-[16px] border border-[#e8eaf1] bg-white p-4 shadow-[0_16px_42px_rgba(20,21,31,0.045)] sm:rounded-[18px] sm:p-6">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-[12px] font-black uppercase tracking-[0.16em] text-[#ff8d28]">
                    Bước 1
                  </p>
                  <h2 className="mt-2 text-[20px] font-black leading-tight text-[#0e111d] sm:text-[22px]">
                    Chọn dịch vụ
                  </h2>
                  {preferredServiceLabel ? (
                    <p className="mt-2 text-sm text-[#6b7280]">
                      Dịch vụ gợi ý từ trang profile: <span className="font-semibold text-[#0e111d]">{preferredServiceLabel}</span>
                    </p>
                  ) : null}
                </div>
                <span className="hidden rounded-full bg-[#fcf2e9] px-3 py-1.5 text-[12px] font-extrabold text-[#ff8d28] sm:inline-flex">
                  {service.price}
                </span>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {visibleServices.map((item, index) => {
                  const active = item.id === selectedService;
                  const selectedOptionLabel = peopleByService[item.id] || item.peopleOptions[0].label;
                  const selectedOption =
                    item.peopleOptions.find((option) => option.label === selectedOptionLabel) ||
                    item.peopleOptions[0];
                  const priceLabel = getOptionPriceLabel(selectedOption);

                  return (
                    <article
                      key={item.id}
                      onClick={() => setSelectedService(item.id)}
                      data-reveal
                      data-reveal-delay={`${260 + index * 55}`}
                      className={`group grid cursor-pointer grid-cols-[104px_minmax(0,1fr)] overflow-hidden rounded-[14px] border text-left transition-all sm:block ${
                        active
                          ? "border-[#ff8d28] bg-[#fff7ef] shadow-[0_10px_24px_rgba(255,141,40,0.12)]"
                          : "border-[#e8eaf1] bg-white hover:border-[#ffcfaa]"
                      }`}
                    >
                      <span className="relative block h-full min-h-[154px] overflow-hidden bg-[#f2f4f8] sm:aspect-[16/9] sm:h-auto sm:min-h-0">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 360px"
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <span className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/45 to-transparent" />
                      </span>
                      <span className="block min-w-0 p-3 sm:p-4">
                        <span className="block text-[15px] font-black text-[#0e111d]">
                          {item.name}
                        </span>
                        <span className="mt-2 block text-[16px] font-bold text-[#ff8d28]">
                          {priceLabel ? ` ${priceLabel}` : item.price}
                        </span>
                        
                        <span className="mt-3 grid gap-2 sm:mt-4">
                          <span className="text-[11px] font-black uppercase tracking-[0.12em] text-[#8a8fa1]">
                            Quy mô
                          </span>
                          <span className="booking-field">
                            <select
                              value={peopleByService[item.id]}
                              onClick={(event) => event.stopPropagation()}
                              onChange={(event) => {
                                setSelectedService(item.id);
                                setPeopleByService((current) => ({
                                  ...current,
                                  [item.id]: event.target.value,
                                }));
                              }}
                              aria-label={`Quy mô cho ${item.name}`}
                            >
                              {item.peopleOptions.map((option) => (
                                <option key={option.label} value={option.label}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          </span>
                        </span>
                      </span>
                    </article>
                  );
                })}
              </div>
            </section>

            <section data-reveal data-reveal-delay="300" className="booking-panel rounded-[16px] border border-[#e8eaf1] bg-white p-4 shadow-[0_16px_42px_rgba(20,21,31,0.045)] sm:rounded-[18px] sm:p-6">
              <p className="text-[12px] font-black uppercase tracking-[0.16em] text-[#ff8d28]">
                Bước 2
              </p>
              <h2 className="mt-2 text-[20px] font-black leading-tight text-[#0e111d] sm:text-[22px]">
                Chọn lịch rảnh
              </h2>
              <p className="mt-2 text-[13px] font-semibold leading-6 text-[#6b7280]">
                Chọn ngày bằng ô lịch bên dưới, có thể chuyển sang tháng sau hoặc các tháng tiếp theo. Ngày đã qua sẽ không chọn được.
              </p>

              <div className="mt-5 rounded-[14px] border border-[#e8eaf1] bg-[#fafbfc] px-4 py-3">
                {shootDate && selectedTimeRangeId ? (
                  <p className="text-[12px] font-semibold leading-5 text-[#6b7280]">
                    Lịch đang chọn: <span className="font-black text-[#0e111d]">{formatDayLabel(shootDate)}</span> · {getTimeRangeLabel(selectedTimeRangeId)}
                  </p>
                ) : (
                  <p className="text-[12px] font-semibold leading-5 text-[#b45309]">
                    Chọn ngày chụp và khung giờ để tiếp tục.
                  </p>
                )}
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2 sm:gap-4">
                <Field label="Địa điểm chụp">
                  <input value={location} onChange={(event) => setLocation(event.target.value)} placeholder="Ví dụ: Đà Lạt" />
                </Field>
                <Field label="Ngày chụp">
                  <input
                    type="date"
                    min={todayKey}
                    value={shootDate}
                    onChange={(event) => {
                      const nextDate = event.target.value;
                      setShootDate(nextDate);
                      setSelectedSlotId("");
                    }}
                  />
                </Field>
                <Field label="Khung giờ">
                  <select
                    value={selectedTimeRangeId}
                    disabled={!shootDate}
                    onChange={(event) => {
                      const nextRangeId = event.target.value;
                      const nextSlot = getFirstSlotForDateRange(
                        photographerProfile.availableSlots,
                        shootDate,
                        nextRangeId,
                        todayKey,
                      );
                      setShootTime(nextRangeId);
                      setSelectedSlotId(nextSlot?.id ?? "");
                      if (nextSlot) setLocation(nextSlot.location);
                    }}
                  >
                    <option value="" disabled>
                      Chọn khung giờ
                    </option>
                    {timeRanges.map((range) => (
                      <option key={range.id} value={range.id}>
                        {range.label}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Ngân sách dự kiến">
                  <input value={budget} onChange={(event) => setBudget(event.target.value)} placeholder="5.000.000" />
                </Field>
                <Field label="Kênh liên hệ ưu tiên">
                  <select value={contactChannel} onChange={(event) => setContactChannel(event.target.value)}>
                    {contactChannels.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Bối cảnh mong muốn">
                    <select value={scene} onChange={(event) => setScene(event.target.value)}>
                      {sceneOptions.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </Field>
                
                <div className="sm:col-span-2">
                  <Field label="Concept hoặc ghi chú">
                    <textarea
                      value={concept}
                      onChange={(event) => setConcept(event.target.value)}
                      placeholder="Mô tả mood, phong cách ảnh, địa điểm mong muốn hoặc link moodboard."
                      rows={4}
                    />
                  </Field>
                </div>
              </div>
            </section>

            <section data-reveal data-reveal-delay="380" className="booking-panel rounded-[16px] border border-[#e8eaf1] bg-white p-4 shadow-[0_16px_42px_rgba(20,21,31,0.045)] sm:rounded-[18px] sm:p-6">
              <p className="text-[12px] font-black uppercase tracking-[0.16em] text-[#ff8d28]">
                Bước 3
              </p>
              <h2 className="mt-2 text-[20px] font-black leading-tight text-[#0e111d] sm:text-[22px]">
                Yêu cầu sáng tạo
              </h2>

              <div className="mt-5 grid gap-5">
                <label data-reveal data-reveal-delay="420" className="group grid cursor-pointer gap-3 rounded-[16px] border border-dashed border-[#ffd2ad] bg-[#fffaf5] px-4 py-5 text-center transition-colors hover:bg-[#fff4eb] sm:px-5 sm:py-6">
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      setReferenceFileName(file?.name || "");
                    }}
                  />
                  <span className="mx-auto grid h-11 w-11 place-items-center rounded-full bg-white text-[#ff8d28] shadow-[0_8px_18px_rgba(255,141,40,0.12)]">
                    <UploadIcon className="h-5 w-5" />
                  </span>
                  <span className="text-[14px] font-black text-[#0e111d]">
                    Tải ảnh minh họa phong cách mong muốn
                  </span>
                  <span className="text-[12px] font-semibold leading-5 text-[#6b7280]">
                    JPG, PNG hoặc WebP. File này chỉ dùng để photographer hiểu mood/concept của bạn.
                  </span>
                  {referenceFileName ? (
                    <span className="mx-auto max-w-full truncate rounded-full bg-white px-3 py-1.5 text-[12px] font-extrabold text-[#ff8d28]">
                      {referenceFileName}
                    </span>
                  ) : null}
                </label>

                <div>
                  <p className="text-[13px] font-extrabold text-[#0e111d]">
                    Dịch vụ đi kèm
                  </p>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    {availableAddOns.map((item, index) => {
                      const active = selectedAddOns.includes(item.id);

                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => toggleAddOn(item.id)}
                          aria-pressed={active}
                          data-reveal
                          data-reveal-delay={`${480 + index * 45}`}
                          className={`flex items-start gap-3 rounded-[14px] border p-3 text-left transition-all sm:p-4 ${
                            active
                              ? "border-[#ff8d28] bg-[#fff7ef] shadow-[0_10px_24px_rgba(255,141,40,0.1)]"
                              : "border-[#e8eaf1] bg-white hover:border-[#ffcfaa]"
                          }`}
                        >
                          <span
                            className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-[6px] border ${
                              active
                                ? "border-[#ff8d28] bg-[#ff8d28] text-white"
                                : "border-[#d7dbe6] bg-white text-transparent"
                            }`}
                          >
                            <CheckIcon className="h-3.5 w-3.5" />
                          </span>
                          <span>
                            <span className="flex flex-wrap items-center gap-2">
                              <span className="text-[14px] font-black text-[#0e111d]">
                                {item.name}
                              </span>
                              {item.isOfferedByPhotographer ? (
                                <span className="rounded-full bg-[#eaf7ee] px-2 py-1 text-[10px] font-extrabold text-[#16a34a]">
                                  Có trong photographer
                                </span>
                              ) : (
                                <span className="rounded-full bg-[#fcf2e9] px-2 py-1 text-[10px] font-extrabold text-[#ff8d28]">
                                  Hợp ngân sách
                                </span>
                              )}
                            </span>
                            <span className="mt-1 block text-[12px] font-semibold leading-5 text-[#6b7280]">
                              {item.note} · {item.priceLabel ?? `Từ ${item.minBudget.toLocaleString("vi-VN")} VND`}
                            </span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  {availableAddOns.length === 0 ? (
                    <div className="mt-3 rounded-[14px] border border-[#e8eaf1] bg-[#fafbfc] px-4 py-5 text-[13px] font-semibold leading-6 text-[#6b7280]">
                      Chưa có dịch vụ đi kèm phù hợp với dịch vụ chính hoặc ngân sách hiện tại. Hãy tăng ngân sách hoặc đổi dịch vụ để xem thêm gợi ý.
                    </div>
                  ) : null}
                </div>
              </div>
            </section>

            <section data-reveal data-reveal-delay="460" className="booking-panel rounded-[16px] border border-[#e8eaf1] bg-white p-4 shadow-[0_16px_42px_rgba(20,21,31,0.045)] sm:rounded-[18px] sm:p-6">
              <p className="text-[12px] font-black uppercase tracking-[0.16em] text-[#ff8d28]">
                Bước 4
              </p>
              <h2 className="mt-2 text-[20px] font-black leading-tight text-[#0e111d] sm:text-[22px]">
                Thông tin liên hệ
              </h2>

              <div className="mt-5 grid gap-3 sm:grid-cols-2 sm:gap-4">
                <Field label="Họ và tên">
                  <input value={fullName} onChange={(event) => setFullName(event.target.value)} placeholder="Nguyễn Minh Anh" required />
                </Field>
                <Field label="Số điện thoại">
                  <input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="090..." required />
                </Field>
                <div className="sm:col-span-2">
                  <Field label="Email">
                    <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@sudion.vn" required />
                  </Field>
                </div>
              </div>
            </section>
          </div>

          <aside data-reveal data-reveal-delay="300" className="booking-summary flex flex-col rounded-[16px] border border-[#e8eaf1] bg-white p-4 shadow-[0_16px_42px_rgba(20,21,31,0.06)] sm:rounded-[18px] sm:p-5 lg:sticky lg:top-[112px]">
            <div className="flex shrink-0 items-start justify-between gap-4 border-b border-[#f1f3f7] pb-3">
              <div>
                <p className="text-[12px] font-black uppercase tracking-[0.16em] text-[#ff8d28]">
                  Tóm tắt
                </p>
                <h2 className="mt-1.5 text-[20px] font-black leading-tight text-[#0e111d]">
                  Yêu cầu đặt lịch
                </h2>
              </div>
              <span className="rounded-full bg-[#fff7ef] px-3 py-1.5 text-[11px] font-extrabold text-[#ff8d28]">
                Chưa gửi
              </span>
            </div>

            <div className="grid gap-2.5 py-3">
              <SummaryRow label="Dịch vụ" value={service.name} />
              <SummaryRow label="Photographer" value={photographerProfile.name} />
              <SummaryRow label="Giá gói" value={selectedPackagePriceLabel ?? formatCurrency(selectedPackagePrice)} />
              <SummaryRow label="Địa điểm" value={location || "Chưa chọn"} />
              <SummaryRow label="Ngày chụp" value={shootDate || "Chưa chọn"} />
              <SummaryRow label="Khung giờ" value={selectedTimeRangeLabel || "Chưa chọn"} />
              <SummaryRow label="Quy mô" value={selectedPeopleScale} />
              <SummaryRow label="Tạm tính" value={formatCurrency(estimatedTotal)} />
              <SummaryRow label="Bối cảnh" value={scene || "Chưa chọn"} />
              <SummaryRow label="Ảnh minh họa" value={referenceFileName || "Chưa tải"} />
              <SummaryRow
                label="Dịch vụ kèm"
                value={selectedAddOnNames.length ? selectedAddOnNames.join(", ") : "Chưa chọn"}
              />
              <SummaryRow label="Ngân sách" value={budget ? `${budget} VND` : "Chưa nhập"} />
              <SummaryRow label="Liên hệ qua" value={contactChannel} />
            </div>

            <div className="shrink-0 border-t border-[#f1f3f7] pt-3">
              <div className="mt-4 rounded-[18px] border border-[#e8eaf1] bg-[#fffaf5] p-4">
              <p className="text-[13px] font-bold uppercase tracking-[0.14em] text-[#ff8d28]">
                Chọn phương thức thanh toán
              </p>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {paymentMethods.map((method) => {
                  const active = method.id === paymentMethod;

                  return (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setPaymentMethod(method.id)}
                      aria-pressed={active}
                      className={`flex min-h-[56px] flex-col items-center justify-center gap-1 rounded-[12px] border px-3 py-2 text-center transition-all ${
                        active
                          ? "border-[#ff8d28] bg-[#fff4eb] text-[#ff8d28]"
                          : "border-[#d8dce8] bg-white text-[#4b5563] hover:border-[#ffcfaa]"
                      }`}
                    >
                      <span className={`grid h-8 w-8 place-items-center rounded-full text-[12px] font-black ${
                        active ? "bg-[#ff8d28] text-white" : "bg-[#f3f4f6] text-[#6b7280]"
                      }`}>
                        {method.mark}
                      </span>
                      <span className="text-[12px] font-black leading-4">{method.name}</span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 grid gap-3 rounded-[14px] border border-[#f1f3f7] bg-white p-4">
                <div className="flex items-center justify-between gap-3 text-[13px] font-semibold text-[#4b5563]">
                  <span>Tiền cọc (50%)</span>
                  <span className="text-[15px] font-black text-[#ff8d28]">{formatCurrency(depositAmount)}</span>
                </div>
                <div className="flex items-center justify-between gap-3 text-[13px] font-semibold text-[#4b5563]">
                  <span>Còn lại</span>
                  <span className="text-[15px] font-black text-[#0e111d]">{formatCurrency(remainingAmount)}</span>
                </div>
              </div>
            </div>
            <button
                type="submit"
                disabled={!canSubmit}
                className="w-full rounded-lg bg-[#ff8d28] px-5 py-3.5 text-[14px] font-extrabold text-white shadow-[0_8px_18px_rgba(255,141,40,0.18)] transition-all hover:translate-y-[-1px] hover:bg-[#e0751b] disabled:cursor-not-allowed disabled:bg-[#d0d5dd] disabled:shadow-none disabled:hover:translate-y-0"
              >
                Gửi yêu cầu đặt lịch
              </button>

              <p className="mt-2 text-center text-[11px] font-semibold leading-4 text-[#6b7280]">
                STUDION sẽ xác nhận thông tin trước khi thanh toán.
              </p>
            </div>
          </aside>
        </form>
      </section>
    </main>
  );
}

function UploadIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M10 13V4M10 4L6.5 7.5M10 4L13.5 7.5" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 13.5V15.5C4 16.3 4.7 17 5.5 17H14.5C15.3 17 16 16.3 16 15.5V13.5" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M5 10.3L8.3 13.5L15 6.5" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="grid gap-2 text-[13px] font-extrabold text-[#0e111d]">
      {label}
      <span className="booking-field">{children}</span>
    </label>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex min-w-0 items-start justify-between gap-3">
      <span className="shrink-0 text-[12px] font-bold text-[#8a8fa1]">{label}</span>
      <span className="min-w-0 max-w-[60%] break-words text-right text-[13px] font-extrabold leading-5 text-[#0e111d] sm:max-w-[190px]">
        {value}
      </span>
    </div>
  );
}
