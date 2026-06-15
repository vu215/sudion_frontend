"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/app/auth-context";
import { saveBooking } from "../booking-store";
import { useToast } from "@/app/toast-context";
const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

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
};

type BookingPackage = {
  id: number;
  name: string;
  price: number;
  description: string | null;
  duration: string | number | null;
  worker_count: number | null;
  max_customer_count: number | null;
  category: {
    id: number;
    name: string;
    slug: string;
    description: string | null;
  };
};

type BookedSlot = {
  booking_code: string;
  photographer_id: string;
  shoot_date: string;
  shoot_time: string;
  status: string;
};

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
  error?: unknown;
};

type BookingOptionsData = {
  photographer: BookingPhotographer;
  packages: BookingPackage[];
};

type PeopleOption = {
  label: string;
  extra: number;
};

type UiService = {
  packageId: number;
  id: string;
  categorySlug: string;
  name: string;
  packageName: string;
  price: string;
  basePrice: number;
  duration: string;
  image: string;
  description: string;
  peopleOptions: PeopleOption[];
};

type Slot = {
  id: string;
  date: string;
  time: string;
  location: string;
  label: string;
};

const DEFAULT_PEOPLE_OPTIONS: PeopleOption[] = [
  { label: "1 người", extra: 0 },
  { label: "2 người", extra: 300000 },
  { label: "3-5 người", extra: 600000 },
];

const SERVICE_META: Record<
  string,
  {
    image: string;
    duration: string;
    peopleOptions: PeopleOption[];
  }
> = {
  wedding: {
    duration: "Nửa ngày - cả ngày",
    peopleOptions: [
      { label: "2-10 người", extra: 0 },
      { label: "11-30 người", extra: 1200000 },
      { label: "31-80 người", extra: 2500000 },
      { label: "Trên 80 người", extra: 4000000 },
    ],
    image:
      "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=640&q=82",
  },
  portrait: {
    duration: "Studio hoặc ngoại cảnh",
    peopleOptions: [
      { label: "1 người", extra: 0 },
      { label: "2 người", extra: 300000 },
      { label: "3-5 người", extra: 600000 },
    ],
    image:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=640&q=82",
  },
  fashion: {
    duration: "Lookbook thương hiệu",
    peopleOptions: [
      { label: "1 người", extra: 0 },
      { label: "2-4 người", extra: 600000 },
      { label: "5-10 người", extra: 1200000 },
    ],
    image:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=640&q=82",
  },
  couple: {
    duration: "2 - 3 giờ",
    peopleOptions: [
      { label: "2 người", extra: 0 },
      { label: "3-5 người", extra: 500000 },
      { label: "6-10 người", extra: 1000000 },
    ],
    image:
      "https://images.unsplash.com/photo-1523438885200-e635ba2c371e?auto=format&fit=crop&w=640&q=82",
  },
  yearbook: {
    duration: "Theo lớp/nhóm",
    peopleOptions: [
      { label: "10-20 người", extra: 0 },
      { label: "21-40 người", extra: 800000 },
      { label: "41-60 người", extra: 1600000 },
      { label: "Trên 60 người", extra: 2600000 },
    ],
    image:
      "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=640&q=82",
  },
  event: {
    duration: "Theo giờ",
    peopleOptions: [
      { label: "Dưới 30 khách", extra: 0 },
      { label: "30-80 khách", extra: 700000 },
      { label: "80-150 khách", extra: 1500000 },
      { label: "Trên 150 khách", extra: 2800000 },
    ],
    image:
      "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=640&q=82",
  },
  food: {
    duration: "Theo concept",
    peopleOptions: [
      { label: "1-5 sản phẩm", extra: 0 },
      { label: "6-15 sản phẩm", extra: 600000 },
      { label: "16-30 sản phẩm", extra: 1400000 },
      { label: "Trên 30 sản phẩm", extra: 2400000 },
    ],
    image:
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=640&q=82",
  },
  product: {
    duration: "Theo concept",
    peopleOptions: [
      { label: "1-5 sản phẩm", extra: 0 },
      { label: "6-15 sản phẩm", extra: 600000 },
      { label: "16-30 sản phẩm", extra: 1400000 },
      { label: "Trên 30 sản phẩm", extra: 2400000 },
    ],
    image:
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=640&q=82",
  },
  travel: {
    duration: "Theo lịch trình",
    peopleOptions: [
      { label: "1 người", extra: 0 },
      { label: "2 người", extra: 300000 },
      { label: "3-6 người", extra: 900000 },
      { label: "Nhóm trên 6 người", extra: 1800000 },
    ],
    image:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=640&q=82",
  },
  family: {
    duration: "Gia đình / nhóm nhỏ",
    peopleOptions: [
      { label: "2-5 người", extra: 0 },
      { label: "6-10 người", extra: 500000 },
      { label: "Trên 10 người", extra: 1200000 },
    ],
    image:
      "https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=640&q=82",
  },
  commercial: {
    duration: "Theo dự án",
    peopleOptions: [
      { label: "1 concept", extra: 0 },
      { label: "2-3 concept", extra: 1000000 },
      { label: "Trên 3 concept", extra: 2500000 },
    ],
    image:
      "https://images.unsplash.com/photo-1556742044-3c52d6e88c62?auto=format&fit=crop&w=640&q=82",
  },
};

