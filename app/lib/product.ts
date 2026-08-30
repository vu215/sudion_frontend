import { LegacyVariant, Product, ProductVariant } from "../types/product";

const BACKEND_HOST = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api").replace(/\/api\/?$/, "");

export function formatPrice(price: any) {
  const num = Math.round(Number(price || 0));
  return `${num.toLocaleString("vi-VN")}đ`;
}

export function getProductName(product: Product) {
  return product.ten_san_pham || product.name || "Sản phẩm Sony";
}

export function getProductCategory(product: Product) {
  return product.danh_muc || product.categoryId?.name || "Sony Alpha";
}

export function getProductDescription(product: Product) {
  return product.mo_ta || product.description || "Chưa có mô tả cho sản phẩm này.";
}

export function getProductModel(product: Product) {
  return product.ma_model || product.slug || "";
}

export function getProductHref(product: Product) {
  return `/products/${product.slug || product._id}`;
}

export function getLegacyVariants(product: Product): ProductVariant[] {
  return (product.variants || []).map((variant: any) => ({
    _id: variant._id,
    ten: variant.name || variant.ten || "",
    gia: variant.sale && variant.sale > 0 ? variant.sale : (variant.price || variant.gia || 0),
    ton_kho: variant.ton_kho !== undefined ? Number(variant.ton_kho) : 0,
    hinh_anh: variant.img || variant.hinh_anh || product.img || "",
  }));
}

export function getProductVariants(product: Product): ProductVariant[] {
  if (product.bien_the?.length) {
    return product.bien_the;
  }

  if (product.variants?.length) {
    const first = product.variants[0] as any;
    if (first && ("ten" in first || "ton_kho" in first)) {
      return product.variants as unknown as ProductVariant[];
    }
  }

  return getLegacyVariants(product);
}

export function getProductBasePrice(product: Product) {
  const variants = getProductVariants(product);
  if (variants.length > 0) {
    return Math.min(...variants.map((variant) => variant.gia || 0));
  }

  if (product.sale && product.sale > 0) {
    return product.sale;
  }

  return product.gia_ban || product.price || 0;
}

export function normalizeImageSrc(src?: string) {
  if (!src) {
    return "/next.svg";
  }

  if (src.startsWith("http://") || src.startsWith("https://") || src.startsWith("data:")) {
    return src;
  }

  if (src.startsWith("/")) {
    return `${BACKEND_HOST}${src}`;
  }

  return `${BACKEND_HOST}/uploads/${src}`;
}

export function getProductImage(product: Product, variant?: ProductVariant | null) {
  if (variant?.hinh_anh) {
    return normalizeImageSrc(variant.hinh_anh);
  }

  const firstVariant = getProductVariants(product)[0];
  if (firstVariant?.hinh_anh) {
    return normalizeImageSrc(firstVariant.hinh_anh);
  }

  if (product.hinh_anh?.thumbnail_chinh) {
    return normalizeImageSrc(product.hinh_anh.thumbnail_chinh);
  }

  return normalizeImageSrc(product.img);
}

export function matchesKeyword(product: Product, keyword: string) {
  const normalizedKeyword = keyword.trim().toLowerCase();

  if (!normalizedKeyword) {
    return true;
  }

  const haystacks = [
    getProductName(product),
    product.slug || "",
    getProductCategory(product),
    getProductDescription(product),
    ...(product.bo_suu_tap || []),
    ...getProductVariants(product).map((variant) => variant.ten),
    ...Object.values(product.thong_so || {}),
  ];

  return haystacks.some((value) => value.toLowerCase().includes(normalizedKeyword));
}
