"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

const faqs = [
  { category: "Đặt lịch", question: "Làm sao để đặt lịch chụp ảnh?", answer: "Chọn dịch vụ hoặc photographer bạn yêu thích, chọn ngày giờ phù hợp, điền thông tin buổi chụp và xác nhận khoản đặt cọc." },
  { category: "Thanh toán", question: "Tôi có thể thanh toán bằng hình thức nào?", answer: "Sudion hỗ trợ thanh toán trực tuyến theo các phương thức được hiển thị tại bước checkout. Vui lòng giữ lại mã giao dịch sau khi thanh toán." },
  { category: "Đặt lịch", question: "Tôi có thể hủy hoặc đổi lịch không?", answer: "Bạn có thể gửi yêu cầu hủy hoặc đổi lịch từ mục Bookings. Điều kiện hoàn tiền được áp dụng theo Chính sách & Quy định hoạt động." },
  { category: "Tài khoản", question: "Tôi quên mật khẩu thì phải làm gì?", answer: "Chọn Quên mật khẩu tại trang đăng nhập, nhập email đã đăng ký và làm theo hướng dẫn trong email khôi phục." },
  { category: "Photographer", question: "Làm sao để đăng ký làm photographer?", answer: "Đăng nhập tài khoản, mở trang hồ sơ và chọn đăng ký trở thành photographer. Sau đó hoàn thiện thông tin và hồ sơ xác minh." },
  { category: "Sản phẩm", question: "Tôi theo dõi đơn mua máy ảnh ở đâu?", answer: "Mở mục Đơn hàng Máy ảnh trong tài khoản để xem trạng thái xử lý, giao hàng và thông tin thanh toán." },
  { category: "Thanh toán", question: "Bao lâu tôi nhận được tiền hoàn?", answer: "Sau khi yêu cầu được duyệt, thời gian hoàn tiền phụ thuộc vào phương thức thanh toán và thường mất từ 3 đến 5 ngày làm việc." },
  { category: "Sản phẩm", question: "Thời gian giao máy ảnh là bao lâu?", answer: "Đơn hàng sẽ được xử lý sau khi thanh toán xác nhận. Thời gian giao dự kiến được hiển thị trong chi tiết đơn hàng và có thể thay đổi theo khu vực." },
  { category: "Tài khoản", question: "Thông tin cá nhân của tôi có được bảo mật không?", answer: "Sudion chỉ sử dụng thông tin cần thiết để vận hành tài khoản, booking và đơn hàng. Bạn có thể xem thêm tại Chính sách & Quy định hoạt động." },
];

const categories = [
  ["Đặt lịch", "Tìm photographer, chọn ngày và quản lý booking", "calendar_month"],
  ["Thanh toán", "Đặt cọc, thanh toán và hoàn tiền", "payments"],
  ["Tài khoản", "Đăng nhập, bảo mật và thông tin cá nhân", "person"],
  ["Photographer", "Hồ sơ, dịch vụ và lịch làm việc", "photo_camera"],
  ["Sản phẩm", "Mua máy ảnh, đơn hàng và giao hàng", "shopping_bag"],
  ["Khiếu nại", "Báo cáo vấn đề và nhận hỗ trợ", "report_problem"],
];

