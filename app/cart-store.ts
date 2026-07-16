export interface CartItem {
  id: string; // productId-variantName or productId
  productId: number;
  ten_san_pham: string;
  gia_ban: number;
  hinh_anh: string;
  so_luong: number;
  bien_the?: string;
}

const storageKey = "sudion-cart";

function canUseStorage() {
  return typeof window !== "undefined" && Boolean(window.localStorage);
}

function dispatchCartUpdated() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("cartUpdated"));
  }
}

export function readCart(): CartItem[] {
  if (!canUseStorage()) {
    return [];
  }

  try {
    const rawCart = window.localStorage.getItem(storageKey);
    if (!rawCart) return [];
    return JSON.parse(rawCart) || [];
  } catch {
    return [];
  }
}

export function writeCart(items: CartItem[]) {
  if (!canUseStorage()) {
    return;
  }
  window.localStorage.setItem(storageKey, JSON.stringify(items));
  dispatchCartUpdated();
}

const BACKEND_HOST = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api").replace(/\/api\/?$/, "");

function resolveImageUrl(path: string): string {
  if (!path) return "/default-product.png";
  if (path.startsWith("http") || path.startsWith("data:")) return path;
  if (path.startsWith("/")) return `${BACKEND_HOST}${path}`;
  return `${BACKEND_HOST}/uploads/${path}`;
}

export function addToCart(product: any, variant: any, quantity = 1) {
  const items = readCart();
  const selectedVariantName = variant?.ten || null;
  const itemId = selectedVariantName ? `${product.id}-${selectedVariantName}` : String(product.id);
  const price = variant?.gia || product.sale_price || product.price || 0;

  const existingItem = items.find(item => item.id === itemId);
  if (existingItem) {
    existingItem.so_luong += quantity;
  } else {
    // Determine image — always resolve to absolute backend URL
    let rawImage = product.image_url || "/next.svg";
    if (variant?.hinh_anh) {
      rawImage = variant.hinh_anh;
    } else if (product.img) {
      rawImage = product.img;
    }

    items.push({
      id: itemId,
      productId: product.id,
      ten_san_pham: product.name || product.ten_san_pham,
      gia_ban: price,
      hinh_anh: resolveImageUrl(rawImage),
      so_luong: quantity,
      bien_the: selectedVariantName || undefined
    });
  }

  writeCart(items);
}

export function removeFromCart(itemId: string) {
  const items = readCart().filter(item => item.id !== itemId);
  writeCart(items);
}

export function updateCartQuantity(itemId: string, delta: number) {
  const items = readCart();
  const item = items.find(i => i.id === itemId);
  if (item) {
    item.so_luong = Math.max(1, item.so_luong + delta);
    writeCart(items);
  }
}

export function clearCart() {
  writeCart([]);
}

export function getCartTotal() {
  return readCart().reduce((sum, item) => sum + item.gia_ban * item.so_luong, 0);
}

export function getCartCount() {
  return readCart().reduce((sum, item) => sum + item.so_luong, 0);
}
