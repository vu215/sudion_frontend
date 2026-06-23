"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useAuth } from "@/app/auth-context";

const assets = {
  coupleBot:
    "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=500&q=80",
};

export default function LoginPage() {
  const { login, transitionTo } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Vui lòng nhập đầy đủ thông tin.");
      return;
    }

    setLoading(true);

    const result = await login(email, password);

    setLoading(false);

    if (result.ok === false) {
      setError(result.error || "Đăng nhập thất bại.");
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
          <div className="relative hidden md:block min-h-[480px] overflow-hidden select-none">
            <div className="flex h-full flex-col">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={assets.coupleBot}
                alt=""
                className="h-full w-full object-cover"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent pointer-events-none" />

            <div className="absolute bottom-6 left-6 right-6 rounded-[12px] border border-white/10 bg-black/30 p-4.5 text-white shadow-[0_12px_30px_rgba(0,0,0,0.15)] backdrop-blur-md">
              <h2 className="text-[14px] font-bold leading-snug">
                Nâng tầm câu chuyện hình ảnh của bạn.
              </h2>
              <p className="mt-1 text-[10px] font-medium leading-relaxed text-white/70">
                Đăng nhập bằng tài khoản đã lưu trong database.
              </p>
            </div>
          </div>

          <div className="flex flex-col justify-center px-6 py-10 sm:px-12">
            <div className="w-full max-w-[360px] mx-auto">
              <div className="mb-6">
                <h1 className="text-3xl font-extrabold leading-tight text-[#1a1b24] tracking-tight">
                  Chào mừng trở lại
                </h1>
                <p className="mt-2 text-sm font-medium text-[#5f6368]">
                  Đăng nhập để tiếp tục sử dụng Sudion.
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
                    Email
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@gmail.com"
                    className="!h-11 !min-h-0 w-full rounded-xl !border !border-[#e2e8f0] bg-white px-4 !text-sm font-medium text-[#1a1b24] outline-none transition focus:border-[#ff8d28] focus:bg-white focus:ring-2 focus:ring-[#ff8d28]/10"
                  />
                </div>

                <div className="grid gap-1.5">
                  <span className="flex items-center justify-between">
                    <span className="text-[13px] font-bold text-[#1a1b24]">
                      Mật khẩu
                    </span>
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

                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="!h-11 !min-h-0 w-full rounded-xl !border !border-[#e2e8f0] bg-white px-4 !text-sm font-medium text-[#1a1b24] outline-none transition focus:border-[#ff8d28] focus:bg-white focus:ring-2 focus:ring-[#ff8d28]/10"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center justify-center !h-11 w-full rounded-xl bg-[#ff8d28] hover:bg-[#e9791d] text-sm font-bold text-white shadow-sm transition duration-200 disabled:opacity-60"
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
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}