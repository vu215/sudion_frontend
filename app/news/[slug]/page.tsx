import Link from "next/link";
import { notFound } from "next/navigation";
import { articles } from "../articles";

export default function NewsArticlePage({ params }: { params: { slug: string } }) {
  const article = articles.find((item) => item.id === params.slug);

  if (!article) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#f8f9fd] text-[#0e111d]">
      <section className="bg-white border-b border-slate-100 py-12">
        <div className="mx-auto max-w-[1080px] px-6 md:px-12 lg:px-20">
          <Link href="/news" className="inline-flex items-center gap-2 text-sm font-semibold text-[#334155] hover:text-[#ff8d28] mb-6">
            ← Quay lại Tin tức
          </Link>
          <div className="mt-4 max-w-3xl">
            <div className="flex flex-wrap items-center gap-3 text-[11px] font-bold uppercase tracking-[0.22em] text-[#ff8d28]">
              <span className="rounded-full bg-[#ffedd5] px-3 py-1 text-[#c2410c]">{article.category}</span>
              <span>{article.date}</span>
              <span>{article.readTime}</span>
            </div>
            <h1 className="mt-6 text-[32px] sm:text-[42px] font-black leading-tight text-[#0f172a]">
              {article.title}
            </h1>
            <p className="mt-4 max-w-[760px] text-[15px] leading-relaxed text-slate-600">
              {article.excerpt}
            </p>
            <div className="mt-6 flex items-center gap-3">
              <img src={article.authorAvatar} alt={article.author} className="h-12 w-12 rounded-full object-cover" />
              <div>
                <p className="text-sm font-bold text-[#0f172a]">{article.author}</p>
                <p className="text-xs text-slate-500">Tác giả</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1080px] px-6 md:px-12 lg:px-20 py-12">
        <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
          <img src={article.image} alt={article.title} className="w-full object-cover" />
          <div className="p-10">
            <div className="grid gap-8">
              <p className="text-[15px] leading-8 text-slate-700">
                {article.excerpt} Đây là bài viết đầy đủ giúp người đọc hiểu sâu hơn về nội dung và ứng dụng thực tế trong nhiếp ảnh. Trong mỗi đoạn, tôi sẽ mở rộng thông tin với ví dụ, mẹo thao tác và các bước thực hiện cụ thể.
              </p>
              <div className="space-y-6">
                <div>
                  <h2 className="text-[22px] font-bold text-[#0f172a]">1. Giới thiệu chi tiết</h2>
                  <p className="mt-3 text-[15px] leading-8 text-slate-700">
                    Một bài viết tin tức chuyên nghiệp cần bắt đầu bằng định hướng lý do tại sao đề tài này quan trọng. Với nhiếp ảnh, điều đó có thể là xu hướng thị trường, công nghệ mới, hoặc cách người dùng thay đổi nhu cầu. Bài viết này sẽ phân tích thành phần, tính năng và tác động thực tế đối với nhiếp ảnh gia.
                  </p>
                </div>

                <div>
                  <h2 className="text-[22px] font-bold text-[#0f172a]">2. Phân tích rõ vấn đề</h2>
                  <p className="mt-3 text-[15px] leading-8 text-slate-700">
                    Mỗi phần nội dung nên đi sâu vào chi tiết: những gì đang thay đổi, lý do và kết quả. Ví dụ, nếu bài viết nói về AI, bạn có thể mô tả cách AI giúp tự động cân bằng ánh sáng, gợi ý bố cục hoặc cung cấp preview màu sắc trước khi chụp.
                  </p>
                </div>

                <div>
                  <h2 className="text-[22px] font-bold text-[#0f172a]">3. Kinh nghiệm và lời khuyên</h2>
                  <p className="mt-3 text-[15px] leading-8 text-slate-700">
                    Từ góc độ nhiếp ảnh gia, bạn cần gợi ý những mẹo thiết thực: chuẩn bị đồ nghề, chọn địa điểm, giao tiếp với khách hoặc xử lý hậu kỳ. Một bài viết tốt sẽ cho người đọc cảm giác họ có thể áp dụng ngay.
                  </p>
                </div>

                <div>
                  <h2 className="text-[22px] font-bold text-[#0f172a]">4. Kết luận và kêu gọi hành động</h2>
                  <p className="mt-3 text-[15px] leading-8 text-slate-700">
                    Kết thúc bài viết bằng phần tóm lược giá trị chính và lời kêu gọi hành động: đọc thêm, đăng ký nhận tin hoặc trải nghiệm dịch vụ. Đây là cách giữ chân độc giả và biến họ thành khách hàng tiềm năng.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
