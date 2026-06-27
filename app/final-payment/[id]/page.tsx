"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, use } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/app/toast-context";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

type Booking = {
  booking_code: string;
  photographer_id?: string | number;
  photographer_name: string;
  service_name: string;
  deposit_amount: number;
  remaining_amount: number;
  estimated_total: number;
  status: string;
  location?: string | null;
};

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

type PaymentMethod = "momo" | "vnpay" | "bank";

const paymentMethods: {
  id: PaymentMethod;
  label: string;
  description: string;
  mark: string;
}[] = [
  {
    id: "momo",
    label: "MoMo",
    description: "Thanh toán ví điện tử",
    mark: "M",
  },
  {
    id: "vnpay",
    label: "VNPay",
    description: "Quét mã QR ngân hàng",
    mark: "QR",
  },
  {
    id: "bank",
    label: "Chuyển khoản",
    description: "Chuyển khoản thủ công",
    mark: "B",
  },
];

const statusMap: Record<
  string,
  {
    label: string;
    className: string;
    dot: string;
  }
> = {
  awaiting_payment: {
    label: "Chờ photographer xác nhận",
    className: "border-amber-200 bg-amber-50 text-amber-700",
    dot: "bg-amber-500",
  },
  accepted: {
    label: "Chờ thanh toán cọc",
    className: "border-blue-200 bg-blue-50 text-blue-700",
    dot: "bg-blue-500",
  },
  confirmed: {
    label: "Đã thanh toán cọc",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
    dot: "bg-emerald-500",
  },
  completed: {
    label: "Chờ thanh toán còn lại",
    className: "border-purple-200 bg-purple-50 text-purple-700",
    dot: "bg-purple-500",
  },
  fully_paid: {
    label: "Đã thanh toán đủ",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
    dot: "bg-emerald-500",
  },
  rejected: {
    label: "Đã từ chối",
    className: "border-red-200 bg-red-50 text-red-700",
    dot: "bg-red-500",
  },
  cancelled: {
    label: "Đã hủy",
    className: "border-slate-200 bg-slate-50 text-slate-600",
    dot: "bg-slate-400",
  },
};

function formatCurrency(value: number | string | null | undefined) {
  return `${Number(value || 0).toLocaleString("vi-VN")} VND`;
}

function getStatusInfo(status: string) {
  return (
    statusMap[status] || {
      label: status,
      className: "border-slate-200 bg-slate-50 text-slate-600",
      dot: "bg-slate-400",
    }
  );
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

async function payFinal(bookingCode: string, paymentMethod: string) {
  const response = await fetch(
    `${API_URL}/bookings/${bookingCode}/final-payment`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ paymentMethod }),
    }
  );

  const json: ApiResponse<Booking> = await response.json();

  if (!response.ok || !json.success) {
    throw new Error(json.message || "Không thể thanh toán phần còn lại.");
  }

  return json.data;
}

