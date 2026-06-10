export default function PhotographerPortfolioPage() {
  return (
    <main className="px-6 py-7 lg:px-8 xl:px-10">
      <div className="mx-auto max-w-[1080px] space-y-6 pb-10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#1a1a2e]">Portfolio</h1>
            <p className="mt-1 text-sm text-slate-500">Quản lý ảnh mẫu để khách hàng tham khảo.</p>
          </div>
          <button className="inline-flex items-center justify-center rounded-xl bg-[#ff8d28] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#e07820] transition">
            Thêm ảnh mới
          </button>
        </div>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="flex min-h-[220px] items-center justify-center rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
                Thêm ảnh mẫu vào portfolio
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
