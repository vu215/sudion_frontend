"use client";

import Link from "next/link";

export default function AboutPage() {
  return (
    <>
      <main>
        {/* Hero */}
        <section className="relative flex h-[89vh] min-h-[480px] flex-col items-center justify-center overflow-hidden text-center">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url('/screen%201.png')" }}
          />

          <div className="absolute inset-0 bg-black/65" />

          <div className="relative z-10 px-4">
            <h1 className="mb-4 text-4xl font-bold text-white md:text-6xl">
              Sứ mệnh của chúng tôi
            </h1>

            <p className="mx-auto max-w-xl text-base text-gray-300 md:text-lg">
              Chúng tôi đang định nghĩa lại nghề nhiếp ảnh chuyên nghiệp bằng
              cách kết hợp sự nhạy bén của con người với trí tuệ nhân tạo.
            </p>
          </div>

          <div className="absolute bottom-6 z-10 animate-bounce">
            <svg
              className="h-6 w-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </section>

        {/* Get started */}
        <section className="bg-white py-20">
          <div className="mx-auto mb-12 max-w-5xl px-4 text-center">
            <h2 className="text-3xl font-bold text-gray-900 md:text-4xl">
              Bắt đầu hành trình của bạn <br />
              tại <span className="text-orange-500">STUDION</span>
            </h2>

            <p className="mt-3 text-sm text-gray-500 md:text-base">
              Vui lòng chọn vai trò của bạn để chúng tôi có thể hỗ trợ tốt nhất.
            </p>
          </div>

          <div className="mx-auto grid max-w-3xl gap-6 px-4 md:grid-cols-2">
            {/* Card khách hàng */}
            <div className="flex flex-col items-start gap-4 rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100">
                <svg
                  className="h-6 w-6 text-orange-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Tôi là Khách hàng
                </h3>

                <p className="mt-2 text-sm text-gray-500">
                  Tìm kiếm nhiếp ảnh gia chuyên nghiệp, đặt lịch chụp ảnh và lưu
                  giữ những khoảnh khắc tuyệt vời nhất.
                </p>
              </div>

              <Link
                href="/photographer"
                className="mt-auto rounded-full bg-orange-500 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-orange-600"
              >
                ĐẶT LỊCH NGAY
              </Link>
            </div>

            {/* Card nhiếp ảnh gia */}
            <div className="flex flex-col items-start gap-4 rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100">
                <svg
                  className="h-6 w-6 text-orange-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Tôi là Nhiếp ảnh gia
                </h3>

                <p className="mt-2 text-sm text-gray-500">
                  Gia nhập cộng đồng nhiếp ảnh gia tài năng, quản lý lịch trình
                  và phát triển sự nghiệp cùng Studion.
                </p>
              </div>

              <Link
                href="/become-photographer"
                className="mt-auto rounded-full bg-orange-500 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-orange-600"
              >
                GIA NHẬP ĐỘI NGŨ
              </Link>
            </div>
          </div>
        </section>

        {/* Our story */}
        <section className="bg-white py-24">
          <div className="mx-auto grid max-w-5xl items-start gap-12 px-4 md:grid-cols-[1.1fr_0.9fr]">
            <div className="relative overflow-visible">
              <img
                src="/Overlay+Shadow.png"
                alt="Hình ảnh chính"
                className="h-[28rem] w-full rounded-[2rem] object-cover shadow-[0_32px_64px_rgba(15,23,42,0.08)] md:h-[34rem]"
              />

              <div className="absolute -bottom-8 -right-8 z-10 h-44 w-44 overflow-hidden rounded-[1.75rem] shadow-2xl md:h-52 md:w-52">
                <img
                  src="/Overlay+Border+Shadow.png"
                  alt="Hình ảnh phụ"
                  className="h-[110%] w-[110%] -translate-x-1 -translate-y-1 object-cover"
                />
              </div>
            </div>

            <div className="space-y-6 pt-2">
              <p className="text-xs font-semibold uppercase tracking-widest text-orange-500">
                CÂU CHUYỆN CỦA CHÚNG TÔI
              </p>

              <h2 className="text-3xl font-bold leading-tight text-gray-900 md:text-5xl">
                Kết nối đam mê với sự tinh hoa
              </h2>

              <div className="max-w-xl space-y-4 text-sm leading-relaxed text-gray-600 md:text-base">
                <p>
                  Studion ra đời từ một tầm nhìn đơn giản: giúp mọi khoảnh khắc
                  đáng giá đều có thể được ghi lại bởi những nhiếp ảnh gia phù
                  hợp nhất.
                </p>

                <p>
                  Chúng tôi xây dựng một hệ sinh thái nơi các nhiếp ảnh gia tài
                  năng không chỉ tìm thấy khách hàng, mà còn có công cụ để quản
                  lý booking, chat, thanh toán và phát triển thương hiệu cá nhân.
                </p>
              </div>

              <Link
                href="/photographer"
                className="inline-flex items-center justify-center rounded-full bg-orange-500 px-7 py-3 text-sm font-semibold text-white transition-colors hover:bg-orange-600"
              >
                Tìm hiểu thêm
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}