export default function FinalPaymentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const toast = useToast();

  const unwrappedParams = use(params);
  const bookingCode = unwrappedParams.id;

  const [booking, setBooking] = useState<Booking | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("momo");
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
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

    const uniqueSameCategoryMap = new Map<string, any>();
    sameCategory.forEach((pkg) => {
      uniqueSameCategoryMap.set(pkg.name, pkg);
    });
    const uniqueSameCategory = Array.from(uniqueSameCategoryMap.values());

    uniqueSameCategory.sort((a, b) => {
      const aSelected = a.name === booking.service_name;
      const bSelected = b.name === booking.service_name;
      return (aSelected ? 1 : 0) - (bSelected ? 1 : 0);
    });

    return { sameCategory: uniqueSameCategory, otherCategory };
  }, [photographerDetail, booking]);
  const [pageError, setPageError] = useState("");

  useEffect(() => {
    async function loadBooking() {
      try {
        if (!bookingCode) {
          throw new Error("Thiếu mã booking.");
        }

        setLoading(true);
        setPageError("");

        const data = await getBooking(bookingCode);
        setBooking(data);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Không thể lấy booking.";

        setPageError(message);
        toast.error("Không thể tải booking", message);
      } finally {
        setLoading(false);
      }
    }

    void loadBooking();
  }, [bookingCode, toast]);

  const canPay = booking?.status === "completed";

  const selectedMethod = useMemo(() => {
    return (
      paymentMethods.find((item) => item.id === paymentMethod) ||
      paymentMethods[0]
    );
  }, [paymentMethod]);

  async function handlePay() {
    if (!booking) return;

    try {
      setPaying(true);
      setPageError("");

      const updatedBooking = await payFinal(
        booking.booking_code,
        paymentMethod
      );

      toast.success(
        "Thanh toán hoàn tất",
        `Booking ${updatedBooking.booking_code} đã được thanh toán đủ.`
      );

      router.push("/bookings");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Không thể thanh toán phần còn lại.";

      setPageError(message);
      toast.error("Thanh toán thất bại", message);
    } finally {
      setPaying(false);
    }
  }

  if (loading) {
    return <LoadingScreen />;
  }

  if (pageError && !booking) {
    return <ErrorState message={pageError} />;
  }

  if (!booking) return null;

  const statusInfo = getStatusInfo(booking.status);

  return (
    <main className="min-h-screen bg-[#f8fafc] px-5 py-10 text-[#0f172a] sm:py-14">
      <section className="mx-auto grid w-full max-w-[1180px] gap-6 lg:grid-cols-[minmax(0,1fr)_390px] lg:items-start">
        <div className="overflow-hidden rounded-[30px] border border-[#e2e8f0] bg-white shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
          <div className="relative overflow-hidden bg-[#111827] px-6 py-8 text-white sm:px-8">
            <div className="absolute right-[-90px] top-[-90px] h-[260px] w-[260px] rounded-full bg-[#ff8d28]/25 blur-3xl" />
            <div className="absolute bottom-[-120px] left-[20%] h-[260px] w-[260px] rounded-full bg-white/10 blur-3xl" />

            <div className="relative">
              <div className="flex flex-wrap items-center gap-3">
                <p className="text-[12px] font-black uppercase tracking-[0.18em] text-[#ffb267]">
                  Final payment
                </p>

                <StatusBadge
                  label={statusInfo.label}
                  className={statusInfo.className}
                  dot={statusInfo.dot}
                />
              </div>

              <h1 className="mt-4 max-w-[680px] text-[34px] font-black leading-[1.05] tracking-[-0.04em] sm:text-[46px]">
                Thanh toán số tiền còn lại
              </h1>

              <p className="mt-4 max-w-[680px] text-[14px] font-semibold leading-7 text-white/70">
                Sau khi photographer đánh dấu buổi chụp hoàn thành, bạn có thể
                thanh toán phần còn lại để hoàn tất booking.
              </p>
            </div>
          </div>

          <div className="grid gap-5 p-6 sm:p-8">
            <div className="grid gap-4 rounded-[24px] border border-[#eef2f7] bg-[#fbfcff] p-5">
              <SectionTitle
                eyebrow="Thông tin booking"
                title="Chi tiết buổi chụp"
              />

              <div className="grid gap-3 sm:grid-cols-2">
                <InfoCard label="Mã booking" value={booking.booking_code} />
                <InfoCard
                  label="Photographer"
                  value={booking.photographer_name}
                />
                <div className="sm:col-span-2">
                  <InfoCard label="Dịch vụ" value={booking.service_name} />
                </div>
              </div>
            </div>

            <div className="grid gap-4 rounded-[24px] border border-[#ffedd5] bg-[#fff7ed] p-5">
              <SectionTitle
                eyebrow="Số tiền thanh toán"
                title="Hoàn tất phần còn lại"
              />

              <div className="grid gap-3">
                <MoneyRow label="Tổng tiền" value={booking.estimated_total} />
                <MoneyRow
                  label="Đã thanh toán cọc"
                  value={booking.deposit_amount}
                />
                <MoneyRow
                  label="Thanh toán còn lại"
                  value={booking.remaining_amount}
                  strong
                />
              </div>
            </div>

            <div className="grid gap-4 rounded-[24px] border border-[#eef2f7] bg-white p-5">
              <SectionTitle
                eyebrow="Phương thức"
                title="Chọn cách thanh toán"
              />

              <div className="grid gap-3 sm:grid-cols-3">
                {paymentMethods.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setPaymentMethod(item.id)}
                    className={`rounded-[18px] border p-4 text-left transition-all ${
                      paymentMethod === item.id
                        ? "border-[#ff8d28] bg-[#fff7ed] shadow-[0_12px_28px_rgba(255,141,40,0.12)]"
                        : "border-[#e2e8f0] bg-white hover:border-[#ffcfaa]"
                    }`}
                  >
                    <span
                      className={`grid h-10 w-10 place-items-center rounded-full text-[13px] font-black ${
                        paymentMethod === item.id
                          ? "bg-[#ff8d28] text-white"
                          : "bg-[#f1f5f9] text-[#64748b]"
                      }`}
                    >
                      {item.mark}
                    </span>

                    <span className="mt-3 block text-[14px] font-black text-[#0f172a]">
                      {item.label}
                    </span>

                    <span className="mt-1 block text-[12px] font-semibold leading-5 text-[#64748b]">
                      {item.description}
                    </span>
                  </button>
                ))}
              </div>

              <PaymentPreview
                method={selectedMethod.label}
                bookingCode={booking.booking_code}
                amount={booking.remaining_amount}
              />
            </div>

            {pageError ? (
              <div className="rounded-[18px] border border-red-200 bg-red-50 px-4 py-3 text-[13px] font-bold text-red-600">
                {pageError}
              </div>
            ) : null}

            {!canPay ? (
              <div className="rounded-[18px] border border-amber-200 bg-amber-50 px-4 py-3 text-[13px] font-bold leading-6 text-amber-700">
                Booking này chưa ở trạng thái chờ thanh toán phần còn lại.
                Photographer cần đánh dấu hoàn thành buổi chụp trước.
              </div>
            ) : null}

            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={handlePay}
                disabled={!canPay || paying}
                className="rounded-[16px] bg-[#ff8d28] px-5 py-4 text-[14px] font-black text-white shadow-[0_14px_30px_rgba(255,141,40,0.22)] transition-all hover:-translate-y-0.5 hover:bg-[#e0751b] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
              >
                {paying ? "Đang xử lý..." : "Xác nhận thanh toán còn lại"}
              </button>

              <Link
                href="/bookings"
                className="rounded-[16px] border border-[#e2e8f0] bg-white px-5 py-4 text-center text-[14px] font-black text-[#334155] transition-all hover:border-[#ffcfaa] hover:text-[#ff8d28]"
              >
                Quay lại booking
              </Link>
            </div>
          </div>
        </div>

        <aside className="rounded-[30px] border border-[#e2e8f0] bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.06)] lg:sticky lg:top-[100px]">
          <p className="text-[12px] font-black uppercase tracking-[0.18em] text-[#ff8d28]">
            Booking progress
          </p>

          <h2 className="mt-2 text-[22px] font-black tracking-[-0.04em] text-[#0f172a]">
            Quy trình booking
          </h2>

          <div className="mt-4 mb-6 grid gap-2">
            <ProgressItem
              active={booking.status === "awaiting_payment"}
              done={["accepted", "confirmed", "completed", "fully_paid"].includes(booking.status)}
              title="Gửi yêu cầu"
              description="Yêu cầu đặt lịch đã được gửi."
            />
            <ProgressItem
              active={booking.status === "accepted"}
              done={["confirmed", "completed", "fully_paid"].includes(booking.status)}
              title="Xác nhận lịch"
              description="Photographer xác nhận thời gian chụp."
            />
            <ProgressItem
              active={booking.status === "accepted" || booking.status === "confirmed"}
              done={["confirmed", "completed", "fully_paid"].includes(booking.status)}
              title="Thanh toán cọc"
              description={`Thanh toán cọc ${booking.estimated_total > 0 ? Math.round((booking.deposit_amount / booking.estimated_total) * 100) : 50}% để giữ chỗ.`}
            />
            <ProgressItem
              active={booking.status === "completed"}
              done={["completed", "fully_paid"].includes(booking.status)}
              title="Thực hiện chụp"
              description="Hoàn thành chụp & đưa link ảnh."
            />
            <ProgressItem
              active={booking.status === "fully_paid"}
              done={booking.status === "fully_paid"}
              title="Hoàn tất"
              description="Thanh toán đủ & đánh giá."
            />
          </div>

          <p className="text-[12px] font-black uppercase tracking-[0.18em] text-[#ff8d28] border-t border-gray-100 pt-4">
            Payment summary
          </p>

          <h2 className="mt-2 text-[22px] font-black tracking-[-0.04em] text-[#0f172a]">
            Tóm tắt thanh toán
          </h2>

          <div className="mt-5 grid gap-3 rounded-[22px] border border-[#eef2f7] bg-[#fbfcff] p-5">
            <SummaryRow label="Mã booking" value={booking.booking_code} />
            <SummaryRow label="Trạng thái" value={statusInfo.label} />
            <SummaryRow label="Phương thức" value={selectedMethod.label} />
          </div>

          <div className="mt-5 grid gap-3 rounded-[22px] border border-[#ffedd5] bg-[#fff7ed] p-5">
            <SummaryRow
              label="Tổng tiền"
              value={formatCurrency(booking.estimated_total)}
            />
            <SummaryRow
              label="Đã thanh toán cọc"
              value={formatCurrency(booking.deposit_amount)}
            />
            <SummaryRow
              label="Cần thanh toán"
              value={formatCurrency(booking.remaining_amount)}
              strong
            />
          </div>

          <div className="mt-5 rounded-[22px] border border-emerald-200 bg-emerald-50 p-5">
            <p className="text-[13px] font-black text-emerald-700">
              Sau khi thanh toán đủ
            </p>

            <p className="mt-2 text-[13px] font-semibold leading-6 text-emerald-700/80">
              Booking sẽ chuyển sang trạng thái đã thanh toán đủ. Bạn có thể
              đánh giá photographer và tiếp tục chat trong hệ thống.
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

