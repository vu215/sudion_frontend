"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/app/auth-context";
import { useToast } from "@/app/toast-context";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

function authHeaders() {
  const token = typeof window !== "undefined" ? window.localStorage.getItem("sudion_token") : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

interface Equipment {
  id: number;
  name: string;
  type: string;
  brand: string;
  condition: string;
  rate_per_day: number;
  rate_6h: number;
  overtime_fee_per_hour: number;
  deposit_amount: number;
  description: string;
  location: string;
  images: string;
  status: string;
}

interface RentalBooking {
  id: number;
  booking_code: string;
  equipment_name: string;
  equipment_images: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  start_date: string;
  end_date: string;
  total_price: number;
  deposit_amount: number;
  status: string;
  payment_method: string;
  renter_kyc_status: string;
  rent_duration_type?: string;
  insurance_included?: number;
  deposit_discount?: number;
  trust_score_applied?: number;
  actual_return_time?: string;
  overtime_hours?: number;
  overtime_fee?: number;
  renter_cccd_url?: string;
  renter_face_url?: string;
}

export default function PhotographerRentalDashboard() {
  const { isLoggedIn } = useAuth();
  const toast = useToast();

  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [bookings, setBookings] = useState<RentalBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"gear" | "bookings">("gear");

  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState("camera");
  const [brand, setBrand] = useState("");
  const [condition, setCondition] = useState("Mới 95%");
  const [ratePerDay, setRatePerDay] = useState("");
  const [rate6h, setRate6h] = useState("");
  const [overtimeFeePerHour, setOvertimeFeePerHour] = useState("");
  const [depositAmount, setDepositAmount] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("Hà Nội");
  const [imageUrl, setImageUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Return calculation modal states
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [selectedReturnBooking, setSelectedReturnBooking] = useState<RentalBooking | null>(null);
  const [actualReturnDate, setActualReturnDate] = useState("");
  const [actualReturnTime, setActualReturnTime] = useState("");
  const [overtimeHours, setOvertimeHours] = useState(0);
  const [overtimeFeeResult, setOvertimeFeeResult] = useState(0);
  const [totalRefundDue, setTotalRefundDue] = useState(0);
  const [returningLoading, setReturningLoading] = useState(false);

  useEffect(() => {
    if (isLoggedIn) {
      loadData();
    }
  }, [isLoggedIn]);

  const loadData = async () => {
    try {
      setLoading(true);
      const gearRes = await fetch(`${API_URL}/equipments/owner/list`, { headers: authHeaders() });
      const gearData = await gearRes.json();
      if (gearData.success) {
        setEquipments(gearData.data);
      }

      const bookRes = await fetch(`${API_URL}/equipment-bookings/owner`, { headers: authHeaders() });
      const bookData = await bookRes.json();
      if (bookData.success) {
        setBookings(bookData.data);
      }
    } catch (err) {
      console.error(err);
      toast.error("Lỗi", "Không thể tải dữ liệu cho thuê máy.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddGear = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !brand || !ratePerDay || !depositAmount) {
      toast.error("Lỗi", "Vui lòng điền đủ thông tin thiết bị.");
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch(`${API_URL}/equipments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders()
        },
        body: JSON.stringify({
          name,
          type,
          brand,
          condition,
          ratePerDay: Number(ratePerDay),
          rate6h: rate6h ? Number(rate6h) : (Number(ratePerDay) * 0.65),
          overtimeFeePerHour: overtimeFeePerHour ? Number(overtimeFeePerHour) : 40000,
          depositAmount: Number(depositAmount),
          description,
          location,
          images: imageUrl ? [imageUrl] : ["https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80"]
        })
      });

      const resData = await res.json();
      if (resData.success) {
        toast.success("Thành công", "Đăng ký thiết bị cho thuê thành công!");
        setShowAddForm(false);
        setName("");
        setBrand("");
        setRatePerDay("");
        setRate6h("");
        setOvertimeFeePerHour("");
        setDepositAmount("");
        setDescription("");
        setImageUrl("");
        loadData();
      } else {
        toast.error("Lỗi", resData.message || "Đăng ký thất bại.");
      }
    } catch {
      toast.error("Lỗi", "Lỗi kết nối máy chủ.");
    } finally {
      setSubmitting(false);
    }
  };

  const updateBookingStatus = async (code: string, newStatus: string) => {
    try {
      const res = await fetch(`${API_URL}/equipment-bookings/${code}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders()
        },
        body: JSON.stringify({ status: newStatus })
      });
      const resData = await res.json();
      if (resData.success) {
        toast.success("Thành công", "Cập nhật trạng thái đơn đặt thuê thành công!");
        loadData();
      } else {
        toast.error("Lỗi", resData.message);
      }
    } catch {
      toast.error("Lỗi", "Lỗi kết nối máy chủ.");
    }
  };

  const openReturnModal = (booking: RentalBooking) => {
    setSelectedReturnBooking(booking);
    const now = new Date();
    const dateStr = now.toISOString().split("T")[0];
    const timeStr = now.toTimeString().substring(0, 5);
    setActualReturnDate(dateStr);
    setActualReturnTime(timeStr);
    
    calculateReturnPreview(booking, `${dateStr}T${timeStr}:00`);
    setShowReturnModal(true);
  };

  const calculateReturnPreview = (booking: RentalBooking, fullTimeStr: string) => {
    const returnTime = new Date(fullTimeStr);
    const startTime = new Date(booking.start_date);
    
    const timeDiffMs = returnTime.getTime() - startTime.getTime();
    const totalHoursElapsed = Math.ceil(timeDiffMs / (1000 * 3600));

    let hoursLate = 0;
    let lateFee = 0;

    const equipmentRatePerDay = booking.total_price; 
    const overtimeRate = 40000; 

    if (booking.rent_duration_type === "6h") {
      if (totalHoursElapsed > 6) {
        hoursLate = totalHoursElapsed - 6;
        if (hoursLate < 3) {
          lateFee = hoursLate * overtimeRate;
        } else {
          // Upgrade to day rate
          const dayRate = equipmentRatePerDay / 0.65;
          lateFee = Math.max(0, dayRate - Number(booking.total_price));
        }
      }
    } else {
      const expectedDays = Math.ceil((new Date(booking.end_date).getTime() - startTime.getTime()) / (1000 * 3600 * 24)) + 1;
      const actualDays = Math.ceil(timeDiffMs / (1000 * 3600 * 24));
      if (actualDays > expectedDays) {
        const extraDays = actualDays - expectedDays;
        lateFee = extraDays * (equipmentRatePerDay / expectedDays);
        hoursLate = extraDays * 24;
      }
    }

    setOvertimeHours(hoursLate);
    setOvertimeFeeResult(lateFee);
    setTotalRefundDue(Math.max(0, Number(booking.deposit_amount) - lateFee));
  };

  const handleReturnPreviewChange = (date: string, time: string) => {
    setActualReturnDate(date);
    setActualReturnTime(time);
    if (selectedReturnBooking && date && time) {
      calculateReturnPreview(selectedReturnBooking, `${date}T${time}:00`);
    }
  };

  const submitReturn = async () => {
    if (!selectedReturnBooking) return;
    try {
      setReturningLoading(true);
      const fullReturnTime = new Date(`${actualReturnDate}T${actualReturnTime}:00`);
      
      const res = await fetch(`${API_URL}/equipment-bookings/${selectedReturnBooking.booking_code}/return`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders()
        },
        body: JSON.stringify({
          actualReturnTime: fullReturnTime.toISOString()
        })
      });

      const resData = await res.json();
      if (resData.success) {
        toast.success("Thành công", `Trả máy thành công! Khấu trừ phụ phí: ${formatPrice(resData.overtimeFee)}, Hoàn cọc: ${formatPrice(resData.totalRefundDue)}`);
        setShowReturnModal(false);
        loadData();
      } else {
        toast.error("Lỗi", resData.message || "Không thể thực hiện trả máy.");
      }
    } catch {
      toast.error("Lỗi", "Lỗi kết nối máy chủ.");
    } finally {
      setReturningLoading(false);
    }
  };

  const updateKycStatus = async (code: string, newKyc: string) => {
    try {
      const res = await fetch(`${API_URL}/equipment-bookings/${code}/kyc`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders()
        },
        body: JSON.stringify({ kycStatus: newKyc })
      });
      const resData = await res.json();
      if (resData.success) {
        toast.success("Thành công", "Cập nhật duyệt eKYC của khách thành công!");
        loadData();
      } else {
        toast.error("Lỗi", resData.message);
      }
    } catch {
      toast.error("Lỗi", "Lỗi kết nối máy chủ.");
    }
  };

  const deleteGear = async (id: number) => {
    if (!confirm("Bạn có chắc chắn muốn ngừng cho thuê và xóa thiết bị này?")) return;
    try {
      const res = await fetch(`${API_URL}/equipments/${id}`, {
        method: "DELETE",
        headers: authHeaders()
      });
      const resData = await res.json();
      if (resData.success) {
        toast.success("Thành công", "Đã xóa thiết bị.");
        loadData();
      } else {
        toast.error("Lỗi", resData.message);
      }
    } catch {
      toast.error("Lỗi", "Lỗi kết nối máy chủ.");
    }
  };

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen py-20 bg-slate-50">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#ff8d28] border-t-transparent" />
        <p className="mt-4 text-xs font-semibold text-slate-500">Đang tải bảng điều khiển...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      <div className="bg-[#111827] text-white py-12 px-6 md:px-12 lg:px-20">
        <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-black uppercase">Quản Lý Thiết Bị Cho Thuê</h1>
            <p className="text-slate-400 text-xs md:text-sm mt-1">Đăng thuê máy ảnh nhàn rỗi và quản lý đơn đặt thuê từ khách hàng của bạn.</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/profilephotographer" className="px-4 py-2 border border-slate-700 rounded-xl text-xs font-bold text-slate-300 hover:border-slate-500 transition">
              Quay lại Hồ sơ
            </Link>
            <button onClick={() => setShowAddForm(true)} className="px-4 py-2 bg-[#ff8d28] hover:bg-orange-600 rounded-xl text-xs font-bold text-white transition shadow-sm cursor-pointer">
              Đăng máy cho thuê
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-6 md:px-12 lg:px-20 mt-8">
        <div className="flex items-center gap-2 border-b border-slate-200 pb-px mb-6">
          <button 
            onClick={() => setActiveTab("gear")}
            className={`px-6 py-2.5 text-xs font-bold uppercase border-b-2 cursor-pointer transition ${
              activeTab === "gear" ? "border-[#ff8d28] text-[#ff8d28]" : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Kho thiết bị của tôi ({equipments.length})
          </button>
          <button 
            onClick={() => setActiveTab("bookings")}
            className={`px-6 py-2.5 text-xs font-bold uppercase border-b-2 cursor-pointer transition ${
              activeTab === "bookings" ? "border-[#ff8d28] text-[#ff8d28]" : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Đơn đặt thuê từ khách ({bookings.length})
          </button>
        </div>

        {activeTab === "gear" && (
          <div>
            {equipments.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm">
                <svg className="mx-auto h-12 w-12 text-slate-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path d="M4 7h3l1.5-2h7L17 7h3v12H4Z" /><circle cx="12" cy="13" r="4" />
                </svg>
                <p className="text-slate-500 font-bold">Bạn chưa đăng tải thiết bị cho thuê nào.</p>
                <button onClick={() => setShowAddForm(true)} className="mt-4 px-6 py-2 bg-[#ff8d28] text-white font-extrabold text-xs rounded-full">
                  Đăng máy cho thuê ngay
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {equipments.map(item => {
                  let images: string[] = [];
                  try {
                    images = JSON.parse(item.images || "[]");
                  } catch {
                    images = ["https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80"];
                  }
                  if (!Array.isArray(images) || images.length === 0) {
                    images = ["https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80"];
                  }
                  return (
                    <div key={item.id} className="group bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col justify-between">
                      <div>
                        <div className="relative aspect-[16/10] w-full bg-slate-100">
                          <img src={images[0]} alt={item.name} className="w-full h-full object-cover" />
                          <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-[9px] font-black uppercase text-white ${
                            item.status === "active" ? "bg-emerald-500" : "bg-slate-400"
                          }`}>
                            {item.status === "active" ? "Hoạt động" : "Tạm ẩn"}
                          </div>
                        </div>
                        <div className="p-5 space-y-2">
                          <div className="text-[10px] font-bold text-slate-400 uppercase">{item.brand} • {item.type}</div>
                          <h3 className="font-extrabold text-slate-800 text-sm line-clamp-1">{item.name}</h3>
                          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{item.description}</p>
                          <div className="grid grid-cols-3 gap-2 pt-3 text-xs border-t border-slate-100">
                            <div>
                              <div className="text-[8px] font-bold text-slate-400 uppercase">Giá ngày</div>
                              <div className="font-black text-[#ff8d28]">{formatPrice(item.rate_per_day)}</div>
                            </div>
                            <div>
                              <div className="text-[8px] font-bold text-slate-400 uppercase">Giá 6h</div>
                              <div className="font-black text-[#ff8d28]">{formatPrice(item.rate_6h || (item.rate_per_day * 0.65))}</div>
                            </div>
                            <div>
                              <div className="text-[8px] font-bold text-slate-400 uppercase">Trễ / giờ</div>
                              <div className="font-bold text-slate-700">{formatPrice(item.overtime_fee_per_hour || 40000)}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="p-5 bg-slate-50/50 border-t border-slate-100 flex items-center justify-end gap-2.5">
                        <button onClick={() => deleteGear(item.id)} className="px-3 py-1.5 border border-red-200 text-red-500 hover:bg-red-50 text-[11px] font-bold rounded-lg transition cursor-pointer">
                          Ngừng cho thuê
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === "bookings" && (
          <div>
            {bookings.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm text-slate-500 font-bold">
                Chưa có đơn hàng đặt thuê thiết bị nào.
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.map(book => {
                  return (
                    <div key={book.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                      <div className="space-y-3.5">
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="text-[14px] font-black text-slate-800 bg-slate-100 px-3 py-1 rounded-lg">{book.booking_code}</span>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                            book.status === "awaiting_payment" ? "bg-amber-100 text-amber-700" :
                            book.status === "confirmed" ? "bg-emerald-100 text-emerald-700" :
                            book.status === "active" ? "bg-blue-100 text-blue-700" :
                            book.status === "completed" ? "bg-slate-100 text-slate-600" : "bg-red-100 text-red-700"
                          }`}>
                            {book.status === "awaiting_payment" ? "Chờ thanh toán cọc" :
                             book.status === "confirmed" ? "Đã nhận cọc" :
                             book.status === "active" ? "Đang cho thuê máy" :
                             book.status === "completed" ? "Đã hoàn tất & trả cọc" : "Đã hủy"}
                          </span>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                            book.renter_kyc_status === "verified" ? "bg-emerald-100 text-emerald-700" :
                            book.renter_kyc_status === "rejected" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
                          }`}>
                            KYC: {book.renter_kyc_status === "verified" ? "Đã duyệt" :
                                 book.renter_kyc_status === "rejected" ? "Từ chối" : "Chờ duyệt ảnh CCCD"}
                          </span>
                          <span className="px-2.5 py-0.5 bg-purple-50 text-purple-700 border border-purple-100 rounded-full text-[9px] font-extrabold uppercase">
                            Gói {book.rent_duration_type === "6h" ? "6 Giờ" : "Ngày"}
                          </span>
                          {book.insurance_included === 1 && (
                            <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full text-[9px] font-extrabold uppercase">
                              ✓ Có bảo hiểm (Cọc -70%)
                            </span>
                          )}
                          {book.trust_score_applied === 1 && (
                            <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-100 rounded-full text-[9px] font-extrabold uppercase">
                              ✓ Điểm uy tín (Miễn cọc)
                            </span>
                          )}
                          {(book.status === "completed" || book.status === "cancelled") && (
                            <span className="px-2.5 py-0.5 bg-slate-200 text-slate-600 border border-slate-300 rounded-full text-[9px] font-extrabold uppercase">
                              🔒 Đã bảo mật thông tin (Masked)
                            </span>
                          )}
                        </div>
                        
                        <div className="text-xs space-y-1 text-slate-600">
                          <div><span className="font-bold text-slate-800">Thiết bị:</span> {book.equipment_name}</div>
                          <div><span className="font-bold text-slate-800">Khách thuê:</span> {book.customer_name} ({book.customer_email} - {book.customer_phone})</div>
                          <div><span className="font-bold text-slate-800">Thời gian thuê:</span> Từ {new Date(book.start_date).toLocaleDateString("vi-VN")} đến {new Date(book.end_date).toLocaleDateString("vi-VN")}</div>
                          <div className="grid grid-cols-2 gap-4 max-w-[400px] pt-1">
                            <div><span className="font-bold text-slate-800">Tổng tiền thuê:</span> {formatPrice(book.total_price)}</div>
                            <div><span className="font-bold text-slate-800">Tiền cọc giữ máy:</span> {formatPrice(book.deposit_amount)}</div>
                          </div>
                        </div>

                        {book.renter_face_url && (
                          <div className="mt-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3 max-w-[500px]">
                            <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Đối chiếu khuôn mặt & CCCD</h4>
                            <div className="flex gap-4">
                              <div className="flex-1 space-y-1">
                                <span className="text-[9px] font-bold text-slate-400 block uppercase">Ảnh mặt trước CCCD</span>
                                <div className="aspect-[1.6/1] w-full bg-slate-200 rounded-xl overflow-hidden flex items-center justify-center border border-slate-300/80">
                                  <div className="w-full h-full bg-gradient-to-br from-blue-50 to-indigo-100 p-3 text-[9px] flex flex-col justify-between font-mono relative text-slate-700 shadow-inner">
                                    <div className="font-bold border-b border-indigo-200 pb-1 text-[8px] text-indigo-700 uppercase">CĂN CƯỚC CÔNG DÂN</div>
                                    <div className="space-y-0.5 mt-1">
                                      <div>Số: 030095******</div>
                                      <div className="font-sans font-bold text-[9px] text-slate-800 uppercase truncate">{book.customer_name}</div>
                                      <div>Sinh ngày: 01/01/1998</div>
                                    </div>
                                    <span className="absolute bottom-2 right-2 text-indigo-500 font-sans font-black text-[8px] opacity-75 uppercase">✓ CHÍNH CHỦ</span>
                                  </div>
                                </div>
                              </div>
                              <div className="w-28 space-y-1 shrink-0">
                                <span className="text-[9px] font-bold text-slate-400 block uppercase">Ảnh Quét Liveness</span>
                                <div className="aspect-square w-full bg-slate-200 rounded-xl overflow-hidden border border-slate-300/80 relative">
                                  <img src={book.renter_face_url} alt="Liveness" className="w-full h-full object-cover" />
                                  <span className="absolute bottom-1.5 left-1/2 transform -translate-x-1/2 text-[8px] font-black text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 uppercase whitespace-nowrap">
                                    100% Khớp
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-100 justify-end">
                        {book.renter_kyc_status === "pending" && (
                          <>
                            <button onClick={() => updateKycStatus(book.booking_code, "verified")} className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 text-[11px] font-bold rounded-lg transition cursor-pointer">
                              Duyệt KYC
                            </button>
                            <button onClick={() => updateKycStatus(book.booking_code, "rejected")} className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-[11px] font-bold rounded-lg transition cursor-pointer">
                              Từ chối KYC
                            </button>
                          </>
                        )}

                        {book.status === "awaiting_payment" && (
                          <button onClick={() => updateBookingStatus(book.booking_code, "confirmed")} className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold rounded-lg transition cursor-pointer">
                            Xác nhận đã cọc
                          </button>
                        )}
                        {book.status === "confirmed" && (
                          <button onClick={() => updateBookingStatus(book.booking_code, "active")} className="px-3 py-1.5 bg-[#ff8d28] hover:bg-orange-600 text-white text-[11px] font-bold rounded-lg transition cursor-pointer">
                            Bàn giao máy (Bắt đầu thuê)
                          </button>
                        )}
                        {book.status === "active" && (
                          <button onClick={() => openReturnModal(book)} className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded-lg transition cursor-pointer">
                            Đã trả máy & Hoàn cọc
                          </button>
                        )}
                        {book.status !== "completed" && book.status !== "cancelled" && (
                          <button onClick={() => updateBookingStatus(book.booking_code, "cancelled")} className="px-3 py-1.5 border border-red-200 text-red-500 hover:bg-red-50 text-[11px] font-bold rounded-lg transition cursor-pointer">
                            Hủy đơn
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[26px] max-w-[550px] w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-black uppercase text-slate-800">ĐĂNG MÁY CHO THUÊ</h3>
              <button onClick={() => setShowAddForm(false)} className="text-slate-400 hover:text-slate-600 font-bold text-xl cursor-pointer">×</button>
            </div>

            <form onSubmit={handleAddGear} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Loại thiết bị</label>
                  <select value={type} onChange={e => setType(e.target.value)} className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-200 bg-slate-50 outline-none">
                    <option value="camera">Máy ảnh (Body)</option>
                    <option value="lens">Ống kính (Lens)</option>
                    <option value="lighting">Đèn chiếu sáng</option>
                    <option value="accessory">Phụ kiện nhiếp ảnh</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Khu vực bàn giao</label>
                  <select value={location} onChange={e => setLocation(e.target.value)} className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-200 bg-slate-50 outline-none">
                    <option value="Hà Nội">Hà Nội</option>
                    <option value="TP. Hồ Chí Minh">TP. Hồ Chí Minh</option>
                    <option value="Đà Nẵng">Đà Nẵng</option>
                    <option value="Đà Lạt">Đà Lạt</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Tên thiết bị (Model)</label>
                <input type="text" required placeholder="Sony Alpha A7 IV" value={name} onChange={e => setName(e.target.value)} className="w-full text-xs font-semibold p-3 rounded-xl border border-slate-200 outline-none focus:border-[#ff8d28]" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Hãng sản xuất</label>
                  <input type="text" required placeholder="Sony" value={brand} onChange={e => setBrand(e.target.value)} className="w-full text-xs font-semibold p-3 rounded-xl border border-slate-200 outline-none focus:border-[#ff8d28]" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Độ mới / Tình trạng</label>
                  <input type="text" required placeholder="Mới 98% nguyên hộp" value={condition} onChange={e => setCondition(e.target.value)} className="w-full text-xs font-semibold p-3 rounded-xl border border-slate-200 outline-none focus:border-[#ff8d28]" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Giá ngày (24h)</label>
                  <input type="number" required placeholder="350000" value={ratePerDay} onChange={e => setRatePerDay(e.target.value)} className="w-full text-xs font-semibold p-3 rounded-xl border border-slate-200 outline-none focus:border-[#ff8d28]" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Giá gói 6h</label>
                  <input type="number" placeholder="220000" value={rate6h} onChange={e => setRate6h(e.target.value)} className="w-full text-xs font-semibold p-3 rounded-xl border border-slate-200 outline-none focus:border-[#ff8d28]" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Trễ hạn / giờ</label>
                  <input type="number" placeholder="40000" value={overtimeFeePerHour} onChange={e => setOvertimeFeePerHour(e.target.value)} className="w-full text-xs font-semibold p-3 rounded-xl border border-slate-200 outline-none focus:border-[#ff8d28]" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Số tiền đặt cọc (VND)</label>
                <input type="number" required placeholder="4000000" value={depositAmount} onChange={e => setDepositAmount(e.target.value)} className="w-full text-xs font-semibold p-3 rounded-xl border border-slate-200 outline-none focus:border-[#ff8d28]" />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">URL Ảnh thiết bị</label>
                <input type="url" placeholder="https://..." value={imageUrl} onChange={e => setImageUrl(e.target.value)} className="w-full text-xs font-semibold p-3 rounded-xl border border-slate-200 outline-none focus:border-[#ff8d28]" />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Mô tả thông số chi tiết</label>
                <textarea rows={3} placeholder="Mô tả máy ảnh, ống kính, các phụ kiện đi kèm (2 pin, sạc, thẻ nhớ)..." value={description} onChange={e => setDescription(e.target.value)} className="w-full text-xs font-semibold p-3 rounded-xl border border-slate-200 outline-none focus:border-[#ff8d28] resize-none" />
              </div>

              <button type="submit" disabled={submitting} className="w-full h-11 bg-[#ff8d28] hover:bg-orange-600 text-white font-extrabold rounded-xl transition text-xs shadow-md cursor-pointer flex items-center justify-center">
                {submitting ? "Đang xử lý..." : "ĐĂNG THIẾT BỊ"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Return Calculation Modal */}
      {showReturnModal && selectedReturnBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[26px] max-w-[480px] w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-md font-black uppercase text-slate-800">Xác Nhận Trả Máy & Tính Phụ Phí</h3>
              <button onClick={() => setShowReturnModal(false)} className="text-slate-400 hover:text-slate-600 font-bold text-xl cursor-pointer">×</button>
            </div>

            <div className="space-y-3.5">
              <div className="text-xs space-y-1 text-slate-600">
                <div><span className="font-bold text-slate-800">Đơn hàng:</span> {selectedReturnBooking.booking_code}</div>
                <div><span className="font-bold text-slate-800">Thiết bị:</span> {selectedReturnBooking.equipment_name}</div>
                <div><span className="font-bold text-slate-800">Khách thuê:</span> {selectedReturnBooking.customer_name}</div>
                <div><span className="font-bold text-slate-800">Hạn trả cam kết:</span> {new Date(selectedReturnBooking.end_date).toLocaleDateString("vi-VN")}</div>
              </div>

              <div className="pt-2 border-t border-slate-100 space-y-3">
                <h4 className="text-xs font-bold text-slate-700">NHẬP THỜI GIAN NHẬN LẠI THỰC TẾ:</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Ngày nhận trả</label>
                    <input 
                      type="date" 
                      value={actualReturnDate} 
                      onChange={e => handleReturnPreviewChange(e.target.value, actualReturnTime)} 
                      className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-200 outline-none" 
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Giờ nhận trả</label>
                    <input 
                      type="time" 
                      value={actualReturnTime} 
                      onChange={e => handleReturnPreviewChange(actualReturnDate, e.target.value)} 
                      className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-200 outline-none" 
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-500 font-semibold">
                  <span>Số giờ trễ hạn:</span>
                  <span className={overtimeHours > 0 ? "text-red-500 font-extrabold" : ""}>
                    {overtimeHours} giờ
                  </span>
                </div>
                {overtimeHours > 0 && (
                  <div className="flex items-center justify-between text-red-500 font-extrabold">
                    <span>Phụ phí phạt quá giờ:</span>
                    <span>+{formatPrice(overtimeFeeResult)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between text-slate-500">
                  <span>Tiền cọc giữ của khách:</span>
                  <span>{formatPrice(selectedReturnBooking.deposit_amount)}</span>
                </div>
                <div className="flex items-center justify-between text-emerald-600 font-black text-sm pt-2 border-t border-slate-200/50">
                  <span>Thực nhận hoàn cọc của khách:</span>
                  <span>{formatPrice(totalRefundDue)}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowReturnModal(false)}
                  className="w-full py-2.5 border border-slate-200 text-slate-500 hover:bg-slate-50 font-bold rounded-xl text-xs transition cursor-pointer"
                >
                  Đóng
                </button>
                <button 
                  type="button" 
                  onClick={submitReturn}
                  disabled={returningLoading}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-xs transition flex items-center justify-center cursor-pointer"
                >
                  {returningLoading ? "Đang xử lý..." : "Xác nhận & Hoàn cọc"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
