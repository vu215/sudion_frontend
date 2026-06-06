import Link from "next/link";

const cityImage = "https://www.figma.com/api/mcp/asset/bcd9a754-1bf3-47a9-bde6-2270fed16d80";

export default function ForgotPasswordPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#fbf8ff] text-[#1a1b24]">
      <section className="absolute left-1/2 top-1/2 grid min-h-[1080px] w-[1920px] origin-center -translate-x-1/2 -translate-y-1/2 scale-[0.375] grid-cols-[480px_514px] items-center justify-center gap-[94px] px-[410px] py-[122px] min-[640px]:scale-[0.333] min-[768px]:scale-[0.4] min-[1024px]:scale-[0.533] min-[1280px]:scale-[0.667] min-[1366px]:scale-[0.711] min-[1440px]:scale-[0.75] min-[1536px]:scale-[0.8] min-[1728px]:scale-[0.9] min-[1920px]:scale-100">
        <div className="w-[480px]">
          <Link href="/" className="mb-12 inline-flex items-center gap-2 text-[30px] font-extrabold text-[#ff8d28]">
            <span className="grid h-6 w-6 place-items-center rounded-full bg-[#ff8d28] text-white">
              <SparkIcon />
            </span>
            Sudion
          </Link>

          <div className="mb-10">
            <h1 className="text-[40px] font-extrabold leading-[1.12] tracking-[-0.02em] text-[#1a1b24]">
              Quên mật khẩu?
            </h1>
            <p className="mt-3 text-[20px] font-medium leading-[1.2] text-[#444655]">
              Đừng lo lắng, hãy nhập email của bạn và chúng tôi sẽ gửi hướng dẫn đặt lại mật khẩu.
            </p>
          </div>

          <form className="grid gap-5">
            <label className="grid gap-2 text-[16px] font-bold leading-5 text-[#1a1b24]">
              Email
              <span className="relative block">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#6b7280]">
                  <EmailIcon />
                </span>
                <input
                  type="email"
                  placeholder="name@example.com"
                  className="!h-[60px] !min-h-0 w-full !rounded-[8px] !border !border-[#c5c5d8] !bg-[#f4f2ff] !px-4 !pl-12 text-[16px] font-medium !text-[#1a1b24] !shadow-none outline-none transition focus:!border-[#ff8d28] focus:!bg-white focus:!ring-4 focus:!ring-[#ff8d28]/15"
                />
              </span>
            </label>

            <button
              type="submit"
              className="h-[50px] rounded-[8px] bg-[#ff8d28] px-5 text-[16px] font-bold text-white shadow-[0_10px_15px_-3px_rgba(29,60,221,0.10),0_4px_6px_-4px_rgba(29,60,221,0.10)] transition hover:-translate-y-0.5 hover:bg-[#e9791d]"
            >
              Gửi hướng dẫn →
            </button>
          </form>

          <div className="mt-8 text-center">
            <Link href="/login" className="inline-flex items-center gap-2 text-[16px] font-bold text-[#ff8d28]">
              ← Quay lại đăng nhập
            </Link>
          </div>
        </div>

        <div className="relative h-[634px] w-[514px] overflow-hidden rounded-[24px] shadow-[0_18px_40px_rgba(20,24,36,0.08)]">
          <img src={cityImage} alt="" className="h-full w-full object-cover" />
          <div className="absolute bottom-12 left-12 right-12 rounded-[16px] border border-white/20 bg-black/20 px-8 py-7 text-white shadow-[0_18px_40px_rgba(0,0,0,0.12)] backdrop-blur-md">
            <h2 className="text-[30px] font-extrabold leading-[1.18] tracking-[-0.02em]">
              Nâng tầm câu chuyện
              <br />
              hình ảnh của bạn.
            </h2>
          </div>
        </div>
      </section>
    </main>
  );
}

function EmailIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" aria-hidden="true">
      <path d="M3.25 5.75h13.5v8.5H3.25v-8.5Z" stroke="currentColor" strokeWidth="1.8" />
      <path d="m4 6.5 6 4.25 6-4.25" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SparkIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" aria-hidden="true">
      <path d="M10 2.5 12 8l5.5 2-5.5 2-2 5.5L8 12l-5.5-2L8 8l2-5.5Z" fill="currentColor" />
    </svg>
  );
}