function LoadingScreen() {
  return (
    <main className="min-h-screen bg-[#f8fafc] px-5 py-12">
      <section className="mx-auto grid max-w-[1180px] gap-6 lg:grid-cols-[minmax(0,1fr)_390px]">
        <div className="overflow-hidden rounded-[30px] border border-[#e2e8f0] bg-white shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
          <div className="h-[220px] animate-pulse bg-[#111827]" />

          <div className="grid gap-5 p-6 sm:p-8">
            <div className="h-[150px] animate-pulse rounded-[24px] bg-[#eef2f7]" />
            <div className="h-[180px] animate-pulse rounded-[24px] bg-[#eef2f7]" />
            <div className="h-[220px] animate-pulse rounded-[24px] bg-[#eef2f7]" />
          </div>
        </div>

        <div className="hidden h-[420px] animate-pulse rounded-[30px] bg-white lg:block" />
      </section>
    </main>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <main className="grid min-h-screen place-items-center bg-[#f8fafc] px-5">
      <div className="w-full max-w-[460px] rounded-[28px] border border-[#e2e8f0] bg-white p-7 text-center shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-red-50 text-[24px] font-black text-red-600">
          !
        </div>

        <h1 className="mt-5 text-[26px] font-black tracking-[-0.04em] text-[#0f172a]">
          Không thể mở thanh toán
        </h1>

        <p className="mt-2 text-[14px] font-bold leading-6 text-red-600">
          {message}
        </p>

        <Link
          href="/bookings"
          className="mt-6 inline-flex rounded-[14px] bg-[#ff8d28] px-5 py-3 text-[14px] font-black text-white shadow-[0_12px_28px_rgba(255,141,40,0.2)]"
        >
          Về booking
        </Link>
      </div>
    </main>
  );
}

