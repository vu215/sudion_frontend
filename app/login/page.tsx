"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useAuth } from "@/app/auth-context";

const assets = {
  coupleBot: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=500&q=80",
};

export default function LoginPage() {
  const { login, transitionTo } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Vui lòng nhập đầy đủ thông tin.");
      return;
    }

    setLoading(true);

    const result = login(email, password);

    setLoading(false);

    if (result.ok === false) {
      setError(result.error);
      return;
    }

    if (result.user && result.user.role === "photographer") {
      transitionTo("/photographer-dashboard");
      return;
    }

    transitionTo("/");
  }

  return (
    <main className="min-h-[calc(100vh-280px)] bg-[#fbf8ff] text-[#1a1b24] py-10 flex items-center justify-center px-4 animate-fade-in">
      <div className="w-full max-w-[800px] bg-white border border-[#e8eaf1]/80 rounded-[20px] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.06)] overflow-hidden">
        <div className="grid md:grid-cols-[1fr_1.1fr] items-stretch">

          {/* Banner Column */}
          <div className="relative hidden md:block min-h-[480px] overflow-hidden select-none">
            <div className="flex h-full flex-col">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={assets.coupleBot} alt="" className="h-full w-full object-cover" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent pointer-events-none" />

            {/* Glassmorphism description box */}
            <div className="absolute bottom-6 left-6 right-6 rounded-[12px] border border-white/10 bg-black/30 p-4.5 text-white shadow-[0_12px_30px_rgba(0,0,0,0.15)] backdrop-blur-md">
              <h2 className="text-[14px] font-bold leading-snug">
                Nâng tầm câu chuyện hình ảnh của bạn.
              </h2>
              <p className="mt-1 text-[10px] font-medium leading-relaxed text-white/70">
                Tham gia cộng đồng hàng nghìn nhiếp ảnh gia và doanh nghiệp đang thay đổi cách họ làm việc với AI.
              </p>
            </div>
          </div>

          {/* Form Column */}
          <div className="flex flex-col justify-center px-6 py-10 sm:px-12">
            <div className="w-full max-w-[360px] mx-auto">
              <div className="mb-6">
                <h1 className="text-3xl font-extrabold leading-tight text-[#1a1b24] tracking-tight">
                  Chào mừng trở lại
                </h1>
                <p className="mt-2 text-sm font-medium text-[#5f6368]">
                  Đăng nhập để tiếp tục khám phá sức mạnh AI.
                </p>
              </div>

              {error ? (
                <div className="mb-4 rounded-xl border border-red-100 bg-red-50 px-3.5 py-2.5 text-xs font-semibold text-red-600">
                  {error}
                </div>
              ) : null}

              <form onSubmit={handleSubmit} className="grid gap-3">
                <div className="grid gap-1">
                  <span className="text-[13px] font-bold text-[#1a1b24]">
                    Email hoặc tên đăng nhập
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="!h-11 !min-h-0 w-full rounded-xl !border !border-[#e2e8f0] bg-white px-4 !text-sm font-medium text-[#1a1b24] outline-none transition focus:border-[#ff8d28] focus:bg-white focus:ring-2 focus:ring-[#ff8d28]/10"
                  />
                </div>

                <div className="grid gap-1.5">
                  <span className="flex items-center justify-between">
                    <span className="text-[13px] font-bold text-[#1a1b24]">Mật khẩu</span>
                    <Link
                      href="/forgot-password"
                      onClick={(e) => {
                        e.preventDefault();
                        transitionTo("/forgot-password");
                      }}
                      className="text-[12px] font-bold text-[#ff8d28] hover:underline"
                    >
                      Quên mật khẩu?
                    </Link>
                  </span>
                  <span className="relative block">
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="!h-11 !min-h-0 w-full rounded-xl !border !border-[#e2e8f0] bg-white px-4 pr-11 !text-sm font-medium tracking-[0.22em] text-[#1a1b24] outline-none placeholder:tracking-[0.22em] focus:border-[#ff8d28] focus:bg-white focus:ring-2 focus:ring-[#ff8d28]/10"
                    />
                    <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[#5f6368]">
                      <EyeIcon />
                    </span>
                  </span>
                </div>

                <div className="flex flex-row items-center justify-left gap-2 py-1">
                  <input
                    type="checkbox"
                    id="remember-me"
                    className="!h-4 !w-4 !min-h-0 !w-auto rounded !border !border-gray-300 accent-[#ff8d28] cursor-pointer"
                  />
                  <label htmlFor="remember-me" className="!block !text-center !text-[13px] !font-bold !text-[#1a1b24] cursor-pointer select-none">
                    Ghi nhớ đăng nhập
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center justify-center !h-11 w-full rounded-xl bg-[#ff8d28] hover:bg-[#e9791d] text-sm font-bold text-white shadow-sm transition duration-200"
                >
                  {loading ? "Đang đăng nhập..." : "Đăng nhập"}
                </button>
              </form>

              <p className="mt-5 text-center text-xs font-semibold text-[#444655]">
                Chưa có tài khoản?{" "}
                <Link
                  href="/register"
                  onClick={(e) => {
                    e.preventDefault();
                    transitionTo("/register");
                  }}
                  className="font-bold text-[#ff8d28] transition hover:text-[#e9791d] hover:underline"
                >
                  Đăng ký ngay
                </Link>
              </p>

              <div className="my-5 flex items-center gap-3">
                <span className="h-px flex-1 bg-gray-200/60" />
                <span className="text-[10px] font-bold text-gray-400 tracking-wider">
                  HOẶC EMAIL
                </span>
                <span className="h-px flex-1 bg-gray-200/60" />
              </div>

              <button
                type="button"
                className="flex !h-11 w-full items-center justify-center gap-2.5 rounded-xl border border-gray-200 bg-white text-sm font-bold text-[#1a1b24] transition hover:bg-gray-50"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
                </svg>
                Tiếp tục với Google
              </button>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}

function EyeIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" aria-hidden="true">
      <path
        d="M2.75 10s2.4-4.25 7.25-4.25S17.25 10 17.25 10 14.85 14.25 10 14.25 2.75 10 2.75 10Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="10" cy="10" r="2.25" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}