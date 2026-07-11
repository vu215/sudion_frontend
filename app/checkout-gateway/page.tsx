"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { useToast } from "@/app/toast-context";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

function CheckoutGatewayContent() {
  const router = useRouter();
  const toast = useToast();
  const searchParams = useSearchParams();

  const bookingCode = searchParams.get("bookingCode") || "";
  const paymentType = searchParams.get("paymentType") || "deposit";
  const amount = Number(searchParams.get("amount") || 0);
  const method = searchParams.get("method") || "vnpay";
  const signature = searchParams.get("signature") || "";

  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Simulate gateway connection loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const getMethodDetails = () => {
    switch (method) {
      case "momo":
        return {
          name: "Ví Điện Tử MoMo",
          logo: "M",
          color: "bg-[#a50064] text-white",
          accentColor: "#a50064",
          btnColor: "bg-[#a50064] hover:bg-[#80004e]",
        };
      case "vnpay":
        return {
          name: "VNPay Gateway",
          logo: "QR",
          color: "bg-[#005baa] text-white",
          accentColor: "#005baa",
          btnColor: "bg-[#005baa] hover:bg-[#004785]",
        };
      default:
        return {
          name: "Chuyển Khoản Ngân Hàng",
          logo: "TK",
          color: "bg-slate-700 text-white",
          accentColor: "#334155",
          btnColor: "bg-slate-700 hover:bg-slate-800",
        };
    }
  };

  const md = getMethodDetails();

  const handleSimulatePayment = async (status: "success" | "cancel") => {
    if (status === "cancel") {
      toast.error("Thanh toán đã hủy", "Bạn đã hủy giao dịch thanh toán.");
      router.back();
      return;
    }

    try {
      setPaying(true);
      const res = await fetch(`${API_URL}/payments/webhook`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bookingCode,
          paymentType,
          amount,
          paymentMethod: method,
          signature,
          transactionCode: `TXN_GATEWAY_${Date.now()}`,
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.message || "Giao dịch không được backend chấp nhận.");
      }

      setSuccess(true);
      toast.success(
        "Thanh toán thành công",
        "Giao dịch đã được ghi nhận qua cổng bảo mật."
      );

      setTimeout(() => {
        router.push("/bookings");
      }, 2000);
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Có lỗi xảy ra.";
      toast.error("Giao dịch thất bại", msg);
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#0e1217] text-white">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#ff8d28] border-t-transparent" />
        <p className="mt-5 text-[14px] font-semibold text-slate-400">
          Đang kết nối cổng thanh toán {md.name}...
        </p>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#0e1217] text-white px-4">
        <div className="grid h-16 w-16 place-items-center rounded-full bg-emerald-500 text-3xl font-bold animate-bounce text-white shadow-[0_0_30px_rgba(16,185,129,0.3)]">
          ✓
        </div>
        <h1 className="mt-6 text-2xl font-black tracking-tight">Thanh Toán Thành Công!</h1>
        <p className="mt-2 text-center text-[13px] text-slate-400 max-w-[340px]">
          Cổng thanh toán đã gửi webhook bảo mật về máy chủ. Bạn sẽ được tự động chuyển hướng về trang lịch đặt sau vài giây.
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0e1217] px-4 py-8 text-white">
      <div className="relative w-full max-w-[480px] overflow-hidden rounded-3xl border border-white/5 bg-white/[0.03] p-7 shadow-2xl backdrop-blur-xl">
        <div className="absolute -right-24 -top-24 h-56 w-56 rounded-full bg-[#ff8d28]/10 blur-3xl" />
        
        {/* Method Badge Header */}
        <div className="flex items-center gap-3 border-b border-white/5 pb-5">
          <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-2xl text-[13px] font-black ${md.color}`}>
            {md.logo}
          </span>
          <div>
            <h1 className="text-base font-extrabold tracking-tight">{md.name}</h1>
            <p className="text-[11px] text-slate-500">Môi trường giả lập cổng thanh toán bảo mật</p>
          </div>
        </div>

        {/* Info */}
        <div className="mt-6 space-y-4">
          <div className="rounded-2xl bg-white/[0.02] border border-white/5 p-4">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Số tiền giao dịch</span>
            <div className="mt-1 text-2xl font-black text-[#ff8d28]">
              {amount.toLocaleString("vi-VN")} <span className="text-xs font-semibold text-slate-400">VND</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-[12px]">
            <div className="rounded-xl bg-white/[0.01] border border-white/5 p-3">
              <span className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider">Mã Booking</span>
              <strong className="mt-1 block font-bold text-slate-300">{bookingCode}</strong>
            </div>
            <div className="rounded-xl bg-white/[0.01] border border-white/5 p-3">
              <span className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider">Loại thanh toán</span>
              <strong className="mt-1 block font-bold text-slate-300">
                {paymentType === "deposit" ? "Đặt cọc (Deposit)" : "Thanh toán đủ (Final)"}
              </strong>
            </div>
          </div>

          {/* Secure details */}
          <div className="rounded-2xl border border-white/5 bg-white/[0.01] p-3.5 text-[11px] leading-relaxed text-slate-500">
            <div className="flex items-center gap-1.5 text-emerald-500 font-semibold mb-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Chữ ký bảo mật từ backend được xác nhận
            </div>
            <p className="font-mono break-all opacity-60">
              Signature: {signature || "N/A"}
            </p>
          </div>
        </div>

        {/* Buttons */}
        <div className="mt-8 flex flex-col gap-3">
          <button
            type="button"
            disabled={paying}
            onClick={() => handleSimulatePayment("success")}
            className={`w-full rounded-2xl py-4 text-[13px] font-extrabold text-white transition-all shadow-lg active:scale-95 ${md.btnColor} disabled:opacity-50`}
          >
            {paying ? "Đang truyền tải webhook..." : "Xác nhận thanh toán (Thành công)"}
          </button>

          <button
            type="button"
            disabled={paying}
            onClick={() => handleSimulatePayment("cancel")}
            className="w-full rounded-2xl border border-white/10 bg-transparent py-4 text-[13px] font-semibold text-slate-400 transition hover:bg-white/[0.03] hover:text-white"
          >
            Hủy giao dịch
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutGatewayPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#0e1217] text-white">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#ff8d28] border-t-transparent" />
        <p className="mt-5 text-[14px] font-semibold text-slate-400">Đang tải...</p>
      </div>
    }>
      <CheckoutGatewayContent />
    </Suspense>
  );
}
