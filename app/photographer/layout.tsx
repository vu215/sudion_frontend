import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tìm Photographer | Sudion Studio",
  description:
    "Tìm kiếm và kết nối với hàng ngàn nhiếp ảnh gia chuyên nghiệp tại Việt Nam. Lọc theo dịch vụ, khu vực và phong cách chụp.",
  openGraph: {
    title: "Tìm Photographer chuyên nghiệp | Sudion Studio",
    description:
      "Khám phá hàng ngàn photographer chuyên nghiệp trên Sudion Studio.",
  },
};

export default function PhotographerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
