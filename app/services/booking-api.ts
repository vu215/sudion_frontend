export type BackendBooking = {
  id: number;
  booking_code: string;

  photographer_id: string;
  photographer_name: string;

  service_id: string;
  service_name: string;
  base_price: number;

  availability_slot_id: string | null;
  availability_slot_label: string | null;

  location: string | null;
  shoot_date: string | null;
  shoot_time: string | null;

  people_scale: string | null;
  people_extra: number;

  scene: string | null;
  concept: string | null;
  budget: string | null;

  add_on_total: number;
  estimated_total: number;
  deposit_amount: number;
  remaining_amount: number;

  add_ons: {
    id: string;
    name: string;
    price: number;
  }[];

  reference_file_name: string | null;
  payment_method: string | null;
  status: "awaiting_payment" | "confirmed" | string;

  customer_full_name: string;
  customer_phone: string;
  customer_email: string;
  contact_channel: string | null;

  created_at: string;
  updated_at: string;
};

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
  error?: unknown;
};

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export async function getBookingFromBackend(bookingCode: string) {
  const response = await fetch(`${API_URL}/bookings/${bookingCode}`, {
    method: "GET",
    cache: "no-store",
  });

  const json: ApiResponse<BackendBooking> = await response.json();

  if (!response.ok || !json.success) {
    throw new Error(json.message || "Không tìm thấy booking.");
  }

  return json.data;
}

export async function confirmBookingPayment(
  bookingCode: string,
  paymentMethod: string
) {
  const response = await fetch(
    `${API_URL}/bookings/${bookingCode}/confirm-payment`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ paymentMethod }),
    }
  );

  const json: ApiResponse<BackendBooking> = await response.json();

  if (!response.ok || !json.success) {
    throw new Error(json.message || "Không thể xác nhận thanh toán.");
  }

  return json.data;
}