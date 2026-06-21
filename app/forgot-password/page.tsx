"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useAuth } from "@/app/auth-context";

export default function ForgotPasswordPage() {
  const { transitionTo } = useAuth();
  const [email, setEmail] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    // Giả lập gửi yêu cầu đặt lại mật khẩu
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
    }, 1000);
  }

  return (
    <main className="min-h-[calc(100vh-280px)] bg-[#fbf8ff] text-[#1a1b24] py-10 flex items-center justify-center px-4 animate-fade-in">
      <div className="w-full max-w-[800px] bg-white border border-[#e8eaf1]/80 rounded-[20px] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.06)] overflow-hidden">
        <div className="grid md:grid-cols-[1.1fr_1fr] items-stretch">

          {/* Form Column */}
          <div className="flex flex-col justify-center px-6 py-10 sm:px-12">
            <div className="w-full max-w-[360px] mx-auto">



              <div className="mb-6">
                <h1 className="text-3xl font-extrabold leading-tight text-[#1a1b24] tracking-tight">
                  Quên mật khẩu?
                </h1>
                <p className="mt-2 text-sm font-medium text-[#5f6368] leading-relaxed">
                  Đừng lo lắng, hãy nhập email của bạn và chúng tôi sẽ gửi hướng dẫn đặt lại mật khẩu.
                </p>
              </div>

              {success ? (
                <div className="mb-4 rounded-xl border border-green-100 bg-green-50 px-3.5 py-3 text-xs font-semibold text-green-600">
                  Hướng dẫn đặt lại mật khẩu đã được gửi đến email của bạn. Vui lòng kiểm tra hộp thư.
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="grid gap-4.5">
                  <div className="grid gap-1.5">
                    <span className="text-[13px] font-bold text-[#1a1b24]">Email</span>
                    <span className="relative block">
                      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#9ca3af]">
                        <EmailIcon />
                      </span>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@example.com"
                        className="!h-11 !min-h-0 w-full rounded-xl !border !border-[#e2e8f0] bg-white px-4 pl-11 !text-sm font-medium text-[#1a1b24] outline-none transition focus:border-[#ff8d28] focus:bg-white focus:ring-2 focus:ring-[#ff8d28]/10"
                      />
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center justify-center gap-1.5 !h-11 w-full rounded-xl bg-[#ff8d28] hover:bg-[#e9791d] text-sm font-bold text-white shadow-sm transition duration-200"
                  >
                    {loading ? "Đang gửi..." : "Gửi hướng dẫn"}
                    {!loading && (
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                        <polyline points="12 5 19 12 12 19"></polyline>
                      </svg>
                    )}
                  </button>
                </form>
              )}

              <div className="mt-6 text-center">
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

            </div>
          </div>

          {/* Banner Column */}
          <div className="relative hidden md:block min-h-[480px] overflow-hidden select-none">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.unsplash.com/photo-1508962914676-134849a727f0?auto=format&fit=crop&w=800&q=80"
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

        </div>
      </div>
    </main>
  );
}

function ApertureIcon() {
  return (
    <svg
      className="h-6 w-6 text-[#ff8d28]"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="14.31" y1="8" x2="20.05" y2="17.94" />
      <line x1="9.69" y1="8" x2="21.17" y2="8" />
      <line x1="7.38" y1="12" x2="13.12" y2="2.06" />
      <line x1="9.69" y1="16" x2="3.95" y2="6.06" />
      <line x1="14.31" y1="16" x2="2.83" y2="16" />
      <line x1="16.62" y1="12" x2="10.88" y2="21.94" />
    </svg>
  );
}

function EmailIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="14" height="12" rx="2" />
      <path d="m4 6 6 4 6-4" />
    </svg>
  );
}
