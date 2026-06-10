"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginUser } from "@/app/auth-store";
import { useAuth } from "@/app/auth-context";

const assets = {
  google: "https://www.figma.com/api/mcp/asset/7799c334-9a5d-4ef7-a51b-c5701a78b252",
  couple: "https://www.figma.com/api/mcp/asset/97d3fb14-57d8-472d-9e23-491baaa81cbb",
  coupleDetail: "https://www.figma.com/api/mcp/asset/8c7adf63-8b00-40ae-a559-a0b0872dd59c",
  wedding: "https://www.figma.com/api/mcp/asset/562009e6-7e75-4a98-a6fe-5d9cb1e9ea76",
};

export default function LoginPage() {
  const router = useRouter();
  const { refresh } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!email || !password) { setError("Vui lòng nhập đầy đủ thông tin."); return; }
    setLoading(true);
    const result = loginUser(email, password);
    setLoading(false);
    if (result.ok === false) { setError(result.error); return; }
    refresh();
    router.push("/");
  }

  function handleRegisterSwitch(e: React.MouseEvent<HTMLAnchorElement>) {
    e.preventDefault();
    if (isSwitching) return;
    setIsSwitching(true);
    window.setTimeout(() => router.push("/register"), 420);
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#fbf8ff] text-[#1a1b24]">
      <div
        className={`pointer-events-none absolute inset-0 z-50 bg-[#ff8d28] transition-transform duration-500 ease-[cubic-bezier(0.83,0,0.17,1)] ${
          isSwitching ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-hidden="true"
      />
      <section className="absolute left-1/2 top-1/2 flex min-h-[1080px] w-[1920px] origin-center -translate-x-1/2 -translate-y-1/2 scale-[0.375] flex-col items-center justify-center px-[410px] py-[126px] min-[640px]:scale-[0.333] min-[768px]:scale-[0.4] min-[1024px]:scale-[0.533] min-[1280px]:scale-[0.667] min-[1366px]:scale-[0.711] min-[1440px]:scale-[0.75] min-[1536px]:scale-[0.8] min-[1728px]:scale-[0.9] min-[1920px]:scale-100">
        <div className="grid h-[736px] w-[1100px] grid-cols-[625px_475px] overflow-hidden rounded-[24px] border border-[#c5c5d8]/20 bg-white shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)]">
          <div className="relative h-full overflow-hidden">
            <div className="flex h-full flex-col">
              <img src={assets.couple} alt="" className="h-1/3 w-full object-cover" />
              <img src={assets.coupleDetail} alt="" className="h-1/3 w-full object-cover" />
              <img src={assets.wedding} alt="" className="h-1/3 w-full object-cover" />
            </div>
            <div className="absolute bottom-12 left-12 right-12 rounded-[16px] border border-white/20 bg-black/25 px-8 py-7 text-white shadow-[0_18px_40px_rgba(0,0,0,0.12)] backdrop-blur-md">
              <h2 className="text-[30px] font-extrabold leading-[1.18] tracking-[-0.02em]">
                Nâng tầm câu chuyện<br />hình ảnh của bạn.
              </h2>
              <p className="mt-5 text-[17px] font-medium leading-[1.6] text-white/80">
                Tham gia cộng đồng hàng nghìn nhiếp ảnh gia và doanh nghiệp đang thay đổi cách họ làm việc với AI.
              </p>
            </div>
          </div>

          <div className="flex h-full w-full items-center justify-center bg-white px-[38px]">
            <div className="w-[400px]">
              <div className="mb-10">
                <h1 className="text-[40px] font-extrabold leading-[1.12] tracking-[-0.02em] text-[#1a1b24]">
                  Chào mừng trở lại
                </h1>
                <p className="mt-3 text-[18px] font-medium leading-[1.35] text-[#444655]">
                  Đăng nhập để tiếp tục khám phá sức mạnh AI.
                </p>
              </div>

              {error && (
                <div className="mb-5 rounded-[8px] bg-red-50 border border-red-100 px-4 py-3 text-[15px] text-red-600">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="grid gap-5">
                <label className="grid gap-2 text-[16px] font-bold leading-5 text-[#1a1b24]">
                  Email hoặc tên đăng nhập
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="!h-[55px] !min-h-0 w-full !rounded-[8px] !border !border-[#c5c5d8] !bg-[#f4f2ff] !px-4 text-[16px] font-medium !text-[#1a1b24] !shadow-none outline-none transition focus:!border-[#ff8d28] focus:!bg-white focus:!ring-4 focus:!ring-[#ff8d28]/15"
                  />
                </label>

                <label className="grid gap-2 text-[16px] font-bold leading-5 text-[#1a1b24]">
                  <span className="flex items-center justify-between gap-3">
                    Mật khẩu
                    <Link href="/forgot-password" className="text-[14px] font-semibold text-[#ff8d28]">
                      Quên mật khẩu?
                    </Link>
                  </span>
                  <span className="relative block">
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="!h-[55px] !min-h-0 w-full !rounded-[8px] !border !border-[#c5c5d8] !bg-[#f4f2ff] !px-4 !pr-12 text-[16px] font-medium tracking-[0.22em] !text-[#1a1b24] !shadow-none outline-none placeholder:tracking-[0.22em] focus:!border-[#ff8d28] focus:!bg-white focus:!ring-4 focus:!ring-[#ff8d28]/15"
                    />
                    <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#444655]">
                      <EyeIcon />
                    </span>
                  </span>
                </label>

                <label className="mt-1 flex w-fit cursor-pointer items-center gap-2 text-[16px] font-medium text-[#444655]">
                  <input type="checkbox" className="!h-4 !min-h-0 !w-4 rounded border-[#c5c5d8] bg-white !p-0" />
                  Ghi nhớ đăng nhập
                </label>

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-1 h-[52px] rounded-[8px] bg-[#ff8d28] px-5 text-[16px] font-bold text-white shadow-[0_10px_15px_-3px_rgba(29,60,221,0.10),0_4px_6px_-4px_rgba(29,60,221,0.10)] transition hover:-translate-y-0.5 hover:bg-[#e9791d] disabled:opacity-60"
                >
                  {loading ? "Đang đăng nhập..." : "Đăng nhập"}
                </button>
              </form>

              <p className="mt-8 text-center text-[16px] font-medium text-[#444655]">
                Chưa có tài khoản?{" "}
                <Link href="/register" onClick={handleRegisterSwitch} className="font-bold text-[#ff8d28] transition hover:text-[#e9791d]">
                  Đăng ký ngay
                </Link>
              </p>

              <div className="my-8 flex items-center gap-4">
                <span className="h-px flex-1 bg-[#c5c5d8]/50" />
                <span className="text-[14px] font-semibold text-[#444655]/60">HOẶC EMAIL</span>
                <span className="h-px flex-1 bg-[#c5c5d8]/50" />
              </div>

              <button type="button" className="flex h-[50px] w-full items-center justify-center gap-3 rounded-[12px] border border-[#c5c5d8] bg-[#fbf8ff] text-[16px] font-bold text-[#1a1b24] transition hover:border-[#ff8d28]">
                <img src={assets.google} alt="" className="h-5 w-5" />
                Tiếp tục với Google
              </button>
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

function EyeIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" aria-hidden="true">
      <path d="M2.75 10s2.4-4.25 7.25-4.25S17.25 10 17.25 10 14.85 14.25 10 14.25 2.75 10 2.75 10Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="10" cy="10" r="2.25" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}
