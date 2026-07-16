"use client";

import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/auth-context";
import { useToast } from "@/app/toast-context";
import { readCart, clearCart, getCartTotal, CartItem } from "@/app/cart-store";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

function resolveProductImageUrl(path: string) {
  if (!path) return "/default-product.png";
  if (path.startsWith("http") || path.startsWith("data:")) return path;
  const backendHost = API_URL.replace(/\/api\/?$/, "");
  if (path.startsWith("/")) return `${backendHost}${path}`;
  return `${backendHost}/uploads/${path}`;
}

export default function CheckoutPage() {
  const router = useRouter();
  const toast = useToast();
  const { session } = useAuth();

  const [items, setItems] = useState<CartItem[]>([]);
  const [totalPrice, setTotalPrice] = useState(0);

  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    note: ""
  });

  // Address parts
  type VnLocation = { code: number; name: string };
  const [provinces, setProvinces] = useState<VnLocation[]>([]);
  const [districts, setDistricts] = useState<VnLocation[]>([]);
  const [wards, setWards] = useState<VnLocation[]>([]);
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedWard, setSelectedWard] = useState("");
  const [streetAddress, setStreetAddress] = useState("");

  const [savedAddresses, setSavedAddresses] = useState<string[]>([]);
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [shippingMethod, setShippingMethod] = useState("standard");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch provinces on mount
  useEffect(() => {
    fetch("https://provinces.open-api.vn/api/p/")
      .then(r => r.json())
      .then((data: VnLocation[]) => {
        if (Array.isArray(data)) setProvinces(data);
      })
      .catch(() => {});
  }, []);

  // Fetch districts when province changes
  useEffect(() => {
    setDistricts([]);
    setWards([]);
    setSelectedDistrict("");
    setSelectedWard("");
    if (!selectedProvince) return;
    fetch(`https://provinces.open-api.vn/api/p/${selectedProvince}?depth=2`)
      .then(r => r.json())
      .then((data: { districts?: VnLocation[] }) => {
        if (Array.isArray(data.districts)) setDistricts(data.districts);
      })
      .catch(() => {});
  }, [selectedProvince]);

  // Fetch wards when district changes
  useEffect(() => {
    setWards([]);
    setSelectedWard("");
    if (!selectedDistrict) return;
    fetch(`https://provinces.open-api.vn/api/d/${selectedDistrict}?depth=2`)
      .then(r => r.json())
      .then((data: { wards?: VnLocation[] }) => {
        if (Array.isArray(data.wards)) setWards(data.wards);
      })
      .catch(() => {});
  }, [selectedDistrict]);

  // Compose full address whenever parts change
  useEffect(() => {
    const provName = provinces.find(p => String(p.code) === selectedProvince)?.name || "";
    const distName = districts.find(d => String(d.code) === selectedDistrict)?.name || "";
    const wardName = wards.find(w => String(w.code) === selectedWard)?.name || "";
    const parts = [streetAddress, wardName, distName, provName].filter(Boolean);
    setCustomerInfo(prev => ({ ...prev, address: parts.join(", ") }));
  }, [streetAddress, selectedProvince, selectedDistrict, selectedWard, provinces, districts, wards]);

  useEffect(() => {
    const cartItems = readCart();
    setItems(cartItems);
    setTotalPrice(getCartTotal());

    if (session) {
      setCustomerInfo(prev => ({
        ...prev,
        name: session.fullName || "",
        email: session.email || "",
        phone: session.phone || "",
      }));
    }

    if (typeof window !== "undefined") {
      const saved = window.localStorage.getItem("sudion_saved_addresses");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) setSavedAddresses(parsed);
        } catch (e) {}
      }
    }
  }, [session]);

  const shippingFee = shippingMethod === "express" ? 50000 : 0;
  const finalTotal = totalPrice + shippingFee;

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();

    if (items.length === 0) {
      toast.error("Lỗi", "Giỏ hàng của bạn đang trống.");
      return;
    }

    if (!customerInfo.name || !customerInfo.email || !customerInfo.phone || !customerInfo.address) {
      toast.error("Lỗi", "Vui lòng nhập đầy đủ thông tin giao hàng bắt buộc.");
      return;
    }

    setIsSubmitting(true);

    try {
      const token = typeof window !== "undefined" ? window.localStorage.getItem("sudion_token") : null;
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch(`${API_URL}/orders/checkout`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          items: items.map((item) => ({
            productId: item.productId,
            ten_san_pham: item.ten_san_pham,
            gia_ban: item.gia_ban,
            so_luong: item.so_luong,
            hinh_anh: item.hinh_anh,
            bien_the: item.bien_the
          })),
          totalAmount: finalTotal,
          customerInfo: {
            ...customerInfo,
            paymentMethod,
            shippingMethod
          }
        })
      });

      const resData = await res.json();
      if (res.ok && resData.success) {
        // Save address to local storage
        if (typeof window !== "undefined" && customerInfo.address) {
          let list: string[] = [];
          const saved = window.localStorage.getItem("sudion_saved_addresses");
          if (saved) {
            try {
              const parsed = JSON.parse(saved);
              if (Array.isArray(parsed)) list = parsed;
            } catch (err) {}
          }
          list = list.filter(item => item !== customerInfo.address);
          list.unshift(customerInfo.address);
          list = list.slice(0, 5);
          window.localStorage.setItem("sudion_saved_addresses", JSON.stringify(list));
        }

        clearCart();
        toast.success("Thành công", "Đơn hàng đã được đặt thành công!");
        router.push("/checkout/success");
      } else {
        toast.error("Lỗi", resData.message || "Lỗi khi đặt hàng.");
      }
    } catch (err) {
      console.error("Checkout error:", err);
      toast.error("Lỗi", "Không thể kết nối đến máy chủ.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatPrice = (price: any) => {
    const num = Math.round(Number(price || 0));
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(num);
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen pt-32 flex flex-col items-center justify-center bg-slate-50 px-6">
        <span className="material-symbols-outlined text-8xl text-slate-300 mb-6">shopping_cart_off</span>
        <h1 className="text-2xl font-black mb-4">Giỏ hàng của bạn đang trống</h1>
        <p className="text-slate-500 mb-8">Hãy chọn cho mình những sản phẩm ưng ý trước khi thanh toán nhé!</p>
        <Link href="/products" className="bg-gradient-to-r from-[#ff5e00] to-[#ff3c00] px-10 py-4 rounded-2xl font-bold text-white shadow-xl hover:scale-[1.01] transition-transform">
          Quay lại mua sắm
        </Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 pt-10 pb-20 px-6 lg:px-20">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <Link href="/cart" className="inline-flex items-center gap-2 text-slate-400 hover:text-[#ff8d28] transition-colors text-xs mb-6">
            <span className="material-symbols-outlined text-xs">arrow_back</span>
            Quay lại giỏ hàng
          </Link>
          <h1 className="text-2xl font-black tracking-tight uppercase">Thanh toán đơn hàng</h1>
        </div>

        <form onSubmit={handleCheckout} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-7 space-y-6">
            <section className="bg-white rounded-[26px] border border-slate-100 p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2.5 mb-4">
                <span className="flex size-8 items-center justify-center rounded-full bg-[#ff8d28] text-white text-xs font-black">1</span>
                <h2 className="text-md font-black uppercase tracking-tight">Thông tin giao hàng</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Họ và tên *</label>
                  <input 
                    required
                    type="text"
                    className="w-full bg-slate-50/50 border border-slate-200 rounded-xl p-3 text-xs focus:border-[#ff8d28] outline-none transition-all"
                    placeholder="VD: Nguyễn Văn A"
                    value={customerInfo.name}
                    onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Số điện thoại *</label>
                  <input 
                    required
                    type="tel"
                    className="w-full bg-slate-50/50 border border-slate-200 rounded-xl p-3 text-xs focus:border-[#ff8d28] outline-none transition-all"
                    placeholder="09XXXXXXXX"
                    value={customerInfo.phone}
                    onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Email *</label>
                  <input 
                    required
                    type="email"
                    className="w-full bg-slate-50/50 border border-slate-200 rounded-xl p-3 text-xs focus:border-[#ff8d28] outline-none transition-all"
                    placeholder="name@example.com"
                    value={customerInfo.email}
                    onChange={(e) => setCustomerInfo({...customerInfo, email: e.target.value})}
                  />
                </div>
                {/* Địa chỉ đã lưu - dropdown riêng */}
                {savedAddresses.length > 0 && (
                  <div className="md:col-span-2 space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Chọn địa chỉ đã lưu</label>
                    <select
                      className="w-full bg-slate-50/50 border border-slate-200 rounded-xl p-3 text-xs focus:border-[#ff8d28] outline-none transition-all cursor-pointer h-[42px]"
                      value=""
                      onChange={(e) => {
                        if (e.target.value) {
                          setStreetAddress(e.target.value);
                          setSelectedProvince("");
                          setSelectedDistrict("");
                          setSelectedWard("");
                          setCustomerInfo(prev => ({ ...prev, address: e.target.value }));
                        }
                      }}
                    >
                      <option value="">— Chọn từ địa chỉ đã dùng —</option>
                      {savedAddresses.map((addr, idx) => (
                        <option key={idx} value={addr}>{addr}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Tỉnh/Thành phố */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Tỉnh / Thành phố *</label>
                  <select
                    required
                    className="w-full bg-slate-50/50 border border-slate-200 rounded-xl p-3 text-xs focus:border-[#ff8d28] outline-none transition-all cursor-pointer h-[42px]"
                    value={selectedProvince}
                    onChange={(e) => setSelectedProvince(e.target.value)}
                  >
                    <option value="">— Chọn Tỉnh/Thành phố —</option>
                    {provinces.map(p => (
                      <option key={p.code} value={String(p.code)}>{p.name}</option>
                    ))}
                  </select>
                </div>

                {/* Quận/Huyện */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Quận / Huyện *</label>
                  <select
                    required
                    className="w-full bg-slate-50/50 border border-slate-200 rounded-xl p-3 text-xs focus:border-[#ff8d28] outline-none transition-all cursor-pointer h-[42px]"
                    value={selectedDistrict}
                    onChange={(e) => setSelectedDistrict(e.target.value)}
                    disabled={!selectedProvince}
                  >
                    <option value="">— Chọn Quận/Huyện —</option>
                    {districts.map(d => (
                      <option key={d.code} value={String(d.code)}>{d.name}</option>
                    ))}
                  </select>
                </div>

                {/* Phường/Xã */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Phường / Xã *</label>
                  <select
                    required
                    className="w-full bg-slate-50/50 border border-slate-200 rounded-xl p-3 text-xs focus:border-[#ff8d28] outline-none transition-all cursor-pointer h-[42px]"
                    value={selectedWard}
                    onChange={(e) => setSelectedWard(e.target.value)}
                    disabled={!selectedDistrict}
                  >
                    <option value="">— Chọn Phường/Xã —</option>
                    {wards.map(w => (
                      <option key={w.code} value={String(w.code)}>{w.name}</option>
                    ))}
                  </select>
                </div>

                {/* Số nhà, tên đường */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Số nhà, tên đường *</label>
                  <input
                    required
                    type="text"
                    className="w-full bg-slate-50/50 border border-slate-200 rounded-xl p-3 text-xs focus:border-[#ff8d28] outline-none transition-all"
                    placeholder="VD: 123 Nguyễn Văn Linh"
                    value={streetAddress}
                    onChange={(e) => setStreetAddress(e.target.value)}
                  />
                </div>
                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Ghi chú đơn hàng</label>
                  <input 
                    type="text"
                    className="w-full bg-slate-50/50 border border-slate-200 rounded-xl p-3 text-xs focus:border-[#ff8d28] outline-none transition-all"
                    placeholder="Lời nhắn cho shipper..."
                    value={customerInfo.note}
                    onChange={(e) => setCustomerInfo({...customerInfo, note: e.target.value})}
                  />
                </div>
              </div>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <section className="bg-white rounded-[26px] border border-slate-100 p-6 shadow-sm">
                <div className="flex items-center gap-2.5 mb-5">
                  <span className="flex size-8 items-center justify-center rounded-full bg-[#ff8d28] text-white text-xs font-black">2</span>
                  <h2 className="text-md font-black uppercase tracking-tight">Vận chuyển</h2>
                </div>

                <div className="space-y-3">
                  <label className={`flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer ${shippingMethod === "standard" ? "border-[#ff8d28] bg-orange-50/10" : "border-slate-200 hover:border-slate-300"}`}>
                    <div className="flex items-center gap-2.5">
                      <input 
                        type="radio" 
                        name="shipping" 
                        className="hidden" 
                        checked={shippingMethod === "standard"}
                        onChange={() => setShippingMethod("standard")}
                      />
                      <div className={`size-4 rounded-full border-2 flex items-center justify-center ${shippingMethod === "standard" ? "border-[#ff8d28]" : "border-slate-300"}`}>
                        {shippingMethod === "standard" && <div className="size-2 rounded-full bg-[#ff8d28]" />}
                      </div>
                      <div>
                        <p className="text-xs font-bold">Giao hàng tiêu chuẩn</p>
                        <p className="text-[10px] text-slate-400 font-semibold mt-0.5">3-5 ngày làm việc</p>
                      </div>
                    </div>
                    <span className="text-xs font-black text-green-600">Free</span>
                  </label>

                  <label className={`flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer ${shippingMethod === "express" ? "border-[#ff8d28] bg-orange-50/10" : "border-slate-200 hover:border-slate-300"}`}>
                    <div className="flex items-center gap-2.5">
                      <input 
                        type="radio" 
                        name="shipping" 
                        className="hidden" 
                        checked={shippingMethod === "express"}
                        onChange={() => setShippingMethod("express")}
                      />
                      <div className={`size-4 rounded-full border-2 flex items-center justify-center ${shippingMethod === "express" ? "border-[#ff8d28]" : "border-slate-300"}`}>
                        {shippingMethod === "express" && <div className="size-2 rounded-full bg-[#ff8d28]" />}
                      </div>
                      <div>
                        <p className="text-xs font-bold">Giao hàng hỏa tốc</p>
                        <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Trong vòng 24h</p>
                      </div>
                    </div>
                    <span className="text-xs font-black">{formatPrice(50000)}</span>
                  </label>
                </div>
              </section>

              <section className="bg-white rounded-[26px] border border-slate-100 p-6 shadow-sm">
                <div className="flex items-center gap-2.5 mb-5">
                  <span className="flex size-8 items-center justify-center rounded-full bg-[#ff8d28] text-white text-xs font-black">3</span>
                  <h2 className="text-md font-black uppercase tracking-tight">Thanh toán</h2>
                </div>

                <div className="space-y-3">
                  <label className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all cursor-pointer ${paymentMethod === "cod" ? "border-[#ff8d28] bg-orange-50/10" : "border-slate-200 hover:border-slate-300"}`}>
                    <input 
                      type="radio" 
                      className="hidden" 
                      checked={paymentMethod === "cod"}
                      onChange={() => setPaymentMethod("cod")}
                    />
                    <div className={`size-4 rounded-full border-2 flex items-center justify-center ${paymentMethod === "cod" ? "border-[#ff8d28]" : "border-slate-300"}`}>
                      {paymentMethod === "cod" && <div className="size-2 rounded-full bg-[#ff8d28]" />}
                    </div>
                    <p className="text-xs font-bold">Thanh toán khi nhận hàng (COD)</p>
                  </label>

                  <label className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all cursor-pointer ${paymentMethod === "bank" ? "border-[#ff8d28] bg-orange-50/10" : "border-slate-200 hover:border-slate-300"}`}>
                    <input 
                      type="radio" 
                      className="hidden" 
                      checked={paymentMethod === "bank"}
                      onChange={() => setPaymentMethod("bank")}
                    />
                    <div className={`size-4 rounded-full border-2 flex items-center justify-center ${paymentMethod === "bank" ? "border-[#ff8d28]" : "border-slate-300"}`}>
                      {paymentMethod === "bank" && <div className="size-2 rounded-full bg-[#ff8d28]" />}
                    </div>
                    <p className="text-xs font-bold">Chuyển khoản ngân hàng</p>
                  </label>

                  {paymentMethod === "bank" && (
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 flex flex-col items-center">
                      <div className="w-full">
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider mb-2">Quét mã VietQR để thanh toán</p>
                        <div className="border border-slate-200 rounded-xl p-2.5 bg-white flex justify-center shadow-inner">
                          <img 
                            src={`https://img.vietqr.io/image/Techcombank-123456789001-compact.png?amount=${finalTotal}&addInfo=DH${Date.now()}&accountName=SUDION%20STUDIO`}
                            alt="VietQR Payment Code"
                            className="w-[180px] h-[180px] object-contain"
                          />
                        </div>
                      </div>
                      <div className="w-full text-left space-y-1 text-xs">
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider mt-1">Thông tin chuyển khoản</p>
                        <p className="text-slate-600">Ngân hàng: <span className="font-extrabold text-slate-800">Techcombank</span></p>
                        <p className="text-slate-600">Số tài khoản: <span className="font-extrabold text-slate-800 copyable">123456789001</span></p>
                        <p className="text-slate-600">Chủ tài khoản: <span className="font-extrabold text-slate-800 uppercase font-mono">SUDION STUDIO</span></p>
                        <p className="text-slate-600">Số tiền: <span className="font-black text-[#ff8d28]">{formatPrice(finalTotal)}</span></p>
                        <p className="text-[9.5px] text-slate-400 italic mt-3 leading-snug border-t border-slate-200/60 pt-2 font-medium">
                          * Quý khách vui lòng chuyển khoản đúng số tiền trên. Hệ thống sẽ xác nhận thanh toán sau khi giao dịch thành công.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </section>
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-5">
            <div className="bg-white p-6 rounded-[26px] border border-slate-100 shadow-md space-y-6">
              <h2 className="text-lg font-black uppercase border-b border-slate-50 pb-4">Tóm tắt đơn hàng</h2>
              
              <div className="max-h-[260px] overflow-y-auto pr-1 space-y-3">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3 p-2.5 rounded-xl bg-slate-50/60 border border-slate-100">
                    <div className="size-14 rounded-lg overflow-hidden shrink-0 border border-slate-100">
                      <img src={resolveProductImageUrl(item.hinh_anh)} alt={item.ten_san_pham} className="size-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <h4 className="text-xs font-extrabold truncate text-slate-800">{item.ten_san_pham}</h4>
                      {item.bien_the && <p className="text-[9px] text-slate-400 uppercase font-black tracking-tight">{item.bien_the}</p>}
                      <div className="flex items-center justify-between mt-1 text-xs">
                        <span className="text-slate-400 font-semibold">x{item.so_luong}</span>
                        <span className="font-extrabold text-[#ff8d28]">{formatPrice(item.gia_ban * item.so_luong)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3 pt-4 border-t border-slate-100 text-sm font-semibold text-slate-500">
                <div className="flex justify-between">
                  <span>Tạm tính:</span>
                  <span className="text-slate-800 font-extrabold">{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Phí vận chuyển:</span>
                  <span>{shippingFee > 0 ? formatPrice(shippingFee) : "Miễn phí"}</span>
                </div>
                <div className="pt-4 border-t border-slate-200/60 flex justify-between items-end">
                  <div>
                    <span className="text-md font-black text-slate-800 block">Tổng thanh toán:</span>
                    <span className="text-[9px] text-slate-400 block mt-0.5">(Đã bao gồm VAT)</span>
                  </div>
                  <span className="text-2xl font-black text-[#ff8d28]">{formatPrice(finalTotal)}</span>
                </div>
              </div>

              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 bg-gradient-to-r from-[#ff5e00] to-[#ff3c00] hover:scale-[1.01] active:scale-[0.99] text-white font-extrabold rounded-xl transition text-sm flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-[#ff3c00]/25 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                ) : (
                  <>
                    Xác nhận đặt hàng
                    <span className="material-symbols-outlined text-sm">verified_user</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}