const contactChannels = ["Zalo", "Điện thoại", "Email"];

const sceneOptions = [
  "Studio",
  "Ngoài trời",
  "Quán cà phê",
  "Bãi biển",
  "Resort / khách sạn",
  "Địa điểm sự kiện",
];

const addOnServices = [
  {
    id: "makeup",
    name: "Makeup",
    note: "Artist đi cùng buổi chụp",
    minBudget: 1500000,
    services: ["wedding", "couple", "yearbook", "event", "travel"],
  },
  {
    id: "video",
    name: "Video highlight",
    note: "Clip ngắn hậu kỳ",
    minBudget: 2500000,
    services: ["wedding", "couple", "yearbook", "event", "travel"],
  },
  {
    id: "flycam",
    name: "Flycam",
    note: "Góc quay/chụp từ trên cao",
    minBudget: 5000000,
    services: ["wedding", "event", "travel"],
  },
  {
    id: "album",
    name: "Album in ấn",
    note: "Thiết kế và in album",
    minBudget: 3000000,
    services: ["wedding", "couple", "yearbook", "travel"],
  },
  {
    id: "retouch",
    name: "Retouch nâng cao",
    note: "Chỉnh sửa chi tiết hơn",
    minBudget: 1200000,
    services: [
      "wedding",
      "couple",
      "yearbook",
      "event",
      "food",
      "product",
      "travel",
      "portrait",
    ],
  },
  {
    id: "stylist",
    name: "Stylist",
    note: "Hỗ trợ concept/trang phục",
    minBudget: 4000000,
    services: [
      "wedding",
      "couple",
      "food",
      "product",
      "travel",
      "fashion",
      "commercial",
    ],
  },
];

function parseBudget(value: string) {
  return Number(value.replace(/\D/g, "")) || 0;
}

function formatCurrency(value: number) {
  return `${Number(value || 0).toLocaleString("vi-VN")} VND`;
}

function normalizeText(value: string) {
  return value.toLowerCase().trim();
}

function normalizeDate(value: string) {
  return String(value || "").slice(0, 10);
}

function normalizeTime(value: string) {
  return String(value || "").slice(0, 5);
}

function isSlotBookedByList(
  bookedSlots: BookedSlot[],
  date: string,
  time: string
) {
  return bookedSlots.some((slot) => {
    return (
      normalizeDate(slot.shoot_date) === normalizeDate(date) &&
      normalizeTime(slot.shoot_time) === normalizeTime(time)
    );
  });
}

function createFallbackSlots(photographer?: BookingPhotographer | null): Slot[] {
  const area = photographer?.active_area || "Hồ Chí Minh";

  return [
    {
      id: "slot-1",
      date: "2026-06-12",
      time: "09:00",
      location: area,
      label: "12/06 · 09:00",
    },
    {
      id: "slot-2",
      date: "2026-06-14",
      time: "14:30",
      location: area,
      label: "14/06 · 14:30",
    },
    {
      id: "slot-3",
      date: "2026-06-18",
      time: "08:30",
      location: area,
      label: "18/06 · 08:30",
    },
  ];
}

function mapPackageToService(item: BookingPackage): UiService {
  const categorySlug = item.category.slug || "portrait";
  const meta = SERVICE_META[categorySlug] || SERVICE_META.portrait;

  return {
    packageId: item.id,
    id: String(item.id),
    categorySlug,
    name: item.name || item.category.name,
    packageName: item.name,
    price: `Từ ${formatCurrency(item.price)}`,
    basePrice: Number(item.price || 0),
    duration: item.duration ? String(item.duration) : meta.duration,
    image: meta.image,
    description: item.description || item.category.description || "",
    peopleOptions: meta.peopleOptions || DEFAULT_PEOPLE_OPTIONS,
  };
}

