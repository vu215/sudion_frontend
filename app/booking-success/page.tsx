"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { getBookingById, saveBooking, type StoredBooking } from "../booking-store";

function formatCurrency(value: number) {
  return `${value.toLocaleString("vi-VN")} VND`;
}

function formatDate(value: string) {
  if (!value) {
    return "Chưa chọn";
  }

  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatTimeRange(value: string) {
  if (!value) {
    return "Chưa chọn";
  }

  const [hour = "0", minute = "0"] = value.split(":");
  const endHour = Number(hour) + 2;

  return `${value} - ${String(endHour).padStart(2, "0")}:${minute}`;
}

export default function BookingSuccessPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-[#fafbfc]" />}>
      <BookingSuccessContent />
    </Suspense>
  );
}

function BookingSuccessContent() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("id") || "";
  const [booking, setBooking] = useState<StoredBooking | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setBooking(bookingId ? getBookingById(bookingId) : null);
      setHasLoaded(true);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [bookingId]);

  if (!hasLoaded) {
    return <main className="min-h-screen bg-[#fafbfc]" />;
  }

  if (!booking) {
    return <MissingBooking />;
  }

  return (
    <main className="min-h-screen bg-[#fafbfc] text-[#0e111d]">
      <section className="mx-auto w-full max-w-[1440px] px-6 py-14 md:px-12 lg:px-20 lg:py-1">
        <HorizontalSteps status={booking.status} />

        <div data-reveal data-reveal-delay="260" className="mt-8 rounded-[18px] border border-[#e8eaf1] bg-white px-5 py-4 shadow-[0_16px_42px_rgba(20,21,31,0.045)] sm:flex sm:items-center sm:justify-between sm:px-6">
          <div>
            <p className="text-[12px] font-black uppercase tracking-[0.16em] text-[#8a8fa1]">
              Mã booking
            </p>
            <p className="mt-1 break-all text-[24px] font-black tracking-[-0.02em] text-[#0e111d]">
              {booking.id}
            </p>
          </div>
          <p className="mt-3 text-[12px] font-semibold leading-5 text-[#6b7280] sm:mt-0 sm:max-w-[320px] sm:text-right">
            Hãy giữ mã này để theo dõi yêu cầu và trao đổi với đội ngũ hỗ trợ.
          </p>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px] xl:grid-cols-[minmax(0,1fr)_450px]">
          <BookingDetails booking={booking} />
          <NextSteps booking={booking} onConfirmPayment={(updatedBooking) => setBooking(updatedBooking)} />
        </div>
      </section>
    </main>
  );
}

function HorizontalSteps({ status }: { status: StoredBooking["status"] }) {
  const steps = [
    "Gói dịch vụ",
    "Lịch trình",
    "Thanh toán",
    "Xác nhận",
  ];
  const activeStep = status === "confirmed" ? 3 : 2;
  const progressWidth = `${(activeStep / (steps.length - 1)) * 100}%`;

  return (
    <section data-reveal data-reveal-delay="230" className="mt-8 rounded-[18px]  px-4 pb-4 pt-5  sm:px-6">
      <div className="relative">
        <div className="absolute left-[12.5%] right-[12.5%] top-5 h-[2px] bg-[#dfe3ee]" />
        <div className="absolute left-[12.5%] top-5 h-[2px] bg-[#ff8d28]" style={{ width: progressWidth }} />
        <div className="relative grid grid-cols-4">
        {steps.map((step, index) => {
          const done = index < activeStep;
          const active = index === activeStep;

          return (
            <div
              key={step}
              className="grid min-w-0 justify-items-center gap-2"
            >
              <span className={`grid h-7 w-7 place-items-center rounded-full border text-[13px] font-black shadow-[0_8px_18px_rgba(20,21,31,0.08)] ${
                done
                  ? "border-[#ff8d28] bg-[#ff8d28] text-white"
                  : active
                    ? "border-[#ffcfaa] bg-[#ff8d28] text-white ring-4 ring-[#ffe3cc]"
                    : "border-[#cfd3df] bg-[#e6e8f0] text-[#4b5563]"
              }`}>
                {done ? <CheckIcon className="h-4 w-4" /> : index + 1}
              </span>
              <span className={`block w-full truncate text-center text-[15px] font-semibold leading-5 sm:text-[18px] ${
                active || done ? "text-[#ff8d28]" : "text-[#4b5563]"
              }`}>
                {step}
              </span>
            </div>
          );
        })}
        </div>
      </div>
    </section>
  );
}

