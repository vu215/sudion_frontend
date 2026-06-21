export interface Article {
  id: string;
  category: string;
  categoryColor: string;
  title: string;
  excerpt: string;
  author: string;
  authorAvatar: string;
  date: string;
  readTime: string;
  image: string;
  featured?: boolean;
}

export const articles: Article[] = [
  {
    id: "ai-photography-2026",
    category: "Công nghệ",
    categoryColor: "bg-violet-100 text-violet-700",
    title: "AI đang thay đổi nhiếp ảnh thương mại như thế nào trong năm 2026",
    excerpt:
      "Trí tuệ nhân tạo không còn chỉ là công cụ hậu kỳ — nó đang tái định nghĩa toàn bộ quy trình từ scouting địa điểm, gợi ý ánh sáng đến phân tích phong cách khách hàng theo thời gian thực.",
    author: "Minh Châu",
    authorAvatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&q=80",
    date: "8 tháng 6, 2026",
    readTime: "6 phút đọc",
    image:
      "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?auto=format&fit=crop&w=1200&q=80",
    featured: true,
  },
  {
    id: "wedding-trends-2026",
    category: "Cưới hỏi",
    categoryColor: "bg-rose-100 text-rose-700",
    title: "5 xu hướng chụp ảnh cưới hot nhất mùa hè 2026",
    excerpt:
      "Từ film grain cổ điển đến editorial tối giản, các cặp đôi đang chọn phong cách riêng thay vì theo khuôn mẫu. Cùng khám phá những concept đang được đặt nhiều nhất trên Studion.",
    author: "Hà Linh",
    authorAvatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&q=80",
    date: "5 tháng 6, 2026",
    readTime: "4 phút đọc",
    image:
      "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "photographer-income",
    category: "Kinh nghiệm",
    categoryColor: "bg-emerald-100 text-emerald-700",
    title: "Nhiếp ảnh gia tự do kiếm được bao nhiêu tại Việt Nam?",
    excerpt:
      "Khảo sát từ hơn 300 nhiếp ảnh gia trên nền tảng Studion cho thấy mức thu nhập dao động lớn tùy theo chuyên môn, khu vực và cách xây dựng thương hiệu cá nhân.",
    author: "Tuấn Anh",
    authorAvatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&q=80",
    date: "2 tháng 6, 2026",
    readTime: "8 phút đọc",
    image:
      "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "gear-guide-2026",
    category: "Thiết bị",
    categoryColor: "bg-sky-100 text-sky-700",
    title: "Bộ kit máy ảnh tốt nhất cho nhiếp ảnh gia mới vào nghề năm 2026",
    excerpt:
      "Không cần phải đầu tư hàng chục triệu ngay từ đầu. Chuyên gia của chúng tôi gợi ý những bộ kit thực chiến nhất, cân bằng giữa chất lượng và ngân sách cho người mới bắt đầu.",
    author: "Bảo Khoa",
    authorAvatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=80&q=80",
    date: "29 tháng 5, 2026",
    readTime: "5 phút đọc",
    image:
      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "lightroom-tips",
    category: "Hậu kỳ",
    categoryColor: "bg-amber-100 text-amber-700",
    title: "10 thủ thuật Lightroom giúp workflow hậu kỳ nhanh gấp 3 lần",
    excerpt:
      "Masking AI, Profile Sync, và Export Preset đúng cách — ba công cụ này đơn giản thôi nhưng rất ít photographer khai thác hết tiềm năng của chúng.",
    author: "Thu Phương",
    authorAvatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=80&q=80",
    date: "25 tháng 5, 2026",
    readTime: "7 phút đọc",
    image:
      "https://images.unsplash.com/photo-1609921212029-bb5a28e60960?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "product-photography",
    category: "Thương mại",
    categoryColor: "bg-orange-100 text-orange-700",
    title: "Hướng dẫn chụp ảnh sản phẩm tại nhà với ánh sáng tự nhiên",
    excerpt:
      "Studio đắt tiền không phải lúc nào cũng cần thiết. Chỉ với một cửa sổ lớn, tấm phản sáng và vài món đồ gia dụng, bạn hoàn toàn có thể tạo ra bộ ảnh thương mại chất lượng cao.",
    author: "Ngọc Hân",
    authorAvatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=80&q=80",
    date: "20 tháng 5, 2026",
    readTime: "5 phút đọc",
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "portfolio-tips",
    category: "Kinh nghiệm",
    categoryColor: "bg-emerald-100 text-emerald-700",
    title: "Xây dựng portfolio nhiếp ảnh thu hút khách hàng cao cấp",
    excerpt:
      "Portfolio không chỉ là tập hợp ảnh đẹp — nó là câu chuyện về phong cách và giá trị của bạn. Học cách chọn lọc, sắp xếp và trình bày để tạo ấn tượng mạnh ngay lần xem đầu tiên.",
    author: "Minh Châu",
    authorAvatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&q=80",
    date: "15 tháng 5, 2026",
    readTime: "6 phút đọc",
    image:
      "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=900&q=80",
  },
];
