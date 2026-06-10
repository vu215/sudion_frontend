export default function PhotographerMessagesPage() {
  return (
    <main className="px-6 py-7 lg:px-8 xl:px-10">
      <div className="mx-auto max-w-[1080px] space-y-6 pb-10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#1a1a2e]">Tin nhắn</h1>
            <p className="mt-1 text-sm text-slate-500">Danh sách liên hệ và tin nhắn từ khách hàng.</p>
          </div>
        </div>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-600">
            Chưa có tin nhắn mới. Tất cả hội thoại sẽ hiển thị ở đây.
          </div>
        </section>
      </div>
    </main>
  );
}