async function getBookingOptions(photographerId: string) {
  const response = await fetch(
    `${API_URL}/photographers/${photographerId}/booking-options`,
    {
      method: "GET",
      cache: "no-store",
    }
  );

  const json: ApiResponse<BookingOptionsData> = await response.json();

  if (!response.ok || !json.success) {
    throw new Error(json.message || "Không thể lấy dịch vụ của photographer.");
  }

  return json.data;
}

async function getBookedSlots(photographerId: string) {
  const response = await fetch(
    `${API_URL}/photographers/${photographerId}/booked-slots`,
    {
      method: "GET",
      cache: "no-store",
    }
  );

  const json: ApiResponse<BookedSlot[]> = await response.json();

  if (!response.ok || !json.success) {
    throw new Error(json.message || "Không thể lấy lịch đã được book.");
  }

  return json.data;
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
  const { session } = useAuth();
  const toast = useToast();
  const photographerId = searchParams.get("photographer") || "";
  const serviceQuery = searchParams.get("service")?.trim() || "";
  const datesQuery = searchParams.get("dates")?.trim() || "";

  const [photographer, setPhotographer] =
    useState<BookingPhotographer | null>(null);
  const [packages, setPackages] = useState<BookingPackage[]>([]);
  const [bookedSlots, setBookedSlots] = useState<BookedSlot[]>([]);
  const [selectedPackageId, setSelectedPackageId] = useState<number | null>(
    null
  );

  const [isLoadingOptions, setIsLoadingOptions] = useState(true);
  const [optionsError, setOptionsError] = useState("");

  const [preferredServiceLabel, setPreferredServiceLabel] = useState<
    string | null
  >(null);
  const [selectedPeopleScale, setSelectedPeopleScale] = useState("");
  const [location, setLocation] = useState("Hồ Chí Minh");
  const [shootDate, setShootDate] = useState("");
  const [shootTime, setShootTime] = useState("09:00");
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

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    if (!session) return;

    setFullName((current) => current || session.fullName);
    setEmail((current) => current || session.email);
  }, [session]);

  const availableServices = useMemo(
    () => packages.map(mapPackageToService),
    [packages]
  );

  const service = useMemo(
    () =>
      availableServices.find((item) => item.packageId === selectedPackageId) ||
      availableServices[0] ||
      null,
    [availableServices, selectedPackageId]
  );

  const slots = useMemo(() => createFallbackSlots(photographer), [photographer]);

  const selectedSlot =
    slots.find((slot) => slot.id === selectedSlotId) || slots[0];

  const selectedTimeBooked = useMemo(() => {
    return isSlotBookedByList(bookedSlots, shootDate, shootTime);
  }, [bookedSlots, shootDate, shootTime]);

  useEffect(() => {
    async function fetchOptions() {
      try {
        setIsLoadingOptions(true);
        setOptionsError("");
        setSubmitError("");

        if (!photographerId) {
          throw new Error(
            "Thiếu photographer. Vui lòng chọn photographer trước khi đặt lịch."
          );
        }

        const [data, bookedData] = await Promise.all([
          getBookingOptions(photographerId),
          getBookedSlots(photographerId),
        ]);

        setPhotographer(data.photographer);
        setPackages(data.packages);
        setBookedSlots(bookedData);

        if (!data.packages.length) {
          throw new Error(
            "Photographer này chưa có gói dịch vụ trong database."
          );
        }

        const mappedServices = data.packages.map(mapPackageToService);

        let matchedService: UiService | undefined;

        if (serviceQuery) {
          const normalizedService = normalizeText(serviceQuery);

          matchedService = mappedServices.find((item) => {
            const categoryName =
              data.packages.find((pkg) => pkg.id === item.packageId)?.category
                .name || "";

            return (
              normalizeText(item.categorySlug) === normalizedService ||
              normalizeText(item.name) === normalizedService ||
              normalizeText(item.name).includes(normalizedService) ||
              normalizeText(categoryName) === normalizedService ||
              normalizeText(categoryName).includes(normalizedService)
            );
          });
        }

        if (serviceQuery && !matchedService) {
          setPreferredServiceLabel(serviceQuery);
        } else {
          setPreferredServiceLabel(null);
        }

        const firstService = matchedService || mappedServices[0];

        setSelectedPackageId(firstService.packageId);
        setSelectedPeopleScale(firstService.peopleOptions[0]?.label || "");
        setSelectedAddOns([]);

        const fallbackSlots = createFallbackSlots(data.photographer);
        const firstAvailableSlot =
          fallbackSlots.find(
            (slot) => !isSlotBookedByList(bookedData, slot.date, slot.time)
          ) || fallbackSlots[0];

        setSelectedSlotId(firstAvailableSlot.id);
        setShootDate(firstAvailableSlot.date);
        setShootTime(firstAvailableSlot.time);
        setLocation(firstAvailableSlot.location);
      } catch (error) {
        console.error("Lỗi lấy dịch vụ booking:", error);
        setOptionsError(
          error instanceof Error
            ? error.message
            : "Không thể lấy dịch vụ booking."
        );
        setPhotographer(null);
        setPackages([]);
        setBookedSlots([]);
      } finally {
        setIsLoadingOptions(false);
      }
    }

    fetchOptions();
  }, [photographerId, serviceQuery]);

  useEffect(() => {
    if (!datesQuery) {
      return;
    }

    const firstDate = datesQuery.split(",").find(Boolean);

    if (firstDate) {
      setShootDate(firstDate);
    }
  }, [datesQuery]);

  useEffect(() => {
    if (!service) {
      return;
    }

    const exists = service.peopleOptions.some(
      (item) => item.label === selectedPeopleScale
    );

    if (!exists) {
      setSelectedPeopleScale(service.peopleOptions[0]?.label || "");
    }
  }, [service, selectedPeopleScale]);

  const budgetValue = useMemo(() => parseBudget(budget), [budget]);

  const selectedPeopleOption =
    service?.peopleOptions.find((item) => item.label === selectedPeopleScale) ||
    service?.peopleOptions[0] ||
    DEFAULT_PEOPLE_OPTIONS[0];

  const availableAddOns = useMemo(() => {
    if (!service) {
      return [];
    }

    return addOnServices
      .map((item) => {
        const isWithinBudget = budgetValue >= item.minBudget;
        const isCompatibleService = item.services.includes(service.categorySlug);

        return {
          ...item,
          isWithinBudget,
          isVisible: isCompatibleService && isWithinBudget,
        };
      })
      .filter((item) => item.isVisible);
  }, [budgetValue, service]);

  const selectedAddOnsDetails = availableAddOns
    .filter((item) => selectedAddOns.includes(item.id))
    .map((item) => ({
      id: item.id,
      name: item.name,
      price: item.minBudget,
    }));

  const addOnTotal = selectedAddOnsDetails.reduce(
    (total, addOn) => total + addOn.price,
    0
  );

  const selectedAddOnNames = selectedAddOnsDetails.map((item) => item.name);

  const estimatedTotal =
    (service?.basePrice || 0) + selectedPeopleOption.extra + addOnTotal;

  const depositAmount = Math.round(estimatedTotal * 0.5);
  const remainingAmount = estimatedTotal - depositAmount;

