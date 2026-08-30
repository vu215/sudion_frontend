"use client";

import Link from "next/link";

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#fafbfc] text-[#0e111d] font-sans antialiased selection:bg-[#ff8d28]/20">
      {/* Header */}
      <header className="border-b border-[#e6e8f0] bg-white sticky top-0 z-50">
        <div className="w-full max-w-[1280px] mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-[20px] font-black tracking-tight text-[#0f172a]">
            STUD<span className="text-[#ff8d28]">ION</span>
          </Link>
          <Link href="/" className="text-[13px] font-bold text-[#ff8d28] hover:text-[#e0751b] transition-colors">
            Quay lại Trang chủ
          </Link>
        </div>
      </header>

      {/* Hero Header */}
      <section className="bg-gradient-to-br from-[#0f172a] to-[#1e293b] text-white py-16 md:py-20 relative overflow-hidden">
        <div className="absolute right-[-100px] top-[-100px] h-[300px] w-[300px] rounded-full bg-[#ff8d28]/15 blur-3xl" />
        <div className="w-full max-w-[800px] mx-auto px-6 relative z-10 text-center">
          <span className="text-[11px] font-black uppercase tracking-[0.25em] text-[#ff8d28]">ĐIỀU KHOẢN VÀ QUY CHẾ</span>
          <h1 className="mt-3 text-[32px] sm:text-[42px] font-black tracking-[-0.03em] leading-tight">Chính Sách & Quy Định Hoạt Động</h1>
          <p className="mt-4 text-[14px] sm:text-[15px] text-white/70 font-medium leading-relaxed">
            Áp dụng cho tất cả Khách hàng và Nhiếp ảnh gia tham gia giao dịch trên sàn giao dịch nhiếp ảnh Sudion.
          </p>
        </div>
      </section>

      {/* Policy Content */}
      <section className="py-16 md:py-24">
        <div className="w-full max-w-[800px] mx-auto px-6">
          <article className="prose prose-slate max-w-none space-y-12">
            
            {/* Section 1 */}
            <div>
              <h2 className="text-[22px] font-black text-[#0f172a] border-l-4 border-[#ff8d28] pl-3.5 tracking-tight">1. Điều khoản Chung dành cho Thành viên</h2>
              <p className="mt-4 text-[14px] leading-relaxed text-[#4b5563] font-medium">
                Sàn giao dịch Sudion là cầu nối trung gian giữa Khách hàng có nhu cầu chụp ảnh và các Nhiếp ảnh gia chuyên nghiệp (Photographers). Bằng việc đăng ký tài khoản và giao dịch trên Sudion, các bên cam kết tuân thủ đúng các quy định về an toàn thông tin, văn hóa ứng xử và pháp luật hiện hành.
              </p>
            </div>

            {/* Section 2 */}
            <div>
              <h2 className="text-[22px] font-black text-[#0f172a] border-l-4 border-[#ff8d28] pl-3.5 tracking-tight">2. Chính sách Hoa hồng dành cho Sàn (Platform Fee)</h2>
              <p className="mt-4 text-[14px] leading-relaxed text-[#4b5563] font-medium">
                Để duy trì nền tảng, hệ thống đối soát kết nối và dịch vụ hỗ trợ khách hàng, Sudion áp dụng mức phí hoa hồng dịch vụ trên mỗi đơn đặt lịch thành công:
              </p>
              <ul className="mt-3 space-y-2.5 list-disc list-inside text-[13px] text-[#4b5563] font-semibold">
                <li><strong className="text-[#0f172a]">Tỷ lệ mặc định:</strong> 15% trên tổng giá trị đơn đặt lịch của Nhiếp ảnh gia.</li>
                <li><strong className="text-[#0f172a]">Phương thức thu phí:</strong> Khấu trừ tự động vào khoản thanh toán thực nhận (net payout) của Nhiếp ảnh gia sau khi buổi chụp đã được xác nhận hoàn thành và đối soát.</li>
                <li><strong className="text-[#0f172a]">Điều chỉnh hoa hồng:</strong> Admin Sudion có quyền điều chỉnh tỷ lệ hoa hồng riêng đối với một số tài khoản đối tác chiến lược hoặc trong các chiến dịch ưu đãi được công bố trước.</li>
              </ul>
            </div>

            {/* Section 3 */}
            <div>
              <h2 className="text-[22px] font-black text-[#0f172a] border-l-4 border-[#ff8d28] pl-3.5 tracking-tight">3. Quy trình Đặt lịch và Thanh toán</h2>
              <p className="mt-4 text-[14px] leading-relaxed text-[#4b5563] font-medium">
                Để bảo vệ quyền lợi cho cả Khách hàng và Photographer, quy trình đặt lịch trên Sudion được thực hiện qua các bước nghiêm ngặt:
              </p>
              <div className="mt-5 grid gap-4 sm:grid-cols-3">
                <div className="bg-[#f8fafc] border border-[#e2e8f0] p-4.5 rounded-2xl">
                  <span className="text-[11px] font-black text-[#ff8d28] uppercase">Bước 1</span>
                  <h4 className="text-[14px] font-bold text-gray-800 mt-1">Đăng ký lịch</h4>
                  <p className="text-[12px] text-gray-500 mt-2 font-medium">Khách đặt lịch và thợ ảnh chấp nhận/từ chối trong vòng 24 giờ.</p>
                </div>
                <div className="bg-[#f8fafc] border border-[#e2e8f0] p-4.5 rounded-2xl">
                  <span className="text-[11px] font-black text-[#ff8d28] uppercase">Bước 2</span>
                  <h4 className="text-[14px] font-bold text-gray-800 mt-1">Thanh toán cọc</h4>
                  <p className="text-[12px] text-gray-500 mt-2 font-medium">Khách hàng thanh toán 50% tiền cọc qua cổng online để giữ chỗ.</p>
                </div>
                <div className="bg-[#f8fafc] border border-[#e2e8f0] p-4.5 rounded-2xl">
                  <span className="text-[11px] font-black text-[#ff8d28] uppercase">Bước 3</span>
                  <h4 className="text-[14px] font-bold text-gray-800 mt-1">Tất toán & Bàn giao</h4>
                  <p className="text-[12px] text-gray-500 mt-2 font-medium">Buổi chụp hoàn tất, khách hàng trả 50% còn lại và nhận link ảnh.</p>
                </div>
              </div>
            </div>

            {/* Section 4 */}
            <div>
              <h2 className="text-[22px] font-black text-[#0f172a] border-l-4 border-[#ff8d28] pl-3.5 tracking-tight">4. Chính sách Hủy lịch và Hoàn tiền (Refund Policy)</h2>
              <ul className="mt-4 space-y-4 text-[13px] text-[#4b5563] font-medium leading-relaxed">
                <li className="bg-[#fff7ed] border border-[#ffedd5] p-4 rounded-xl">
                  <strong className="text-[#ea580c] block mb-1">Khách hàng chủ động hủy lịch:</strong>
                  Tiền đặt cọc (50% giá trị đơn) sẽ không được hoàn trả nếu khách hàng tự ý hủy lịch chụp trong vòng 48 giờ trước thời gian diễn ra buổi chụp. Nếu hủy lịch trước 48 giờ, khách hàng có thể được xem xét dời lịch hoặc hoàn cọc theo thỏa thuận trực tiếp với photographer.
                </li>
                <li className="bg-red-50 border border-red-100 p-4 rounded-xl">
                  <strong className="text-[#be123c] block mb-1">Nhiếp ảnh gia chủ động hủy lịch:</strong>
                  Trong trường hợp Photographer không thể thực hiện buổi chụp và chủ động hủy lịch, toàn bộ 100% số tiền đặt cọc của Khách hàng sẽ được hệ thống Sudion hoàn trả lại tài khoản gốc trong vòng 3-5 ngày làm việc. Tài khoản của photographer có thể bị ghi nhận cảnh cáo bởi hệ thống.
                </li>
              </ul>
            </div>

            {/* Section 5 */}
            <div>
              <h2 className="text-[22px] font-black text-[#0f172a] border-l-4 border-[#ff8d28] pl-3.5 tracking-tight">5. Quy định dịch vụ Quảng cáo & Banner</h2>
              <p className="mt-4 text-[14px] leading-relaxed text-[#4b5563] font-medium">
                Sudion hỗ trợ các tính năng quảng cáo nhằm tăng cơ hội hiển thị cho Photographers:
              </p>
              <ul className="mt-3 space-y-2.5 list-disc list-inside text-[13px] text-[#4b5563] font-semibold">
                <li><strong className="text-[#0f172a]">Bán Banner quảng cáo:</strong> Các nhãn hàng hoặc photographer có thể thuê vị trí banner động trên trang chủ của Sudion theo bảng giá quy định từng thời kỳ.</li>
                <li><strong className="text-[#0f172a]">Vị trí Nổi bật (Featured Artist):</strong> Photographers mua gói nổi bật (7 ngày hoặc 30 ngày) sẽ được xếp hạng đầu tiên trong danh sách thợ ảnh. Các giao dịch mua gói quảng cáo không được hoàn trả dưới mọi hình thức.</li>
              </ul>
            </div>
          </article>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#edf0f5] bg-white py-10">
        <div className="w-full max-w-[1280px] mx-auto px-6 text-center text-[#8a8fa1] text-[12px]">
          <p>© {new Date().getFullYear()} Sudion Platform. Bảo lưu mọi quyền.</p>
          <div className="mt-3 flex justify-center gap-4">
            <Link href="/" className="hover:text-[#ff8d28]">Trang chủ</Link>
            <span>•</span>
            <Link href="/terms" className="text-[#ff8d28] font-bold">Chính sách sàn</Link>
            <span>•</span>
            <a href="mailto:support@sudion.com" className="hover:text-[#ff8d28]">Hỗ trợ kỹ thuật</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
