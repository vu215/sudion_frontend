"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/app/toast-context";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8080/api";

type GroupPaymentData = {
  total_amount?: number | string;
  status?: string;
  payment_type?: string;
};

type PaymentResponse = {
  success?: boolean;
  message?: string;
  data?: {
    status?: string;
    deposit_status?: string;
    final_status?: string;
    remaining_amount?: number | string;
  };
};

type VnpayCreateResponse = {
  success?: boolean;
  message?: string;
  data?: {
    txn_ref?: string;
    amount?: number;
    payment_url?: string;
    environment?: string;
    expires_at?: string;
    ipn_url?: string;
  };
};

function authHeaders(): Record<string, string> {
  if (typeof window === "undefined") {
    return {};
  }

  const token =
    window.localStorage.getItem("sudion_token") ||
    window.localStorage.getItem("token") ||
    window.localStorage.getItem("accessToken");

  return token
    ? {
      Authorization: `Bearer ${token}`,
    }
    : {};
}

function CheckoutGatewayContent() {
  const router = useRouter();
  const toast = useToast();
  const searchParams = useSearchParams();

  const groupCode =
    searchParams.get("groupCode") || "";

  const bookingCode =
    searchParams.get("bookingCode") || "";

  const paymentType =
    searchParams.get("paymentType") || "deposit";

  const queryAmount = Number(
    searchParams.get("amount") || 0
  );

  const paymentMethod =
    searchParams.get("method") || "bank";

  const signature =
    searchParams.get("signature") || "";

  const isFinalPayment =
    paymentType === "final";

  const [loading, setLoading] =
    useState(true);

  const [paying, setPaying] =
    useState(false);

  const [vnpayLaunching, setVnpayLaunching] =
    useState(false);

  const [vnpayReturnHandled, setVnpayReturnHandled] =
    useState(false);

  const [selectedMethod, setSelectedMethod] =
    useState<"bank" | "vnpay">(
      paymentMethod.toLowerCase() === "vnpay" ? "vnpay" : "bank"
    );

  const [success, setSuccess] =
    useState(false);

  const [groupData, setGroupData] =
    useState<GroupPaymentData | null>(null);

  const displayCode =
    groupCode || bookingCode;

  const displayAmount = groupData
    ? Number(groupData.total_amount || 0)
    : queryAmount;

  const bankInfo = {
    bankName: "Techcombank (TCB)",
    accountNumber: "19075748293011",
    accountName: "TRAN THIEN VU",
  };

  const qrUrl =
    `https://img.vietqr.io/image/TCB-${bankInfo.accountNumber}-compact.png` +
    `?amount=${displayAmount}` +
    `&addInfo=${encodeURIComponent(displayCode)}` +
    `&accountName=${encodeURIComponent(
      bankInfo.accountName
    )}`;

  // Kiểm tra trạng thái thanh toán mỗi 3 giây
  useEffect(() => {
    let active = true;

    let intervalId:
      | ReturnType<typeof setInterval>
      | null = null;

    const stopPolling = () => {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    };

    async function checkStatus() {
      if (!displayCode) {
        if (active) {
          setLoading(false);
        }

        return;
      }

      try {
        // Thanh toán đơn gom
        if (groupCode) {
          const response = await fetch(
            `${API_URL}/payments/group/${groupCode}/info`,
            {
              headers: authHeaders(),
              cache: "no-store",
            }
          );

          const json = (await response
            .json()
            .catch(() => ({}))) as {
              success?: boolean;
              data?: GroupPaymentData;
            };

          if (!active) {
            return;
          }

          if (
            response.ok &&
            json.success &&
            json.data
          ) {
            setGroupData(json.data);

            if (
              json.data.status === "paid"
            ) {
              setSuccess(true);
              stopPolling();
            }
          }
        }

        // Thanh toán một booking
        else if (bookingCode) {
          const response = await fetch(
            `${API_URL}/payments/${bookingCode}`,
            {
              headers: authHeaders(),
              cache: "no-store",
            }
          );

          const json = (await response
            .json()
            .catch(() => ({}))) as PaymentResponse;

          if (!active) {
            return;
          }

          if (
            response.ok &&
            json.success &&
            json.data
          ) {
            // Final chỉ được thành công khi fully_paid
            // hoặc final_status = paid.
            const paymentCompleted =
              isFinalPayment
                ? json.data.status ===
                "fully_paid" ||
                json.data.final_status ===
                "paid"
                : json.data.status ===
                "confirmed" ||
                json.data.status ===
                "fully_paid" ||
                json.data.deposit_status ===
                "paid";

            if (paymentCompleted) {
              setSuccess(true);
              stopPolling();
            }
          }
        }
      } catch (error) {
        console.error(
          "Lỗi polling trạng thái thanh toán:",
          error
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void checkStatus();

    intervalId = setInterval(() => {
      void checkStatus();
    }, 3000);

    return () => {
      active = false;
      stopPolling();
    };
  }, [
    groupCode,
    bookingCode,
    displayCode,
    isFinalPayment,
  ]);

  // Chuyển về lịch đặt khi thanh toán thành công
  useEffect(() => {
    if (!success) {
      return;
    }

    toast.success(
      "Thanh toán thành công!",
      isFinalPayment
        ? "Đơn đặt lịch đã được thanh toán đầy đủ."
        : "Hệ thống đã ghi nhận tiền cọc."
    );

    const timer = setTimeout(() => {
      router.push("/bookings");
    }, 2500);

    return () => {
      clearTimeout(timer);
    };
  }, [
    success,
    isFinalPayment,
    router,
    toast,
  ]);

  // VNPAY return đã được backend kiểm tra Secure Hash trước khi quay lại trang này.
  // Frontend tuyệt đối không tự set paid từ query string; chỉ IPN đã verify mới cập nhật DB.
  useEffect(() => {
    if (vnpayReturnHandled) {
      return;
    }

    if (searchParams.get("vnpayReturn") !== "1") {
      return;
    }

    setVnpayReturnHandled(true);
    setSelectedMethod("vnpay");

    const verified = searchParams.get("vnpVerified") === "1";
    const responseCode = searchParams.get("vnpResponseCode") || "";
    const transactionStatus = searchParams.get("vnpTransactionStatus") || "";

    if (!verified) {
      toast.error(
        "Không xác minh được phản hồi VNPAY",
        "Checksum phản hồi không hợp lệ hoặc thiếu dữ liệu. Booking vẫn được giữ nguyên và chưa bị đánh dấu đã thanh toán."
      );
      return;
    }

    if (responseCode === "00" && (!transactionStatus || transactionStatus === "00")) {
      toast.success(
        "VNPAY đã tiếp nhận thanh toán",
        "Đang chờ IPN VNPAY xác nhận giao dịch. Trang sẽ tự cập nhật khi backend ghi nhận thành công."
      );
      return;
    }

    toast.error(
      "Thanh toán VNPAY chưa thành công",
      responseCode
        ? `VNPAY trả mã ${responseCode}. Booking vẫn được giữ để bạn thử lại hoặc chuyển khoản.`
        : "Giao dịch chưa hoàn tất. Booking vẫn được giữ nguyên."
    );
  }, [vnpayReturnHandled, searchParams, toast]);

  const handleVnpayPayment = async () => {
    if (!displayCode) {
      toast.error(
        "Không thể tạo giao dịch VNPAY",
        "Thiếu mã booking/giao dịch."
      );
      return;
    }

    try {
      setVnpayLaunching(true);

      const response = await fetch(
        `${API_URL}/payments/vnpay/create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...authHeaders(),
          },
          body: JSON.stringify(
            groupCode
              ? { groupCode }
              : { bookingCode, paymentType }
          ),
        }
      );

      const json = (await response
        .json()
        .catch(() => ({}))) as VnpayCreateResponse;

      if (!response.ok || !json.success) {
        throw new Error(
          json.message || "Không thể tạo giao dịch VNPAY."
        );
      }

      const paymentUrl = json.data?.payment_url;
      if (!paymentUrl) {
        throw new Error(
          "VNPAY không trả về payment URL. Hãy kiểm tra TMN Code/Hash Secret ở backend."
        );
      }

      window.location.assign(paymentUrl);
    } catch (error) {
      console.error("VNPAY_CREATE_ERROR:", error);
      toast.error(
        "Không thể mở VNPAY",
        error instanceof Error
          ? error.message
          : "Có lỗi xảy ra khi tạo giao dịch VNPAY."
      );
      setVnpayLaunching(false);
    }
  };

  const handleManualConfirm = async () => {
    if (!displayCode) {
      toast.error(
        "Không thể kiểm tra",
        "Thiếu mã booking/giao dịch."
      );
      return;
    }

    try {
      setPaying(true);

      // Nút này CHỈ kiểm tra trạng thái.
      // Nó không tự đánh dấu paid và không tạo TXN_TEST nữa.
      if (groupCode) {
        const response = await fetch(
          `${API_URL}/payments/group/${groupCode}/info`,
          {
            headers: authHeaders(),
            cache: "no-store",
          }
        );

        const json = (await response
          .json()
          .catch(() => ({}))) as {
          success?: boolean;
          message?: string;
          data?: GroupPaymentData;
        };

        if (!response.ok || !json.success) {
          throw new Error(json.message || "Không thể kiểm tra giao dịch đơn gom.");
        }

        if (json.data?.status === "paid") {
          setGroupData(json.data);
          setSuccess(true);
          return;
        }

        toast.error(
          "Chưa nhận được giao dịch",
          "Ngân hàng chưa xác nhận đủ tiền cho đơn này. Hãy giữ đúng số tiền và nội dung chuyển khoản rồi thử lại sau vài giây."
        );
        return;
      }

      const response = await fetch(
        `${API_URL}/payments/${bookingCode}/check-bank-transfer?paymentType=${encodeURIComponent(
          paymentType
        )}`,
        {
          headers: authHeaders(),
          cache: "no-store",
        }
      );

      const json = (await response
        .json()
        .catch(() => ({}))) as {
        success?: boolean;
        message?: string;
        data?: {
          paid?: boolean;
          expected_amount?: number;
          received_amount?: number;
          transaction_code?: string | null;
        };
      };

      if (!response.ok || !json.success) {
        throw new Error(json.message || "Không thể kiểm tra giao dịch chuyển khoản.");
      }

      if (json.data?.paid) {
        setSuccess(true);
        return;
      }

      toast.error(
        "Chưa tìm thấy giao dịch",
        `Hệ thống vẫn đang chờ ngân hàng xác nhận ${Number(
          json.data?.expected_amount || queryAmount || 0
        ).toLocaleString("vi-VN")}đ. Không cần thanh toán lại nếu bạn vừa chuyển khoản.`
      );
    } catch (error) {
      console.error("PAYMENT_CHECK_ERROR:", error);
      toast.error(
        "Kiểm tra thất bại",
        error instanceof Error ? error.message : "Có lỗi xảy ra khi kiểm tra giao dịch."
      );
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#0e1217] text-white">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#ff8d28] border-t-transparent" />

        <p className="mt-5 text-[14px] font-semibold text-slate-400">
          Đang khởi tạo kết nối ngân hàng...
        </p>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#0e1217] px-4 text-white">
        <div className="grid h-20 w-20 animate-bounce place-items-center rounded-full bg-emerald-500 text-4xl font-bold text-white shadow-[0_0_40px_rgba(16,185,129,0.4)]">
          ✓
        </div>

        <h1 className="mt-6 text-2xl font-black tracking-tight text-white">
          Thanh Toán Đã Nhận Thành Công!
        </h1>

        <p className="mt-2 max-w-[360px] text-center text-xs leading-relaxed text-slate-400">
          {isFinalPayment ? (
            <>
              Đơn đặt lịch đã chuyển sang
              trạng thái{" "}
              <strong>
                ĐÃ THANH TOÁN ĐỦ
              </strong>
              .
            </>
          ) : (
            <>
              Đơn đặt lịch đã chuyển sang
              trạng thái{" "}
              <strong>ĐÃ CỌC</strong>.
            </>
          )}
        </p>

        <p className="mt-4 animate-pulse text-[11px] font-semibold text-emerald-400">
          Đang chuyển hướng về lịch đặt
          của bạn...
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0e1217] px-4 py-10 text-white">
      <div className="relative w-full max-w-[500px] overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-7 shadow-2xl backdrop-blur-xl">
        <div className="absolute -right-24 -top-24 h-56 w-56 rounded-full bg-[#ff8d28]/10 blur-3xl" />

        <div className="relative mb-5 grid grid-cols-2 gap-2 rounded-2xl border border-white/10 bg-black/20 p-1.5">
          <button
            type="button"
            onClick={() => setSelectedMethod("bank")}
            disabled={paying || vnpayLaunching}
            className={`rounded-xl px-3 py-2.5 text-xs font-extrabold transition ${
              selectedMethod === "bank"
                ? "bg-white text-[#111827] shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Chuyển khoản
          </button>

          <button
            type="button"
            onClick={() => setSelectedMethod("vnpay")}
            disabled={paying || vnpayLaunching}
            className={`rounded-xl px-3 py-2.5 text-xs font-extrabold transition ${
              selectedMethod === "vnpay"
                ? "bg-[#0066b3] text-white shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            VNPAY
          </button>
        </div>

        {selectedMethod === "bank" ? (
          <>
            <div className="flex items-center justify-between border-b border-white/10 pb-5">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-[#ff8d28] text-xs font-black text-white">
                  QR
                </span>

                <div>
                  <h1 className="text-base font-extrabold tracking-tight">
                    Thanh Toán Chuyển Khoản Ngân Hàng
                  </h1>

                  <p className="text-[11px] text-slate-400">
                    Tự động xác nhận khi backend nhận webhook ngân hàng
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold text-emerald-400">
                <span className="h-1.5 w-1.5 animate-ping rounded-full bg-emerald-400" />
                <span>Đang chờ xác nhận</span>
              </div>
            </div>

            <div className="mt-6 space-y-4 text-center">
              <div className="inline-block rounded-2xl bg-white p-3 shadow-xl">
                <img
                  src={qrUrl}
                  alt="Mã VietQR"
                  className="mx-auto h-[220px] w-[220px] object-contain"
                />

                <span className="mt-2 block text-[10px] font-black uppercase tracking-wider text-slate-500">
                  Quét mã bằng ứng dụng ngân hàng bất kỳ
                </span>
              </div>

              <div className="space-y-2 rounded-2xl border border-white/10 bg-white/[0.02] p-4 text-left text-xs">
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-slate-400">
                    {isFinalPayment
                      ? "Số tiền còn lại cần chuyển:"
                      : "Số tiền cọc cần chuyển:"}
                  </span>

                  <strong className="text-base font-black text-[#ff8d28]">
                    {displayAmount.toLocaleString("vi-VN")} VND
                  </strong>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-400">Ngân hàng:</span>
                  <strong className="text-slate-200">{bankInfo.bankName}</strong>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-400">Số tài khoản:</span>
                  <strong className="select-all font-mono text-slate-200">
                    {bankInfo.accountNumber}
                  </strong>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-400">Chủ tài khoản:</span>
                  <strong className="uppercase text-slate-200">
                    {bankInfo.accountName}
                  </strong>
                </div>

                <div className="flex justify-between border-t border-white/5 pt-1">
                  <span className="text-slate-400">Nội dung chuyển khoản:</span>
                  <span className="select-all rounded bg-orange-500/20 px-2 py-0.5 font-mono font-bold text-orange-400">
                    {displayCode}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-2 pt-2 text-xs text-slate-400">
                <div className="h-2 w-2 animate-ping rounded-full bg-[#ff8d28]" />
                <span>Đang lắng nghe tín hiệu chuyển khoản từ ngân hàng...</span>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-2.5">
              <button
                type="button"
                disabled={paying}
                onClick={handleManualConfirm}
                className="w-full rounded-2xl bg-[#ff8d28] py-3.5 text-xs font-extrabold text-white shadow-lg transition-all hover:bg-[#e0751b] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {paying
                  ? "Đang kiểm tra giao dịch..."
                  : "Tôi đã chuyển khoản - Kiểm tra ngay"}
              </button>

              <button
                type="button"
                disabled={paying}
                onClick={() => router.back()}
                className="w-full rounded-2xl border border-white/10 bg-transparent py-3 text-xs font-semibold text-slate-400 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                Quay lại
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between border-b border-white/10 pb-5">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-[#0066b3] text-[10px] font-black text-white">
                  VN
                </span>

                <div>
                  <h1 className="text-base font-extrabold tracking-tight">
                    Thanh Toán Qua VNPAY
                  </h1>
                  <p className="text-[11px] text-slate-400">
                    Sandbox WebPay · xác nhận bằng Secure Hash + IPN
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 rounded-full border border-sky-400/20 bg-sky-400/10 px-2.5 py-1 text-[10px] font-bold text-sky-300">
                <span className="h-1.5 w-1.5 rounded-full bg-sky-300" />
                <span>VNPAY Gateway</span>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#0066b3]/20 to-white/[0.02] p-5">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-sky-300">
                  {isFinalPayment
                    ? "Thanh toán phần còn lại"
                    : "Thanh toán tiền cọc"}
                </p>

                <div className="mt-2 text-3xl font-black tracking-tight text-white">
                  {displayAmount.toLocaleString("vi-VN")}đ
                </div>

                <div className="mt-4 grid gap-2 text-xs">
                  <div className="flex justify-between border-t border-white/10 pt-3">
                    <span className="text-slate-400">Mã đối chiếu:</span>
                    <strong className="select-all font-mono text-slate-200">
                      {displayCode}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Môi trường:</span>
                    <strong className="text-slate-200">VNPAY Sandbox</strong>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-emerald-500/15 bg-emerald-500/[0.06] p-4 text-[11px] leading-5 text-slate-300">
                <strong className="text-emerald-300">Xác nhận an toàn:</strong>{" "}
                URL thanh toán được backend ký HMAC-SHA512. Frontend không tự đánh dấu
                thanh toán thành công. Backend chỉ cập nhật khi IPN VNPAY có checksum hợp lệ,
                đúng booking và đúng số tiền.
              </div>

              <div className="rounded-2xl border border-amber-400/15 bg-amber-400/[0.06] p-4 text-[11px] leading-5 text-slate-300">
                Nếu VNPAY Sandbox lỗi hoặc bạn hủy giao dịch, booking vẫn được giữ nguyên.
                Bạn có thể thử lại hoặc chuyển sang chuyển khoản ngân hàng.
              </div>

              <div className="flex items-center justify-center gap-2 pt-1 text-xs text-slate-400">
                <div className="h-2 w-2 animate-ping rounded-full bg-sky-400" />
                <span>Sau thanh toán, trang tự kiểm tra trạng thái mỗi 3 giây.</span>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-2.5">
              <button
                type="button"
                disabled={vnpayLaunching || displayAmount <= 0}
                onClick={handleVnpayPayment}
                className="w-full rounded-2xl bg-[#0066b3] py-3.5 text-xs font-extrabold text-white shadow-lg transition-all hover:bg-[#005492] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {vnpayLaunching
                  ? "Đang tạo giao dịch VNPAY..."
                  : "Thanh toán bằng VNPAY"}
              </button>

              <button
                type="button"
                disabled={vnpayLaunching}
                onClick={() => setSelectedMethod("bank")}
                className="w-full rounded-2xl border border-white/10 bg-transparent py-3 text-xs font-semibold text-slate-400 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                Chuyển sang chuyển khoản ngân hàng
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function CheckoutGatewayPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen flex-col items-center justify-center bg-[#0e1217] text-white">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#ff8d28] border-t-transparent" />

          <p className="mt-5 text-[14px] font-semibold text-slate-400">
            Đang tải...
          </p>
        </div>
      }
    >
      <CheckoutGatewayContent />
    </Suspense>
  );
}