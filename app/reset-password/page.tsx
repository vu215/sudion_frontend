"use client";

import Link from "next/link";
import { useState, type FormEvent, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/app/auth-context";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<main className="min-h-[calc(100vh-280px)] bg-[#fbf8ff]" />}>
      <ResetPasswordContent />
    </Suspense>
  );
}

function ResetPasswordContent() {
  const { transitionTo } = useAuth();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Điều kiện kiểm tra
  const hasMinLength = password.length >= 8;
  const hasUpperAndLower = /[a-z]/.test(password) && /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (!password || !confirmPassword) {
      setError("Vui lòng nhập đầy đủ thông tin.");
      return;
    }

    if (!hasMinLength || !hasUpperAndLower || !hasNumber) {
      setError("Mật khẩu chưa đáp ứng đủ điều kiện bảo mật.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }

    if (!token) {
      setError("Mã token không hợp lệ hoặc đã hết hạn.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Đặt lại mật khẩu thất bại.");
      }
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-[calc(100vh-280px)] bg-[#fbf8ff] text-[#1a1b24] py-10 flex items-center justify-center px-4 animate-fade-in">
      <div className="w-full max-w-[800px] bg-white border border-[#e8eaf1]/80 rounded-[20px] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.06)] overflow-hidden">
        <div className="grid md:grid-cols-[1fr_1.1fr] items-stretch">

          {/* Banner Column */}
          <div className="relative hidden md:block min-h-[480px] overflow-hidden select-none">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&w=800&q=80"
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent pointer-events-none" />

            {/* Glassmorphism description box */}
            <div className="absolute bottom-6 left-6 right-6 rounded-[12px] border border-white/10 bg-black/30 p-4.5 text-white shadow-[0_12px_30px_rgba(0,0,0,0.15)] backdrop-blur-md">
              <h2 className="text-[14px] font-bold leading-snug">
                Nâng tầm câu chuyện hình ảnh của bạn.
              </h2>
            </div>
          </div>

          {/* Form Column */}
          <div className="flex flex-col justify-center px-6 py-10 sm:px-12">
            <div className="w-full max-w-[360px] mx-auto">

              {/* Back to login link at the top */}
              <div className="mb-4">
                <Link
                  href="/login"
                  onClick={(e) => {
                    e.preventDefault();
                    transitionTo("/login");
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#ff8d28] hover:underline"
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="19" y1="12" x2="5" y2="12"></line>
                    <polyline points="12 19 5 12 12 5"></polyline>
                  </svg>
                  Quay lại đăng nhập
                </Link>
              </div>

              <div className="mb-6">
                <h1 className="text-3xl font-extrabold leading-tight text-[#1a1b24] tracking-tight">
                  Thiết lập mật khẩu mới
                </h1>
                <p className="mt-2 text-sm font-medium text-[#5f6368] leading-relaxed">
                  Vui lòng nhập mật khẩu mới của bạn bên dưới.
                </p>
              </div>

              {success ? (
                <div className="grid gap-4.5">
                  <div className="rounded-xl border border-green-100 bg-green-50 px-3.5 py-3 text-xs font-semibold text-green-600">
                    Mật khẩu đã được thiết lập lại thành công! Bạn có thể dùng mật khẩu mới này để đăng nhập ngay bây giờ.
                  </div>
                  <Link
                    href="/login"
                    onClick={(e) => {
                      e.preventDefault();
                      transitionTo("/login");
                    }}
                    className="flex items-center justify-center !h-11 w-full rounded-xl bg-[#ff8d28] hover:bg-[#e9791d] text-sm font-bold text-white shadow-sm transition duration-200"
                  >
                    Đến trang đăng nhập
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="grid gap-4.5">
                  {error ? (
                    <div className="rounded-xl border border-red-100 bg-red-50 px-3.5 py-2.5 text-xs font-semibold text-red-600">
                      {error}
                    </div>
                  ) : null}

                  <div className="grid gap-1.5">
                    <span className="text-[13px] font-bold text-[#1a1b24]">Mật khẩu mới</span>
                    <span className="relative block">
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="!h-11 !min-h-0 w-full rounded-xl !border !border-[#e2e8f0] bg-white px-4 pr-11 !text-sm font-medium tracking-[0.22em] text-[#1a1b24] outline-none placeholder:tracking-[0.22em] focus:border-[#ff8d28] focus:bg-white focus:ring-2 focus:ring-[#ff8d28]/10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#5f6368] hover:text-[#ff8d28] transition"
                      >
                        {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                      </button>
                    </span>
                  </div>

                  <div className="grid gap-1.5">
                    <span className="text-[13px] font-bold text-[#1a1b24]">Xác nhận mật khẩu mới</span>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="!h-11 !min-h-0 w-full rounded-xl !border !border-[#e2e8f0] bg-white px-4 !text-sm font-medium tracking-[0.22em] text-[#1a1b24] outline-none placeholder:tracking-[0.22em] focus:border-[#ff8d28] focus:bg-white focus:ring-2 focus:ring-[#ff8d28]/10"
                    />
                  </div>

                  {/* Checklist Card */}
                  <div className="rounded-xl border border-gray-100 bg-[#f8fafc] px-4 py-3.5 text-xs font-semibold leading-relaxed text-[#5f6368] grid gap-2 select-none">
                    <div className="flex items-center gap-2">
                      <CheckCircleIcon active={hasMinLength} />
                      <span className={hasMinLength ? "text-green-600" : "text-[#5f6368]"}>
                        Ít nhất 8 ký tự
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircleIcon active={hasUpperAndLower} />
                      <span className={hasUpperAndLower ? "text-green-600" : "text-[#5f6368]"}>
                        Bao gồm chữ hoa và chữ thường
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircleIcon active={hasNumber} />
                      <span className={hasNumber ? "text-green-600" : "text-[#5f6368]"}>
                        Bao gồm ít nhất một số
                      </span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center justify-center !h-11 w-full rounded-xl bg-[#ff8d28] hover:bg-[#e9791d] text-sm font-bold text-white shadow-sm transition duration-200"
                  >
                    {loading ? "Đang cập nhật..." : "Cập nhật mật khẩu"}
                  </button>
                </form>
              )}

            </div>
          </div>

        </div>
      </div>
    </main>
  );
}

function EyeIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2.75 10s2.4-4.25 7.25-4.25S17.25 10 17.25 10 14.85 14.25 10 14.25 2.75 10 2.75 10Z" />
      <circle cx="10" cy="10" r="2.25" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="m2 2 16 16M10 5.75c3.27 0 5.92 2.22 7.25 4.25M17.25 10s-.83 1.47-2.39 2.51M8.09 8.09a2.25 2.25 0 0 0 3.18 3.18M6.28 6.28C3.89 7.37 2.75 10 2.75 10s2.4-4.25 7.25-4.25" />
    </svg>
  );
}

function CheckCircleIcon({ active }: { active: boolean }) {
  if (active) {
    return (
      <svg className="h-4 w-4 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4 text-gray-300 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="10" cy="10" r="6" />
    </svg>
  );
}
