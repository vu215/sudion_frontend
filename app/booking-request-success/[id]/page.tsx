"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, use } from "react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const AUTO_REFRESH_MS = 8000;

type Booking = {
  booking_code: string;
  photographer_id?: string | number;
  photographer_name: string;
  service_name: string;
  shoot_date: string | null;
  shoot_time: string | null;
  estimated_total: number;
  deposit_amount: number;
  remaining_amount: number;
  status: string;
  location?: string | null;
};

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

type StatusInfo = {
  label: string;
  description: string;
  className: string;
  dot: string;
};

const statusMap: Record<string, StatusInfo> = {
  awaiting_payment: {
    label: "Chờ photographer xác nhận",
    description:
      "Yêu cầu đã được gửi tới photographer. Vui lòng chờ xác nhận lịch.",
    className: "border-amber-200 bg-amber-50 text-amber-700",
    dot: "bg-amber-500",
  },
  accepted: {
    label: "Photographer đã xác nhận",
    description:
      "Photographer đã xác nhận lịch. Bạn có thể thanh toán cọc để giữ lịch.",
    className: "border-blue-200 bg-blue-50 text-blue-700",
    dot: "bg-blue-500",
  },
  confirmed: {
    label: "Đã thanh toán cọc",
    description:
      "Bạn đã thanh toán cọc thành công. Vui lòng đến đúng lịch hẹn chụp.",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
    dot: "bg-emerald-500",
  },
  completed: {
    label: "Buổi chụp đã hoàn thành",
    description:
      "Photographer đã hoàn thành buổi chụp. Bạn có thể thanh toán phần còn lại.",
    className: "border-purple-200 bg-purple-50 text-purple-700",
    dot: "bg-purple-500",
  },
  fully_paid: {
    label: "Đã thanh toán đủ",
    description:
      "Booking đã hoàn tất thanh toán. Bạn có thể đánh giá photographer.",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
    dot: "bg-emerald-500",
  },
  rejected: {
    label: "Photographer đã từ chối",
    description:
      "Photographer đã từ chối yêu cầu này. Bạn có thể chọn photographer hoặc khung giờ khác.",
    className: "border-red-200 bg-red-50 text-red-700",
    dot: "bg-red-500",
  },
  cancelled: {
    label: "Booking đã hủy",
    description: "Booking này đã được hủy.",
    className: "border-slate-200 bg-slate-50 text-slate-600",
    dot: "bg-slate-400",
  },
};

function getStatusInfo(status: string): StatusInfo {
  return (
    statusMap[status] || {
      label: status,
      description: "Trạng thái booking hiện tại.",
      className: "border-slate-200 bg-slate-50 text-slate-600",
      dot: "bg-slate-400",
    }
  );
}

function formatCurrency(value: number | string | null | undefined) {
  return `${Number(value || 0).toLocaleString("vi-VN")} VND`;
}

function formatDate(value: string | null) {
  if (!value) return "Chưa chọn";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("vi-VN");
}

function formatTime(value: string | null) {
  if (!value) return "Chưa chọn";
  return String(value).slice(0, 5);
}

async function getBooking(bookingCode: string) {
  const response = await fetch(`${API_URL}/bookings/${bookingCode}`, {
    method: "GET",
    cache: "no-store",
  });

  const json: ApiResponse<Booking> = await response.json();

  if (!response.ok || !json.success) {
    throw new Error(json.message || "Không thể lấy booking.");
  }

  return json.data;
}

