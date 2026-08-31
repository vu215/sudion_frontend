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

type MomoCreateResponse = {
  success?: boolean;
  message?: string;
  data?: {
    order_id?: string;
    request_id?: string;
    amount?: number;
    pay_url?: string;
    deeplink?: string | null;
    qr_code_url?: string | null;
    environment?: string;
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

  const [momoLaunching, setMomoLaunching] =
    useState(false);

  const [momoReturnHandled, setMomoReturnHandled] =
    useState(false);

  const [selectedMethod, setSelectedMethod] =
    useState<"bank" | "momo">(
      paymentMethod.toLowerCase() === "momo" ? "momo" : "bank"
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

  // Redirect từ MoMo chỉ dùng để cập nhật UX.
  // Tuyệt đối không set paid từ query string; trạng thái paid chỉ đến từ IPN đã verify chữ ký.
  useEffect(() => {
    if (momoReturnHandled) {
      return;
    }

    const isMomoReturn =
      searchParams.get("momoReturn") === "1";

    if (!isMomoReturn) {
      return;
    }

    setMomoReturnHandled(true);
    setSelectedMethod("momo");

    const resultCode = searchParams.get("resultCode");
    const providerMessage = searchParams.get("message") || "";

    if (resultCode === "0") {
      toast.success(
        "MoMo đã tiếp nhận thanh toán",
        "Đang chờ IPN MoMo xác nhận giao dịch. Trang sẽ tự cập nhật khi backend ghi nhận thành công."
      );
      return;
    }

    if (resultCode) {
      toast.error(
        "Thanh toán MoMo chưa thành công",
        providerMessage || `MoMo trả mã ${resultCode}.`
      );
    }
  }, [momoReturnHandled, searchParams, toast]);

  const handleMomoPayment = async () => {
    if (!displayCode) {
      toast.error(
        "Không thể tạo giao dịch MoMo",
        "Thiếu mã booking/giao dịch."
      );
      return;
    }

    try {
      setMomoLaunching(true);

      const response = await fetch(
        `${API_URL}/payments/momo/create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...authHeaders(),
          },
          body: JSON.stringify(
            groupCode
              ? { groupCode }
              : {
                  bookingCode,
                  paymentType,
                }
          ),
        }
      );

      const json = (await response
        .json()
        .catch(() => ({}))) as MomoCreateResponse;

      if (!response.ok || !json.success) {
        throw new Error(
          json.message || "Không thể tạo giao dịch MoMo."
        );
      }

      const payUrl = json.data?.pay_url;

      if (!payUrl) {
        throw new Error(
          "MoMo không trả về payUrl. Hãy kiểm tra cấu hình merchant ở backend."
        );
      }

      // Dùng trang thanh toán chính thức của MoMo.
      // Desktop sẽ có QR, mobile có thể mở app từ trang MoMo.
      window.location.assign(payUrl);
    } catch (error) {
      console.error("MOMO_CREATE_ERROR:", error);
      toast.error(
        "Không thể mở MoMo",
        error instanceof Error
          ? error.message
          : "Có lỗi xảy ra khi tạo giao dịch MoMo."
      );
      setMomoLaunching(false);
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
          provider_check?: {
            attempted?: boolean;
            configured?: boolean;
            matched?: boolean;
            checked?: number;
            provider?: string;
            error?: string;
          };
        };
      };

      if (!response.ok || !json.success) {
        throw new Error(json.message || "Không thể kiểm tra giao dịch chuyển khoản.");
      }

      if (json.data?.paid) {
        setSuccess(true);
        return;
      }

      const providerCheck = json.data?.provider_check;
      const expectedText = Number(
        json.data?.expected_amount || queryAmount || 0
      ).toLocaleString("vi-VN");

      if (providerCheck?.configured) {
        toast.error(
          "Chưa tìm thấy giao dịch",
          `Đã đối soát ${Number(providerCheck.checked || 0)} giao dịch gần nhất từ SePay nhưng chưa thấy mã ${bookingCode} với số tiền từ ${expectedText}đ. Nếu bạn vừa chuyển khoản, chờ 10-30 giây rồi kiểm tra lại.`
        );
      } else {
        toast.error(
          "Chưa có tín hiệu ngân hàng",
          `Backend chưa kết nối dịch vụ đối soát SePay nên chỉ thấy dữ liệu webhook đã lưu. Giao dịch ${expectedText}đ của bạn không bị mất; sau khi cấu hình SePay, bấm Kiểm tra ngay để đối soát giao dịch gần nhất.`
        );
      }
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
          Đang tải thông tin thanh toán...
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

        {/* Chọn phương thức - không thay đổi luồng bank cũ */}
        <div className="relative mb-5 grid grid-cols-2 gap-2 rounded-2xl border border-white/10 bg-black/20 p-1.5">
          <button
            type="button"
            onClick={() => setSelectedMethod("bank")}
            disabled={paying || momoLaunching}
            className={`rounded-xl px-3 py-2.5 text-xs font-extrabold transition ${
              selectedMethod === "bank"
                ? "bg-white text-[#111827] shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Chuyển khoản ngân hàng
          </button>

          <button
            type="button"
            onClick={() => setSelectedMethod("momo")}
            disabled={paying || momoLaunching}
            className={`rounded-xl px-3 py-2.5 text-xs font-extrabold transition ${
              selectedMethod === "momo"
                ? "bg-[#a50064] text-white shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Ví MoMo
          </button>
        </div>

        {selectedMethod === "bank" ? (
          <>
            {/* BANK: giữ nguyên QR + polling + nút check, không tự set paid */}
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
                  <span className="text-slate-400">
                    Nội dung chuyển khoản (bắt buộc):
                  </span>
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
            {/* MOMO: chỉ redirect sang cổng MoMo. Paid chỉ do IPN hợp lệ cập nhật. */}
            <div className="flex items-center justify-between border-b border-white/10 pb-5">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-[#a50064] text-[10px] font-black text-white">
                  MoMo
                </span>

                <div>
                  <h1 className="text-base font-extrabold tracking-tight">
                    Thanh Toán Qua Ví MoMo
                  </h1>
                  <p className="text-[11px] text-slate-400">
                    Thanh toán trên trang/app MoMo và xác nhận bằng IPN bảo mật
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 rounded-full border border-pink-400/20 bg-pink-400/10 px-2.5 py-1 text-[10px] font-bold text-pink-300">
                <span className="h-1.5 w-1.5 rounded-full bg-pink-300" />
                <span>MoMo Gateway</span>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#a50064]/20 to-white/[0.02] p-5">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-pink-300">
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
                    <span className="text-slate-400">Phương thức:</span>
                    <strong className="text-slate-200">MoMo</strong>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-emerald-500/15 bg-emerald-500/[0.06] p-4 text-[11px] leading-5 text-slate-300">
                <strong className="text-emerald-300">Xác nhận an toàn:</strong>{" "}
                Sudion không đánh dấu thanh toán thành công từ nút bấm hoặc URL quay về.
                Backend chỉ cập nhật khi nhận IPN MoMo có chữ ký hợp lệ, đúng mã giao dịch
                và đúng số tiền của booking.
              </div>

              <div className="flex items-center justify-center gap-2 pt-1 text-xs text-slate-400">
                <div className="h-2 w-2 animate-ping rounded-full bg-[#d82d8b]" />
                <span>
                  Sau khi thanh toán, trang sẽ tự kiểm tra trạng thái mỗi 3 giây.
                </span>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-2.5">
              <button
                type="button"
                disabled={momoLaunching || displayAmount <= 0}
                onClick={handleMomoPayment}
                className="w-full rounded-2xl bg-[#a50064] py-3.5 text-xs font-extrabold text-white shadow-lg transition-all hover:bg-[#8f0057] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {momoLaunching
                  ? "Đang kết nối MoMo..."
                  : "Thanh toán bằng MoMo"}
              </button>

              <button
                type="button"
                disabled={momoLaunching}
                onClick={() => router.back()}
                className="w-full rounded-2xl border border-white/10 bg-transparent py-3 text-xs font-semibold text-slate-400 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                Quay lại
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