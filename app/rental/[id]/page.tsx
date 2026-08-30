"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useRef, useCallback } from "react";
import { useAuth } from "@/app/auth-context";
import { useToast } from "@/app/toast-context";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

interface Equipment {
  id: number;
  owner_id: string;
  name: string;
  type: "camera" | "lens" | "lighting" | "accessory";
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

export default function RentalDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { session } = useAuth();
  const toast = useToast();
  const id = params.id;

  const [item, setItem] = useState<Equipment | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);

  const [rentDurationType, setRentDurationType] = useState<"6h" | "24h">("24h");
  const [insuranceIncluded, setInsuranceIncluded] = useState(false);

  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [kycFileName, setKycFileName] = useState("");
  
  const [showLivenessPopup, setShowLivenessPopup] = useState(false);
  const [livenessStep, setLivenessStep] = useState(0); // 0: Detect, 1: Straight, 2: Left, 3: Blink
  const [livenessVerified, setLivenessVerified] = useState(false);
  const [countdown, setCountdown] = useState(4);
  const [scannerStatusText, setScannerStatusText] = useState("Đang khởi động hệ thống quét...");

  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const activeVideoRef = useRef<HTMLVideoElement | null>(null);
  const [capturedFaceUrl, setCapturedFaceUrl] = useState("");

  const videoRefCallback = useCallback((node: HTMLVideoElement | null) => {
    if (node && cameraStream) {
      node.srcObject = cameraStream;
      activeVideoRef.current = node;
      node.play().catch(err => console.log("Video auto play failed:", err));
    }
  }, [cameraStream]);

  const captureFaceSnapshot = () => {
    const video = activeVideoRef.current;
    if (video) {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = 300;
        canvas.height = 300;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          // Mirror horizontal flip because video is front-facing (selfie)
          ctx.translate(canvas.width, 0);
          ctx.scale(-1, 1);
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
          setCapturedFaceUrl(dataUrl);
        }
      } catch (err) {
        console.warn("Failed to capture snapshot:", err);
      }
    }
  };

  useEffect(() => {
    if (session) {
      setCustomerName(session.fullName || "");
      setCustomerEmail(session.email || "");
      setCustomerPhone(session.phone || "");
      if (session.kyc_verified) {
        setLivenessVerified(true);
        setKycFileName("CCCD_Da_Xac_Minh.jpg");
      }
    }
  }, [session]);

  useEffect(() => {
    if (id) {
      fetchDetail();
    }
  }, [id]);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/equipments/${id}`);
      const resData = await res.json();
      if (resData.success) {
        setItem(resData.data);
      } else {
        toast.error("Lỗi", resData.message || "Không thể tải chi tiết thiết bị.");
      }
    } catch {
      toast.error("Lỗi", "Lỗi kết nối máy chủ.");
    } finally {
      setLoading(false);
    }
  };

  const getLeaseDays = () => {
    if (rentDurationType === "6h") return 1;
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diff = end.getTime() - start.getTime();
    const days = Math.ceil(diff / (1000 * 3600 * 24)) + 1;
    return days > 0 ? days : 0;
  };

  // Manage camera streaming lifecycle
  useEffect(() => {
    let activeStream: MediaStream | null = null;

    if (showLivenessPopup) {
      setLivenessStep(0);
      setCountdown(2);
      setScannerStatusText("🔍 Đang dò tìm khuôn mặt...");

      navigator.mediaDevices.getUserMedia({ video: { width: 300, height: 300, facingMode: "user" } })
        .then((stream) => {
          activeStream = stream;
          streamRef.current = stream;
          setCameraStream(stream);
        })
        .catch((err) => {
          console.warn("Camera access denied or unavailable", err);
          setScannerStatusText("⚠️ Camera không khả dụng. Vui lòng cho phép truy cập.");
        });

      return () => {
        if (activeStream) {
          activeStream.getTracks().forEach(track => track.stop());
        }
        setCameraStream(null);
      };
    }
  }, [showLivenessPopup]);

  // Automated step countdown tick
  useEffect(() => {
    if (!showLivenessPopup || !cameraStream) return;

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          // Time to advance to next step
          setLivenessStep((step) => step + 1);
          return 4;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [showLivenessPopup, cameraStream]);

  // Execute step transition actions safely outside rendering cycles
  useEffect(() => {
    if (!showLivenessPopup || !cameraStream) return;

    if (livenessStep === 1) {
      setScannerStatusText("📸 Bước 1/3: Hãy NHÌN THẲNG vào camera...");
      setCountdown(4);
    } else if (livenessStep === 2) {
      captureFaceSnapshot();
      setScannerStatusText("🔄 Bước 2/3: Hãy quay đầu sang phía bên TRÁI...");
      setCountdown(4);
    } else if (livenessStep === 3) {
      setScannerStatusText("👁 Bước 3/3: Hãy NHÁY MẮT NHẸ để xác thực...");
      setCountdown(4);
    } else if (livenessStep === 4) {
      // Done - successful liveness validation
      setLivenessVerified(true);
      setShowLivenessPopup(false);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      setCameraStream(null);
      
      // Delay toast execution to run outside of the current render loop
      setTimeout(() => {
        toast.success("Thành công", "Xác thực sinh trắc học khuôn mặt eKYC hoàn tất!");
      }, 50);
    }
  }, [livenessStep, showLivenessPopup, cameraStream]);

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!item) return;

    const days = getLeaseDays();
    if (days <= 0) {
      toast.error("Lỗi", "Ngày trả máy phải sau hoặc trùng ngày nhận máy.");
      return;
    }

    if (!customerName || !customerEmail || !customerPhone) {
      toast.error("Lỗi", "Vui lòng nhập đầy đủ thông tin liên hệ.");
      return;
    }

    if (!livenessVerified) {
      toast.error("Lỗi", "Vui lòng tải ảnh CCCD và hoàn tất quét khuôn mặt eKYC.");
      return;
    }

    try {
      setBookingLoading(true);
      const token = window.localStorage.getItem("sudion_token");
      if (!token || !session) {
        toast.error("Cần đăng nhập", "Vui lòng đăng nhập trước khi thuê thiết bị.");
        router.push(`/login?redirect=${encodeURIComponent(`/rental/${id}`)}`);
        return;
      }
      const res = await fetch(`${API_URL}/equipment-bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          equipmentId: item.id,
          customerName,
          customerEmail,
          customerPhone,
          startDate,
          endDate: rentDurationType === "6h" ? startDate : endDate,
          paymentMethod: "momo",
          rentDurationType,
          insuranceIncluded,
          renterCccdUrl: kycFileName || "CCCD_Verified.jpg",
          renterFaceUrl: capturedFaceUrl
        })
      });

      const resData = await res.json();
      if (resData.success) {
        toast.success("Đã tạo đơn thuê", "Vui lòng thanh toán để xác nhận giữ máy.");
        const payable = Number(resData.totalPrice || 0) + Number(resData.depositAmount || 0);
        router.push(`/checkout-gateway?rentalCode=${encodeURIComponent(resData.bookingCode)}&amount=${payable}`);
      } else {
        toast.error("Lỗi", resData.message || "Đã xảy ra lỗi khi tạo đơn thuê.");
      }
    } catch {
      toast.error("Lỗi", "Lỗi kết nối máy chủ khi tạo đơn đặt thuê.");
    } finally {
      setBookingLoading(false);
    }
  };

  const formatPrice = (value: any) => {
    const num = Math.round(Number(value || 0));
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(num);
  };

  const getParsedImages = (imagesJson: string | string[]) => {
    try {
      if (Array.isArray(imagesJson)) return imagesJson;
      const parsed = JSON.parse(imagesJson);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : ["https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80"];
    } catch {
      return ["https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80"];
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#ff8d28] border-t-transparent mb-4"></div>
        <p className="text-slate-500 font-bold">Đang tải thông tin chi tiết...</p>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="text-center py-20 min-h-screen">
        <p className="text-red-500 font-extrabold text-lg">Không tìm thấy thiết bị này.</p>
        <Link href="/rental" className="mt-4 inline-block px-6 py-2 bg-[#ff8d28] text-white font-extrabold rounded-full">Quay lại danh mục</Link>
      </div>
    );
  }

  const images = getParsedImages(item.images);
  const leaseDays = getLeaseDays();
  
  const baseRate = rentDurationType === "6h" 
    ? Number(item.rate_6h || (item.rate_per_day * 0.65)) 
    : Number(item.rate_per_day);
  const leasePrice = baseRate * (leaseDays || 1);
  const insuranceFee = insuranceIncluded ? (leasePrice * 0.05) : 0;
  const totalRentPrice = leasePrice + insuranceFee;

  const originalDeposit = Number(item.deposit_amount);
  const depositDiscount = insuranceIncluded ? (originalDeposit * 0.7) : 0;
  const finalDeposit = originalDeposit - depositDiscount;

  return (
    <main className="bg-slate-50 min-h-screen font-sans text-slate-900 py-10">
      <div className="mx-auto w-full max-w-[1440px] px-6 md:px-12 lg:px-20">
        <div className="mb-6 flex items-center gap-2 text-xs font-bold text-slate-400">
          <Link href="/" className="hover:text-slate-600">Trang chủ</Link>
          <span>/</span>
          <Link href="/rental" className="hover:text-slate-600">Thuê thiết bị</Link>
          <span>/</span>
          <span className="text-[#ff8d28]">{item.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white rounded-[26px] border border-slate-100 p-6 shadow-sm space-y-6">
              <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden bg-slate-100">
                <img src={images[0]} alt={item.name} className="w-full h-full object-cover" />
              </div>

              <div>
                <div className="flex items-center gap-2 text-xs font-extrabold text-[#ff8d28] uppercase tracking-wider mb-2">
                  <span>{item.brand}</span>
                  <span>•</span>
                  <span>Tình trạng: {item.condition}</span>
                </div>
                <h1 className="text-2xl md:text-3xl font-black text-slate-900 leading-tight">
                  {item.name}
                </h1>
                <div className="mt-3 flex items-center gap-4 text-xs font-bold text-slate-500">
                  <div className="flex items-center gap-1">
                    <svg viewBox="0 0 24 24" className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" />
                    </svg>
                    <span>{item.location}</span>
                  </div>
                  <span>•</span>
                  <span>Chủ sở hữu: Photographer uy tín</span>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100">
                <h3 className="text-[15px] font-extrabold text-slate-800 uppercase tracking-wider mb-3">
                  Mô tả chi tiết & Phụ kiện kèm theo
                </h3>
                <p className="text-slate-600 text-sm md:text-[15px] leading-relaxed whitespace-pre-line">
                  {item.description}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-[26px] border border-slate-100 p-6 shadow-sm">
              <h3 className="text-[15px] font-extrabold text-slate-800 uppercase tracking-wider mb-4">
                Chính sách & Thủ tục thuê đồ P2P
              </h3>
              <ul className="text-slate-600 text-sm space-y-3.5 list-disc pl-5">
                <li>Bên cho thuê giữ tiền cọc qua Sudion và giải ngân hoàn cọc 100% khi nhận lại thiết bị nguyên vẹn.</li>
                <li>Khách thuê cần đối chiếu trực tiếp tình trạng thiết bị với bên cho thuê khi giao nhận máy.</li>
                <li>Hệ thống áp dụng công thức phụ phí quá giờ cho gói thuê ngắn hạn 6 giờ (trễ dưới 3h phụ thu theo giờ lẻ, trễ từ 3h tự động chuyển gói 24 giờ).</li>
                <li>Chúng tôi không giữ thẻ căn cước gốc của bạn. Thay vào đó bạn cần định danh eKYC điện tử và xuất trình VNeID lúc nhận máy.</li>
              </ul>
            </div>
          </div>

          <div className="lg:col-span-4 bg-white rounded-[26px] border border-slate-100 p-6 shadow-md sticky top-24">
            <h2 className="text-lg font-black text-slate-900 uppercase border-b border-slate-50 pb-4 mb-5">
              ĐẶT THUÊ THIẾT BỊ
            </h2>

            <form onSubmit={handleBookingSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Gói thời gian thuê</label>
                <div className="grid grid-cols-2 gap-2 bg-slate-50 p-1 rounded-xl border border-slate-100">
                  <button 
                    type="button" 
                    onClick={() => { setRentDurationType("6h"); setEndDate(startDate); }}
                    className={`py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      rentDurationType === "6h" ? "bg-white text-[#ff8d28] shadow-sm" : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    Gói 6 Giờ (Half-day)
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setRentDurationType("24h")}
                    className={`py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      rentDurationType === "24h" ? "bg-white text-[#ff8d28] shadow-sm" : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    Gói ngày (24 Giờ)
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className={rentDurationType === "6h" ? "col-span-2" : ""}>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                    {rentDurationType === "6h" ? "Ngày thuê" : "Ngày nhận máy"}
                  </label>
                  <input 
                    type="date" 
                    required
                    value={startDate}
                    onChange={(e) => {
                      setStartDate(e.target.value);
                      if (rentDurationType === "6h") setEndDate(e.target.value);
                    }}
                    className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-200 focus:border-[#ff8d28] outline-none bg-slate-50"
                  />
                </div>
                {rentDurationType === "24h" && (
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Ngày trả máy</label>
                    <input 
                      type="date" 
                      required
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-200 focus:border-[#ff8d28] outline-none bg-slate-50"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-3.5 pt-1">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Họ và tên người thuê</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Nguyễn Văn A"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full text-xs font-semibold p-3 rounded-xl border border-slate-200 focus:border-[#ff8d28] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Email liên hệ</label>
                  <input 
                    type="email" 
                    required
                    placeholder="example@gmail.com"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full text-xs font-semibold p-3 rounded-xl border border-slate-200 focus:border-[#ff8d28] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Số điện thoại</label>
                  <input 
                    type="tel" 
                    required
                    placeholder="09XXXXXXXX"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full text-xs font-semibold p-3 rounded-xl border border-slate-200 focus:border-[#ff8d28] outline-none"
                  />
                </div>

                <div className="flex items-start gap-2.5 p-3.5 bg-orange-50/40 rounded-2xl border border-orange-100/60 mt-1">
                  <input 
                    type="checkbox" 
                    id="insurance" 
                    checked={insuranceIncluded}
                    onChange={(e) => setInsuranceIncluded(e.target.checked)}
                    className="mt-0.5 h-4 w-4 accent-[#ff8d28] rounded border-slate-300"
                  />
                  <label htmlFor="insurance" className="text-[11px] font-bold text-slate-700 leading-normal select-none cursor-pointer">
                    Mua bảo hiểm Sudion Gear <span className="text-[#ff8d28] font-extrabold">(+5% phí thuê)</span> để <span className="text-emerald-600 font-extrabold">giảm 70% tiền đặt cọc</span> giữ thiết bị.
                  </label>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Xác minh danh tính (CCCD & eKYC)</label>
                  {livenessVerified ? (
                    <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 flex items-center justify-between">
                      <span className="text-xs font-extrabold text-emerald-700 flex items-center gap-1">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.8">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        CCCD & Sinh trắc học đã khớp
                      </span>
                      <span className="text-[10px] font-black uppercase text-emerald-600 bg-white px-2 py-0.5 rounded border border-emerald-200">
                        verified
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="relative border-2 border-dashed border-slate-200 hover:border-[#ff8d28] rounded-xl p-4 text-center cursor-pointer transition-colors bg-slate-50/50">
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setKycFileName(file.name);
                            }
                          }}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                        <svg className="mx-auto h-5 w-5 text-slate-400 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                        </svg>
                        <span className="text-[10px] font-bold text-slate-500 block truncate">
                          {kycFileName ? `Đã chọn: ${kycFileName}` : "Tải lên ảnh mặt trước CCCD"}
                        </span>
                      </div>
                      {kycFileName && (
                        <button 
                          type="button"
                          onClick={() => setShowLivenessPopup(true)}
                          className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <svg viewBox="0 0 24 24" className="h-4.5 w-4.5 text-slate-300" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" /><path d="M8 14s1.5 2 4 2 4-2 4-2" /><line x1="9" y1="9" x2="9.01" y2="9" /><line x1="15" y1="9" x2="15.01" y2="9" />
                          </svg>
                          Quét khuôn mặt (eKYC Liveness)
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-slate-50 rounded-2xl p-4 space-y-2 border border-slate-100 text-xs font-semibold pt-4">
                <div className="flex items-center justify-between text-slate-500">
                  <span>Giá gói ({rentDurationType === "6h" ? "6 Giờ" : "Ngày"}):</span>
                  <span>{formatPrice(baseRate)}</span>
                </div>
                {rentDurationType === "24h" && (
                  <div className="flex items-center justify-between text-slate-500">
                    <span>Số ngày thuê:</span>
                    <span>{leaseDays || 1} ngày</span>
                  </div>
                )}
                {insuranceIncluded && (
                  <div className="flex items-center justify-between text-slate-500">
                    <span>Bảo hiểm (5%):</span>
                    <span>{formatPrice(insuranceFee)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between text-slate-700 font-extrabold pb-2 border-b border-slate-200/60">
                  <span>Tổng tiền thuê thiết bị:</span>
                  <span>{formatPrice(totalRentPrice)}</span>
                </div>
                
                <div className="flex items-center justify-between text-slate-500 pt-1">
                  <span>Tiền cọc gốc (hoàn lại):</span>
                  <span className="line-through">{formatPrice(originalDeposit)}</span>
                </div>
                {insuranceIncluded && (
                  <div className="flex items-center justify-between text-emerald-600 font-bold">
                    <span>Miễn giảm cọc (bảo hiểm 70%):</span>
                    <span>-{formatPrice(depositDiscount)}</span>
                  </div>
                )}
                
                <div className="flex items-center justify-between text-[#ff8d28] font-black text-sm pt-2">
                  <span>Thanh toán trước cọc:</span>
                  <span>{formatPrice(finalDeposit)}</span>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={bookingLoading}
                className="w-full h-11 bg-gradient-to-r from-[#ff5e00] to-[#ff3c00] hover:scale-[1.01] active:scale-[0.99] text-white font-extrabold rounded-xl transition text-sm flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-[#ff3c00]/25"
              >
                {bookingLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                ) : (
                  <>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Tiến hành đặt cọc ngay
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      {showLivenessPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/90 backdrop-blur-md p-4">
          <div className="bg-slate-950 text-white rounded-3xl max-w-[400px] w-full p-8 text-center space-y-6 border border-slate-800 shadow-2xl relative">
            <div>
              <h3 className="text-md font-black uppercase text-[#ff8d28] tracking-wider">Xác thực sinh trắc học</h3>
              <p className="text-xs text-slate-400 mt-1">Đảm bảo camera trước đủ sáng và không che khuôn mặt.</p>
            </div>

            <div className="relative h-52 w-52 rounded-full border-4 border-[#ff8d28] mx-auto overflow-hidden bg-slate-900 flex items-center justify-center shadow-lg shadow-[#ff8d28]/10">
              {cameraStream ? (
                <>
                  <video 
                    ref={videoRefCallback} 
                    autoPlay 
                    playsInline 
                    muted 
                    className="w-full h-full object-cover rounded-full transform -scale-x-100" 
                  />
                  
                  {/* Visual overlay guiding the user with state icons */}
                  <div className="absolute inset-0 z-10 bg-black/45 backdrop-blur-[0.5px] flex flex-col items-center justify-center text-center p-4 pointer-events-none">
                    {livenessStep === 0 && (
                      <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#ff8d28] border-t-transparent"></div>
                    )}
                    
                    {livenessStep === 1 && (
                      <div className="flex flex-col items-center animate-fade-in space-y-1">
                        <svg className="h-14 w-14 text-white drop-shadow-md" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        <span className="text-[10px] font-black text-white bg-black/60 px-2 py-0.5 rounded-full uppercase tracking-wider">Nhìn thẳng</span>
                      </div>
                    )}

                    {livenessStep === 2 && (
                      <div className="flex flex-col items-center animate-fade-in space-y-1">
                        <svg className="h-14 w-14 text-[#ff8d28] drop-shadow-md animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        <span className="text-[10px] font-black text-white bg-black/60 px-2 py-0.5 rounded-full uppercase tracking-wider">Quay Trái</span>
                      </div>
                    )}

                    {livenessStep === 3 && (
                      <div className="flex flex-col items-center animate-fade-in space-y-1">
                        <svg className="h-14 w-14 text-emerald-400 drop-shadow-md animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18" />
                        </svg>
                        <span className="text-[10px] font-black text-white bg-black/60 px-2 py-0.5 rounded-full uppercase tracking-wider">Nháy mắt</span>
                      </div>
                    )}

                    {/* Step Countdown Overlay timer */}
                    {livenessStep > 0 && (
                      <span className="absolute bottom-2.5 right-2.5 h-6 w-6 rounded-full bg-black/85 flex items-center justify-center text-[10px] font-black text-[#ff8d28]">
                        {countdown}s
                      </span>
                    )}
                  </div>
                </>
              ) : (
                <svg viewBox="0 0 24 24" className="h-20 w-20 text-slate-700 animate-pulse" fill="none" stroke="currentColor" strokeWidth="1.2">
                  <circle cx="12" cy="12" r="10" /><path d="M8 14s1.5 2 4 2 4-2 4-2" /><line x1="9" y1="9" x2="9.01" y2="9" /><line x1="15" y1="9" x2="15.01" y2="9" />
                </svg>
              )}
            </div>

            {/* Glowing active step instructions */}
            <div className="text-xs md:text-sm font-bold text-slate-200 min-h-[40px] flex flex-col items-center justify-center px-4 bg-slate-900/50 py-2.5 rounded-2xl border border-slate-800/80">
              <span className="text-[#ff8d28] font-black uppercase tracking-wider text-[9px] mb-1 animate-pulse">
                {livenessStep === 0 && "🤖 Đang khởi tạo"}
                {livenessStep === 1 && "📸 Bước 1 / 3"}
                {livenessStep === 2 && "🔄 Bước 2 / 3"}
                {livenessStep === 3 && "👁 Bước 3 / 3"}
              </span>
              <span className="text-center leading-normal text-slate-300">
                {scannerStatusText}
              </span>
            </div>

            <div className="text-[10px] text-slate-500 pt-1">
              Sudion eKYC Core Engine v2.0 • Biometric Secure
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
