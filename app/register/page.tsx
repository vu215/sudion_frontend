"use client";

import Link from "next/link";
import {
  useEffect,
  useRef,
  useState,
  type ClipboardEvent,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { useAuth } from "@/app/auth-context";
import { GoogleAuthButton } from "@/app/components/google-auth-button";

const assets = {
  dalat:
    "https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&w=800&q=80",
};

type RegisterStep = "form" | "otp";

function formatCountdown(totalSeconds: number) {
  const safe = Math.max(0, totalSeconds);
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export default function RegisterPage() {
  const { requestRegisterOtp, verifyRegisterOtp, transitionTo } = useAuth();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptedPolicy, setAcceptedPolicy] = useState(false);

  const [step, setStep] = useState<RegisterStep>("form");
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const otpRefs = useRef<Array<HTMLInputElement | null>>([]);
  const [maskedEmail, setMaskedEmail] = useState("");
  const [expiresSeconds, setExpiresSeconds] = useState(0);
  const [resendSeconds, setResendSeconds] = useState(0);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (step !== "otp") return;

    const timer = window.setInterval(() => {
      setExpiresSeconds((value) => Math.max(0, value - 1));
      setResendSeconds((value) => Math.max(0, value - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [step]);

  useEffect(() => {
    if (step !== "otp") return;

    const focusTimer = window.setTimeout(() => {
      otpRefs.current[0]?.focus();
    }, 80);

    return () => window.clearTimeout(focusTimer);
  }, [step]);

  function validateRegisterForm() {
    setError("");
    setSuccess("");

    if (!fullName.trim() || !email.trim() || !phone.trim() || !password || !confirmPassword) {
      setError("Vui lòng nhập đầy đủ thông tin.");
      return null;
    }

    if (!acceptedPolicy) {
      setError("Vui lòng đồng ý với Điều khoản sử dụng và Chính sách bảo mật.");
      return null;
    }

    const cleanPhone = phone.trim();
    const phoneRegex = /^(0|\+84)(3|5|7|8|9)[0-9]{8}$/;
    if (!phoneRegex.test(cleanPhone)) {
      setError("Số điện thoại không đúng định dạng (ví dụ: 0912345678 hoặc +84912345678).");
      return null;
    }

    if (password.length < 8) {
      setError("Mật khẩu phải có ít nhất 8 ký tự.");
      return null;
    }

    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[^A-Za-z0-9]/.test(password);

    if (!hasUppercase || !hasLowercase || !hasNumber || !hasSpecialChar) {
      setError(
        "Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt."
      );
      return null;
    }

    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return null;
    }

    return cleanPhone;
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const cleanPhone = validateRegisterForm();
    if (!cleanPhone) return;

    setLoading(true);

    const result = await requestRegisterOtp({
      fullName: fullName.trim(),
      email: email.trim(),
      phone: cleanPhone,
      password,
    });

    setLoading(false);

    if (!result.ok) {
      setError(result.error || "Không thể gửi mã OTP đăng ký.");
      return;
    }

    setOtp(["", "", "", "", "", ""]);
    setMaskedEmail(result.email || email.trim());
    setExpiresSeconds(result.expiresIn || 300);
    setResendSeconds(result.resendAfter || 60);
    setSuccess(result.message || "Đã gửi mã OTP đến email của bạn.");
    setStep("otp");
  }

  function handleOtpChange(index: number, rawValue: string) {
    const digits = rawValue.replace(/\D/g, "");
    const digit = digits.slice(-1);

    setOtp((current) => {
      const next = [...current];
      next[index] = digit;
      return next;
    });

    setError("");

    if (digit && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  }

  function handleOtpKeyDown(index: number, event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Backspace") {
      if (!otp[index] && index > 0) {
        otpRefs.current[index - 1]?.focus();
      }
      return;
    }

    if (event.key === "ArrowLeft" && index > 0) {
      event.preventDefault();
      otpRefs.current[index - 1]?.focus();
      return;
    }

    if (event.key === "ArrowRight" && index < 5) {
      event.preventDefault();
      otpRefs.current[index + 1]?.focus();
    }
  }

  function handleOtpPaste(event: ClipboardEvent<HTMLDivElement>) {
    const pasted = event.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);

    if (!pasted) return;

    event.preventDefault();

    const nextOtp = ["", "", "", "", "", ""];
    pasted.split("").forEach((digit, index) => {
      nextOtp[index] = digit;
    });

    setOtp(nextOtp);
    setError("");

    const focusIndex = Math.min(pasted.length, 6) - 1;
    otpRefs.current[Math.max(0, focusIndex)]?.focus();
  }

  async function handleVerifyOtp(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess("");

    const otpCode = otp.join("");

    if (!/^\d{6}$/.test(otpCode)) {
      setError("Vui lòng nhập đủ 6 số OTP.");
      return;
    }

    if (expiresSeconds <= 0) {
      setError("Mã OTP đã hết hạn. Vui lòng gửi lại mã mới.");
      return;
    }

    setLoading(true);

    const result = await verifyRegisterOtp({
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      password,
      otp: otpCode,
    });

    setLoading(false);

    if (!result.ok) {
      setOtp(["", "", "", "", "", ""]);
      window.setTimeout(() => otpRefs.current[0]?.focus(), 50);
      setError(result.error || "Mã OTP không hợp lệ.");
      return;
    }

    setSuccess(result.message || "Xác minh thành công. Đang đăng nhập...");

    // verifyRegisterOtp đã lưu token + session và cập nhật AuthContext.
    // Chuyển về trang chủ ngay sau khi xác minh thành công.
    transitionTo("/");
  }

  async function handleResendOtp() {
    if (resending || resendSeconds > 0) return;

    setError("");
    setSuccess("");
    setResending(true);

    const result = await requestRegisterOtp({
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      password,
    });

    setResending(false);

    if (!result.ok) {
      if (result.retryAfter && result.retryAfter > 0) {
        setResendSeconds(result.retryAfter);
      }
      setError(result.error || "Không thể gửi lại OTP.");
      return;
    }

    setOtp(["", "", "", "", "", ""]);
    setMaskedEmail(result.email || maskedEmail || email.trim());
    setExpiresSeconds(result.expiresIn || 300);
    setResendSeconds(result.resendAfter || 60);
    setSuccess("Đã gửi một mã OTP mới đến email của bạn.");
    window.setTimeout(() => otpRefs.current[0]?.focus(), 50);
  }

  function handleBackToForm() {
    setStep("form");
    setOtp(["", "", "", "", "", ""]);
    setError("");
    setSuccess("");
    setExpiresSeconds(0);
    setResendSeconds(0);
  }

  return (
    <main className="min-h-[calc(100vh-220px)] bg-[#fbf8ff] text-[#1a1b24] py-6 flex items-center justify-center px-4 animate-fade-in">
      <div className="w-full max-w-[850px] bg-white border border-[#e8eaf1]/80 rounded-[20px] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.06)] overflow-hidden">
        <div className="grid md:grid-cols-[1.15fr_1fr] items-stretch">
          <div className="flex flex-col justify-center px-6 py-7 sm:px-9 sm:py-8 order-2 md:order-1">
            <div className="w-full max-w-[380px] mx-auto">
              {step === "form" ? (
                <>
                  <div className="mb-3.5">
                    <h1 className="text-2xl sm:text-[26px] font-extrabold leading-tight text-[#1a1b24] tracking-tight">
                      Bắt đầu hành trình
                    </h1>
                    <p className="mt-1 text-xs font-medium text-[#5f6368]">
                      Đăng ký tài khoản SudionStudio.
                    </p>
                  </div>

                  {error ? (
                    <div className="mb-3 rounded-xl border border-red-100 bg-red-50 px-3.5 py-2 text-xs font-semibold text-red-600">
                      {error}
                    </div>
                  ) : null}

                  <form onSubmit={handleSubmit} className="grid gap-2.5">
                    <div className="grid gap-1">
                      <span className="text-[13px] font-bold text-[#1a1b24]">
                        Họ và tên
                      </span>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Nhập họ và tên"
                        autoComplete="name"
                        className="!h-10 !min-h-0 w-full rounded-xl !border !border-[#e2e8f0] bg-white px-3.5 !text-sm font-medium text-[#1a1b24] outline-none transition focus:border-[#ff8d28] focus:bg-white focus:ring-2 focus:ring-[#ff8d28]/10"
                      />
                    </div>

                    <div className="grid gap-1">
                      <span className="text-[13px] font-bold text-[#1a1b24]">
                        Số điện thoại <span className="text-red-500">*</span>
                      </span>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Ví dụ: 0912345678"
                        autoComplete="tel"
                        className="!h-10 !min-h-0 w-full rounded-xl !border !border-[#e2e8f0] bg-white px-3.5 !text-sm font-medium text-[#1a1b24] outline-none transition focus:border-[#ff8d28] focus:bg-white focus:ring-2 focus:ring-[#ff8d28]/10"
                      />
                    </div>

                    <div className="grid gap-1">
                      <span className="text-[13px] font-bold text-[#1a1b24]">
                        Email
                      </span>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="example@gmail.com"
                        autoComplete="email"
                        className="!h-10 !min-h-0 w-full rounded-xl !border !border-[#e2e8f0] bg-white px-3.5 !text-sm font-medium text-[#1a1b24] outline-none transition focus:border-[#ff8d28] focus:bg-white focus:ring-2 focus:ring-[#ff8d28]/10"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="grid gap-1">
                        <span className="text-[13px] font-bold text-[#1a1b24]">
                          Mật khẩu
                        </span>
                        <input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Sudion@123"
                          autoComplete="new-password"
                          className="!h-10 !min-h-0 w-full rounded-xl !border !border-[#e2e8f0] bg-white px-3.5 !text-sm font-medium text-[#1a1b24] outline-none focus:border-[#ff8d28] focus:bg-white focus:ring-2 focus:ring-[#ff8d28]/10"
                        />
                      </div>

                      <div className="grid gap-1">
                        <span className="text-[13px] font-bold text-[#1a1b24]">
                          Xác nhận
                        </span>
                        <input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Sudion@123"
                          autoComplete="new-password"
                          className="!h-10 !min-h-0 w-full rounded-xl !border !border-[#e2e8f0] bg-white px-3.5 !text-sm font-medium text-[#1a1b24] outline-none focus:border-[#ff8d28] focus:bg-white focus:ring-2 focus:ring-[#ff8d28]/10"
                        />
                      </div>
                    </div>

                    <label className="!flex !flex-row !items-start !gap-2.5 my-1 text-xs leading-5 text-[#5f6368] cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={acceptedPolicy}
                        onChange={(e) => setAcceptedPolicy(e.target.checked)}
                        className="mt-0.5 !h-4 !w-4 !min-h-0 !w-auto shrink-0 rounded border-[#cbd5e1] accent-[#ff8d28] cursor-pointer"
                      />
                      <span>
                        Tôi đồng ý với{" "}
                        <Link href="/terms" className="font-semibold text-[#1a1b24] underline hover:text-[#ff8d28]">
                          Điều khoản sử dụng
                        </Link>{" "}
                        và{" "}
                        <Link href="/support" className="font-semibold text-[#1a1b24] underline hover:text-[#ff8d28]">
                          Chính sách bảo mật
                        </Link>{" "}
                        của SudionStudio.
                      </span>
                    </label>

                    <button
                      type="submit"
                      disabled={loading}
                      className="flex items-center justify-center !h-11 mt-1 rounded-xl bg-[#ff8d28] hover:bg-[#e9791d] text-sm font-bold text-white shadow-sm transition duration-200 disabled:opacity-60 cursor-pointer"
                    >
                      {loading ? "Đang gửi mã xác minh..." : "Tạo tài khoản ngay"}
                    </button>
                  </form>

                  <div className="relative my-3">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-[#e2e8f0]" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-2 text-[#64748b] font-medium">
                        Hoặc đăng ký bằng
                      </span>
                    </div>
                  </div>

                  <GoogleAuthButton buttonText="Đăng ký bằng Google" onError={setError} />

                  <p className="mt-3.5 text-center text-xs font-semibold text-[#444655]">
                    Đã có tài khoản?{" "}
                    <Link
                      href="/login"
                      onClick={(e) => {
                        e.preventDefault();
                        transitionTo("/login");
                      }}
                      className="font-bold text-[#ff8d28] transition hover:text-[#e9791d] hover:underline"
                    >
                      Đăng nhập
                    </Link>
                  </p>
                </>
              ) : (
                <>
                  <div className="mb-5">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff4e8] text-[#ff8d28] shadow-sm ring-1 ring-[#ff8d28]/15">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        className="h-6 w-6"
                        aria-hidden="true"
                      >
                        <path d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v11a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 17.5v-11Z" />
                        <path d="m5.5 7 6.5 5 6.5-5" />
                      </svg>
                    </div>

                    <h1 className="text-2xl sm:text-3xl font-extrabold leading-tight text-[#1a1b24] tracking-tight">
                      Xác minh email
                    </h1>
                    <p className="mt-2 text-xs font-medium leading-5 text-[#5f6368]">
                      Sudion đã gửi mã OTP gồm 6 số đến{" "}
                      <span className="font-bold text-[#1a1b24]">
                        {maskedEmail || email}
                      </span>
                      . Nhập mã để hoàn tất đăng ký.
                    </p>
                  </div>

                  {error ? (
                    <div className="mb-3.5 rounded-xl border border-red-100 bg-red-50 px-3.5 py-2 text-xs font-semibold leading-5 text-red-600">
                      {error}
                    </div>
                  ) : null}

                  {success ? (
                    <div className="mb-3.5 rounded-xl border border-emerald-100 bg-emerald-50 px-3.5 py-2 text-xs font-semibold leading-5 text-emerald-700">
                      {success}
                    </div>
                  ) : null}

                  <form onSubmit={handleVerifyOtp} className="grid gap-4">
                    <div>
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <span className="text-[13px] font-bold text-[#1a1b24]">
                          Mã xác minh
                        </span>
                        <span
                          className={`text-[11px] font-bold ${
                            expiresSeconds > 60
                              ? "text-[#64748b]"
                              : expiresSeconds > 0
                                ? "text-amber-600"
                                : "text-red-500"
                          }`}
                        >
                          {expiresSeconds > 0
                            ? `Còn ${formatCountdown(expiresSeconds)}`
                            : "Mã đã hết hạn"}
                        </span>
                      </div>

                      <div
                        className="flex items-center justify-between gap-2"
                        onPaste={handleOtpPaste}
                      >
                        {otp.map((digit, index) => (
                          <input
                            key={index}
                            ref={(element) => {
                              otpRefs.current[index] = element;
                            }}
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            autoComplete={index === 0 ? "one-time-code" : "off"}
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleOtpChange(index, e.target.value)}
                            onKeyDown={(e) => handleOtpKeyDown(index, e)}
                            aria-label={`Số OTP thứ ${index + 1}`}
                            className="h-12 w-10 sm:w-11 rounded-xl border border-[#dfe3ea] bg-white text-center text-lg font-extrabold text-[#1a1b24] outline-none transition focus:border-[#ff8d28] focus:ring-2 focus:ring-[#ff8d28]/15"
                          />
                        ))}
                      </div>

                      <p className="mt-2 text-[11px] font-medium leading-4 text-[#8a9099]">
                        Có thể dán nguyên mã 6 số vào bất kỳ ô nào.
                      </p>
                    </div>

                    <button
                      type="submit"
                      disabled={loading || expiresSeconds <= 0 || otp.join("").length !== 6}
                      className="flex items-center justify-center !h-11 rounded-xl bg-[#ff8d28] hover:bg-[#e9791d] text-sm font-bold text-white shadow-sm transition duration-200 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {loading ? "Đang xác minh..." : "Xác minh & đăng nhập"}
                    </button>
                  </form>

                  <div className="mt-4 rounded-xl border border-[#edf0f4] bg-[#fafbfc] px-3.5 py-3 text-center">
                    <p className="text-[11px] font-medium text-[#6b7280]">
                      Chưa nhận được mã?
                    </p>
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={resending || resendSeconds > 0}
                      className="mt-1 text-xs font-bold text-[#ff8d28] transition hover:text-[#e9791d] disabled:cursor-not-allowed disabled:text-[#9ca3af]"
                    >
                      {resending
                        ? "Đang gửi lại..."
                        : resendSeconds > 0
                          ? `Gửi lại sau ${resendSeconds}s`
                          : "Gửi lại mã OTP"}
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleBackToForm}
                    className="mt-4 flex w-full items-center justify-center gap-1.5 text-xs font-bold text-[#5f6368] transition hover:text-[#1a1b24]"
                  >
                    <span aria-hidden="true">←</span>
                    Đổi thông tin đăng ký
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="relative hidden md:block min-h-[480px] overflow-hidden order-1 md:order-2 select-none">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={assets.dalat}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent pointer-events-none" />

            <div className="absolute top-[15%] left-8 text-white select-none">
              <h3 className="text-[52px] font-extrabold leading-none tracking-wide text-shadow-sm font-serif">
                Đà Lạt
              </h3>
              <p className="text-[15px] font-medium leading-none tracking-wider mt-2 opacity-90 font-sans italic">
                đi đâu chụp gì?
              </p>
            </div>

            <div className="absolute bottom-6 left-6 right-6 rounded-[12px] border border-white/10 bg-black/30 p-4.5 text-white shadow-[0_12px_30px_rgba(0,0,0,0.15)] backdrop-blur-md">
              <h2 className="text-[14px] font-bold leading-snug">
                Nâng tầm câu chuyện hình ảnh của bạn.
              </h2>
              <p className="mt-1 text-[10px] font-medium leading-relaxed text-white/70">
                Tài khoản chỉ được tạo sau khi email được xác minh bằng mã OTP.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
