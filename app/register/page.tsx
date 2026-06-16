"use client";

import Link from "next/link";
import { useState, type FormEvent, type MouseEvent } from "react";
import { useRouter } from "next/navigation";
import {
  registerUser,
  setSession,
  type UserRole,
} from "@/app/auth-store";
import { useAuth } from "@/app/auth-context";

const assets = {
  dalat:
    "https://www.figma.com/api/mcp/asset/5b095a9c-ad55-48b1-81b3-784b326613ba",
  google:
    "https://www.figma.com/api/mcp/asset/7799c334-9a5d-4ef7-a51b-c5701a78b252",
};

export default function RegisterPage() {
  const router = useRouter();
  const { refresh } = useAuth();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [role, setRole] = useState<UserRole>("customer");
  const [photographerId, setPhotographerId] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
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

    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }

    if (role === "photographer" && !photographerId.trim()) {
      setError("Photographer cần nhập Photographer ID.");
      return;
    }

    setLoading(true);

    const result = registerUser({
      fullName,
      email,
      password,
      role,
      photographerId,
    });

    setLoading(false);

    if (result.ok === false) {
      setError(result.error);
      return;
    }

    setSession({
      userId: result.user.id,
      email: result.user.email,
      fullName: result.user.fullName,
      role: result.user.role,
      photographerId: result.user.photographerId,
    });

    refresh();

    if (result.user.role === "photographer") {
      router.push("/photographer-dashboard");
      return;
    }

    router.push("/");
  }

  function handleLoginSwitch(e: MouseEvent<HTMLAnchorElement>) {
    e.preventDefault();

    if (isSwitching) return;

    setIsSwitching(true);
    window.setTimeout(() => router.push("/login"), 420);
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#fbf8ff] text-[#1a1b24]">
      <div
        className={`pointer-events-none absolute inset-0 z-50 bg-[#ff8d28] transition-transform duration-500 ease-[cubic-bezier(0.83,0,0.17,1)] ${
          isSwitching ? "translate-x-0" : "translate-x-full"
        }`}
        aria-hidden="true"
      />

      <section className="absolute left-1/2 top-1/2 flex min-h-[1080px] w-[1920px] origin-center -translate-x-1/2 -translate-y-1/2 scale-[0.375] flex-col items-center justify-center px-[410px] py-[98px] min-[640px]:scale-[0.333] min-[768px]:scale-[0.4] min-[1024px]:scale-[0.533] min-[1280px]:scale-[0.667] min-[1366px]:scale-[0.711] min-[1440px]:scale-[0.75] min-[1536px]:scale-[0.8] min-[1728px]:scale-[0.9] min-[1920px]:scale-100">
        <div className="grid h-[775px] w-[1100px] grid-cols-[550px_550px] overflow-hidden rounded-[24px] border border-[#c5c5d8]/20 bg-white shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)]">
          <div className="flex h-full items-center bg-white px-[74px] py-8">
            <div className="w-full max-w-[400px]">
              <div className="mb-6">
                <h1 className="text-[32px] font-extrabold leading-[1.2] tracking-[-0.01em] text-[#1a1b24]">
                  Bắt đầu hành trình của bạn
                </h1>

                <p className="mt-2 text-[20px] font-normal leading-[1.2] text-[#444655]">
                  Tạo tài khoản để đặt lịch hoặc quản lý booking.
                </p>
              </div>

              {error ? (
                <div className="mb-4 rounded-[8px] border border-red-100 bg-red-50 px-4 py-3 text-[14px] font-semibold text-red-600">
                  {error}
                </div>
              ) : null}

              <form onSubmit={handleSubmit} className="grid gap-4">
                <label className="grid gap-2 text-[16px] font-bold leading-5 text-[#1a1b24]">
                  Họ và tên
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Nhập họ và tên"
                    className="!h-[55px] !min-h-0 w-full !rounded-[8px] !border !border-[#c5c5d8] !bg-[#f4f2ff] !px-4 text-[16px] font-medium !text-[#1a1b24] !shadow-none outline-none transition focus:!border-[#ff8d28] focus:!bg-white focus:!ring-4 focus:!ring-[#ff8d28]/15"
                  />
                </label>

                <label className="grid gap-2 text-[16px] font-bold leading-5 text-[#1a1b24]">
                  Email
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@sudion.vn"
                    className="!h-[55px] !min-h-0 w-full !rounded-[8px] !border !border-[#c5c5d8] !bg-[#f4f2ff] !px-4 text-[16px] font-medium !text-[#1a1b24] !shadow-none outline-none transition focus:!border-[#ff8d28] focus:!bg-white focus:!ring-4 focus:!ring-[#ff8d28]/15"
                  />
                </label>

                <div className="grid gap-2">
                  <p className="text-[16px] font-bold leading-5 text-[#1a1b24]">
                    Loại tài khoản
                  </p>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setRole("customer")}
                      className={`h-[48px] rounded-[8px] border text-[14px] font-bold transition ${
                        role === "customer"
                          ? "border-[#ff8d28] bg-[#fff4eb] text-[#ff8d28]"
                          : "border-[#c5c5d8] bg-[#f4f2ff] text-[#444655]"
                      }`}
                    >
                      Khách hàng
                    </button>

                    <button
                      type="button"
                      onClick={() => setRole("photographer")}
                      className={`h-[48px] rounded-[8px] border text-[14px] font-bold transition ${
                        role === "photographer"
                          ? "border-[#ff8d28] bg-[#fff4eb] text-[#ff8d28]"
                          : "border-[#c5c5d8] bg-[#f4f2ff] text-[#444655]"
                      }`}
                    >
                      Photographer
                    </button>
                  </div>
                </div>

                {role === "photographer" ? (
                  <label className="grid gap-2 text-[16px] font-bold leading-5 text-[#1a1b24]">
                    Photographer ID
                    <input
                      type="text"
                      value={photographerId}
                      onChange={(e) => setPhotographerId(e.target.value)}
                      placeholder="Ví dụ: 84"
                      className="!h-[55px] !min-h-0 w-full !rounded-[8px] !border !border-[#c5c5d8] !bg-[#f4f2ff] !px-4 text-[16px] font-medium !text-[#1a1b24] !shadow-none outline-none transition focus:!border-[#ff8d28] focus:!bg-white focus:!ring-4 focus:!ring-[#ff8d28]/15"
                    />

                    <span className="text-[12px] font-semibold leading-5 text-[#777a88]">
                      ID này lấy trong API{" "}
                      <span className="font-black text-[#ff8d28]">
                        /api/photographers?category=all
                      </span>
                    </span>
                  </label>
                ) : null}

                <div className="grid grid-cols-2 gap-4">
                  <label className="grid gap-2 text-[16px] font-bold leading-5 text-[#1a1b24]">
                    Mật khẩu
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="!h-[55px] !min-h-0 w-full !rounded-[8px] !border !border-[#c5c5d8] !bg-[#f4f2ff] !px-4 text-[16px] font-medium tracking-[0.22em] !text-[#1a1b24] !shadow-none outline-none placeholder:tracking-[0.22em] focus:!border-[#ff8d28] focus:!bg-white focus:!ring-4 focus:!ring-[#ff8d28]/15"
                    />
                  </label>

                  <label className="grid gap-2 text-[16px] font-bold leading-5 text-[#1a1b24]">
                    Xác nhận mật khẩu
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="!h-[55px] !min-h-0 w-full !rounded-[8px] !border !border-[#c5c5d8] !bg-[#f4f2ff] !px-4 text-[16px] font-medium tracking-[0.22em] !text-[#1a1b24] !shadow-none outline-none placeholder:tracking-[0.22em] focus:!border-[#ff8d28] focus:!bg-white focus:!ring-4 focus:!ring-[#ff8d28]/15"
                    />
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="h-[52px] rounded-[8px] bg-[#ff8d28] px-5 text-[16px] font-bold text-white shadow-[0_10px_15px_-3px_rgba(29,60,221,0.10),0_4px_6px_-4px_rgba(29,60,221,0.10)] transition hover:-translate-y-0.5 hover:bg-[#e9791d] disabled:opacity-60"
                >
                  {loading ? "Đang tạo tài khoản..." : "Tạo tài khoản ngay"}
                </button>
              </form>

              <p className="mt-6 text-center text-[16px] font-medium text-[#444655]">
                Đã có tài khoản?{" "}
                <Link
                  href="/login"
                  onClick={handleLoginSwitch}
                  className="font-bold text-[#ff8d28] transition hover:text-[#e9791d]"
                >
                  Đăng nhập
                </Link>
              </p>

              <div className="my-6 flex items-center gap-4">
                <span className="h-px flex-1 bg-[#c5c5d8]/50" />
                <span className="text-[14px] font-semibold text-[#444655]/60">
                  HOẶC
                </span>
                <span className="h-px flex-1 bg-[#c5c5d8]/50" />
              </div>

              <button
                type="button"
                className="flex h-[50px] w-full items-center justify-center gap-3 rounded-[12px] border border-[#c5c5d8] bg-[#fbf8ff] text-[16px] font-bold text-[#1a1b24] transition hover:border-[#ff8d28]"
              >
                <img src={assets.google} alt="" className="h-5 w-5" />
                Tiếp tục với Google
              </button>
            </div>
          </div>

          <div className="relative h-full overflow-hidden">
            <img src={assets.dalat} alt="" className="h-full w-full object-cover" />

            <div className="absolute bottom-12 left-12 right-12 rounded-[16px] border border-white/20 bg-black/20 px-8 py-7 text-white shadow-[0_18px_40px_rgba(0,0,0,0.12)] backdrop-blur-md">
              <h2 className="text-[30px] font-extrabold leading-[1.18] tracking-[-0.02em]">
                Nâng tầm câu chuyện
                <br />
                hình ảnh của bạn.
              </h2>

              <p className="mt-5 text-[17px] font-medium leading-[1.6] text-white/80">
                Khách hàng đặt lịch nhanh hơn, photographer quản lý đơn chuyên
                nghiệp hơn.
              </p>
            </div>
          </div>
        </div>

        <p className="border-t border-[#c5c5d8]/10 px-6 py-8 text-center text-[12px] font-medium text-[#444655]/60">
          © 2026 Sudion. Elevating visual storytelling through intelligence.
        </p>
      </section>
    </main>
  );
}