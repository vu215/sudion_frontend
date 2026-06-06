import Link from "next/link";

const cityImage = "https://www.figma.com/api/mcp/asset/bcd9a754-1bf3-47a9-bde6-2270fed16d80";

export default function ResetPasswordPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#fbf8ff] text-[#1a1b24]">
      <section className="absolute left-1/2 top-1/2 grid min-h-[1080px] w-[1920px] origin-center -translate-x-1/2 -translate-y-1/2 scale-[0.375] grid-cols-[514px_414px] items-center justify-center gap-[108px] px-[498px] py-[214px] min-[640px]:scale-[0.333] min-[768px]:scale-[0.4] min-[1024px]:scale-[0.533] min-[1280px]:scale-[0.667] min-[1366px]:scale-[0.711] min-[1440px]:scale-[0.75] min-[1536px]:scale-[0.8] min-[1728px]:scale-[0.9] min-[1920px]:scale-100">
        <div className="relative h-[648px] w-[514px] overflow-hidden rounded-[24px] shadow-[0_18px_40px_rgba(20,24,36,0.08)]">
          <img src={cityImage} alt="" className="h-full w-full object-cover" />
          <div className="absolute bottom-12 left-12 right-12 rounded-[16px] border border-white/20 bg-black/20 px-8 py-7 text-white shadow-[0_18px_40px_rgba(0,0,0,0.12)] backdrop-blur-md">
            <h2 className="text-[30px] font-extrabold leading-[1.18] tracking-[-0.02em]">
              Nâng tầm câu chuyện
              <br />
              hình ảnh của bạn
            </h2>
          </div>
        </div>

        <div className="w-[414px]">
          <Link href="/login" className="mb-8 inline-flex items-center gap-2 text-[15px] font-bold text-[#ff8d28]">
            ← Quay lại đăng nhập
          </Link>

          <div className="mb-10">
            <h1 className="text-[34px] font-extrabold leading-[1.12] tracking-[-0.02em] text-[#1a1b24]">
              Thiết lập mật khẩu mới
            </h1>
            <p className="mt-3 text-[16px] font-medium leading-[1.5] text-[#444655]">
              Vui lòng nhập mật khẩu mới của bạn bên dưới.
            </p>
          </div>

          <form className="grid gap-6">
            <label className="grid gap-2 text-[14px] font-bold leading-5 text-[#1a1b24]">
              Mật khẩu mới
              <span className="relative block">
                <input
                  type="password"
                  placeholder="••••••••"
                  className="!h-[55px] !min-h-0 w-full !rounded-[8px] !border !border-[#c5c5d8] !bg-[#f4f2ff] !px-4 !pr-12 text-[16px] font-medium tracking-[0.22em] !text-[#1a1b24] !shadow-none outline-none placeholder:tracking-[0.22em] focus:!border-[#ff8d28] focus:!bg-white focus:!ring-4 focus:!ring-[#ff8d28]/15"
                />
                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#444655]">
                  <EyeIcon />
                </span>
              </span>
            </label>

            <label className="grid gap-2 text-[14px] font-bold leading-5 text-[#1a1b24]">
              Xác nhận mật khẩu mới
              <input
                type="password"
                placeholder="••••••••"
                className="!h-[55px] !min-h-0 w-full !rounded-[8px] !border !border-[#c5c5d8] !bg-[#f4f2ff] !px-4 text-[16px] font-medium tracking-[0.22em] !text-[#1a1b24] !shadow-none outline-none placeholder:tracking-[0.22em] focus:!border-[#ff8d28] focus:!bg-white focus:!ring-4 focus:!ring-[#ff8d28]/15"
              />
            </label>

            <div className="rounded-[8px] bg-[#e7e4f1] px-4 py-4 text-[14px] font-medium leading-6 text-[#444655]">
              <div className="flex items-center gap-2">
                <CheckIcon />
                <span>Ít nhất 8 ký tự</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckIcon />
                <span>Bao gồm chữ hoa và chữ thường</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckIcon />
                <span>Bao gồm ít nhất một số</span>
              </div>
            </div>

            <button
              type="submit"
              className="h-[48px] rounded-[8px] bg-[#ff8d28] px-5 text-[16px] font-bold text-white shadow-[0_10px_15px_-3px_rgba(29,60,221,0.10),0_4px_6px_-4px_rgba(29,60,221,0.10)] transition hover:-translate-y-0.5 hover:bg-[#e9791d]"
            >
              Cập nhật mật khẩu
            </button>
          </form>
        </div>
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

function CheckIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4 shrink-0" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="6" stroke="currentColor" strokeWidth="1.5" />
      <path d="m7.25 10.2 1.8 1.8 3.8-4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
