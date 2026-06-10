"use client";
import Link from "next/link";


export default function AboutPage() {
  return (
    <>
      <main>

        {/* Hero */}
        <section className="relative h-[89vh] min-h-[480px] flex flex-col items-center justify-center text-center overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url('/screen%201.png')" }}
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
        <section className="py-20 bg-white">
          <div className="max-w-5xl mx-auto px-4 text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Bắt đầu hành trình của bạn <br />tại <span className="text-orange-500">STUDION</span>
            </h2>
            <p className="text-gray-500 mt-3 text-sm md:text-base">
             Vui lòng chọn vai trò của bạn để chúng tôi có thể hỗ trợ tốt nhất.
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
                 Tìm kiếm nhiếp ảnh gia chuyên nghiệp, đặt lịch chụp ảnh và lưu giữ những khoảnh khắc tuyệt vời nhất.
                </p>
              </div>
              <Link href="/photographer" className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-5 py-2.5 rounded-full transition-colors mt-auto">
               ĐẶT LỊCH NGAY
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
                  Gia nhập cộng đồng nhiếp ảnh gia tài năng, quản lý lịch trình và phát triển sự nghiệpcùng Lumina Studio.
                </p>
              </div>
              <Link href="/profilephotographer" className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-5 py-2.5 rounded-full transition-colors mt-auto">
              GIA NHẬP ĐỘI NGŨ
              </Link>
            </div>
          </div>
        </section>

        {/* Our story */}
        <section className="py-24 bg-white">
          <div className="max-w-5xl mx-auto px-4 grid md:grid-cols-[1.1fr_0.9fr] gap-12 items-start">
            {/* Images */}
            <div className="relative overflow-visible">
              <img
                src="/Overlay+Shadow.png"
                alt="Hình ảnh chính"
                className="w-full h-[28rem] md:h-[34rem] rounded-[2rem] object-cover shadow-[0_32px_64px_rgba(15,23,42,0.08)]"
              />
              <div className="absolute -bottom-8 -right-8 w-44 h-44 md:w-52 md:h-52 rounded-[1.75rem] overflow-hidden shadow-2xl z-10">
                <img
                  src="/Overlay+Border+Shadow.png"
                  alt="Hình ảnh phụ"
                  className="w-[110%] h-[110%] object-cover -translate-x-1 -translate-y-1"
                />
              </div>
            </div>

            {/* Text */}
            <div className="space-y-6 pt-2">
              <p className="text-orange-500 text-xs font-semibold uppercase tracking-widest">CÂU CHUYỆN CỦA CHÚNG TÔI</p>
              <h2 className="text-3xl md:text-5xl font-bold text-gray-900 leading-tight">
                Kết nối đam mê với sự tinh hoa
              </h2>
              <div className="space-y-4 text-gray-600 text-sm md:text-base leading-relaxed max-w-xl">
                <p>
                  Photar AI ra đời từ một tầm nhìn đơn giản: Làm thế nào để mọi khoảnh khắc đáng giá đều có thể trở thành những đôi mắt tưởng như, được hỗ trợ bởi công nghệ tiên tiến nhất?
                </p>
                <p>
                  Chúng tôi xây dựng một hệ sinh thái nơi các nhiếp ảnh gia tài năng không chỉ tìm thấy khách hàng, mà còn tìm thấy một cộng đồng sáng tạo được hỗ trợ bởi AI, giúp tối ưu hoá quy trình từ tìm kiếm địa điểm đến hậu kỳ hoàn hảo.
                </p>
              </div>
              <Link href="/photographer" className="inline-flex items-center justify-center bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-7 py-3 rounded-full transition-colors">
                Tìm hiểu thêm
              </Link>
            </div>
          </div>
        </section>

        
      </main>
    </>
  );
}