function BookingDetails({ booking }: { booking: StoredBooking }) {
  const detailRows = useMemo(
    () => [
      { label: "Dịch vụ", value: booking.serviceName },
      { label: "Photographer", value: booking.photographerName },
      { label: "Slot đã chọn", value: booking.availabilitySlotLabel },
      { label: "Ngày chụp", value: formatDate(booking.shootDate) },
      { label: "Khung giờ", value: booking.shootTime || "Chưa chọn" },
      { label: "Địa điểm", value: booking.location || "Chưa chọn" },
      { label: "Quy mô", value: booking.peopleScale },
      { label: "Bối cảnh", value: booking.scene || "Chưa chọn" },
      { label: "Kênh liên hệ", value: booking.customer.contactChannel },
      { label: "Trạng thái thanh toán", value: booking.status === "confirmed" ? "Đã thanh toán" : "Chờ thanh toán" },
      { label: "Phương thức thanh toán", value: booking.paymentMethod || "Chưa chọn" },
      { label: "Ngân sách dự kiến", value: booking.budget ? `${booking.budget} VND` : "Chưa nhập" },
      { label: "Ảnh minh họa", value: booking.referenceFileName || "Chưa tải" },
    ],
    [booking],
  );

  return (
    <section data-reveal data-reveal-delay="320" className="rounded-[18px] border border-[#e8eaf1] bg-white p-5 shadow-[0_16px_42px_rgba(20,21,31,0.045)] sm:p-6">
      <div className="flex flex-col gap-3 border-b border-[#f1f3f7] pb-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[12px] font-black uppercase tracking-[0.16em] text-[#ff8d28]">
            Chi tiết booking
          </p>
          <h2 className="mt-2 text-[24px] font-black leading-tight text-[#0e111d]">
            Thông tin buổi chụp
          </h2>
        </div>
        <div className="text-left sm:text-right">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#8a8fa1]">
            Tạm tính
          </p>
          <p className="mt-1 text-[24px] font-black tracking-[-0.02em] text-[#ff8d28]">
            {formatCurrency(booking.estimatedTotal)}
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {detailRows.map((row) => (
          <DetailRow key={row.label} label={row.label} value={row.value} />
        ))}
      </div>

      <div className="mt-6 grid gap-3 border-t border-[#f1f3f7] pt-5">
        <p className="text-[13px] font-extrabold text-[#0e111d]">Dịch vụ đi kèm</p>
        {booking.addOns.length ? (
          <div className="flex flex-wrap gap-2">
            {booking.addOns.map((addOn) => (
              <span key={addOn.id} className="rounded-full bg-[#f0f3fe] px-3 py-1.5 text-[11px] font-bold text-[#556080]">
                {addOn.name}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-[13px] font-semibold text-[#6b7280]">Chưa chọn dịch vụ đi kèm.</p>
        )}
      </div>

      <div className="mt-6 grid gap-3 border-t border-[#f1f3f7] pt-5">
        <p className="text-[13px] font-extrabold text-[#0e111d]">Thông tin liên hệ</p>
        <div className="grid gap-3 sm:grid-cols-3">
          <DetailRow label="Họ tên" value={booking.customer.fullName} />
          <DetailRow label="Số điện thoại" value={booking.customer.phone} />
          <DetailRow label="Email" value={booking.customer.email} />
        </div>
      </div>

      {booking.concept ? (
        <div className="mt-6 rounded-[14px] border border-[#e8eaf1] bg-[#fafbfc] px-4 py-4">
          <p className="text-[12px] font-black uppercase tracking-[0.14em] text-[#8a8fa1]">
            Concept hoặc ghi chú
          </p>
          <p className="mt-2 text-[14px] font-semibold leading-6 text-[#4b5563]">
            {booking.concept}
          </p>
        </div>
      ) : null}
    </section>
  );
}

function NextSteps({ booking, onConfirmPayment }: { booking: StoredBooking; onConfirmPayment: (booking: StoredBooking) => void }) {
  const router = useRouter();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(booking.paymentMethod || "vnpay");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaid, setIsPaid] = useState(booking.status === "confirmed");

  useEffect(() => {
    setIsPaid(booking.status === "confirmed");
  }, [booking.status]);

  const paymentMethods = [
    { id: "vnpay", name: "VNPay", mark: "QR" },
    { id: "momo", name: "MoMo", mark: "M" },
    { id: "bank", name: "Chuyển khoản", mark: "B" },
  ];

  const packagePrice = booking.basePrice;
  const addOnRows = booking.addOns;
  const finalTotal = booking.estimatedTotal;
  const depositAmount = Math.round(finalTotal * 0.5);
  const remainingAmount = finalTotal - depositAmount;

  const paymentInfo = useMemo(() => {
    const commonText = `Booking ${booking.id}\n${booking.serviceName} • ${formatCurrency(finalTotal)}`;

    if (selectedPaymentMethod === "momo") {
      return {
        title: "Thanh toán bằng MoMo",
        description: "Mở ứng dụng MoMo để quét mã QR hoặc chuyển trực tiếp tới ví STUDION.",
        details: [
          { label: "Số ví", value: "037 123 4567" },
          { label: "Tên người nhận", value: "STUDION" },
          { label: "Nội dung", value: commonText },
        ],
        qrData: `MoMo|${commonText}`,
      };
    }

    if (selectedPaymentMethod === "vnpay") {
      return {
        title: "Thanh toán bằng VNPay",
        description: "Quét mã QR VNPay hoặc dùng app ngân hàng để thanh toán.",
        details: [
          { label: "Mã đơn hàng", value: booking.id },
          { label: "Tổng tiền", value: formatCurrency(finalTotal) },
          { label: "Nội dung", value: commonText },
        ],
        qrData: `VNPay|${commonText}`,
      };
    }

    return {
      title: "Thanh toán bằng chuyển khoản",
      description: "Chuyển tiền vào tài khoản ngân hàng của STUDION và xác nhận đã thanh toán.",
      details: [
        { label: "Ngân hàng", value: "Techcombank" },
        { label: "Số tài khoản", value: "1903 123 4567" },
        { label: "Chủ tài khoản", value: "Công ty TNHH STUDION" },
      ],
      qrData: "",
    };
  }, [selectedPaymentMethod, booking.id, booking.serviceName, finalTotal]);

  const handleConfirmPayment = () => {
    setIsProcessing(true);
    const updatedBooking = {
      ...booking,
      status: "confirmed",
      paymentMethod: selectedPaymentMethod,
    };
    saveBooking(updatedBooking);
    setIsPaid(true);
    setIsProcessing(false);
    setIsModalOpen(false);
    onConfirmPayment(updatedBooking);
    router.push(`/booking-success/confirmed?id=${encodeURIComponent(updatedBooking.id)}`);
  };

  return (
    <>
      <aside data-reveal data-reveal-delay="380" className="rounded-[16px] border border-[#e1e4ef] bg-white p-4 shadow-[0_14px_34px_rgba(20,21,31,0.055)] sm:p-5 lg:sticky lg:top-[112px] lg:self-start">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#fff7ef] text-[15px] font-black text-[#ff8d28]">
            {booking.photographerName.slice(0, 1)}
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#6b7280]">
              Đặt lịch với
            </p>
            <h2 className="truncate text-[22px] font-black leading-tight tracking-[-0.02em] text-[#20212b]">
              {booking.photographerName}
            </h2>
            <p className="mt-0.5 text-[12px] font-extrabold text-[#ff8d28]">
              ★ 4.9 (120 reviews)
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-3 border-t border-[#f1f3f7] pt-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[16px] font-black leading-5 text-[#20212b]">
                {booking.serviceName}
              </p>
              <p className="mt-1 text-[12px] font-semibold leading-5 text-[#4b5563]">
                {formatDate(booking.shootDate)} • {formatTimeRange(booking.shootTime)}
              </p>
            </div>
            <p className="shrink-0 text-right text-[16px] font-black leading-5 text-[#20212b]">
              {formatCurrency(packagePrice)}
            </p>
          </div>

          <div className="grid gap-2 rounded-[12px] border border-[#eef0f5] bg-[#fbfcfe] px-3.5 py-3">
            <PaymentRow label="Giá gói chụp" value={formatCurrency(packagePrice)} />
            <PaymentRow
              label={`Phụ thu quy mô (${booking.peopleScale})`}
              value={booking.peopleExtra ? formatCurrency(booking.peopleExtra) : "Không có"}
              muted={!booking.peopleExtra}
            />
            {addOnRows.length ? (
              addOnRows.map((addOn) => (
                <PaymentRow
                  key={addOn.id}
                  label={`Dịch vụ kèm: ${addOn.name}`}
                  value={formatCurrency(addOn.price)}
                />
              ))
            ) : (
              <PaymentRow label="Dịch vụ đi kèm" value="Chưa chọn" muted />
            )}
          </div>

          <div className="grid gap-2.5 border-t border-[#f1f3f7] pt-4">
            <div className="flex items-center justify-between gap-4">
              <p className="text-[14px] font-semibold text-[#4b5563]">Tổng chi phí</p>
              <p className="text-[19px] font-black text-[#20212b]">
                {formatCurrency(finalTotal)}
              </p>
            </div>
            <div className="flex items-center justify-between gap-4 rounded-[10px] border border-[#dcd9f3] bg-[#f0ecff] px-3.5 py-2.5">
              <p className="text-[14px] font-black text-[#ff8d28]">Tiền cọc (50%)</p>
              <p className="text-[15px] font-black text-[#ff8d28]">
                {formatCurrency(depositAmount)}
              </p>
            </div>
            <PaymentRow label="Còn lại sau cọc" value={formatCurrency(remainingAmount)} />
          </div>

          <div>
            <p className="text-[14px] font-semibold text-[#20212b]">
              Chọn phương thức thanh toán
            </p>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {paymentMethods.map((method) => {
                const active = method.id === selectedPaymentMethod;

                return (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => setSelectedPaymentMethod(method.id)}
                    aria-pressed={active}
                    className={`flex min-h-[52px] flex-col items-center justify-center gap-1 rounded-[8px] border px-2 py-2 text-center transition-all ${
                      active
                        ? "border-[#ff8d28] bg-[#fff7ef] text-[#ff8d28]"
                        : "border-[#cfd3df] bg-white text-[#4b5563] hover:border-[#ffcfaa]"
                    }`}
                  >
                    <span className={`grid h-6 w-6 place-items-center rounded-full text-[10px] font-black ${
                      active ? "bg-[#ff8d28] text-white" : "bg-[#f3f4f6] text-[#6b7280]"
                    }`}>
                      {method.mark}
                    </span>
                    <span className="text-[11px] font-black leading-3">
                      {method.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            disabled={isPaid}
            className={`inline-flex justify-center rounded-[9px] px-5 py-3.5 text-[15px] font-black text-white shadow-[0_8px_18px_rgba(255,141,40,0.22)] transition-all ${
              isPaid
                ? "cursor-not-allowed bg-[#9c9c9c]"
                : "bg-[#ff8d28] hover:translate-y-[-1px] hover:bg-[#e0751b]"
            }`}
          >
            {isPaid ? "Đã thanh toán" : "Tiến hành thanh toán"}
          </button>

          <p className="rounded-[9px] border border-[#eee8f6] bg-[#fbf7ff] px-3 py-2.5 text-center text-[11px] font-semibold leading-5 text-[#5f5a6b]">
            ⓘ Hủy lịch miễn phí lên đến 48 giờ trước buổi chụp. Đọc <span className="font-black text-[#ff8d28]">chính sách hoàn tiền</span> của chúng tôi.
          </p>

          <Link
            href="/bookings"
            className="inline-flex justify-center rounded-lg border border-[#e8eaf1] bg-white px-5 py-3 text-[14px] font-extrabold text-[#4b5563] transition-colors hover:border-[#ffcfaa] hover:text-[#ff8d28]"
          >
            Xem lịch đặt
          </Link>
        </div>
      </aside>

      {isModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6">
          <div className="w-full max-w-2xl overflow-hidden rounded-[24px] bg-white shadow-[0_30px_80px_rgba(15,23,42,0.25)]">
            <div className="flex items-center justify-between border-b border-[#eef0f5] px-6 py-5">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#8a8fa1]">Thanh toán</p>
                <h3 className="mt-2 text-[22px] font-black text-[#0e111d]">{paymentInfo.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-[14px] font-bold text-[#6b7280] hover:text-[#0e111d]"
              >
                Đóng
              </button>
            </div>

            <div className="grid gap-6 px-6 py-6 sm:grid-cols-[1.3fr_0.9fr]">
              <div className="grid gap-4">
                <p className="text-[14px] font-medium text-[#4b5563]">{paymentInfo.description}</p>
                <div className="grid gap-3 rounded-[18px] border border-[#eef0f5] bg-[#fafbfc] p-4">
                  {paymentInfo.details.map((item) => (
                    <div key={item.label} className="flex items-center justify-between gap-4 text-[13px] font-semibold text-[#4b5563]">
                      <span>{item.label}</span>
                      <span className="text-right font-black text-[#0e111d]">{item.value}</span>
                    </div>
                  ))}
                </div>
                <div className="rounded-[18px] border border-[#eef0f5] bg-[#fffaf5] p-4 text-[13px] text-[#4b5563]">
                  <p className="font-black text-[#20212b]">Tổng cần thanh toán</p>
                  <p className="mt-2 text-[22px] font-black text-[#ff8d28]">{formatCurrency(finalTotal)}</p>
                  <p className="mt-2 text-sm leading-6 text-[#4b5563]">Sau khi chuyển, nhấn xác nhận để cập nhật trạng thái booking.</p>
                </div>
                <button
                  type="button"
                  onClick={handleConfirmPayment}
                  disabled={isProcessing}
                  className="inline-flex justify-center rounded-[12px] bg-[#ff8d28] px-5 py-3 text-[14px] font-black text-white transition-colors hover:bg-[#e0751b] disabled:cursor-not-allowed disabled:bg-[#d6d6d6]"
                >
                  {isProcessing ? "Đang xử lý..." : "Xác nhận đã thanh toán"}
                </button>
              </div>

              <div className="grid gap-4">
                {paymentInfo.qrData ? (
                  <div className="rounded-[18px] border border-[#eef0f5] bg-white p-4 text-center">
                    <p className="text-[13px] font-bold text-[#4b5563]">Quét mã QR để thanh toán</p>
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(paymentInfo.qrData)}`}
                      alt="QR code thanh toán"
                      className="mx-auto mt-4 h-[260px] w-[260px] rounded-[18px] bg-white"
                    />
                  </div>
                ) : (
                  <div className="rounded-[18px] border border-[#eef0f5] bg-[#fafbfc] p-4 text-[13px] text-[#4b5563]">
                    <p className="font-bold text-[#0e111d]">Hướng dẫn chuyển khoản</p>
                    <p className="mt-2">1. Chuyển tiền chính xác theo nội dung.</p>
                    <p className="mt-2">2. Lưu lại biên lai.</p>
                    <p className="mt-2">3. Nhấn xác nhận để cập nhật trạng thái booking.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

function MissingBooking() {
  return (
    <main className="min-h-screen bg-[#fafbfc] text-[#0e111d]">
      <section className="mx-auto grid w-full max-w-[860px] gap-5 px-6 py-20 md:px-12 lg:px-20">
        <div className="grid h-14 w-14 place-items-center rounded-full bg-[#fff7ef] text-[#ff8d28]">
          <SearchIcon className="h-7 w-7" />
        </div>
        <p className="text-[12px] font-black uppercase tracking-[0.18em] text-[#ff8d28]">
          Không tìm thấy booking
        </p>
        <h1 className="max-w-[680px] text-[38px] font-black leading-[1.08] tracking-[-0.03em] text-[#0e111d] sm:text-[48px]">
          Mã booking không tồn tại hoặc chưa được lưu trên trình duyệt này
        </h1>
        <p className="max-w-[620px] text-[16px] font-medium leading-7 text-[#4b5563] sm:text-[18px]">
          Booking mock hiện được lưu cục bộ trong trình duyệt. Hãy tạo một yêu cầu mới hoặc kiểm tra lại đường dẫn xác nhận.
        </p>
        <div className="flex flex-wrap gap-3 pt-2">
          <Link
            href="/booking"
            className="rounded-lg bg-[#ff8d28] px-5 py-3 text-[14px] font-bold text-white shadow-[0_6px_14px_rgba(255,141,40,0.15)] transition-all hover:translate-y-[-1px] hover:bg-[#e0751b]"
          >
            Tạo booking mới
          </Link>
          <Link
            href="/"
            className="rounded-lg border border-[#e8eaf1] bg-white px-5 py-3 text-[14px] font-bold text-[#4b5563] transition-colors hover:text-[#0e111d]"
          >
            Về trang chủ
          </Link>
        </div>
      </section>
    </main>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[14px] border border-[#eef0f5] bg-[#fbfcfe] px-4 py-3">
      <p className="text-[11px] font-black uppercase tracking-[0.12em] text-[#8a8fa1]">
        {label}
      </p>
      <p className="mt-1 break-words text-[14px] font-extrabold leading-5 text-[#0e111d]">
        {value || "Chưa có"}
      </p>
    </div>
  );
}

function PaymentRow({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className={`flex items-center justify-between gap-4 text-[12px] leading-5 ${muted ? "text-[#8a8fa1]" : "text-[#4b5563]"}`}>
      <span className="min-w-0 truncate font-semibold">{label}</span>
      <span className={`shrink-0 text-right font-bold ${muted ? "text-[#8a8fa1]" : "text-[#20212b]"}`}>
        {value}
      </span>
    </div>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M5 10.3L8.3 13.5L15 6.5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M14 14L17 17" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="8.5" cy="8.5" r="5.75" stroke="currentColor" strokeWidth="2.2" />
    </svg>
  );
}
