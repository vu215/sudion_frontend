export default function PhotographerServicesPage() {
  return (
    <main className="px-6 py-7 lg:px-8 xl:px-10">
      <div className="mx-auto max-w-[1080px] space-y-6 pb-10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#1a1a2e]">Dịch vụ</h1>
            <p className="mt-1 text-sm text-slate-500">Danh sách dịch vụ cho khách hàng đặt lịch.</p>
          </div>
          <button className="rounded-xl bg-[#ff8d28] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#e07820] transition">
            Tạo dịch vụ mới
          </button>
        </div>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="grid gap-4">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 text-slate-600">
              Chưa có dịch vụ nào. Nhấn "Tạo dịch vụ mới" để bắt đầu thêm gói chụp của bạn.
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
