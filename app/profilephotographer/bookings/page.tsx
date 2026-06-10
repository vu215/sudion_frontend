export default function PhotographerBookingsPage() {
  return (
    <main className="px-6 py-7 lg:px-8 xl:px-10">
      <div className="mx-auto max-w-[1080px] space-y-6 pb-10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#1a1a2e]">Đặt lịch</h1>
            <p className="mt-1 text-sm text-slate-500">Quản lý các lịch chụp khách hàng đặt.</p>
          </div>
          <button className="rounded-xl bg-[#ff8d28] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#e07820] transition">
            Tạo đặt lịch mới
          </button>
        </div>

        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="grid gap-0 text-left text-xs uppercase tracking-[0.24em] text-slate-400 bg-slate-50 px-6 py-4 sm:grid-cols-[2fr_1fr_1fr_2fr_1fr]">
            <span>Khách hàng</span>
            <span>Ngày</span>
            <span>Giờ</span>
            <span>Dịch vụ</span>
            <span>Trạng thái</span>
          </div>
          <div className="px-6 py-12 text-center text-sm text-slate-500">
            Chưa có đặt lịch nào. Hãy tạo đặt lịch mới để bắt đầu.
          </div>
        </section>
      </div>
    </main>
  );
}
