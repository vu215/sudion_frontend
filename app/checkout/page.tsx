"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/auth-context";
import { useToast } from "@/app/toast-context";
import { readCart, clearCart, readBuyNow, clearBuyNow, CartItem } from "@/app/cart-store";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

function resolveProductImageUrl(path: string) {
  if (!path) return "/default-product.png";
  if (path.startsWith("http") || path.startsWith("data:")) return path;
  const backendHost = API_URL.replace(/\/api\/?$/, "");
  if (path.startsWith("/")) return `${backendHost}${path}`;
  return `${backendHost}/uploads/${path}`;
}

type VnLocation = { code: number; name: string };

export interface SavedAddressItem {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
  provinceCode?: string;
  provinceName?: string;
  districtCode?: string;
  districtName?: string;
  wardCode?: string;
  wardName?: string;
  streetAddress: string;
  fullAddress: string;
  isDefault?: boolean;
}

const STORAGE_ADDRESS_KEY = "sudion_saved_address_list_v2";

export default function CheckoutPage() {
  const router = useRouter();
  const [isBuyNow, setIsBuyNow] = useState(false);
  const toast = useToast();
  const { session } = useAuth();

  const [items, setItems] = useState<CartItem[]>([]);
  const [totalPrice, setTotalPrice] = useState(0);

  // Address Manager State
  const [addressList, setAddressList] = useState<SavedAddressItem[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<SavedAddressItem | null>(null);

  // Modal controls
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<SavedAddressItem | null>(null);

  // Form Fields State
  const [formName, setFormName] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedWard, setSelectedWard] = useState("");
  const [streetAddress, setStreetAddress] = useState("");
  const [isDefaultAddr, setIsDefaultAddr] = useState(false);

  const [customerNote, setCustomerNote] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [shippingMethod, setShippingMethod] = useState("standard");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setIsBuyNow(new URLSearchParams(window.location.search).get("mode") === "buy-now");
  }, []);

  // Vietnam Cascading Location Data
  const [provinces, setProvinces] = useState<VnLocation[]>([]);
  const [districts, setDistricts] = useState<VnLocation[]>([]);
  const [wards, setWards] = useState<VnLocation[]>([]);

  // Fetch Provinces on mount
  useEffect(() => {
    fetch("https://provinces.open-api.vn/api/p/")
      .then((r) => r.json())
      .then((data: VnLocation[]) => {
        if (Array.isArray(data)) setProvinces(data);
      })
      .catch(() => {});
  }, []);

  // Fetch Districts when province changes
  useEffect(() => {
    setDistricts([]);
    setWards([]);
    setSelectedDistrict("");
    setSelectedWard("");
    if (!selectedProvince) return;

    fetch(`https://provinces.open-api.vn/api/p/${selectedProvince}?depth=2`)
      .then((r) => r.json())
      .then((data: { districts?: VnLocation[] }) => {
        if (Array.isArray(data.districts)) setDistricts(data.districts);
      })
      .catch(() => {});
  }, [selectedProvince]);

  // Fetch Wards when district changes
  useEffect(() => {
    setWards([]);
    setSelectedWard("");
    if (!selectedDistrict) return;

    fetch(`https://provinces.open-api.vn/api/d/${selectedDistrict}?depth=2`)
      .then((r) => r.json())
      .then((data: { wards?: VnLocation[] }) => {
        if (Array.isArray(data.wards)) setWards(data.wards);
      })
      .catch(() => {});
  }, [selectedDistrict]);

  useEffect(() => {
    const cartItems = isBuyNow ? readBuyNow() : readCart();
    setItems(cartItems);
    setTotalPrice(cartItems.reduce((sum, item) => sum + item.gia_ban * item.so_luong, 0));

    if (typeof window !== "undefined") {
      try {
        const raw = window.localStorage.getItem(STORAGE_ADDRESS_KEY);
        if (raw) {
          const list: SavedAddressItem[] = JSON.parse(raw);
          if (Array.isArray(list) && list.length > 0) {
            setAddressList(list);
            const def = list.find((a) => a.isDefault) || list[0];
            setSelectedAddress(def);
          }
        } else if (session?.fullName) {
          const sample: SavedAddressItem = {
            id: `ADDR_${Date.now()}`,
            fullName: session.fullName,
            phone: session.phone || "0901234567",
            email: session.email || "",
            streetAddress: "299/22 Khuông Việt",
            fullAddress: "299/22 Khuông Việt, Phường Tân Phú, Quận Tân Phú, TP Hồ Chí Minh",
            isDefault: true,
          };
          setAddressList([sample]);
          setSelectedAddress(sample);
          window.localStorage.setItem(STORAGE_ADDRESS_KEY, JSON.stringify([sample]));
        }
      } catch (e) {
        console.error("Lỗi đọc địa chỉ checkout:", e);
      }
    }
  }, [session, isBuyNow]);

  const saveAddressListToStorage = (list: SavedAddressItem[]) => {
    setAddressList(list);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_ADDRESS_KEY, JSON.stringify(list));
    }
  };

  const openNewForm = () => {
    setEditingAddress(null);
    setFormName(session?.fullName || "");
    setFormPhone(session?.phone || "");
    setFormEmail(session?.email || "");
    setSelectedProvince("");
    setSelectedDistrict("");
    setSelectedWard("");
    setStreetAddress("");
    setIsDefaultAddr(addressList.length === 0);
    setShowEditForm(true);
  };

  const openEditForm = (addr: SavedAddressItem) => {
    setEditingAddress(addr);
    setFormName(addr.fullName);
    setFormPhone(addr.phone);
    setFormEmail(addr.email || "");
    setSelectedProvince(addr.provinceCode || "");
    setSelectedDistrict(addr.districtCode || "");
    setSelectedWard(addr.wardCode || "");
    setStreetAddress(addr.streetAddress || "");
    setIsDefaultAddr(Boolean(addr.isDefault));
    setShowEditForm(true);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formName.trim() || !formPhone.trim()) {
      toast.error("Thiếu thông tin", "Vui lòng nhập Họ tên và Số điện thoại.");
      return;
    }

    const provName = provinces.find((p) => String(p.code) === selectedProvince)?.name || "";
    const distName = districts.find((d) => String(d.code) === selectedDistrict)?.name || "";
    const wardName = wards.find((w) => String(w.code) === selectedWard)?.name || "";

    const parts = [streetAddress, wardName, distName, provName].filter(Boolean);
    const fullAddressText = parts.length > 0 ? parts.join(", ") : streetAddress;

    if (!fullAddressText.trim()) {
      toast.error("Thiếu địa chỉ", "Vui lòng chọn hoặc nhập đầy đủ địa chỉ.");
      return;
    }

    const newAddr: SavedAddressItem = {
      id: editingAddress ? editingAddress.id : `ADDR_${Date.now()}`,
      fullName: formName.trim(),
      phone: formPhone.trim(),
      email: formEmail.trim(),
      provinceCode: selectedProvince,
      provinceName: provName,
      districtCode: selectedDistrict,
      districtName: distName,
      wardCode: selectedWard,
      wardName: wardName,
      streetAddress: streetAddress.trim(),
      fullAddress: fullAddressText,
      isDefault: isDefaultAddr,
    };

    let updatedList = [...addressList];

    if (editingAddress) {
      updatedList = updatedList.map((item) => (item.id === editingAddress.id ? newAddr : item));
    } else {
      updatedList.unshift(newAddr);
    }

    if (isDefaultAddr) {
      updatedList = updatedList.map((item) => ({
        ...item,
        isDefault: item.id === newAddr.id,
      }));
    }

    saveAddressListToStorage(updatedList);
    setSelectedAddress(newAddr);
    setShowEditForm(false);
    toast.success("Đã lưu địa chỉ", "Thông tin địa chỉ đã được cập nhật thành công.");
  };

  const handleDeleteAddress = (id: string) => {
    const updated = addressList.filter((a) => a.id !== id);
    saveAddressListToStorage(updated);
    if (selectedAddress?.id === id) {
      setSelectedAddress(updated[0] || null);
    }
    toast.info("Đã xóa địa chỉ", "Địa chỉ đã được xóa khỏi danh sách.");
  };

  const handleSelectAddressItem = (addr: SavedAddressItem) => {
    setSelectedAddress(addr);
    setShowAddressModal(false);
  };

  const shippingFee = shippingMethod === "express" ? 50000 : 0;
  const finalTotal = totalPrice + shippingFee;

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();

    if (items.length === 0) {
      toast.error("Lỗi", "Giỏ hàng của bạn đang trống.");
      return;
    }

    if (!selectedAddress) {
      toast.error("Chưa có địa chỉ", "Vui lòng chọn hoặc thêm địa chỉ nhận hàng.");
      setShowAddressModal(true);
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
            bien_the: item.bien_the,
          })),
          totalAmount: finalTotal,
          customerInfo: {
            name: selectedAddress.fullName,
            phone: selectedAddress.phone,
            email: selectedAddress.email || session?.email || "guest@sudion.vn",
            address: selectedAddress.fullAddress,
            note: customerNote,
            paymentMethod,
            shippingMethod,
          },
        }),
      });

      const resData = await res.json();
      if (res.ok && resData.success) {
        if (isBuyNow) clearBuyNow();
        else clearCart();
        if (typeof window !== "undefined") {
          const completedOrder = {
            ...resData.order,
            created_at: resData.order?.created_at || new Date().toISOString(),
          };
          window.sessionStorage.setItem("sudion-last-order", JSON.stringify(completedOrder));

          // Giữ lịch sử dự phòng theo tài khoản để đơn mới không ghi đè đơn cũ
          // trong trường hợp API lịch sử tạm thời chưa đồng bộ.
          const accountKey = String(session?.userId || session?.email || "guest").toLowerCase();
          const historyKey = `sudion-order-history:${accountKey}`;
          try {
            const rawHistory = window.localStorage.getItem(historyKey);
            const history = rawHistory ? JSON.parse(rawHistory) : [];
            const withoutCurrent = Array.isArray(history)
              ? history.filter((order: any) => String(order.id) !== String(completedOrder.id))
              : [];
            window.localStorage.setItem(historyKey, JSON.stringify([completedOrder, ...withoutCurrent]));
          } catch { /* database vẫn là nguồn dữ liệu chính */ }
        }
        toast.success("Thành công", "Đơn hàng đã được đặt thành công!");
        router.push(`/checkout/success?orderId=${resData.order?.id || ""}`);
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
            
            {/* TIKTOK SHOP STYLE MINIMAL ADDRESS CARD */}
            <section className="bg-white rounded-[26px] border border-slate-100 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2.5">
                  <span className="flex size-8 items-center justify-center rounded-full bg-[#ff8d28] text-white text-xs font-black">1</span>
                  <h2 className="text-md font-black uppercase tracking-tight">Thông tin nhận hàng</h2>
                </div>
              </div>

              {selectedAddress ? (
                <div
                  onClick={() => setShowAddressModal(true)}
                  className="group flex items-start justify-between rounded-2xl border border-slate-200 bg-slate-50/50 p-4 transition-all hover:border-[#ff8d28] cursor-pointer"
                >
                  <div className="flex items-start gap-3 min-w-0 pr-2">
                    <svg className="h-5 w-5 text-[#ff8d28] shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <div className="space-y-1 text-xs min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-extrabold text-[#0e111d] text-sm">{selectedAddress.fullName}</span>
                        <span className="text-slate-500">({selectedAddress.phone})</span>
                        {selectedAddress.isDefault && (
                          <span className="rounded bg-slate-200/60 px-1.5 py-0.5 text-[9.5px] font-bold text-slate-600">
                            Mặc định
                          </span>
                        )}
                      </div>
                      <p className="text-slate-600 leading-relaxed font-medium">
                        {selectedAddress.fullAddress}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowAddressModal(true)}
                    className="text-xs font-bold text-red-500 hover:underline shrink-0 pt-0.5"
                  >
                    Chỉnh sửa
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={openNewForm}
                  className="flex w-full items-center justify-between rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 p-4 text-xs font-bold text-slate-700 hover:border-[#ff8d28] transition"
                >
                  <span className="flex items-center gap-2 text-[#ff8d28]">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    Thêm địa chỉ nhận hàng
                  </span>
                  <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              )}

              <div className="space-y-1.5 pt-2">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Ghi chú đơn hàng</label>
                <input 
                  type="text"
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-xl p-3 text-xs focus:border-[#ff8d28] outline-none transition-all"
                  placeholder="Lời nhắn cho shipper..."
                  value={customerNote}
                  onChange={(e) => setCustomerNote(e.target.value)}
                />
              </div>
            </section>

            {/* Shipping & Payment Options */}
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
                            src={`https://img.vietqr.io/image/TCB-19075748293011-compact.png?amount=${finalTotal}&addInfo=EQUIP${Date.now().toString().slice(-6)}&accountName=TRAN%20THIEN%20VU`}
                            alt="VietQR Payment Code"
                            className="w-[180px] h-[180px] object-contain"
                          />
                        </div>
                      </div>
                      <div className="w-full text-left space-y-1 text-xs">
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider mt-1">Thông tin chuyển khoản</p>
                        <p className="text-slate-600">Ngân hàng: <span className="font-extrabold text-slate-800">Techcombank (TCB)</span></p>
                        <p className="text-slate-600">Số tài khoản: <span className="font-extrabold text-slate-800 select-all">19075748293011</span></p>
                        <p className="text-slate-600">Chủ tài khoản: <span className="font-extrabold text-slate-800 uppercase font-mono">TRAN THIEN VU</span></p>
                        <p className="text-slate-600">Số tiền: <span className="font-black text-[#ff8d28]">{formatPrice(finalTotal)}</span></p>
                      </div>
                    </div>
                  )}
                </div>
              </section>
            </div>
          </div>

          {/* Right Column Summary */}
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
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
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

      {/* ════════ TIKTOK SHOP ADDRESS MANAGER MODAL ("ĐỊA CHỈ CỦA BẠN") ════════ */}
      {showAddressModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-[480px] overflow-hidden rounded-2xl bg-white shadow-xl transition-all border border-gray-100">
            
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3.5">
              <h3 className="text-sm font-bold text-[#0e111d]">Địa chỉ của bạn</h3>
              <button
                type="button"
                onClick={() => setShowAddressModal(false)}
                className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="max-h-[420px] overflow-y-auto px-5 py-3 divide-y divide-gray-100">
              <button
                type="button"
                onClick={() => {
                  setShowAddressModal(false);
                  openNewForm();
                }}
                className="flex w-full items-center justify-between py-3.5 text-left text-xs font-semibold text-gray-800 hover:text-[#ff8d28] transition"
              >
                <span className="flex items-center gap-2">
                  <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  Thêm địa chỉ
                </span>
                <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>

              {addressList.map((addr) => {
                const isSelected = selectedAddress?.id === addr.id;

                return (
                  <div
                    key={addr.id}
                    onClick={() => handleSelectAddressItem(addr)}
                    className="group flex items-start justify-between py-4 transition-all cursor-pointer"
                  >
                    <div className="space-y-1 min-w-0 pr-3">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold ${isSelected ? "text-[#0e111d]" : "text-gray-800"}`}>
                          {addr.fullName}
                        </span>
                        {isSelected && (
                          <span className="h-1.5 w-1.5 rounded-full bg-[#ff8d28]" />
                        )}
                      </div>
                      <p className="text-xs text-gray-500 font-normal">{addr.phone}</p>
                      <p className="text-xs text-gray-600 leading-relaxed font-normal">{addr.fullAddress}</p>
                      {addr.isDefault && (
                        <div className="pt-1">
                          <span className="rounded bg-gray-100 px-2 py-0.5 text-[9.5px] font-medium text-gray-500">
                            Mặc định
                          </span>
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowAddressModal(false);
                        openEditForm(addr);
                      }}
                      className="text-xs font-semibold text-red-500 hover:underline shrink-0 pt-0.5"
                    >
                      Chỉnh sửa
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="border-t border-gray-100 px-5 py-3 bg-gray-50 flex justify-end">
              <button
                type="button"
                onClick={() => setShowAddressModal(false)}
                className="rounded-lg border border-gray-200 bg-white px-4 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-100"
              >
                Đóng
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ════════ ADD / EDIT ADDRESS FORM MODAL ════════ */}
      {showEditForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-[540px] overflow-hidden rounded-3xl bg-white shadow-2xl transition-all">
            
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <h3 className="text-base font-black text-[#0e111d]">
                {editingAddress ? "Chỉnh sửa địa chỉ" : "Thêm địa chỉ mới"}
              </h3>
              <button
                type="button"
                onClick={() => setShowEditForm(false)}
                className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="p-6 space-y-4 max-h-[480px] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-gray-500">Họ và tên *</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="VD: Trần Thiện Vũ"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-semibold outline-none focus:border-[#ff8d28]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-gray-500">Số điện thoại *</label>
                  <input
                    type="tel"
                    required
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="09XXXXXXXX"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-semibold outline-none focus:border-[#ff8d28]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-gray-500">Tỉnh / Thành phố *</label>
                  <select
                    value={selectedProvince}
                    onChange={(e) => setSelectedProvince(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-2.5 py-2 text-xs font-semibold outline-none focus:border-[#ff8d28] cursor-pointer"
                  >
                    <option value="">— Chọn Tỉnh/Thành —</option>
                    {provinces.map((p) => (
                      <option key={p.code} value={String(p.code)}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-gray-500">Quận / Huyện *</label>
                  <select
                    disabled={!selectedProvince}
                    value={selectedDistrict}
                    onChange={(e) => setSelectedDistrict(e.target.value)}
                    className="w-full rounded-xl border border-[#e2e8f0] bg-gray-50 px-2.5 py-2 text-xs font-semibold outline-none focus:border-[#ff8d28] cursor-pointer disabled:opacity-50"
                  >
                    <option value="">— Chọn Quận/Huyện —</option>
                    {districts.map((d) => (
                      <option key={d.code} value={String(d.code)}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-gray-500">Phường / Xã *</label>
                  <select
                    disabled={!selectedDistrict}
                    value={selectedWard}
                    onChange={(e) => setSelectedWard(e.target.value)}
                    className="w-full rounded-xl border border-[#e2e8f0] bg-gray-50 px-2.5 py-2 text-xs font-semibold outline-none focus:border-[#ff8d28] cursor-pointer disabled:opacity-50"
                  >
                    <option value="">— Chọn Phường/Xã —</option>
                    {wards.map((w) => (
                      <option key={w.code} value={String(w.code)}>
                        {w.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-gray-500">Số nhà, tên đường *</label>
                  <input
                    type="text"
                    required
                    value={streetAddress}
                    onChange={(e) => setStreetAddress(e.target.value)}
                    placeholder="VD: 299/22 Khuông Việt"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-semibold outline-none focus:border-[#ff8d28]"
                  />
                </div>
              </div>

              <div
                onClick={() => setIsDefaultAddr(!isDefaultAddr)}
                className="flex items-center gap-2.5 pt-2 cursor-pointer select-none"
              >
                <div className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-all ${
                  isDefaultAddr ? "border-[#ff8d28] bg-[#ff8d28] text-white" : "border-gray-300 bg-white"
                }`}>
                  {isDefaultAddr && (
                    <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span className="text-xs font-medium text-gray-700">Đặt làm địa chỉ mặc định</span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                {editingAddress && (
                  <button
                    type="button"
                    onClick={() => handleDeleteAddress(editingAddress.id)}
                    className="mr-auto text-xs font-bold text-red-500 hover:underline"
                  >
                    Xóa địa chỉ
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowEditForm(false)}
                  className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-100"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#ff8d28] px-5 py-2 text-xs font-bold text-white shadow hover:bg-[#e0751b]"
                >
                  Lưu địa chỉ
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </main>
  );
}
