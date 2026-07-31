export interface BookingCartItem {
  cartItemId: string;
  photographerId: string;
  photographerName: string;
  packageId: string;
  packageName: string;
  packageImage?: string;
  categorySlug?: string;
  basePrice: number;
  shootDate: string;
  shootTime: string;
  location: string;
  peopleScale?: string;
  peopleExtra?: number;
  scene?: string;
  concept?: string;
  budget?: string;
  addOns?: Array<{ id: string; name: string; price: number }>;
  estimatedTotal: number;
  depositPercent: number;
  depositAmount: number;
  remainingAmount: number;
}

const storageKey = "sudion-booking-cart";

function canUseStorage() {
  return typeof window !== "undefined" && Boolean(window.localStorage);
}

function dispatchBookingCartUpdated() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("bookingCartUpdated"));
  }
}

export function readBookingCart(): BookingCartItem[] {
  if (!canUseStorage()) return [];
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return [];
    return JSON.parse(raw) || [];
  } catch {
    return [];
  }
}

export function writeBookingCart(items: BookingCartItem[]) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(storageKey, JSON.stringify(items));
  dispatchBookingCartUpdated();
}

export function checkDuplicateInCart(photographerId: string, shootDate: string, shootTime: string): boolean {
  const current = readBookingCart();
  return current.some(
    (i) =>
      String(i.photographerId) === String(photographerId) &&
      i.shootDate === shootDate &&
      i.shootTime === shootTime
  );
}

export function addToBookingCart(item: Omit<BookingCartItem, "cartItemId">) {
  const current = readBookingCart();

  const duplicate = current.find(
    (i) =>
      String(i.photographerId) === String(item.photographerId) &&
      i.shootDate === item.shootDate &&
      i.shootTime === item.shootTime
  );

  if (duplicate) {
    throw new Error(
      `Nhiếp ảnh gia ${item.photographerName} đã có buổi chụp trùng vào ngày ${item.shootDate} (${item.shootTime}) trong giỏ hàng của bạn!`
    );
  }

  const newItem: BookingCartItem = {
    ...item,
    cartItemId: `CART_ITEM_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
  };
  writeBookingCart([...current, newItem]);
  return newItem;
}

export function removeFromBookingCart(cartItemId: string) {
  const current = readBookingCart().filter((i) => i.cartItemId !== cartItemId);
  writeBookingCart(current);
}

export function clearBookingCart() {
  writeBookingCart([]);
}

export function getBookingCartTotalDeposit() {
  return readBookingCart().reduce((sum, item) => sum + (item.depositAmount || 0), 0);
}

export function getBookingCartTotalEstimated() {
  return readBookingCart().reduce((sum, item) => sum + (item.estimatedTotal || 0), 0);
}
