import Link from "next/link";
import { notFound } from "next/navigation";
import { articles } from "@/app/news/data";

interface Params {
  params: Promise<{ id: string }>;
}

export function generateStaticParams() {
  return articles.map((article) => ({ id: article.id }));
}

export default async function NewsArticlePage({ params }: Params) {
  const { id } = await params;
  const article = articles.find((item) => item.id === id);
  if (!article) return notFound();

  return (
    <div className="min-h-screen bg-[#f8f9fd] text-[#0f172a] py-12">
      <div className="mx-auto w-full max-w-[960px] px-6 md:px-10">
        <Link
          href="/news"
          className="inline-flex items-center gap-2 text-sm font-bold text-[#0e111d] opacity-80 hover:opacity-100"
        >
          ← Quay lại tin tức
        </Link>

        <div className="mt-8 rounded-[32px] overflow-hidden bg-white shadow-2xl">
          <div className="relative h-[420px] overflow-hidden bg-slate-200">
            <img src={article.image} alt={article.title} className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 text-white">
              <span className="inline-flex rounded-full bg-[#ff8d28]/95 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em]">
                {article.category}
              </span>
              <h1 className="mt-5 text-4xl font-black leading-tight sm:text-5xl">{article.title}</h1>
              <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-white/80">
                <span>{article.author}</span>
                <span>•</span>
                <span>{article.date}</span>
                <span>•</span>
                <span>{article.readTime}</span>
              </div>
            </div>
          </div>

          <div className="space-y-8 p-8 sm:p-10">
            <div className="flex items-center gap-3">
              <img src={article.authorAvatar} alt={article.author} className="h-12 w-12 rounded-full object-cover" />
              <div>
                <p className="text-sm font-bold text-[#0f172a]">{article.author}</p>
                <p className="text-sm text-slate-500">{article.date} · {article.readTime}</p>
              </div>
            </div>

            <div className="space-y-6 text-[17px] leading-8 text-slate-700">
              <p>{article.excerpt}</p>
              <p>
                Trong bài viết này, chúng tôi sẽ đi sâu vào những điểm chính giúp bạn hiểu rõ hơn về chủ đề. Những xu hướng và phương pháp được chia sẻ dựa trên kinh nghiệm thực tế từ cộng đồng nhiếp ảnh gia, cùng với các mẹo ứng dụng dễ thực hiện.
              </p>
              <p>
                Mỗi người chụp ảnh đều cần biết cách kết hợp ánh sáng, bố cục và cảm xúc để tạo ra bộ ảnh ấn tượng. Việc xác định phong cách riêng và xây dựng câu chuyện cho từng bộ ảnh giúp bạn khác biệt trong mắt khách hàng.
              </p>
              <p>
                Bên cạnh kỹ thuật, yếu tố hậu kỳ và storytelling cũng quyết định chất lượng cuối cùng. Hãy chú ý tạo điểm nhấn bằng chi tiết nhỏ, lựa chọn màu sắc hài hòa, và giữ nhịp cho câu chuyện hình ảnh qua từng khung hình.
              </p>
              <p>
                Cuối cùng, đừng quên liên tục cập nhật xu hướng mới và thử nghiệm phong cách mới để giữ thương hiệu cá nhân luôn tươi mới. Khi bạn biết cách kể chuyện qua ảnh, khách hàng sẽ dễ dàng đồng cảm và tin tưởng hơn.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