export default function BookingRequestSuccessPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const unwrappedParams = use(params);
  const bookingCode = unwrappedParams.id;

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [photographerDetail, setPhotographerDetail] = useState<any>(null);

  useEffect(() => {
    if (!booking?.photographer_id) return;
    
    async function fetchPhotographer() {
      try {
        const res = await fetch(`${API_URL}/photographers/${booking.photographer_id}`);
        if (res.ok) {
          const json = await res.json();
          if (json.success) {
            setPhotographerDetail(json.data);
          }
        }
      } catch (err) {
        console.error("Lỗi lấy chi tiết photographer:", err);
      }
    }

    fetchPhotographer();
  }, [booking?.photographer_id]);

  const suggestedPackages = useMemo(() => {
    if (!photographerDetail || !booking) return { sameCategory: [], otherCategory: [] };

    const packages = photographerDetail.packages || [];
    
    // Tìm danh mục của gói chụp hiện tại
    const bookedPkg = packages.find((p: any) => p.name === booking.service_name);
    const categoryName = bookedPkg?.category?.name || "Cưới hỏi";

    const sameCategory: any[] = [];
    const otherCategory: any[] = [];

    packages.forEach((pkg: any) => {
      if (pkg.category?.name === categoryName) {
        sameCategory.push({ ...pkg });
      } else {
        otherCategory.push({ ...pkg });
      }
    });

    // Nếu chỉ có 1 hoặc ít gói chụp trong danh mục này, chúng ta thêm các gói chụp đặc trưng khác để gợi ý thêm
    if (sameCategory.length <= 1 || (categoryName === "Cưới hỏi" && !sameCategory.some(p => p.name.includes("phóng sự")))) {
      if (categoryName === "Cưới hỏi" || bookedPkg?.category?.slug === "wedding") {
        sameCategory.push(
          { id: "mock_wedding_1", name: "Chụp ảnh Phóng sự cưới", price: 8000000, category: { name: "Cưới hỏi", slug: "wedding" } },
          { id: "mock_wedding_2", name: "Chụp ảnh Lễ gia tiên", price: 4500000, category: { name: "Cưới hỏi", slug: "wedding" } },
          { id: "mock_wedding_3", name: "Chụp ảnh Lễ ăn hỏi", price: 5000000, category: { name: "Cưới hỏi", slug: "wedding" } }
        );
      } else if (categoryName === "Cặp đôi" || bookedPkg?.category?.slug === "couple") {
        sameCategory.push(
          { id: "mock_couple_1", name: "Chụp ảnh Cặp đôi dã ngoại", price: 2500000, category: { name: "Cặp đôi", slug: "couple" } },
          { id: "mock_couple_2", name: "Chụp ảnh Kỷ niệm ngày cưới ngọt ngào", price: 3000000, category: { name: "Cặp đôi", slug: "couple" } }
        );
      } else if (categoryName === "Chân dung cá nhân" || bookedPkg?.category?.slug === "portrait") {
        sameCategory.push(
          { id: "mock_portrait_1", name: "Chụp chân dung doanh nhân chuyên nghiệp", price: 1500000, category: { name: "Chân dung cá nhân", slug: "portrait" } },
          { id: "mock_portrait_2", name: "Chụp chân dung ngoại cảnh Vintage", price: 1200000, category: { name: "Chân dung cá nhân", slug: "portrait" } }
        );
      }
    }

    // Lọc bỏ trùng lặp nếu có gói trùng tên
    const uniqueSameCategoryMap = new Map<string, any>();
    sameCategory.forEach((pkg) => {
      uniqueSameCategoryMap.set(pkg.name, pkg);
    });
    const uniqueSameCategory = Array.from(uniqueSameCategoryMap.values());

    // Trong cùng danh mục: chưa chọn lên trước, đã chọn xuống sau
    uniqueSameCategory.sort((a, b) => {
      const aSelected = a.name === booking.service_name;
      const bSelected = b.name === booking.service_name;
      return (aSelected ? 1 : 0) - (bSelected ? 1 : 0);
    });

    return { sameCategory: uniqueSameCategory, otherCategory };
  }, [photographerDetail, booking]);

  useEffect(() => {
    let ignore = false;

    async function loadBooking(showLoading = true) {
      try {
        if (!bookingCode) {
          throw new Error("Thiếu mã booking.");
        }

        if (showLoading) {
          setLoading(true);
        }

        setPageError("");

        const data = await getBooking(bookingCode);

        if (!ignore) {
          setBooking(data);
        }
      } catch (error) {
        if (!ignore) {
          setPageError(
            error instanceof Error ? error.message : "Không thể lấy booking."
          );
        }
      } finally {
        if (!ignore && showLoading) {
          setLoading(false);
        }
      }
    }

    void loadBooking(true);

    const timer = window.setInterval(() => {
      void loadBooking(false);
    }, AUTO_REFRESH_MS);

    return () => {
      ignore = true;
      window.clearInterval(timer);
    };
  }, [bookingCode]);

  const statusInfo = useMemo(() => {
    return getStatusInfo(booking?.status || "awaiting_payment");
  }, [booking?.status]);

  if (loading) {
    return <LoadingScreen />;
  }

  if (pageError || !booking) {
    return <ErrorState message={pageError || "Không tìm thấy booking."} />;
  }

  return (
    <main className="min-h-screen bg-[#f8fafc] px-5 py-10 text-[#0f172a] sm:py-14">
      <section className="mx-auto grid w-full max-w-[1180px] gap-6 lg:grid-cols-[minmax(0,1fr)_390px] lg:items-start">
        <div className="overflow-hidden rounded-[30px] border border-[#e2e8f0] bg-white shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
          <div className="relative overflow-hidden bg-[#111827] px-6 py-8 text-white sm:px-8 lg:px-10">
            <div className="absolute right-[-110px] top-[-110px] h-[300px] w-[300px] rounded-full bg-[#ff8d28]/25 blur-3xl" />
            <div className="absolute bottom-[-130px] left-[20%] h-[280px] w-[280px] rounded-full bg-white/10 blur-3xl" />

            <div className="relative">
              <div className="flex flex-wrap items-center gap-3">
                <p className="text-[12px] font-black uppercase tracking-[0.18em] text-[#ffb267]">
                  Booking request sent
                </p>

                <StatusBadge
                  label={statusInfo.label}
                  className={statusInfo.className}
                  dot={statusInfo.dot}
                />
              </div>

              <h1 className="mt-4 max-w-[760px] text-[34px] font-black leading-[1.05] tracking-[-0.04em] sm:text-[46px]">
                Đã gửi yêu cầu đặt lịch
              </h1>

              <p className="mt-4 max-w-[720px] text-[14px] font-semibold leading-7 text-white/70">
                STUDION đã gửi yêu cầu này tới photographer. Trang này sẽ tự cập
                nhật trạng thái mỗi 8 giây, không cần tải lại.
              </p>
            </div>
          </div>

          <div className="grid gap-5 p-6 sm:p-8">
            <div className="rounded-[24px] border border-[#eef2f7] bg-[#fbfcff] p-5">
              <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#94a3b8]">
                Mã booking
              </p>

              <p className="mt-2 break-all text-[28px] font-black tracking-[-0.04em] text-[#111827]">
                {booking.booking_code}
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <InfoCard label="Photographer" value={booking.photographer_name} />
              <InfoCard label="Dịch vụ" value={booking.service_name} />
              <InfoCard label="Ngày chụp" value={formatDate(booking.shoot_date)} />
              <InfoCard label="Giờ chụp" value={formatTime(booking.shoot_time)} />
              <InfoCard 
                label="Địa điểm" 
                value={booking.location ? booking.location.split(" [Photos:")[0] : "Chưa chọn"} 
              />
              {booking.location && booking.location.includes("[Photos:") && (
                <div className="rounded-[18px] border border-blue-200 bg-blue-50 p-4 col-span-2">
                  <p className="text-[11px] font-black uppercase tracking-[0.14em] text-blue-500">
                    Ảnh buổi chụp (Google Drive)
                  </p>
                  <a 
                    href={booking.location.match(/\[Photos:\s*(https?:\/\/[^\]]+)\]/)?.[1] || "#"} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-1.5 text-[14px] font-black text-blue-700 hover:text-blue-900 underline"
                  >
                    📂 Truy cập thư mục ảnh Google Drive
                  </a>
                </div>
              )}
            </div>

            <div className={`rounded-[22px] border p-5 ${statusInfo.className}`}>
              <p className="text-[13px] font-black">{statusInfo.label}</p>

              <p className="mt-2 text-[14px] font-semibold leading-6 opacity-90">
                {statusInfo.description}
              </p>
            </div>

            <div className="grid gap-3 md:grid-cols-3 text-[#0e111d]">
              {(() => {
                const depositPct = booking.estimated_total > 0 ? Math.round((booking.deposit_amount / booking.estimated_total) * 100) : 50;
                return (
                  <>
                    <MoneyCard label="Tổng tiền" value={booking.estimated_total} />
                    <MoneyCard label={`Tiền cọc ${depositPct}%`} value={booking.deposit_amount} />
                    <MoneyCard label="Còn lại" value={booking.remaining_amount} />
                  </>
                );
              })()}
            </div>

            <ActionButtons booking={booking} />
          </div>
        </div>

        <aside className="rounded-[30px] border border-[#e2e8f0] bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.06)] lg:sticky lg:top-[100px]">
          <p className="text-[12px] font-black uppercase tracking-[0.18em] text-[#ff8d28]">
            Booking progress
          </p>

          <h2 className="mt-3 text-[26px] font-black tracking-[-0.04em] text-[#0f172a]">
            Quy trình booking
          </h2>

          <div className="mt-6 grid gap-4">
            <ProgressItem
              active
              done
              title="Gửi yêu cầu"
              description="Bạn đã gửi yêu cầu đặt lịch tới photographer."
            />

            <ProgressItem
              active={["accepted", "confirmed", "completed", "fully_paid"].includes(
                booking.status
              )}
              done={["accepted", "confirmed", "completed", "fully_paid"].includes(
                booking.status
              )}
              title="Photographer xác nhận"
              description="Photographer kiểm tra lịch và xác nhận yêu cầu."
            />

            <ProgressItem
              active={["confirmed", "completed", "fully_paid"].includes(
                booking.status
              )}
              done={["confirmed", "completed", "fully_paid"].includes(
                booking.status
              )}
              title="Thanh toán cọc"
              description="Bạn thanh toán cọc để giữ lịch chụp."
            />

            <ProgressItem
              active={["completed", "fully_paid"].includes(booking.status)}
              done={["completed", "fully_paid"].includes(booking.status)}
              title="Hoàn thành buổi chụp"
              description="Photographer đánh dấu hoàn thành sau buổi chụp."
            />

            <ProgressItem
              active={booking.status === "fully_paid"}
              done={booking.status === "fully_paid"}
              title="Thanh toán đủ"
              description="Bạn thanh toán phần còn lại và có thể đánh giá."
            />
          </div>

          <div className="mt-6 rounded-[22px] border border-[#ffedd5] bg-[#fff7ed] p-5">
            <p className="text-[13px] font-black text-[#ea580c]">
              Tự cập nhật trạng thái
            </p>

            <p className="mt-2 text-[13px] font-semibold leading-6 text-[#9a3412]">
              Khi photographer xác nhận, từ chối hoặc hoàn thành booking, trang
              này sẽ tự cập nhật sau vài giây.
            </p>
          </div>

          {/* Gợi ý thể loại chụp khác */}
          {photographerDetail && (
            <div className="mt-6 rounded-[22px] border border-[#e2e8f0] bg-white p-5 shadow-sm text-[#0f172a]">
              <p className="text-[12px] font-black uppercase tracking-[0.15em] text-[#ff8d28]">
                Gợi ý thể loại chụp
              </p>
              
              <h3 className="mt-2 text-[13.5px] font-black text-[#0f172a]">
                Các loại hình {suggestedPackages.sameCategory[0]?.category?.name || "chụp ảnh"} khác:
              </h3>

              <div className="mt-3 space-y-2">
                {suggestedPackages.sameCategory.map((pkg: any) => {
                  const isSelected = pkg.name === booking.service_name;
                  return (
                    <div
                      key={pkg.id}
                      className={`flex items-center justify-between p-2.5 rounded-xl border text-[12px] ${
                        isSelected
                          ? "border-[#ff8d28]/30 bg-orange-50/20"
                          : "border-[#eef2f7] bg-white"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1 pr-2">
                        <img
                          src={pkg.image_url || pkg.cover_image || pkg.image || getCategoryFallbackImage(pkg.category?.slug || pkg.category?.name)}
                          alt={pkg.name}
                          className="h-12 w-12 rounded-lg object-cover shrink-0 border border-gray-100"
                        />
                        <div className="min-w-0">
                          <p className="font-bold text-gray-800 truncate">{pkg.name}</p>
                          <p className="text-gray-500 font-medium mt-0.5">Giá: {pkg.price.toLocaleString("vi-VN")} VND</p>
                        </div>
                      </div>
                      
                      {isSelected ? (
                        <span className="shrink-0 px-2.5 py-1 text-[10px] font-black rounded-full bg-orange-100 text-orange-600">
                          Đã chọn
                        </span>
                      ) : (
                        <Link
                          href={`/booking?photographer=${booking.photographer_id}&service=${pkg.category?.slug || "all"}${pkg.id === "mock_wedding_1" ? "&wedding_subtype=phong-su" : pkg.id === "mock_wedding_2" ? "&wedding_subtype=gia-tien" : pkg.id === "mock_wedding_3" ? "&wedding_subtype=an-hoi" : ""}`}
                          className="shrink-0 px-3 py-1 text-[10px] font-black rounded-lg bg-[#ff8d28] text-white hover:bg-[#e0751b] transition-colors"
                        >
                          Chọn thêm
                        </Link>
                      )}
                    </div>
                  );
                })}
              </div>

              {suggestedPackages.otherCategory.length > 0 && (
                <>
                  <h3 className="mt-4 text-[13.5px] font-black text-[#0f172a]">
                    Dịch vụ khác của photographer đó:
                  </h3>
                  <div className="mt-3 space-y-2">
                    {suggestedPackages.otherCategory.slice(0, 3).map((pkg: any) => (
                      <div
                        key={pkg.id}
                        className="flex items-center justify-between p-2.5 rounded-xl border border-[#eef2f7] bg-white text-[12px]"
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1 pr-2">
                          <img
                            src={pkg.image_url || pkg.cover_image || pkg.image || getCategoryFallbackImage(pkg.category?.slug || pkg.category?.name)}
                            alt={pkg.name}
                            className="h-12 w-12 rounded-lg object-cover shrink-0 border border-gray-100"
                          />
                          <div className="min-w-0">
                            <p className="font-bold text-gray-800 truncate">{pkg.name}</p>
                            <p className="text-gray-400 font-bold text-[10px]">{pkg.category?.name}</p>
                            <p className="text-gray-500 font-medium mt-0.5">{pkg.price.toLocaleString("vi-VN")} VND</p>
                          </div>
                        </div>
                        <Link
                          href={`/booking?photographer=${booking.photographer_id}&service=${pkg.category?.slug || "all"}&package=${pkg.id}`}
                          className="shrink-0 px-3 py-1 text-[10px] font-black rounded-lg border border-[#ff8d28] text-[#ff8d28] hover:bg-orange-50 transition-colors"
                        >
                          Tìm hiểu
                        </Link>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </aside>
      </section>
    </main>
  );
}



function ActionButtons({ booking }: { booking: Booking }) {
  if (booking.status === "accepted") {
    return (
      <div className="grid gap-3 sm:grid-cols-2">
        <Link
          href={`/deposit-payment/${encodeURIComponent(booking.booking_code)}`}
          className="rounded-[16px] bg-[#ff8d28] px-5 py-4 text-center text-[14px] font-black text-white shadow-[0_14px_30px_rgba(255,141,40,0.22)] transition-all hover:-translate-y-0.5 hover:bg-[#e0751b]"
        >
          Thanh toán cọc
        </Link>

        <Link
          href="/bookings"
          className="rounded-[16px] border border-[#e2e8f0] bg-white px-5 py-4 text-center text-[14px] font-black text-[#334155] transition-all hover:border-[#ffcfaa] hover:text-[#ff8d28]"
        >
          Xem booking của tôi
        </Link>
      </div>
    );
  }

  if (booking.status === "completed") {
    return (
      <div className="grid gap-3 sm:grid-cols-2">
        <Link
          href={`/final-payment/${encodeURIComponent(booking.booking_code)}`}
          className="rounded-[16px] bg-[#ff8d28] px-5 py-4 text-center text-[14px] font-black text-white shadow-[0_14px_30px_rgba(255,141,40,0.22)] transition-all hover:-translate-y-0.5 hover:bg-[#e0751b]"
        >
          Thanh toán còn lại
        </Link>

        <Link
          href="/bookings"
          className="rounded-[16px] border border-[#e2e8f0] bg-white px-5 py-4 text-center text-[14px] font-black text-[#334155] transition-all hover:border-[#ffcfaa] hover:text-[#ff8d28]"
        >
          Xem booking của tôi
        </Link>
      </div>
    );
  }

  if (booking.status === "fully_paid") {
    return (
      <div className="grid gap-3 sm:grid-cols-2">
        <Link
          href={`/review?booking=${encodeURIComponent(booking.booking_code)}`}
          className="rounded-[16px] bg-[#ff8d28] px-5 py-4 text-center text-[14px] font-black text-white shadow-[0_14px_30px_rgba(255,141,40,0.22)] transition-all hover:-translate-y-0.5 hover:bg-[#e0751b]"
        >
          Đánh giá photographer
        </Link>

        <Link
          href="/bookings"
          className="rounded-[16px] border border-[#e2e8f0] bg-white px-5 py-4 text-center text-[14px] font-black text-[#334155] transition-all hover:border-[#ffcfaa] hover:text-[#ff8d28]"
        >
          Xem booking của tôi
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Link
        href="/bookings"
        className="rounded-[16px] bg-[#ff8d28] px-5 py-4 text-center text-[14px] font-black text-white shadow-[0_14px_30px_rgba(255,141,40,0.22)] transition-all hover:-translate-y-0.5 hover:bg-[#e0751b]"
      >
        Xem booking của tôi
      </Link>

      <Link
        href="/photographer"
        className="rounded-[16px] border border-[#e2e8f0] bg-white px-5 py-4 text-center text-[14px] font-black text-[#334155] transition-all hover:border-[#ffcfaa] hover:text-[#ff8d28]"
      >
        Chọn photographer khác
      </Link>
    </div>
  );
}

function LoadingScreen() {
  return (
    <main className="min-h-screen bg-[#f8fafc] px-5 py-12">
      <section className="mx-auto grid max-w-[1180px] gap-6 lg:grid-cols-[minmax(0,1fr)_390px]">
        <div className="overflow-hidden rounded-[30px] border border-[#e2e8f0] bg-white shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
          <div className="h-[230px] animate-pulse bg-[#111827]" />

          <div className="grid gap-5 p-6 sm:p-8">
            <div className="h-[110px] animate-pulse rounded-[24px] bg-[#eef2f7]" />
            <div className="grid gap-4 md:grid-cols-2">
              <div className="h-[86px] animate-pulse rounded-[18px] bg-[#eef2f7]" />
              <div className="h-[86px] animate-pulse rounded-[18px] bg-[#eef2f7]" />
            </div>
            <div className="h-[100px] animate-pulse rounded-[22px] bg-[#eef2f7]" />
          </div>
        </div>

        <div className="hidden h-[520px] animate-pulse rounded-[30px] bg-white lg:block" />
      </section>
    </main>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <main className="grid min-h-screen place-items-center bg-[#f8fafc] px-5 text-[#0f172a]">
      <div className="w-full max-w-[520px] rounded-[28px] border border-red-100 bg-white p-7 text-center shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-red-50 text-[24px] font-black text-red-600">
          !
        </div>

        <h1 className="mt-5 text-[26px] font-black tracking-[-0.04em] text-[#0f172a]">
          Không thể mở booking
        </h1>

        <p className="mt-2 text-[14px] font-bold leading-6 text-red-600">
          {message}
        </p>

        <Link
          href="/photographer"
          className="mt-6 inline-flex rounded-[14px] bg-[#ff8d28] px-5 py-3 text-[14px] font-black text-white shadow-[0_12px_28px_rgba(255,141,40,0.2)]"
        >
          Quay lại photographer
        </Link>
      </div>
    </main>
  );
}

function StatusBadge({
  label,
  className,
  dot,
}: {
  label: string;
  className: string;
  dot: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-black ${className}`}
    >
      <span className={`h-2 w-2 rounded-full ${dot}`} />
      {label}
    </span>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[18px] border border-[#eef2f7] bg-white p-4">
      <p className="text-[11px] font-black uppercase tracking-[0.14em] text-[#94a3b8]">
        {label}
      </p>

      <p className="mt-2 break-words text-[15px] font-black text-[#111827]">
        {value}
      </p>
    </div>
  );
}

function MoneyCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[18px] border border-[#eef2f7] bg-white p-4">
      <p className="text-[12px] font-bold text-[#64748b]">{label}</p>

      <p className="mt-2 text-[18px] font-black text-[#111827]">
        {formatCurrency(value)}
      </p>
    </div>
  );
}

function ProgressItem({
  active,
  done,
  title,
  description,
}: {
  active: boolean;
  done: boolean;
  title: string;
  description: string;
}) {
  return (
    <div
      className={`rounded-[14px] border p-2.5 transition-all ${
        active
          ? "border-[#ffcfaa] bg-[#fff7ed]"
          : "border-[#eef2f7] bg-[#fbfcff]"
      }`}
    >
      <div className="flex items-center gap-3">
        <span
          className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-[11px] font-black ${
            done
              ? "bg-[#ff8d28] text-white"
              : active
              ? "bg-white text-[#ff8d28] border border-[#ffcfaa]"
              : "bg-[#e2e8f0] text-[#94a3b8]"
          }`}
        >
          {done ? "✓" : "•"}
        </span>

        <div className="min-w-0 flex-1">
          <p
            className={`text-[12.5px] font-black truncate ${
              active ? "text-[#0f172a]" : "text-[#64748b]"
            }`}
          >
            {title}
          </p>
          {active && (
            <p className="mt-0.5 text-[11px] font-semibold leading-4 text-[#64748b]">
              {description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function getCategoryFallbackImage(slugOrName: string = "") {
  const s = String(slugOrName).toLowerCase();
  // Khớp ảnh cụ thể cho từng loại hình chụp cưới trong booking page
  if (s.includes("phóng sự") || s.includes("phong-su")) {
    return "https://i.pinimg.com/736x/6d/c5/19/6dc519d3bd5450d7e06a71e0e5a2a845.jpg";
  }
  if (s.includes("gia tiên") || s.includes("gia-tien")) {
    return "https://i.pinimg.com/736x/88/f0/a4/88f0a43b271ad694a8e10c7eeaf76ea4.jpg";
  }
  if (s.includes("ăn hỏi") || s.includes("an-hoi")) {
    return "https://i.pinimg.com/736x/26/e9/6c/26e96c6c35a006344570ac3fdcb44c41.jpg";
  }
  if (s.includes("wedding") || s.includes("cưới") || s.includes("pre-wedding")) {
    return "https://i.pinimg.com/736x/d5/39/3f/d5393f1c798379d5dfdf1b85563074dc.jpg";
  }
  if (s.includes("couple") || s.includes("đôi")) {
    return "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=120&auto=format&fit=crop&q=60";
  }
  if (s.includes("portrait") || s.includes("chân dung") || s.includes("cá nhân") || s.includes("đơn")) {
    return "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=60";
  }
  if (s.includes("event") || s.includes("sự kiện")) {
    return "https://images.unsplash.com/photo-1511578314322-379afb476865?w=120&auto=format&fit=crop&q=60";
  }
  if (s.includes("yearbook") || s.includes("kỷ yếu")) {
    return "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=120&auto=format&fit=crop&q=60";
  }
  if (s.includes("travel") || s.includes("du lịch")) {
    return "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=120&auto=format&fit=crop&q=60";
  }
  if (s.includes("food") || s.includes("product") || s.includes("sản phẩm") || s.includes("ẩm thực")) {
    return "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=120&auto=format&fit=crop&q=60";
  }
  return "https://images.unsplash.com/photo-1452780212940-6f5c0d14d84a?w=120&auto=format&fit=crop&q=60";
}