"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useAuth } from "@/app/auth-context";

const assets = {
  dalat:
    "https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&w=800&q=80",
};

export default function RegisterPage() {
  const { register, transitionTo } = useAuth();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (!fullName || !email || !password || !confirmPassword) {
      setError("Vui lòng nhập đầy đủ thông tin.");
      return;
    }

    if (password.length < 8) {
      setError("Mật khẩu phải có ít nhất 8 ký tự.");
      return;
    }

    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[^A-Za-z0-9]/.test(password);

    if (!hasUppercase || !hasLowercase || !hasNumber || !hasSpecialChar) {
      setError(
        "Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt."
      );
      return;
    }

    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }

    setLoading(true);

    const result = await register({
      fullName,
      email,
      phone,
      password,
    });

    setLoading(false);

    if (result.ok === false) {
      setError(result.error || "Đã xảy ra lỗi đăng ký.");
      return;
    }

    transitionTo("/");
  }

  return (
    <main className="min-h-[calc(100vh-280px)] bg-[#fbf8ff] text-[#1a1b24] py-10 flex items-center justify-center px-4 animate-fade-in">
      <div className="w-full max-w-[800px] bg-white border border-[#e8eaf1]/80 rounded-[20px] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.06)] overflow-hidden">
        <div className="grid md:grid-cols-[1.1fr_1fr] items-stretch">
          <div className="flex flex-col justify-center px-6 py-8 sm:px-10 order-2 md:order-1">
            <div className="w-full max-w-[360px] mx-auto">
              <div className="mb-4">
                <h1 className="text-2xl sm:text-3xl font-extrabold leading-tight text-[#1a1b24] tracking-tight">
                  Bắt đầu hành trình
                </h1>
                <p className="mt-1 text-xs font-medium text-[#5f6368]">
                  Đăng ký tài khoản và lưu trực tiếp vào database.
                </p>
              </div>

              {error ? (
                <div className="mb-3.5 rounded-xl border border-red-100 bg-red-50 px-3.5 py-2 text-xs font-semibold text-red-600">
                  {error}
                </div>
              ) : null}

              <form onSubmit={handleSubmit} className="grid gap-3">
                <div className="grid gap-1">
                  <span className="text-[13px] font-bold text-[#1a1b24]">
                    Họ và tên
                  </span>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Nhập họ và tên"
                    className="!h-11 !min-h-0 w-full rounded-xl !border !border-[#e2e8f0] bg-white px-4 !text-sm font-medium text-[#1a1b24] outline-none transition focus:border-[#ff8d28] focus:bg-white focus:ring-2 focus:ring-[#ff8d28]/10"
                  />
                </div>

                <div className="grid gap-1">
                  <span className="text-[13px] font-bold text-[#1a1b24]">
                    Số điện thoại
                  </span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Có thể bỏ trống"
                    className="!h-11 !min-h-0 w-full rounded-xl !border !border-[#e2e8f0] bg-white px-4 !text-sm font-medium text-[#1a1b24] outline-none transition focus:border-[#ff8d28] focus:bg-white focus:ring-2 focus:ring-[#ff8d28]/10"
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
                    className="!h-11 !min-h-0 w-full rounded-xl !border !border-[#e2e8f0] bg-white px-4 !text-sm font-medium text-[#1a1b24] outline-none transition focus:border-[#ff8d28] focus:bg-white focus:ring-2 focus:ring-[#ff8d28]/10"
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
                      className="!h-11 !min-h-0 w-full rounded-xl !border !border-[#e2e8f0] bg-white px-4 !text-sm font-medium text-[#1a1b24] outline-none focus:border-[#ff8d28] focus:bg-white focus:ring-2 focus:ring-[#ff8d28]/10"
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
                      className="!h-11 !min-h-0 w-full rounded-xl !border !border-[#e2e8f0] bg-white px-4 !text-sm font-medium text-[#1a1b24] outline-none focus:border-[#ff8d28] focus:bg-white focus:ring-2 focus:ring-[#ff8d28]/10"
                    />
                  </div>
                </div>

                <p className="text-[11px] font-semibold text-[#5f6368]">
                  Mật khẩu cần ít nhất 8 ký tự, 1 chữ hoa, 1 chữ thường, 1 số và
                  1 ký tự đặc biệt.
                </p>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center justify-center !h-11 mt-1 rounded-xl bg-[#ff8d28] hover:bg-[#e9791d] text-sm font-bold text-white shadow-sm transition duration-200 disabled:opacity-60"
                >
                  {loading ? "Đang lưu vào database..." : "Tạo tài khoản ngay"}
                </button>
              </form>

              <p className="mt-4 text-center text-xs font-semibold text-[#444655]">
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
                Tài khoản sẽ được lưu vào MySQL để dùng đăng nhập và quên mật khẩu.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}