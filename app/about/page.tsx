"use client";
import Link from "next/link";


export default function AboutPage() {
  return (
    <>
      <main className="pt-16">

        {/* Hero */}
        <section className="relative h-[70vh] min-h-[480px] flex flex-col items-center justify-center text-center overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=1600&q=80')" }}
          />
          <div className="absolute inset-0 bg-black/65" />
          <div className="relative z-10 px-4">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">Sứ mệnh của chúng tôi</h1>
            <p className="text-gray-300 max-w-xl mx-auto text-base md:text-lg">
              Chúng tôi đang định nghĩa lại nghề nhiếp ảnh chuyên nghiệp bằng cách kết hợp sự nhạy bén của con người với trí tuệ nhân tạo.
            </p>
          </div>
          <div className="absolute bottom-6 z-10 animate-bounce">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </section>

        {/* Get started */}
        <section className="py-20 bg-[#fff5f0]">
          <div className="max-w-5xl mx-auto px-4 text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Bắt đầu hành trình của bạn <br />tại <span className="text-orange-500">STUDION</span>
            </h2>
            <p className="text-gray-500 mt-3 text-sm md:text-base">
              Xây dựng career với hàng trăm khách hàng và thể hiện tốt nhất.
            </p>
          </div>

          <div className="max-w-3xl mx-auto px-4 grid md:grid-cols-2 gap-6">
            {/* Card khách hàng */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 flex flex-col items-start gap-4">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Tôi là Khách hàng</h3>
                <p className="text-gray-500 text-sm mt-2">
                  Tìm kiếm nhiếp ảnh gia chuyên nghiệp, lịch chụp và những khoảnh khắc lưu mãi mãi.
                </p>
              </div>
              <Link href="/" className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-5 py-2.5 rounded-full transition-colors mt-auto">
                BẮT ĐẦU NGAY
              </Link>
            </div>

            {/* Card nhiếp ảnh gia */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 flex flex-col items-start gap-4">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Tôi là Nhiếp ảnh gia</h3>
                <p className="text-gray-500 text-sm mt-2">
                  Gia nhập cộng đồng, được hỗ trợ toàn diện và phát triển sự nghiệp cùng Studion.
                </p>
              </div>
              <Link href="/photographer" className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-5 py-2.5 rounded-full transition-colors mt-auto">
                GIA NHẬP NGAY
              </Link>
            </div>
          </div>
        </section>

        {/* Our story */}
        <section className="py-20 bg-white">
          <div className="max-w-5xl mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
            {/* Images */}
            <div className="relative h-80 md:h-96">
              <img
                src="https://images.unsplash.com/photo-1554080353-a576cf803bda?w=600&q=80"
                alt="Story main"
                className="absolute top-0 left-0 w-4/5 h-full object-cover rounded-2xl shadow-lg"
              />
              <img
                src="https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=300&q=80"
                alt="Story secondary"
                className="absolute bottom-0 right-0 w-2/5 h-2/5 object-cover rounded-2xl shadow-xl border-4 border-white"
              />
            </div>

            {/* Text */}
            <div>
              <p className="text-orange-500 text-xs font-semibold uppercase tracking-widest mb-2">CÂU CHUYỆN CỦA CHÚNG TÔI</p>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Kết nối đam mê với sự tinh hoa
              </h2>
              <p className="text-gray-500 text-sm leading-relaxed mb-4">
                Studion ra đời từ một câu hỏi đơn giản: Làm thế nào để mọi khoảnh khắc đáng giá đều có thể trở thành những đôi mắt tưởng như, được hỗ trợ bởi công nghệ tiên tiến nhất?
              </p>
              <p className="text-gray-500 text-sm leading-relaxed mb-6">
                Chúng tôi xây dựng một hệ sinh thái nơi các nhiếp ảnh gia và khách hàng không chỉ tìm thấy nhau, mà còn tìm thấy công cụ để cùng tạo được hỗ trợ bởi AI, giúp từng sự kiện trở thành ký ức hoàn hảo.
              </p>
              <Link href="/photographer" className="inline-block bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-6 py-3 rounded-full transition-colors">
                Tìm hiểu thêm
              </Link>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-16 bg-gray-900 text-white">
          <div className="max-w-4xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { number: "5000+", label: "Nhiếp ảnh gia" },
              { number: "50K+", label: "Khách hàng" },
              { number: "200K+", label: "Bức ảnh" },
              { number: "4.9★", label: "Đánh giá" },
            ].map((s) => (
              <div key={s.label}>
                <div className="text-3xl md:text-4xl font-bold text-orange-400">{s.number}</div>
                <div className="text-gray-400 text-sm mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Team */}
        <section className="py-20 bg-white">
          <div className="max-w-5xl mx-auto px-4 text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Đội ngũ của chúng tôi</h2>
            <p className="text-gray-500 mt-2 text-sm">Những con người đam mê đứng sau STUDION</p>
          </div>
          <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { name: "Minh Tuấn", role: "CEO & Co-founder", img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80" },
              { name: "Linh Phương", role: "Head of Design", img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80" },
              { name: "Hồng Sơn", role: "Lead Engineer", img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80" },
              { name: "Mai Anh", role: "Community Lead", img: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=200&q=80" },
            ].map((m) => (
              <div key={m.name} className="text-center">
                <img src={m.img} alt={m.name} className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover mx-auto mb-3 shadow" />
                <div className="font-semibold text-gray-900 text-sm">{m.name}</div>
                <div className="text-orange-500 text-xs">{m.role}</div>
              </div>
            ))}
          </div>
        </section>

        
      </main>
    </>
  );
}
