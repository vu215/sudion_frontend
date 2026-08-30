import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Đăng ký tài khoản | Sudion Studio",
  description:
    "Tạo tài khoản Sudion Studio miễn phí để đặt lịch chụp hình chuyên nghiệp với hàng ngàn photographer trên toàn quốc.",
  openGraph: {
    title: "Đăng ký tài khoản | Sudion Studio",
    description:
      "Tạo tài khoản miễn phí và bắt đầu đặt lịch chụp hình ngay hôm nay.",
  },
};

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
