"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { useToast } from "@/app/toast-context";
import { addToCart } from "@/app/cart-store";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

interface ProductVariant {
  _id: number;
  ten: string;
  gia: number;
  ton_kho: number;
  hinh_anh: string;
}

interface Product {
  id: number;
  name: string;
  slug: string;
  category_name: string;
  category_id: number;
  model_code: string;
  price: number;
  sale_price: number;
  image_url: string;
  description: string;
  specs: Array<{ nhom: string; nd: string }>;
  warranty: string;
  gifts: string[];
  variants: ProductVariant[];
  hot: number;
}

const featureIconMap: Record<string, string> = {
  "cam bien": "photo_size_select_actual",
  video: "videocam",
  "lay net": "visibility",
  ai: "neurology",
  "chong rung": "vibration",
  "ong kinh": "camera",
  "trong luong": "scale",
  "do nhay sang": "wb_twilight",
  "luu tru": "memory",
  "toc do": "bolt",
  "man hinh": "tv",
  pin: "battery_full",
  micro: "mic",
  "chop": "flash_on",
  "tinh nang": "stars",
};

function normalizeKey(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const toast = useToast();
  const id = params.id as string;

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [showToast, setShowToast] = useState(false);

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    fetch(`${API_URL}/products/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Không thể tải chi tiết sản phẩm");
        return res.json();
      })
      .then((data) => {
        setProduct(data);
        setError(null);
      })
      .catch((err) => {
        setError(err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [id]);

  const variants = useMemo(() => (product?.variants ? product.variants : []), [product]);
  const defaultVariant = variants[0] || null;
  const currentVariant = selectedVariant || defaultVariant;
  const isOutOfStock = useMemo(() => !currentVariant || currentVariant.ton_kho <= 0, [currentVariant]);
  const gallery = variants.length > 0 ? variants : currentVariant ? [currentVariant] : [];
  const featureSpecs = product?.specs?.slice(0, 4) || [];

  const handleAddToCart = (buyNow = false) => {
    if (!product) return;
    if (currentVariant) {
      if (currentVariant.ton_kho <= 0) {
        toast.error("Lỗi", "Sản phẩm phiên bản này hiện đã hết hàng.");
        return;
      }
      addToCart(product, { ten: currentVariant.ten, gia: currentVariant.gia, hinh_anh: currentVariant.hinh_anh }, quantity);

      if (buyNow) {
        router.push("/cart");
      } else {
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      }
    }
  };

  const formatPrice = (value: any) => {
    const num = Math.round(Number(value || 0));
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(num);
  };

  const getProductImage = (item: Product, variant: ProductVariant | null) => {
    const backendHost = API_URL.replace(/\/api\/?$/, "");
    
    let imgPath = "";
    if (variant && variant.hinh_anh) {
      imgPath = variant.hinh_anh;
    } else {
      imgPath = item.image_url || "";
    }

    if (!imgPath) return "/default-product.png";
    if (imgPath.startsWith("http") || imgPath.startsWith("data:")) {
      return imgPath;
    }
    if (imgPath.startsWith("/")) {
      return `${backendHost}${imgPath}`;
    }
    return `${backendHost}/uploads/${imgPath}`;
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#ff8d28] border-t-transparent mb-4"></div>
        <p className="text-slate-500 font-bold">Đang tải thông tin sản phẩm...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20 min-h-screen">
        <p className="text-red-500 font-extrabold text-lg">Lỗi tải dữ liệu: {error.message}</p>
        <Link href="/products" className="mt-4 inline-block px-6 py-2 bg-[#ff8d28] text-white font-extrabold rounded-full">Quay lại danh sách</Link>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-20 min-h-screen">
        <p className="text-red-500 font-extrabold text-lg">Không tìm thấy sản phẩm này.</p>
        <Link href="/products" className="mt-4 inline-block px-6 py-2 bg-[#ff8d28] text-white font-extrabold rounded-full">Quay lại danh sách</Link>
      </div>
    );
  }

  return (
    <main className="bg-slate-50 min-h-screen font-sans text-slate-900 py-10 relative">
      <div className="mx-auto w-full max-w-[1440px] px-6 md:px-12 lg:px-20">
        <div className="mb-6 flex items-center gap-2 text-xs font-bold text-slate-400">
          <Link href="/" className="hover:text-slate-600">Trang chủ</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-slate-600">Mua máy ảnh</Link>
          <span>/</span>
          <span className="text-[#ff8d28]">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-[26px] border border-slate-100 p-6 shadow-sm space-y-6">
              <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden bg-slate-100">
                <img
                  src={getProductImage(product, currentVariant)}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Thumbnails */}
              {gallery.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-1">
                  {gallery.map((variant) => {
                    const active = currentVariant?.ten === variant.ten;
                    return (
                      <button
                        key={variant._id || variant.ten}
                        onClick={() => setSelectedVariant(variant)}
                        className={`w-20 h-20 rounded-xl overflow-hidden border-2 shrink-0 transition-colors ${active ? "border-[#ff8d28]" : "border-slate-100 hover:border-slate-300"
                          }`}
                      >
                        <img src={getProductImage(product, variant)} alt={variant.ten} className="w-full h-full object-cover" />
                      </button>
                    );
                  })}
                </div>
              )}

              <div>
                <div className="flex items-center gap-2 text-xs font-extrabold text-[#ff8d28] uppercase tracking-wider mb-2">
                  <span>{product.category_name}</span>
                  <span>•</span>
                  <span>Model: {product.model_code || "Sony Alpha"}</span>
                </div>
                <h1 className="text-2xl md:text-3xl font-black text-slate-900 leading-tight">
                  {product.name}
                </h1>
                <p className="mt-3 text-slate-500 text-sm md:text-[15px] leading-relaxed">
                  {product.description}
                </p>
              </div>

              <div className="pt-6 border-t border-slate-100">
                <h3 className="text-[15px] font-extrabold text-slate-800 uppercase tracking-wider mb-3">
                  Thông số chi tiết
                </h3>
                {product.specs && product.specs.length > 0 ? (
                  <div className="grid gap-3.5 sm:grid-cols-2">
                    {product.specs.map((item) => (
                      <div key={item.nhom} className="rounded-2xl bg-slate-50 px-4 py-3 border border-slate-100/50">
                        <p className="text-[10px] font-black uppercase tracking-wider text-[#ff8d28] mb-0.5">{item.nhom}</p>
                        <p className="text-sm font-semibold text-slate-700">{item.nd}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 text-sm">Chưa có thông số kỹ thuật.</p>
                )}
              </div>
            </div>
          </div>

          {/* Right Column (Sidebar Order Panel) */}
          <div className="lg:col-span-5 space-y-6 sticky top-24">
            <div className="bg-white rounded-[26px] border border-slate-100 p-6 shadow-md">
              <h2 className="text-lg font-black text-slate-900 uppercase border-b border-slate-50 pb-4 mb-5">
                MUA SẢN PHẨM
              </h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Lựa chọn phiên bản</label>
                  <div className="flex flex-wrap gap-2.5">
                    {variants.map((v) => {
                      const active = currentVariant?.ten === v.ten;
                      const outOfStock = v.ton_kho <= 0;
                      return (
                        <button
                          key={v._id || v.ten}
                          type="button"
                          onClick={() => {
                            setSelectedVariant(v);
                            setQuantity(v.ton_kho > 0 ? 1 : 0);
                          }}
                          className={`px-4 py-3 rounded-xl border text-left transition-all cursor-pointer relative ${active
                              ? "border-[#ff8d28] bg-orange-50/20 text-[#ff8d28]"
                              : "border-slate-200 bg-white hover:border-slate-300"
                            } ${outOfStock ? "opacity-60" : ""}`}
                        >
                          <p className="text-xs font-black flex items-center gap-1.5">
                            {v.ten}
                            {outOfStock && (
                              <span className="text-[9px] bg-red-100 text-red-600 font-bold px-1.5 py-0.5 rounded-full uppercase">Hết hàng</span>
                            )}
                          </p>
                          <p className="text-xs font-bold text-slate-400 mt-0.5">{formatPrice(v.gia)}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4 space-y-4 border border-slate-100">
                  <div className="flex items-center justify-between text-slate-700 font-extrabold">
                    <span>Giá bán lẻ:</span>
                    <div className="text-right">
                      <div className="flex items-center gap-2 justify-end">
                        {product.sale_price > 0 && product.sale_price < product.price && !selectedVariant && (
                          <span className="text-xs text-slate-400 line-through font-medium">
                            {formatPrice(product.price)}
                          </span>
                        )}
                        <span className="text-[#ff8d28] text-xl font-black">
                          {formatPrice(currentVariant?.gia || product.sale_price || product.price)}
                        </span>
                      </div>
                      {product.sale_price > 0 && product.sale_price < product.price && !selectedVariant && (
                        <div className="text-[10px] text-red-600 font-bold uppercase mt-0.5">
                          Tiết kiệm {Math.round(((product.price - product.sale_price) / product.price) * 100)}%
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm text-[#ff8d28]">verified</span>
                    <span>Bảo hành: {product.warranty || "24 tháng chính hãng Sony VN"}</span>
                  </div>
                </div>

                {product.gifts && product.gifts.length > 0 && (
                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase">Quà tặng đi kèm</label>
                    <div className="flex flex-wrap gap-2">
                      {product.gifts.map((gift) => (
                        <span key={gift} className="inline-block text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg px-2.5 py-1.5">
                          {gift}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quantity */}
                <div className="space-y-2.5">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase">Số lượng</label>
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="inline-flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-1">
                      <button
                        disabled={isOutOfStock || quantity <= 1}
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="flex size-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600 transition-all hover:bg-[#ff8d28] hover:text-white disabled:opacity-40 disabled:hover:bg-slate-100 disabled:hover:text-slate-600"
                      >
                        <span className="material-symbols-outlined text-sm">remove</span>
                      </button>
                      <span className="w-8 text-center font-black text-sm">{isOutOfStock ? 0 : quantity}</span>
                      <button
                        disabled={isOutOfStock || quantity >= (currentVariant?.ton_kho || 0)}
                        onClick={() => setQuantity(quantity + 1)}
                        className="flex size-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600 transition-all hover:bg-[#ff8d28] hover:text-white disabled:opacity-40 disabled:hover:bg-slate-100 disabled:hover:text-slate-600"
                      >
                        <span className="material-symbols-outlined text-sm">add</span>
                      </button>
                    </div>
                    {currentVariant && currentVariant.ton_kho > 0 ? (
                      <span className="text-[11px] font-bold text-slate-400">Còn lại {currentVariant.ton_kho} sản phẩm trong kho</span>
                    ) : (
                      <span className="text-[11px] font-bold text-red-500">Hết hàng</span>
                    )}
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 pt-2">
                  <button
                    disabled={isOutOfStock}
                    type="button"
                    onClick={() => handleAddToCart(false)}
                    className="h-11 bg-white border border-[#ff8d28]/35 text-[#ff8d28] hover:bg-orange-50/20 font-extrabold rounded-xl transition text-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400"
                  >
                    <span className="material-symbols-outlined text-base">add_shopping_cart</span>
                    Thêm vào giỏ
                  </button>
                  <button
                    disabled={isOutOfStock}
                    type="button"
                    onClick={() => handleAddToCart(true)}
                    className="h-11 bg-gradient-to-r from-[#ff5e00] to-[#ff3c00] hover:scale-[1.01] active:scale-[0.99] text-white font-extrabold rounded-xl transition text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-[#ff3c00]/25 disabled:from-slate-300 disabled:to-slate-300 disabled:shadow-none disabled:cursor-not-allowed"
                  >
                    {isOutOfStock ? "Hết hàng" : "Mua ngay"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Toast Notification */}
      <div className={`fixed bottom-10 left-1/2 z-[100] -translate-x-1/2 transition-all duration-500 ${showToast ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>
        <div className="flex items-center gap-3 rounded-2xl bg-slate-900 px-6 py-4 text-white shadow-2xl">
          <span className="material-symbols-outlined text-emerald-400">check_circle</span>
          <div className="flex flex-col">
            <p className="text-xs font-black uppercase tracking-widest text-[#ff8d28]">Thành công</p>
            <p className="text-sm font-medium text-white/80">Đã thêm {quantity} sản phẩm vào giỏ hàng</p>
          </div>
          <Link href="/cart" className="ml-4 border-l border-white/20 pl-4 text-xs font-black uppercase tracking-widest text-[#ff8d28] hover:underline">
            Xem giỏ hàng
          </Link>
        </div>
      </div>
    </main>
  );
}
