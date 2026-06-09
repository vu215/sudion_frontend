export type BookingStatus = "awaiting_payment" | "confirmed" | "completed" | "cancelled";

export type StoredBooking = {
  id: string;
  status: BookingStatus;
  createdAt: string;
  serviceId: string;
  serviceName: string;
  basePrice: number;
  photographerId: string;
  photographerName: string;
  availabilitySlotId: string;
  availabilitySlotLabel: string;
  location: string;
  shootDate: string;
  shootTime: string;
  peopleScale: string;
  peopleExtra: number;
  scene: string;
  concept: string;
  budget: string;
  estimatedTotal: number;
  addOnTotal: number;
  addOns: Array<{ id: string; name: string; price: number }>;
  referenceFileName: string;
  paymentMethod: string;
  customer: {
    fullName: string;
    phone: string;
    email: string;
    contactChannel: string;
  };
};

const storageKey = "studion-bookings";

function canUseStorage() {
  return typeof window !== "undefined" && Boolean(window.localStorage);
}

function normalizeBooking(value: unknown): StoredBooking | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const booking = value as { [key: string]: unknown };
  const storedAddOns = Array.isArray(booking.addOns) ? booking.addOns : [];

  return {
    id: String(booking.id ?? ""),
    status: (booking.status as BookingStatus) ?? "awaiting_payment",
    createdAt: String(booking.createdAt ?? new Date().toISOString()),
    serviceId: String(booking.serviceId ?? ""),
    serviceName: String(booking.serviceName ?? ""),
    basePrice: typeof booking.basePrice === "number" ? booking.basePrice : 0,
    photographerId: String(booking.photographerId ?? ""),
    photographerName: String(booking.photographerName ?? ""),
    availabilitySlotId: String(booking.availabilitySlotId ?? ""),
    availabilitySlotLabel: String(booking.availabilitySlotLabel ?? ""),
    location: String(booking.location ?? ""),
    shootDate: String(booking.shootDate ?? ""),
    shootTime: String(booking.shootTime ?? ""),
    peopleScale: String(booking.peopleScale ?? ""),
    peopleExtra: typeof booking.peopleExtra === "number" ? booking.peopleExtra : 0,
    scene: String(booking.scene ?? ""),
    concept: String(booking.concept ?? ""),
    budget: String(booking.budget ?? ""),
    estimatedTotal: typeof booking.estimatedTotal === "number" ? booking.estimatedTotal : 0,
    addOnTotal: typeof booking.addOnTotal === "number" ? booking.addOnTotal : 0,
    addOns: storedAddOns.map((item) => {
      if (typeof item === "string") {
        return { id: item, name: item, price: 0 };
      }

      return {
        id: String((item as { id?: unknown }).id ?? ""),
        name: String((item as { name?: unknown }).name ?? ""),
        price: typeof (item as { price?: unknown }).price === "number" ? (item as { price: number }).price : 0,
      };
    }),
    referenceFileName: String(booking.referenceFileName ?? ""),
    paymentMethod: String(booking.paymentMethod ?? ""),
    customer: {
      fullName: String((booking.customer as { fullName?: unknown })?.fullName ?? ""),
      phone: String((booking.customer as { phone?: unknown })?.phone ?? ""),
      email: String((booking.customer as { email?: unknown })?.email ?? ""),
      contactChannel: String((booking.customer as { contactChannel?: unknown })?.contactChannel ?? ""),
    },
  };
}

function readBookings(): StoredBooking[] {
  if (!canUseStorage()) {
    return [];
  }

  try {
    const rawBookings = window.localStorage.getItem(storageKey);
    if (!rawBookings) {
      return [];
    }

    const parsed = JSON.parse(rawBookings);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .map(normalizeBooking)
      .filter((booking): booking is StoredBooking => booking !== null);
  } catch {
    return [];
  }
}

function writeBookings(bookings: StoredBooking[]) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(storageKey, JSON.stringify(bookings));
}

export function generateBookingId(date = new Date()) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const randomPart = Math.floor(1000 + Math.random() * 9000);

  return `STD-${yyyy}${mm}${dd}-${randomPart}`;
}

export function saveBooking(booking: StoredBooking) {
  const currentBookings = readBookings().filter((item) => item.id !== booking.id);
  writeBookings([booking, ...currentBookings]);

  return booking;
}

export function getBookingById(id: string) {
  return readBookings().find((booking) => booking.id === id) || null;
}

export function getAllBookings() {
  return readBookings();
}

export function deleteBooking(id: string) {
  const remaining = readBookings().filter((b) => b.id !== id);
  writeBookings(remaining);
}
