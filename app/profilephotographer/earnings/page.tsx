const summary = [
  { label: "Doanh thu tháng", value: "0đ" },
  { label: "Thu nhập tuần", value: "0đ" },
  { label: "Tổng thanh toán", value: "0đ" },
  { label: "Số payout", value: "0" },
];

export default function PhotographerEarningsPage() {
  return (
    <main className="px-6 py-7 lg:px-8 xl:px-10">
      <div className="mx-auto max-w-[1080px] space-y-6 pb-10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#1a1a2e]">Thu nhập</h1>
            <p className="mt-1 text-sm text-slate-500">Theo dõi doanh thu và lịch sử thanh toán.</p>
          </div>
        </div>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {summary.map((item) => (
            <article key={item.label} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">{item.label}</p>
              <p className="mt-3 text-3xl font-semibold text-[#1a1a2e]">{item.value}</p>
            </article>
          ))}
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[#1a1a2e]">Lịch sử thanh toán</h2>
          </div>
          <div className="mt-5 rounded-3xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">
            Chưa có thanh toán nào. Dữ liệu thu nhập sẽ xuất hiện khi có chuyển khoản hoặc thanh toán hoàn tất.
          </div>
        </section>
      </div>
    </main>
  );
}
