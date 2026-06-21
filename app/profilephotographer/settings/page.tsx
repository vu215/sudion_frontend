export default function PhotographerSettingsPage() {
  return (
    <main className="px-6 py-7 lg:px-8 xl:px-10">
      <div className="mx-auto max-w-[1080px] space-y-6 pb-10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#1a1a2e]">Cài đặt hồ sơ</h1>
            <p className="mt-1 text-sm text-slate-500">Cập nhật thông tin hồ sơ và tùy chọn hiển thị cho nhiếp ảnh gia.</p>
          </div>
        </div>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="grid gap-6 lg:grid-cols-[1.5fr_0.9fr]">
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-semibold text-[#1a1a2e]">Thông tin cá nhân</h2>
                <p className="mt-1 text-sm text-slate-500">Tên, mô tả và liên hệ hiển thị trên hồ sơ của bạn.</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2 text-sm text-slate-700">
                  <span className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Tên hiển thị</span>
                  <input className="w-full rounded-2xl border border-slate-200 bg-[#f8f8fb] px-4 py-3 text-sm text-slate-900 outline-none focus:border-orange-300 focus:ring-1 focus:ring-orange-100" placeholder="Nguyễn Văn A" />
                </label>
                <label className="space-y-2 text-sm text-slate-700">
                  <span className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Chức danh</span>
                  <input className="w-full rounded-2xl border border-slate-200 bg-[#f8f8fb] px-4 py-3 text-sm text-slate-900 outline-none focus:border-orange-300 focus:ring-1 focus:ring-orange-100" placeholder="Nhiếp ảnh gia sự kiện" />
                </label>
              </div>

              <label className="space-y-2 text-sm text-slate-700">
                <span className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Tiểu sử</span>
                <textarea className="w-full min-h-[120px] resize-none rounded-2xl border border-slate-200 bg-[#f8f8fb] px-4 py-3 text-sm text-slate-900 outline-none focus:border-orange-300 focus:ring-1 focus:ring-orange-100" placeholder="Viết vài dòng mô tả về phong cách và dịch vụ nhiếp ảnh của bạn..."></textarea>
              </label>
            </div>

            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-semibold text-[#1a1a2e]">Quản lý hiển thị</h2>
                <p className="mt-1 text-sm text-slate-500">Chọn trạng thái hồ sơ và các tùy chọn hiển thị dành cho khách.</p>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-[#1a1a2e]">Trạng thái hồ sơ</p>
                    <p className="mt-1 text-sm text-slate-500">Cho phép khách hàng đặt lịch hay tạm ẩn.</p>
                  </div>
                  <button className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition">Hoạt động</button>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-[#1a1a2e]">Nhận thông báo</p>
                    <p className="mt-1 text-sm text-slate-500">Quản lý thông báo đặt lịch và tin nhắn mới.</p>
                  </div>
                  <button className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition">Bật</button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-[#1a1a2e]">Bảo mật tài khoản</h2>
              <p className="mt-1 text-sm text-slate-500">Đổi mật khẩu, email và thông tin liên hệ.</p>
            </div>
            <button className="rounded-2xl bg-[#ff8d28] px-5 py-3 text-sm font-semibold text-white hover:bg-[#ff7a09] transition">Cập nhật bảo mật</button>
          </div>
        </section>
      </div>
    </main>
  );
}
