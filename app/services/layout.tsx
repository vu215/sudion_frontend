import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dịch vụ chụp hình | Sudion Studio",
  description:
    "Khám phá các dịch vụ chụp hình chuyên nghiệp: chụp cưới, chụp đôi, kỷ yếu, sự kiện, food & product, travel photography.",
  openGraph: {
    title: "Dịch vụ chụp hình chuyên nghiệp | Sudion Studio",
    description:
      "7 loại dịch vụ chụp hình chuyên nghiệp từ cưới hỏi đến food & product.",
  },
};

export default function ServicesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
