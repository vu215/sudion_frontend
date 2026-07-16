"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { readCart, removeFromCart, updateCartQuantity, clearCart, getCartTotal, getCartCount, CartItem } from "@/app/cart-store";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

function resolveProductImageUrl(path: string) {
  if (!path) return "/default-product.png";
  if (path.startsWith("http") || path.startsWith("data:")) return path;
  const backendHost = API_URL.replace(/\/api\/?$/, "");
  if (path.startsWith("/")) return `${backendHost}${path}`;
  return `${backendHost}/uploads/${path}`;
}

export default function CartPage() {
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    refreshCart();
    
    // Listen for storage changes
    const handleCartUpdate = () => {
      refreshCart();
    };
    window.addEventListener("cartUpdated", handleCartUpdate);
    return () => window.removeEventListener("cartUpdated", handleCartUpdate);
  }, []);

  const refreshCart = () => {
    setItems(readCart());
    setTotalPrice(getCartTotal());
    setTotalCount(getCartCount());
  };

  const handleRemove = (itemId: string) => {
    removeFromCart(itemId);
  };

  const handleUpdateQty = (itemId: string, delta: number) => {
    updateCartQuantity(itemId, delta);
  };

  const handleClearAll = () => {
    clearCart();
  };

  const formatPrice = (price: any) => {
    const num = Math.round(Number(price || 0));
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(num);
  };

  return (
    <main className="bg-slate-50 min-h-screen font-sans text-slate-900 pb-16 pt-10">
      <div className="mx-auto w-full max-w-[1440px] px-6 md:px-12 lg:px-20">
        <Link className="inline-flex items-center gap-2 text-slate-400 hover:text-[#ff8d28] transition-colors mb-8 group" href="/products">
          <span className="material-symbols-outlined text-sm transition-transform group-hover:-translate-x-1">arrow_back</span>
          <span className="text-sm font-medium underline underline-offset-4">Quay lại mua sắm</span>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Cart items list */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white rounded-[26px] border border-slate-100 p-6 shadow-sm">
              <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-50 pb-4">
                <h1 className="text-2xl font-black tracking-tight uppercase">Giỏ hàng của bạn <span className="text-[#ff8d28] text-sm font-normal ml-2">({totalCount} sản phẩm)</span></h1>
                <button
                  className="inline-flex items-center justify-center rounded-xl border border-red-500/30 px-4 py-2 text-xs font-bold text-red-500 transition-colors hover:bg-red-50"
                  onClick={handleClearAll}
                  disabled={items.length === 0}
                >
                  Xóa tất cả
                </button>
              </div>

              {items.length === 0 ? (
                <div className="p-12 flex flex-col items-center gap-4 text-center">
                  <span className="material-symbols-outlined text-6xl text-slate-300">shopping_cart_off</span>
                  <h3 className="text-lg font-bold">Giỏ hàng trống</h3>
                  <p className="text-slate-400 text-sm">Bạn chưa có sản phẩm nào trong giỏ hàng.</p>
                  <Link href="/products" className="mt-4 bg-gradient-to-r from-[#ff5e00] to-[#ff3c00] text-white px-8 py-3 rounded-xl font-bold hover:scale-[1.01] transition-transform">Mua ngay</Link>
                </div>
              ) : (
                <div className="divide-y divide-slate-50">
                  {items.map((item) => (
                    <div key={item.id} className="py-5 first:pt-0 last:pb-0 flex flex-col sm:flex-row items-center gap-6">
                      <div className="w-24 h-24 bg-slate-50 rounded-xl overflow-hidden shrink-0 border border-slate-100">
                        <img className="w-full h-full object-cover" alt={item.ten_san_pham} src={resolveProductImageUrl(item.hinh_anh)} />
                      </div>
                      <div className="flex-1 flex flex-col gap-1 w-full text-center sm:text-left">
                        <h3 className="text-sm font-extrabold text-slate-800">{item.ten_san_pham}</h3>
                        {item.bien_the && <p className="text-slate-400 text-xs font-semibold uppercase">{item.bien_the}</p>}
                        <p className="text-[#ff8d28] font-black text-sm mt-1">{formatPrice(item.gia_ban)}</p>
                      </div>
                      <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
                        <div className="flex items-center bg-slate-50 rounded-xl border border-slate-200 p-1">
                          <button 
                            className="size-8 flex items-center justify-center hover:text-[#ff8d28] transition-colors disabled:opacity-30"
                            onClick={() => handleUpdateQty(item.id, -1)}
                            disabled={item.so_luong <= 1}
                          >
                            <span className="material-symbols-outlined text-sm font-black">remove</span>
                          </button>
                          <span className="w-8 text-center font-black text-xs">{item.so_luong}</span>
                          <button 
                            className="size-8 flex items-center justify-center hover:text-[#ff8d28] transition-colors"
                            onClick={() => handleUpdateQty(item.id, 1)}
                          >
                            <span className="material-symbols-outlined text-sm font-black">add</span>
                          </button>
                        </div>
                        <button 
                          className="text-slate-400 hover:text-red-500 transition-colors"
                          onClick={() => handleRemove(item.id)}
                        >
                          <span className="material-symbols-outlined">delete</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Cart summary */}
          <div className="lg:col-span-4">
            <div className="sticky top-28 bg-white p-6 rounded-[26px] border border-slate-100 shadow-md">
              <h2 className="text-lg font-black uppercase mb-6 border-b border-slate-50 pb-4">Tóm tắt đơn hàng</h2>
              <div className="space-y-4 mb-6 text-sm font-semibold text-slate-500">
                <div className="flex justify-between">
                  <span>Tạm tính:</span>
                  <span className="text-slate-800 font-extrabold">{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Phí vận chuyển:</span>
                  <span className="text-emerald-600 font-extrabold">Miễn phí</span>
                </div>
                <div className="pt-4 border-t border-slate-100 flex justify-between items-end">
                  <span className="text-md font-black text-slate-800">Tổng cộng:</span>
                  <div className="text-right">
                    <p className="text-xl font-black text-[#ff8d28]">{formatPrice(totalPrice)}</p>
                    <p className="text-[10px] text-slate-400 mt-1 leading-none">(Đã bao gồm VAT)</p>
                  </div>
                </div>
              </div>
              <button 
                className="w-full h-11 bg-gradient-to-r from-[#ff5e00] to-[#ff3c00] hover:scale-[1.01] active:scale-[0.99] text-white font-extrabold rounded-xl transition text-sm flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-[#ff3c00]/25 disabled:opacity-50"
                disabled={items.length === 0}
                onClick={() => router.push("/checkout")}
              >
                <span>Tiến hành thanh toán</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
