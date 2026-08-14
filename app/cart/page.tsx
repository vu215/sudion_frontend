"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/auth-context";
import { useToast } from "@/app/toast-context";
import {
  readBookingCart,
  removeFromBookingCart,
  clearBookingCart,
  BookingCartItem,
  getBookingCartTotalDeposit,
  getBookingCartTotalEstimated,
} from "@/app/booking-cart-store";
import {
  readCart,
  removeFromCart,
  updateCartQuantity,
  clearCart,
  CartItem as ProductCartItem,
  getCartTotal,
} from "@/app/cart-store";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

function formatCurrency(val: number) {
  return `${(val || 0).toLocaleString("vi-VN")} VND`;
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

export default function CartPage() {
  const { session } = useAuth();
  const router = useRouter();
  const toast = useToast();

  const [bookingItems, setBookingItems] = useState<BookingCartItem[]>([]);
  const [productItems, setProductItems] = useState<ProductCartItem[]>([]);
  const [submitting, setSubmitting] = useState(false);

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
  const [orderNote, setOrderNote] = useState("");
  const [checkoutMode, setCheckoutMode] = useState<"all" | "separate">("all");

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

  // Load items & saved address list on mount
  useEffect(() => {
    setBookingItems(readBookingCart());
    setProductItems(readCart());

    const handleCartUpdate = () => {
      setBookingItems(readBookingCart());
      setProductItems(readCart());
    };

    window.addEventListener("bookingCartUpdated", handleCartUpdate);
    window.addEventListener("cartUpdated", handleCartUpdate);

    // Load saved address list from localStorage
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
          // Initialize mock sample if logged in for first time
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
        console.error("Lỗi đọc danh sách địa chỉ:", e);
      }
    }

    return () => {
      window.removeEventListener("bookingCartUpdated", handleCartUpdate);
      window.removeEventListener("cartUpdated", handleCartUpdate);
    };
  }, [session]);

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

  const handleRemoveBooking = (id: string) => {
    removeFromBookingCart(id);
    toast.info("Đã xóa khỏi giỏ", "Buổi chụp đã được xóa.");
  };

  const handleRemoveProduct = (id: string) => {
    removeFromCart(id);
    toast.info("Đã xóa khỏi giỏ", "Sản phẩm đã được xóa.");
  };

  const handleUpdateProductQty = (id: string, delta: number) => {
    updateCartQuantity(id, delta);
  };

  const handleCheckoutGroupBookings = async () => {
    if (bookingItems.length === 0) {
      toast.error("Giỏ hàng trống", "Vui lòng thêm buổi chụp vào giỏ trước khi thanh toán.");
      return;
    }

    if (!selectedAddress) {
      toast.error("Chưa có địa chỉ", "Vui lòng chọn hoặc thêm địa chỉ nhận dịch vụ.");
      setShowAddressModal(true);
      return;
    }

    try {
      setSubmitting(true);

      const token = typeof window !== "undefined" ? window.localStorage.getItem("sudion_token") : null;
      const response = await fetch(`${API_URL}/bookings/batch`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          items: bookingItems,
          customer: {
            fullName: selectedAddress.fullName,
            phone: selectedAddress.phone,
            email: selectedAddress.email || session?.email || "guest@sudion.vn",
            address: selectedAddress.fullAddress,
            note: orderNote,
            contactChannel: "Zalo",
          },
        }),
      });

      const json = await response.json();
      if (!response.ok || !json.success) {
        throw new Error(json.message || "Tạo đơn gom thất bại.");
      }

      clearBookingCart();
      toast.success("Tạo đơn thành công", `Đã tạo ${json.data.bookings.length} đơn. Đang chuyển tới trang thanh toán...`);
      router.push(`/checkout-gateway?groupCode=${json.data.group_code}`);
    } catch (err: any) {
      toast.error("Không thể tạo đơn", err.message || "Đã xảy ra lỗi hệ thống.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCheckoutProducts = () => {
    if (productItems.length === 0) {
      toast.error("Giỏ hàng trống", "Vui lòng thêm sản phẩm/thiết bị vào giỏ.");
      return;
    }
    if (!selectedAddress) {
      toast.error("Chưa có địa chỉ", "Vui lòng chọn hoặc thêm địa chỉ nhận hàng.");
      setShowAddressModal(true);
      return;
    }
    router.push("/checkout");
  };

  const bookingDepositTotal = getBookingCartTotalDeposit();
  const bookingEstimatedTotal = getBookingCartTotalEstimated();
  const productTotal = getCartTotal();

  const isCartEmpty = bookingItems.length === 0 && productItems.length === 0;

  return (
    <main className="min-h-screen bg-[#fafbfc] text-[#0e111d] font-sans antialiased">
      <section className="mx-auto w-full max-w-[1200px] px-5 py-8 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col gap-3 border-b border-[#e2e8f0] pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <svg className="h-5 w-5 text-[#ff8d28]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <span className="text-xs font-bold uppercase tracking-wider text-[#ff8d28]">
                Giỏ hàng tổng hợp
              </span>
            </div>
            <h1 className="mt-1 text-2xl font-black tracking-tight text-[#0e111d] sm:text-3xl">
              Danh sách dịch vụ & thiết bị đã chọn
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/photographer"
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#e2e8f0] bg-white px-4 py-2.5 text-xs font-bold text-[#334155] shadow-sm hover:border-[#ff8d28] hover:text-[#ff8d28] transition-all"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              <span>Đặt lịch chụp</span>
            </Link>
            <Link
              href="/products"
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#e2e8f0] bg-white px-4 py-2.5 text-xs font-bold text-[#334155] shadow-sm hover:border-[#ff8d28] hover:text-[#ff8d28] transition-all"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              <span>Mua máy ảnh</span>
            </Link>
          </div>
        </div>

        {/* Empty State */}
        {isCartEmpty ? (
          <div className="mt-10 rounded-3xl border border-dashed border-[#cbd5e1] bg-white p-12 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-gray-200 bg-gray-50 text-gray-400">
              <svg className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h2 className="mt-4 text-xl font-bold text-[#0e111d]">Giỏ hàng của bạn đang trống</h2>
            <p className="mt-1 text-xs text-[#64748b]">
              Bạn chưa có buổi chụp ảnh hoặc sản phẩm máy ảnh nào trong giỏ hàng.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <Link
                href="/photographer"
                className="rounded-xl bg-[#ff8d28] px-5 py-2.5 text-xs font-bold text-white shadow hover:bg-[#e0751b] transition"
              >
                Khám phá Nhiếp ảnh gia
              </Link>
              <Link
                href="/products"
                className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-xs font-bold text-gray-700 hover:border-[#ff8d28] transition"
              >
                Xem Thiết bị Máy ảnh
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_420px]">
            
            {/* LEFT COLUMN: BOTH SECTIONS (BOOKING + PRODUCTS) */}
            <div className="space-y-8">
              
              {/* SECTION 1: BOOKING SERVICES */}
              {bookingItems.length > 0 && (
                <section className="rounded-2xl border border-[#e2e8f0] bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between border-b border-[#f1f5f9] pb-4">
                    <div className="flex items-center gap-2">
                      <svg className="h-5 w-5 text-[#ff8d28]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <h2 className="text-base font-bold text-[#0e111d]">
                        Dịch vụ chụp ảnh gom đơn ({bookingItems.length})
                      </h2>
                    </div>
                    <span className="text-xs font-semibold text-[#64748b]">Tùy chọn cọc 30%</span>
                  </div>

                  <div className="mt-4 grid gap-4">
                    {bookingItems.map((item) => (
                      <div
                        key={item.cartItemId}
                        className="rounded-xl border border-[#e2e8f0] bg-[#fafbfc] p-4 transition-all hover:border-[#ff8d28]/40"
                      >
                        <div className="flex items-start justify-between border-b border-[#e2e8f0]/60 pb-3">
                          <div className="flex items-center gap-4">
                            <div className="relative h-16 w-16 overflow-hidden rounded-xl border border-gray-200 bg-white shrink-0 shadow-sm">
                              {item.packageImage ? (
                                <Image
                                  src={item.packageImage}
                                  alt={item.packageName}
                                  fill
                                  className="object-cover"
                                  sizes="64px"
                                  unoptimized
                                />
                              ) : (
                                <div className="grid h-full w-full place-items-center bg-orange-50 text-xs font-black text-[#ff8d28]">
                                  {(item.categorySlug || "DỊCH VỤ").slice(0, 3).toUpperCase()}
                                </div>
                              )}
                            </div>

                            <div>
                              <span className="rounded bg-orange-100/70 px-2 py-0.5 text-[10px] font-bold text-orange-700 uppercase tracking-wider">
                                {item.categorySlug || "Dịch vụ"}
                              </span>
                              <h3 className="mt-1 text-base font-bold text-[#0e111d]">{item.packageName}</h3>
                              <p className="text-xs text-[#64748b]">
                                Nhiếp ảnh gia: <strong className="text-[#0e111d]">{item.photographerName}</strong>
                              </p>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveBooking(item.cartItemId)}
                            title="Xóa khỏi giỏ"
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-red-200 bg-white text-red-500 transition-all hover:bg-red-50 hover:border-red-400"
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>

                        <div className="mt-3 grid gap-2 sm:grid-cols-3 text-xs">
                          <div>
                            <span className="text-[10px] font-semibold uppercase text-gray-400 block">Lịch chụp</span>
                            <span className="font-bold text-[#0e111d]">{item.shootDate} ({item.shootTime})</span>
                          </div>
                          <div>
                            <span className="text-[10px] font-semibold uppercase text-gray-400 block">Địa điểm</span>
                            <span className="font-bold text-[#0e111d] truncate block">{item.location}</span>
                          </div>
                          <div>
                            <span className="text-[10px] font-semibold uppercase text-gray-400 block">Tiền cọc ({item.depositPercent}%)</span>
                            <span className="font-bold text-[#ff8d28]">{formatCurrency(item.depositAmount)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* SECTION 2: PRODUCTS & CAMERA EQUIPMENT */}
              {productItems.length > 0 && (
                <section className="rounded-2xl border border-[#e2e8f0] bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between border-b border-[#f1f5f9] pb-4">
                    <div className="flex items-center gap-2">
                      <svg className="h-5 w-5 text-[#ff8d28]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      <h2 className="text-base font-bold text-[#0e111d]">
                        Thiết bị máy ảnh & Sản phẩm ({productItems.length})
                      </h2>
                    </div>
                    <span className="text-xs font-semibold text-[#64748b]">Mua / Thuê thiết bị</span>
                  </div>

                  <div className="mt-4 grid gap-3">
                    {productItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between rounded-xl border border-[#e2e8f0] bg-[#fafbfc] p-3.5 transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <div className="relative h-14 w-14 overflow-hidden rounded-lg border border-gray-200 bg-white shrink-0">
                            <Image src={item.hinh_anh} alt={item.ten_san_pham} fill className="object-cover" sizes="56px" unoptimized />
                          </div>
                          <div>
                            <h3 className="text-sm font-bold text-[#0e111d]">{item.ten_san_pham}</h3>
                            {item.bien_the && <p className="text-[11px] text-gray-500">Biến thể: {item.bien_the}</p>}
                            <p className="mt-0.5 text-xs font-bold text-[#ff8d28]">{formatCurrency(item.gia_ban)}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="flex items-center rounded-lg border border-[#e2e8f0] bg-white">
                            <button
                              type="button"
                              onClick={() => handleUpdateProductQty(item.id, -1)}
                              className="px-2.5 py-1 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-l-lg"
                            >
                              -
                            </button>
                            <span className="px-2.5 py-1 text-xs font-bold text-[#0e111d]">{item.so_luong}</span>
                            <button
                              type="button"
                              onClick={() => handleUpdateProductQty(item.id, 1)}
                              className="px-2.5 py-1 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-r-lg"
                            >
                              +
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveProduct(item.id)}
                            title="Xóa khỏi giỏ"
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-red-200 bg-white text-red-500 transition-all hover:bg-red-50 hover:border-red-400"
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* RIGHT COLUMN: TIKTOK SHOP / SHOPEE STYLE ADDRESS CARD & CHECKOUT SUMMARY */}
            <aside className="space-y-6">
              
              {/* ADDRESS CONTAINER CARD */}
              <div className="rounded-2xl border border-[#e2e8f0] bg-white p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-[#f1f5f9] pb-3">
                  <div className="flex items-center gap-2">
                    <svg className="h-4 w-4 text-[#ff8d28]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <h2 className="text-xs font-black uppercase tracking-wider text-[#0e111d]">
                      Địa chỉ nhận hàng & Dịch vụ
                    </h2>
                  </div>
                </div>

                {/* TIKTOK SHOP MINIMAL SELECTED ADDRESS CARD */}
                {selectedAddress ? (
                  <div
                    onClick={() => setShowAddressModal(true)}
                    className="group flex items-start justify-between rounded-xl border border-gray-200 bg-white p-3.5 transition-all hover:border-[#ff8d28] cursor-pointer shadow-sm"
                  >
                    <div className="flex items-start gap-2.5 min-w-0 pr-2">
                      <svg className="h-4 w-4 text-[#ff8d28] shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <div className="space-y-0.5 text-xs min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-[#0e111d]">{selectedAddress.fullName}</span>
                          <span className="text-gray-500">({selectedAddress.phone})</span>
                          {selectedAddress.isDefault && (
                            <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[9px] font-medium text-gray-600">
                              Mặc định
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 leading-snug break-words">
                          {selectedAddress.fullAddress}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-xs font-bold text-red-500 shrink-0 pt-0.5 group-hover:underline">
                      <span>Chỉnh sửa</span>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={openNewForm}
                    className="flex w-full items-center justify-between rounded-xl border border-dashed border-gray-300 bg-white p-3.5 text-xs font-bold text-gray-700 hover:border-[#ff8d28] transition"
                  >
                    <span className="flex items-center gap-2 text-[#ff8d28]">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                      </svg>
                      Thêm địa chỉ nhận hàng / dịch vụ
                    </span>
                    <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                )}

                {/* Chế độ thanh toán - giao diện tĩnh */}
                <div className="space-y-2 pt-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-[#64748b]">Chế độ thanh toán</label>
                  <div className="grid gap-2">
                    <button
                      type="button"
                      onClick={() => setCheckoutMode("all")}
                      className={`flex items-center justify-between rounded-xl border px-3 py-2.5 text-left transition-all ${
                        checkoutMode === "all"
                          ? "border-[#ff8d28] bg-[#fff7ed] shadow-sm"
                          : "border-[#e2e8f0] bg-white hover:border-[#ff8d28]/60"
                      }`}
                    >
                      <div>
                        <div className="text-xs font-bold text-[#0e111d]">Một đơn cho cả giỏ</div>
                        <div className="text-[10px] text-[#64748b]">Thanh toán chung trong một lần</div>
                      </div>
                      <span
                        className={`flex h-4 w-4 items-center justify-center rounded-full border ${
                          checkoutMode === "all" ? "border-[#ff8d28] bg-[#ff8d28]" : "border-[#cbd5e1] bg-white"
                        }`}
                      >
                        {checkoutMode === "all" && <span className="h-2 w-2 rounded-full bg-white" />}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setCheckoutMode("separate")}
                      className={`flex items-center justify-between rounded-xl border px-3 py-2.5 text-left transition-all ${
                        checkoutMode === "separate"
                          ? "border-[#ff8d28] bg-[#fff7ed] shadow-sm"
                          : "border-[#e2e8f0] bg-white hover:border-[#ff8d28]/60"
                      }`}
                    >
                      <div>
                        <div className="text-xs font-bold text-[#0e111d]">Tách đơn riêng</div>
                        <div className="text-[10px] text-[#64748b]">Mỗi sản phẩm / dịch vụ là một đơn</div>
                      </div>
                      <span
                        className={`flex h-4 w-4 items-center justify-center rounded-full border ${
                          checkoutMode === "separate" ? "border-[#ff8d28] bg-[#ff8d28]" : "border-[#cbd5e1] bg-white"
                        }`}
                      >
                        {checkoutMode === "separate" && <span className="h-2 w-2 rounded-full bg-white" />}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Ghi chú đơn hàng */}
                <div className="space-y-1 pt-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-[#64748b]">Ghi chú đơn hàng</label>
                  <input
                    type="text"
                    value={orderNote}
                    onChange={(e) => setOrderNote(e.target.value)}
                    placeholder="Lời nhắn cho nhiếp ảnh gia hoặc shipper..."
                    className="w-full rounded-xl border border-[#e2e8f0] bg-[#fafbfc] px-3 py-2 text-xs font-semibold outline-none focus:border-[#ff8d28]"
                  />
                </div>

                <hr className="my-4 border-[#f1f5f9]" />

                {/* CHECKOUT BUTTONS */}
                <div className="space-y-4">
                  {bookingItems.length > 0 && (
                    <div className="rounded-xl border border-orange-200 bg-orange-50/50 p-4">
                      <div className="flex justify-between text-xs text-[#64748b]">
                        <span>Tổng dịch vụ chụp ảnh ({bookingItems.length} buổi):</span>
                        <span className="font-bold text-[#0e111d]">{formatCurrency(bookingEstimatedTotal)}</span>
                      </div>
                      <div className="mt-1 flex justify-between text-xs font-bold text-[#0e111d]">
                        <span>Tiền cọc cần thanh toán (30%):</span>
                        <span className="text-[#ff8d28]">{formatCurrency(bookingDepositTotal)}</span>
                      </div>

                      <button
                        type="button"
                        onClick={handleCheckoutGroupBookings}
                        disabled={submitting}
                        className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#ff8d28] py-3 text-xs font-bold text-white shadow transition-all hover:bg-[#e0751b] disabled:opacity-60"
                      >
                        <span>Gom đơn & Thanh toán cọc</span>
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </button>
                    </div>
                  )}

                  {productItems.length > 0 && (
                    <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-4">
                      <div className="flex justify-between text-xs font-bold text-[#0e111d]">
                        <span>Tổng sản phẩm thiết bị ({productItems.length}):</span>
                        <span className="text-[#ff8d28]">{formatCurrency(productTotal)}</span>
                      </div>

                      <button
                        type="button"
                        onClick={handleCheckoutProducts}
                        className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#ff8d28] bg-white py-3 text-xs font-bold text-[#ff8d28] shadow-sm transition-all hover:bg-orange-50"
                      >
                        <span>Đặt hàng thiết bị máy ảnh</span>
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>

              </div>
            </aside>
          </div>
        )}
      </section>

      {/* ════════ TIKTOK SHOP ADDRESS MANAGER MODAL ("ĐỊA CHỈ CỦA BẠN") ════════ */}
      {showAddressModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-[480px] overflow-hidden rounded-2xl bg-white shadow-xl transition-all border border-gray-100">
            
            {/* Modal Header */}
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

            {/* Modal Body: Minimal List */}
            <div className="max-h-[420px] overflow-y-auto px-5 py-3 divide-y divide-gray-100">
              
              {/* Row "+ Thêm địa chỉ" */}
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

              {/* Address items matching TikTok Shop screenshot */}
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

              {/* Tỉnh / Quận / Xã Dropdowns */}
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
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-2.5 py-2 text-xs font-semibold outline-none focus:border-[#ff8d28] cursor-pointer disabled:opacity-50"
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
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-2.5 py-2 text-xs font-semibold outline-none focus:border-[#ff8d28] cursor-pointer disabled:opacity-50"
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