const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
  event.preventDefault();

  if (!photographer || !service) {
    setSubmitError("Vui lòng chọn photographer và dịch vụ hợp lệ.");
    return;
  }

  if (isSlotBookedByList(bookedSlots, shootDate, shootTime)) {
    setSubmitError("Khung giờ này đã được book. Vui lòng chọn lịch khác.");
    return;
  }

  try {
    setIsSubmitting(true);
    setSubmitError("");

    const payload = {
      photographerId: photographer.id,
      packageId: service.packageId,

      availabilitySlotId: selectedSlot.id,
      availabilitySlotLabel: selectedSlot.label,

      location,
      shootDate,
      shootTime,

      peopleScale: selectedPeopleScale,
      peopleExtra: selectedPeopleOption.extra,

      scene,
      concept,
      budget,

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
    };

    const response = await fetch(`${API_URL}/bookings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const json = await response.json();

    if (!response.ok || !json.success) {
      throw new Error(json.message || "Không thể tạo booking.");
    }

    const bookingCode = json.data.booking_code;

    saveBooking({
      id: bookingCode,
      status: "awaiting_payment",
      createdAt: json.data.created_at || new Date().toISOString(),

      serviceId: String(service.packageId),
      serviceName: json.data.service_name || service.name,
      basePrice: Number(json.data.base_price || service.basePrice),

      photographerId: String(photographer.id),
      photographerName: json.data.photographer_name || photographer.full_name,

      availabilitySlotId: selectedSlot.id,
      availabilitySlotLabel: selectedSlot.label,

      location,
      shootDate,
      shootTime,

      peopleScale: selectedPeopleScale,
      peopleExtra: selectedPeopleOption.extra,

      scene,
      concept,
      budget,

      estimatedTotal: Number(json.data.estimated_total || estimatedTotal),
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

    toast.redirect({
      type: "success",
      title: "Đã gửi yêu cầu đặt lịch",
      message: "Booking đã được gửi tới photographer. Vui lòng chờ xác nhận.",
    });

router.push(`/booking-request-success?id=${encodeURIComponent(bookingCode)}`);
  } catch (error) {
    console.error("Lỗi gửi booking:", error);

    setSubmitError(
      error instanceof Error
        ? error.message
        : "Có lỗi xảy ra khi gửi yêu cầu đặt lịch."
    );
  } finally {
    setIsSubmitting(false);
  }
};

  const paymentMethods = [
    { id: "momo", name: "MoMo", mark: "M" },
    { id: "vnpay", name: "VNPay", mark: "QR" },
    { id: "bank", name: "Chuyển khoản", mark: "B" },
  ];

  const toggleAddOn = (id: string) => {
    setSelectedAddOns((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  };

  if (isLoadingOptions) {
    return <main className="min-h-screen bg-[#fafbfc]" />;
  }

  if (optionsError) {
    return (
      <main className="min-h-screen bg-[#fafbfc] text-[#0e111d]">
        <section className="mx-auto grid w-full max-w-[860px] gap-5 px-6 py-20 md:px-12 lg:px-20">
          <p className="text-[12px] font-black uppercase tracking-[0.18em] text-[#ff8d28]">
            Không thể đặt lịch
          </p>

          <h1 className="max-w-[680px] text-[38px] font-black leading-[1.08] tracking-[-0.03em] text-[#0e111d] sm:text-[48px]">
            Photographer chưa có dịch vụ phù hợp
          </h1>

          <p className="max-w-[620px] text-[16px] font-medium leading-7 text-[#4b5563] sm:text-[18px]">
            {optionsError}
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              href="/photographer"
              className="rounded-lg bg-[#ff8d28] px-5 py-3 text-[14px] font-bold text-white shadow-[0_6px_14px_rgba(255,141,40,0.15)] transition-all hover:translate-y-[-1px] hover:bg-[#e0751b]"
            >
              Chọn photographer khác
            </Link>
          </div>
        </section>
      </main>
    );
  }

  if (!photographer || !service) {
    return null;
  }

  return (
    <main className="min-h-screen bg-[#fafbfc] text-[#0e111d]">
      <section className="mx-auto w-full max-w-[1440px] px-6 py-12 md:px-12 lg:px-20 lg:py-16">
        <div className="grid gap-3">
          <p
            data-reveal
            className="text-[12px] font-black uppercase tracking-[0.18em] text-[#ff8d28]"
          >
            Booking request
          </p>

          <h1
            data-reveal
            data-reveal-delay="80"
            className="max-w-[760px] text-[36px] font-black leading-[1.08] tracking-[-0.03em] text-[#0e111d] sm:text-[46px]"
          >
            Đặt lịch chụp
          </h1>

          <p className="max-w-[720px] text-[15px] font-semibold leading-7 text-[#6b7280]">
            Bạn đang đặt lịch với{" "}
            <span className="font-black text-[#0e111d]">
              {photographer.full_name}
            </span>
            . Các dịch vụ bên dưới được lấy trực tiếp từ database theo gói mà
            photographer này đang cung cấp.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start xl:grid-cols-[minmax(0,1fr)_400px]"
        >
          <div className="grid gap-6">
            <section
              data-reveal
              data-reveal-delay="220"
              className="rounded-[18px] border border-[#e8eaf1] bg-white p-5 shadow-[0_16px_42px_rgba(20,21,31,0.045)] sm:p-6"
            >
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-[12px] font-black uppercase tracking-[0.16em] text-[#ff8d28]">
                    Bước 1
                  </p>

                  <h2 className="mt-2 text-[22px] font-black leading-tight text-[#0e111d]">
                    Chọn dịch vụ của photographer này
                  </h2>

                  <p className="mt-2 text-sm text-[#6b7280]">
                    {photographer.full_name} hiện có{" "}
                    <span className="font-black text-[#0e111d]">
                      {availableServices.length}
                    </span>{" "}
                    gói dịch vụ.
                  </p>

                  {preferredServiceLabel ? (
                    <p className="mt-2 text-sm text-[#ef4444]">
                      Dịch vụ từ trang trước là{" "}
                      <span className="font-semibold">
                        {preferredServiceLabel}
                      </span>
                      , nhưng photographer này không có gói đó nên hệ thống đã
                      chọn gói phù hợp đầu tiên.
                    </p>
                  ) : null}
                </div>

                <span className="hidden rounded-full bg-[#fcf2e9] px-3 py-1.5 text-[12px] font-extrabold text-[#ff8d28] sm:inline-flex">
                  {service.price}
                </span>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {availableServices.map((item, index) => {
                  const active = item.packageId === selectedPackageId;

                  return (
                    <article
                      key={item.packageId}
                      onClick={() => {
                        setSelectedPackageId(item.packageId);
                        setSelectedPeopleScale(
                          item.peopleOptions[0]?.label || ""
                        );
                        setSelectedAddOns([]);
                      }}
                      data-reveal
                      data-reveal-delay={`${260 + index * 55}`}
                      className={`group cursor-pointer overflow-hidden rounded-[14px] border text-left transition-all ${
                        active
                          ? "border-[#ff8d28] bg-[#fff7ef] shadow-[0_10px_24px_rgba(255,141,40,0.12)]"
                          : "border-[#e8eaf1] bg-white hover:border-[#ffcfaa]"
                      }`}
                    >
                      <span className="relative block aspect-[16/9] overflow-hidden bg-[#f2f4f8]">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 360px"
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />

                        <span className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/45 to-transparent" />
                      </span>

                      <span className="block p-4">
                        <span className="block text-[15px] font-black text-[#0e111d]">
                          {item.name}
                        </span>

                        <span className="mt-2 block text-[12px] font-bold text-[#ff8d28]">
                          {item.price}
                        </span>

                        <span className="mt-1 block text-[12px] font-semibold text-[#6b7280]">
                          {item.duration}
                        </span>

                        <span className="mt-1 block text-[11px] font-bold text-[#8a8fa1]">
                          Loại: {item.categorySlug}
                        </span>

                        <span className="mt-4 grid gap-2">
                          <span className="text-[11px] font-black uppercase tracking-[0.12em] text-[#8a8fa1]">
                            Quy mô
                          </span>

                          <span className="booking-field">
                            <select
                              value={
                                active
                                  ? selectedPeopleScale
                                  : item.peopleOptions[0]?.label || ""
                              }
                              onClick={(event) => event.stopPropagation()}
                              onChange={(event) => {
                                setSelectedPackageId(item.packageId);
                                setSelectedPeopleScale(event.target.value);
                                setSelectedAddOns([]);
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

            <section
              data-reveal
              data-reveal-delay="300"
              className="rounded-[18px] border border-[#e8eaf1] bg-white p-5 shadow-[0_16px_42px_rgba(20,21,31,0.045)] sm:p-6"
            >
              <p className="text-[12px] font-black uppercase tracking-[0.16em] text-[#ff8d28]">
                Bước 2
              </p>

              <h2 className="mt-2 text-[22px] font-black leading-tight text-[#0e111d]">
                Chọn lịch rảnh
              </h2>

              <p className="mt-2 text-[13px] font-semibold leading-6 text-[#6b7280]">
                Đây là các khung giờ gợi ý của {photographer.full_name}. Slot
                nào đã có booking trong database sẽ tự chuyển thành{" "}
                <span className="font-black text-red-500">Đã được book</span>.
              </p>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {slots.map((slot) => {
                  const booked = isSlotBookedByList(
                    bookedSlots,
                    slot.date,
                    slot.time
                  );
                  const active = slot.id === selectedSlot.id && !booked;

                  return (
                    <button
                      key={slot.id}
                      type="button"
                      disabled={booked}
                      onClick={() => {
                        if (booked) return;

                        setSelectedSlotId(slot.id);
                        setShootDate(slot.date);
                        setShootTime(slot.time);
                        setLocation(slot.location);
                        setSubmitError("");
                      }}
                      className={`rounded-[14px] border px-4 py-4 text-left transition-all ${
                        booked
                          ? "cursor-not-allowed border-red-200 bg-red-50 opacity-80"
                          : active
                          ? "border-[#ff8d28] bg-[#fff7ef] shadow-[0_10px_24px_rgba(255,141,40,0.12)]"
                          : "border-[#e8eaf1] bg-white hover:border-[#ffcfaa]"
                      }`}
                      aria-pressed={active}
                    >
                      <span className="block text-[15px] font-black text-[#0e111d]">
                        {slot.label}
                      </span>

                      <span
                        className={`mt-2 block text-[12px] font-black ${
                          booked ? "text-red-500" : "text-[#ff8d28]"
                        }`}
                      >
                        {booked ? "Đã được book" : "Còn trống"}
                      </span>

                      <span className="mt-1 block text-[12px] font-semibold leading-5 text-[#6b7280]">
                        {slot.location}
                      </span>
                    </button>
                  );
                })}
              </div>

              {selectedTimeBooked ? (
                <div className="mt-4 rounded-[14px] border border-red-200 bg-red-50 px-4 py-3 text-[13px] font-bold text-red-600">
                  Khung giờ {shootDate} lúc {shootTime} đã được book. Vui lòng
                  chọn ngày hoặc giờ khác.
                </div>
              ) : null}

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <Field label="Địa điểm chụp">
                  <input
                    value={location}
                    onChange={(event) => setLocation(event.target.value)}
                    placeholder="Ví dụ: Đà Lạt"
                  />
                </Field>

                <Field label="Ngày chụp">
                  <input
                    type="date"
                    value={shootDate}
                    onChange={(event) => {
                      setShootDate(event.target.value);
                      setSelectedSlotId("");
                    }}
                  />
                </Field>

                <Field label="Khung giờ">
                  <input
                    type="time"
                    value={shootTime}
                    onChange={(event) => {
                      setShootTime(event.target.value);
                      setSelectedSlotId("");
                    }}
                  />
                </Field>

                <Field label="Ngân sách dự kiến">
                  <input
                    value={budget}
                    onChange={(event) => setBudget(event.target.value)}
                    placeholder="5.000.000"
                  />
                </Field>

                <Field label="Kênh liên hệ ưu tiên">
                  <select
                    value={contactChannel}
                    onChange={(event) => setContactChannel(event.target.value)}
                  >
                    {contactChannels.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Bối cảnh mong muốn">
                  <select
                    value={scene}
                    onChange={(event) => setScene(event.target.value)}
                  >
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

            <section
              data-reveal
              data-reveal-delay="380"
              className="rounded-[18px] border border-[#e8eaf1] bg-white p-5 shadow-[0_16px_42px_rgba(20,21,31,0.045)] sm:p-6"
            >
              <p className="text-[12px] font-black uppercase tracking-[0.16em] text-[#ff8d28]">
                Bước 3
              </p>

              <h2 className="mt-2 text-[22px] font-black leading-tight text-[#0e111d]">
                Yêu cầu sáng tạo
              </h2>

              <div className="mt-5 grid gap-5">
                <label
                  data-reveal
                  data-reveal-delay="420"
                  className="group grid cursor-pointer gap-3 rounded-[16px] border border-dashed border-[#ffd2ad] bg-[#fffaf5] px-5 py-6 text-center transition-colors hover:bg-[#fff4eb]"
                >
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
                    JPG, PNG hoặc WebP. File này chỉ dùng để photographer hiểu
                    mood/concept của bạn.
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
                          className={`flex items-start gap-3 rounded-[14px] border p-4 text-left transition-all ${
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

                              <span className="rounded-full bg-[#fcf2e9] px-2 py-1 text-[10px] font-extrabold text-[#ff8d28]">
                                Hợp dịch vụ đang chọn
                              </span>
                            </span>

                            <span className="mt-1 block text-[12px] font-semibold leading-5 text-[#6b7280]">
                              {item.note} · Từ{" "}
                              {item.minBudget.toLocaleString("vi-VN")} VND
                            </span>
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {availableAddOns.length === 0 ? (
                    <div className="mt-3 rounded-[14px] border border-[#e8eaf1] bg-[#fafbfc] px-4 py-5 text-[13px] font-semibold leading-6 text-[#6b7280]">
                      Chưa có dịch vụ đi kèm phù hợp với dịch vụ chính hoặc
                      ngân sách hiện tại.
                    </div>
                  ) : null}
                </div>
              </div>
            </section>

            <section
              data-reveal
              data-reveal-delay="460"
              className="rounded-[18px] border border-[#e8eaf1] bg-white p-5 shadow-[0_16px_42px_rgba(20,21,31,0.045)] sm:p-6"
            >
              <p className="text-[12px] font-black uppercase tracking-[0.16em] text-[#ff8d28]">
                Bước 4
              </p>

              <h2 className="mt-2 text-[22px] font-black leading-tight text-[#0e111d]">
                Thông tin liên hệ
              </h2>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <Field label="Họ và tên">
                  <input
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    placeholder="Nguyễn Minh Anh"
                    required
                  />
                </Field>

                <Field label="Số điện thoại">
                  <input
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    placeholder="090..."
                    required
                  />
                </Field>

                <div className="sm:col-span-2">
                  <Field label="Email">
                    <input
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="you@sudion.vn"
                      required
                    />
                  </Field>
                </div>
              </div>
            </section>
          </div>

          <aside
            data-reveal
            data-reveal-delay="300"
            className="flex rounded-[18px] border border-[#e8eaf1] bg-white p-5 shadow-[0_16px_42px_rgba(20,21,31,0.06)] lg:sticky lg:top-[112px] lg:flex-col"
          >
            <div className="flex shrink-0 items-start justify-between gap-4 border-b border-[#f1f3f7] pb-3">
              <div>
                <p className="text-[12px] font-black uppercase tracking-[0.16em] text-[#ff8d28]">
                  Tóm tắt
                </p>

                <h2 className="mt-1.5 text-[20px] font-black leading-tight text-[#0e111d]">
                  Yêu cầu đặt lịch
                </h2>
              </div>

              <span
                className={`rounded-full px-3 py-1.5 text-[11px] font-extrabold ${
                  selectedTimeBooked
                    ? "bg-red-50 text-red-500"
                    : "bg-[#fff7ef] text-[#ff8d28]"
                }`}
              >
                {selectedTimeBooked
                  ? "Slot đã book"
                  : isSubmitting
                  ? "Đang gửi"
                  : "Chưa gửi"}
              </span>
            </div>

            <div className="grid gap-2.5 py-3">
              <SummaryRow label="Dịch vụ" value={service.name} />
              <SummaryRow label="Photographer" value={photographer.full_name} />
              <SummaryRow
                label="Giá cơ bản"
                value={formatCurrency(service.basePrice)}
              />
              <SummaryRow label="Địa điểm" value={location || "Chưa chọn"} />
              <SummaryRow label="Ngày chụp" value={shootDate || "Chưa chọn"} />
              <SummaryRow label="Khung giờ" value={shootTime || "Chưa chọn"} />
              <SummaryRow
                label="Trạng thái slot"
                value={selectedTimeBooked ? "Đã được book" : "Còn trống"}
              />
              <SummaryRow label="Quy mô" value={selectedPeopleScale} />
              <SummaryRow
                label="Phụ phí quy mô"
                value={formatCurrency(selectedPeopleOption.extra)}
              />
              <SummaryRow
                label="Tạm tính"
                value={formatCurrency(estimatedTotal)}
              />
              <SummaryRow label="Bối cảnh" value={scene || "Chưa chọn"} />
              <SummaryRow
                label="Ảnh minh họa"
                value={referenceFileName || "Chưa tải"}
              />
              <SummaryRow
                label="Dịch vụ kèm"
                value={
                  selectedAddOnNames.length
                    ? selectedAddOnNames.join(", ")
                    : "Chưa chọn"
                }
              />
              <SummaryRow
                label="Ngân sách"
                value={budget ? `${budget} VND` : "Chưa nhập"}
              />
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
                        <span
                          className={`grid h-8 w-8 place-items-center rounded-full text-[12px] font-black ${
                            active
                              ? "bg-[#ff8d28] text-white"
                              : "bg-[#f3f4f6] text-[#6b7280]"
                          }`}
                        >
                          {method.mark}
                        </span>

                        <span className="text-[12px] font-black leading-4">
                          {method.name}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-4 grid gap-3 rounded-[14px] border border-[#f1f3f7] bg-white p-4">
                  <div className="flex items-center justify-between gap-3 text-[13px] font-semibold text-[#4b5563]">
                    <span>Tiền cọc (50%)</span>
                    <span className="text-[15px] font-black text-[#ff8d28]">
                      {formatCurrency(depositAmount)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-3 text-[13px] font-semibold text-[#4b5563]">
                    <span>Còn lại</span>
                    <span className="text-[15px] font-black text-[#0e111d]">
                      {formatCurrency(remainingAmount)}
                    </span>
                  </div>
                </div>
              </div>

              {submitError ? (
                <p className="mb-3 mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-center text-[12px] font-bold text-red-600">
                  {submitError}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={isSubmitting || selectedTimeBooked}
                className="mt-4 w-full rounded-lg bg-[#ff8d28] px-5 py-3.5 text-[14px] font-extrabold text-white shadow-[0_8px_18px_rgba(255,141,40,0.18)] transition-all hover:translate-y-[-1px] hover:bg-[#e0751b] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
              >
                {selectedTimeBooked
                  ? "Khung giờ đã được book"
                  : isSubmitting
                  ? "Đang gửi yêu cầu..."
                  : "Gửi yêu cầu đặt lịch"}
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
    <svg
      className={className}
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M10 13V4M10 4L6.5 7.5M10 4L13.5 7.5"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4 13.5V15.5C4 16.3 4.7 17 5.5 17H14.5C15.3 17 16 16.3 16 15.5V13.5"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M5 10.3L8.3 13.5L15 6.5"
        stroke="currentColor"
        strokeWidth="2.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
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
    <div className="flex items-start justify-between gap-4">
      <span className="text-[12px] font-bold text-[#8a8fa1]">{label}</span>
      <span className="max-w-[190px] text-right text-[13px] font-extrabold leading-5 text-[#0e111d]">
        {value}
      </span>
    </div>
  );
}