export default function SupportPage() {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("Tất cả");
  const [openQuestion, setOpenQuestion] = useState<string | null>(null);
  const [formSent, setFormSent] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  const filteredFaqs = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return faqs.filter((faq) => {
      const categoryMatch = activeCategory === "Tất cả" || faq.category === activeCategory;
      const queryMatch = !normalized || `${faq.question} ${faq.answer} ${faq.category}`.toLowerCase().includes(normalized);
      return categoryMatch && queryMatch;
    });
  }, [activeCategory, query]);

  function submitRequest(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormSent(true);
    event.currentTarget.reset();
  }

  function clearSearch() {
    setQuery("");
    setSearchFocused(false);
  }

  function chooseSuggestion(question: string) {
    setQuery(question);
    setOpenQuestion(question);
    setSearchFocused(false);
    document.getElementById("faq")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <main className="min-h-screen bg-[#f8fafc] text-[#101828]">
      <section className="relative overflow-hidden bg-[#101828] px-6 pb-16 pt-14 text-white md:pb-20 md:pt-20">
        <div className="absolute -right-24 -top-32 h-80 w-80 rounded-full border-[48px] border-[#ff8d28]/20" />
        <div className="relative mx-auto max-w-[920px] text-center">
          <p className="text-[11px] font-black uppercase tracking-[0.28em] text-[#ff9d42]">Sudion Support</p>
          <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">Trung tâm hỗ trợ</h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">Tìm câu trả lời nhanh hoặc gửi yêu cầu để đội ngũ Sudion hỗ trợ bạn.</p>
          <div className="relative mx-auto mt-8 max-w-2xl">
          <form onSubmit={(event) => { event.preventDefault(); document.getElementById("faq")?.scrollIntoView({ behavior: "smooth", block: "start" }); }} className="flex items-center gap-3 rounded-2xl bg-white px-5 py-1 shadow-2xl ring-1 ring-white/20 focus-within:ring-2 focus-within:ring-[#ff9d42]">
            <span className="material-symbols-outlined text-slate-400">search</span>
            <input value={query} onFocus={() => setSearchFocused(true)} onChange={(event) => setQuery(event.target.value)} placeholder="Bạn đang cần hỗ trợ điều gì?" aria-label="Tìm kiếm câu hỏi hỗ trợ" className="h-12 min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400" />
            {query && <button type="button" onClick={clearSearch} aria-label="Xóa tìm kiếm" className="grid h-8 w-8 place-items-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700"><span className="material-symbols-outlined text-lg">close</span></button>}
            <button type="submit" className="hidden h-9 rounded-xl bg-[#ff8d28] px-4 text-xs font-black text-white sm:block">Tìm kiếm</button>
          </form>
          {searchFocused && query && filteredFaqs.length > 0 && <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-20 overflow-hidden rounded-2xl border border-slate-200 bg-white text-left shadow-2xl"><p className="border-b border-slate-100 px-4 py-3 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Gợi ý phù hợp</p>{filteredFaqs.slice(0, 4).map((faq) => <button type="button" key={faq.question} onClick={() => chooseSuggestion(faq.question)} className="flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-orange-50"><span className="material-symbols-outlined mt-0.5 text-base text-[#ff8d28]">help</span><span><span className="block text-sm font-bold text-slate-800">{faq.question}</span><span className="mt-0.5 block text-xs text-slate-400">{faq.category}</span></span></button>)}</div>}
          </div>
          <p className="mt-3 text-xs text-slate-400">Tìm theo từ khóa như “đặt cọc”, “hủy lịch”, “mật khẩu” hoặc “đơn hàng”.</p>
        </div>
      </section>

      <section className="mx-auto max-w-[1180px] px-6 py-12 md:py-16">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map(([title, description, icon]) => <button type="button" key={title} onClick={() => { setActiveCategory(title); document.getElementById("faq")?.scrollIntoView({ behavior: "smooth" }); }} className="group rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-[#ffb36e] hover:shadow-md"><span className="material-symbols-outlined text-3xl text-[#ff8d28]">{icon}</span><h2 className="mt-4 text-base font-black">{title}</h2><p className="mt-1 text-xs leading-5 text-slate-500">{description}</p><span className="mt-4 inline-flex text-xs font-bold text-[#ff8d28]">Xem hướng dẫn <span className="ml-1 transition group-hover:translate-x-1">→</span></span></button>)}
        </div>

        <div id="faq" className="mt-16 grid gap-10 lg:grid-cols-[1fr_360px]">
          <section>
            <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div className="min-w-0"><p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#ff8d28]">Câu hỏi thường gặp</p><h2 className="mt-2 text-2xl font-black tracking-tight">Bạn cần biết điều gì?</h2><p className="mt-2 text-sm text-slate-500">{filteredFaqs.length} câu trả lời đang hiển thị</p></div><div className="flex w-full min-w-0 max-w-full flex-wrap items-center justify-end gap-2 sm:w-auto sm:flex-nowrap"><select value={activeCategory} onChange={(event) => setActiveCategory(event.target.value)} className="h-10 min-w-0 w-[180px] max-w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold outline-none"><option>Tất cả</option>{categories.map(([title]) => <option key={title}>{title}</option>)}</select>{activeCategory !== "Tất cả" && <button type="button" onClick={() => setActiveCategory("Tất cả")} className="h-10 min-w-[96px] shrink-0 whitespace-nowrap rounded-xl border border-slate-200 px-2 text-center text-xs font-bold text-slate-500 hover:border-[#ff8d28] hover:text-[#ff8d28]">Xem tất cả</button>}</div></div>
            <div className="mt-6 divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white">{filteredFaqs.map((faq) => <div key={faq.question} className="px-5"><button type="button" onClick={() => setOpenQuestion(openQuestion === faq.question ? null : faq.question)} className="flex w-full items-center justify-between gap-4 py-5 text-left text-sm font-bold"><span>{faq.question}</span><span className="text-xl font-normal text-[#ff8d28]">{openQuestion === faq.question ? "−" : "+"}</span></button>{openQuestion === faq.question && <p className="pb-5 pr-8 text-sm leading-6 text-slate-500">{faq.answer}</p>}</div>)}{filteredFaqs.length === 0 && <p className="px-5 py-10 text-center text-sm text-slate-500">Không tìm thấy câu hỏi phù hợp.</p>}</div>
          </section>

          <aside className="h-fit rounded-2xl bg-[#101828] p-6 text-white"><span className="material-symbols-outlined text-3xl text-[#ff9d42]">support_agent</span><h2 className="mt-4 text-xl font-black">Vẫn cần hỗ trợ?</h2><p className="mt-2 text-sm leading-6 text-slate-300">Gửi thông tin cho đội ngũ Sudion. Chúng tôi sẽ phản hồi qua email sớm nhất.</p>{formSent ? <div className="mt-6"><div className="rounded-xl bg-emerald-500/15 p-4 text-sm font-bold text-emerald-300">Đã ghi nhận yêu cầu. Cảm ơn bạn đã liên hệ Sudion.</div><button type="button" onClick={() => setFormSent(false)} className="mt-3 text-xs font-bold text-[#ffb36e] hover:underline">Gửi yêu cầu khác</button></div> : <form onSubmit={submitRequest} className="mt-6 grid gap-3"><input required type="email" placeholder="Email liên hệ" className="h-11 rounded-xl border border-white/10 bg-white/10 px-3 text-sm text-white outline-none placeholder:text-slate-400 focus:border-[#ff9d42]" /><textarea required placeholder="Mô tả vấn đề của bạn" rows={4} className="rounded-xl border border-white/10 bg-white/10 px-3 py-3 text-sm text-white outline-none placeholder:text-slate-400 focus:border-[#ff9d42]" /><button type="submit" className="h-11 rounded-xl bg-[#ff8d28] text-sm font-black text-white hover:bg-[#f47f16]">Gửi yêu cầu</button></form>}<div className="mt-5 border-t border-white/10 pt-4 text-center text-xs text-slate-400"><p>Thứ 2 - Thứ 6 · 08:30 - 17:30</p><a href="mailto:support@sudion.com" className="mt-2 block font-bold text-[#ffb36e] hover:underline">support@sudion.com</a></div></aside>
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-center gap-4 text-xs font-bold text-slate-500"><Link href="/terms" className="hover:text-[#ff8d28]">Chính sách & quy định</Link><span>·</span><Link href="/login" className="hover:text-[#ff8d28]">Đăng nhập tài khoản</Link><span>·</span><a href="mailto:support@sudion.com" className="hover:text-[#ff8d28]">Liên hệ qua email</a></div>
      </section>
    </main>
  );
}