function SectionTitle({
  eyebrow,
  title,
}: {
  eyebrow: string;
  title: string;
}) {
  return (
    <div>
      <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#ff8d28]">
        {eyebrow}
      </p>

      <h2 className="mt-1 text-[20px] font-black tracking-[-0.03em] text-[#0f172a]">
        {title}
      </h2>
    </div>
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
    <div className="rounded-[18px] border border-[#eef2f7] bg-white px-4 py-3">
      <p className="text-[11px] font-black uppercase tracking-[0.14em] text-[#94a3b8]">
        {label}
      </p>

      <p className="mt-1 break-words text-[15px] font-black text-[#0f172a]">
        {value}
      </p>
    </div>
  );
}

function MoneyRow({
  label,
  value,
  strong,
}: {
  label: string;
  value: number;
  strong?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-[16px] bg-white px-4 py-3">
      <p className="text-[13px] font-bold text-[#64748b]">{label}</p>

      <p
        className={`text-right font-black ${
          strong ? "text-[20px] text-[#ff8d28]" : "text-[16px] text-[#111827]"
        }`}
      >
        {formatCurrency(value)}
      </p>
    </div>
  );
}

function PaymentPreview({
  method,
  bookingCode,
  amount,
}: {
  method: string;
  bookingCode: string;
  amount: number;
}) {
  const bankId = "TCB"; // Techcombank
  const accountNo = "0762682989";
  const accountName = "TRAN THIEN VU";
  
  // URL to generate VietQR image dynamically
  const qrUrl = `https://img.vietqr.io/image/${bankId}-${accountNo}-compact.png?amount=${amount}&addInfo=${encodeURIComponent(bookingCode)}&accountName=${encodeURIComponent(accountName)}`;

  return (
    <div className="rounded-[22px] border border-[#eef2f7] bg-[#fbfcff] p-5">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
        {/* QR Code Container */}
        <div className="flex flex-col items-center justify-center shrink-0">
          <div className="relative overflow-hidden rounded-[22px] border-2 border-[#ff8d28]/20 bg-white p-2 shadow-sm transition hover:border-[#ff8d28]/60">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={qrUrl}
              alt="Mã QR Thanh Toán VietQR"
              className="h-[140px] w-[140px] object-contain rounded-lg"
              title="Quét mã QR để thanh toán"
            />
          </div>
          <span className="mt-2 block text-[10px] font-black uppercase tracking-wider text-slate-400">
            Quét mã VietQR
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[14px] font-black text-[#0f172a] flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Thanh toán qua {method === "momo" ? "ví MoMo (QR Chuyển khoản)" : method === "vnpay" ? "cổng VNPay / Ngân hàng" : "Chuyển khoản Techcombank"}
          </p>

          <div className="mt-3 grid gap-2 text-[12px] leading-5 text-[#64748b]">
            <p>
              Tên ngân hàng: <strong className="text-[#0f172a]">Techcombank (Ngân hàng Kỹ thương)</strong>
            </p>
            <p>
              Số tài khoản: <strong className="text-[#0f172a] select-all">0762682989</strong>
            </p>
            <p>
              Chủ tài khoản: <strong className="text-[#0f172a]">TRAN THIEN VU</strong>
            </p>
            <div className="mt-1">
              <span className="block text-[11px] font-semibold text-[#64748b]">Nội dung chuyển khoản (bắt buộc chính xác):</span>
              <span className="mt-1 inline-block rounded-[8px] border border-orange-100 bg-[#fff7ed] px-3 py-1.5 text-[13px] font-black text-[#ff8d28] select-all">
                {bookingCode}
              </span>
            </div>
            <p className="mt-2 text-slate-900 font-semibold">
              Số tiền:{" "}
              <span className="font-black text-[#ff8d28] text-sm">
                {formatCurrency(amount)}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryRow({
  label,
  value,
  strong,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-[12px] font-bold text-[#64748b]">{label}</span>

      <span
        className={`max-w-[210px] text-right text-[13px] font-black leading-5 ${
          strong ? "text-[#ff8d28]" : "text-[#0f172a]"
        }`}
      >
        {value}
      </span>
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