export type BookingStatus = "awaiting_payment" | "confirmed" | "completed" | "cancelled";

export type StoredBooking = {
  id: string;
  status: BookingStatus;
  createdAt: string;
  serviceId: string;
  serviceName: string;
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
  addOns: string[];
  referenceFileName: string;
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

function readBookings(): StoredBooking[] {
  if (!canUseStorage()) {
    return [];
  }

  try {
    const rawBookings = window.localStorage.getItem(storageKey);
    return rawBookings ? (JSON.parse(rawBookings) as StoredBooking[]) : [];
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
