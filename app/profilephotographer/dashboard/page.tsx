export default function PhotographerDashboardPage() {
  const stats = [
    { label: "Đặt lịch hôm nay", value: "0" },
    { label: "Thu nhập tháng", value: "0đ" },
    { label: "Dịch vụ đang chạy", value: "0" },
    { label: "Tin nhắn mới", value: "0" },
  ];

  return (
    <main className="px-6 py-7 lg:px-8 xl:px-10">
      <div className="mx-auto max-w-[1080px] space-y-6 pb-10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#1a1a2e]">Bảng điều khiển</h1>
            <p className="mt-1 text-sm text-slate-500">Tổng quan đơn giản về hoạt động của nhiếp ảnh gia.</p>
          </div>
        </div>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((item) => (
            <article key={item.label} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">{item.label}</p>
              <p className="mt-3 text-3xl font-semibold text-[#1a1a2e]">{item.value}</p>
            </article>
          ))}
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[#1a1a2e]">Hoạt động gần đây</h2>
          </div>
          <div className="mt-5 rounded-3xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">
            Chưa có hoạt động mới. Các cập nhật sẽ hiển thị tại đây khi có dữ liệu.
          </div>
        </section>
      </div>
    </main>
  );
}
