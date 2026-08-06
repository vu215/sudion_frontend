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
    authorAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&q=80",
    date: "8 tháng 6, 2026",
    readTime: "6 phút đọc",
    image: "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?auto=format&fit=crop&w=1200&q=80",
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
    authorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&q=80",
    date: "5 tháng 6, 2026",
    readTime: "4 phút đọc",
    image: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "photographer-income",
    category: "Kinh nghiệm",
    categoryColor: "bg-emerald-100 text-emerald-700",
    title: "Nhiếp ảnh gia tự do kiếm được bao nhiêu tại Việt Nam?",
    excerpt:
      "Khảo sát từ hơn 300 nhiếp ảnh gia trên nền tảng Studion cho thấy mức thu nhập dao động lớn tùy theo chuyên môn, khu vực và cách xây dựng thương hiệu cá nhân.",
    author: "Tuấn Anh",
    authorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&q=80",
    date: "2 tháng 6, 2026",
    readTime: "8 phút đọc",
    image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "gear-guide-2026",
    category: "Thiết bị",
    categoryColor: "bg-sky-100 text-sky-700",
    title: "Bộ kit máy ảnh tốt nhất cho nhiếp ảnh gia mới vào nghề năm 2026",
    excerpt:
      "Không cần phải đầu tư hàng chục triệu ngay từ đầu. Chuyên gia của chúng tôi gợi ý những bộ kit thực chiến nhất, cân bằng giữa chất lượng và ngân sách cho người mới bắt đầu.",
    author: "Bảo Khoa",
    authorAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=80&q=80",
    date: "29 tháng 5, 2026",
    readTime: "5 phút đọc",
    image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "lightroom-tips",
    category: "Hậu kỳ",
    categoryColor: "bg-amber-100 text-amber-700",
    title: "10 thủ thuật Lightroom giúp workflow hậu kỳ nhanh gấp 3 lần",
    excerpt:
      "Masking AI, Profile Sync, và Export Preset đúng cách — ba công cụ này đơn giản thôi nhưng rất ít photographer khai thác hết tiềm năng của chúng.",
    author: "Thu Phương",
    authorAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=80&q=80",
    date: "25 tháng 5, 2026",
    readTime: "7 phút đọc",
    image: "https://images.unsplash.com/photo-1609921212029-bb5a28e60960?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "product-photography",
    category: "Thương mại",
    categoryColor: "bg-orange-100 text-orange-700",
    title: "Hướng dẫn chụp ảnh sản phẩm tại nhà với ánh sáng tự nhiên",
    excerpt:
      "Studio đắt tiền không phải lúc nào cũng cần thiết. Chỉ với một cửa sổ lớn, tấm phản sáng và vài món đồ gia dụng, bạn hoàn toàn có thể tạo ra bộ ảnh thương mại chất lượng cao.",
    author: "Ngọc Hân",
    authorAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=80&q=80",
    date: "20 tháng 5, 2026",
    readTime: "5 phút đọc",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "portfolio-tips",
    category: "Kinh nghiệm",
    categoryColor: "bg-emerald-100 text-emerald-700",
    title: "Xây dựng portfolio nhiếp ảnh thu hút khách hàng cao cấp",
    excerpt:
      "Portfolio không chỉ là tập hợp ảnh đẹp — nó là câu chuyện về phong cách và giá trị của bạn. Học cách chọn lọc, sắp xếp và trình bày để tạo ấn tượng mạnh ngay lần xem đầu tiên.",
    author: "Minh Châu",
    authorAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&q=80",
    date: "15 tháng 5, 2026",
    readTime: "6 phút đọc",
    image: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "social-media-visuals",
    category: "Thương mại",
    categoryColor: "bg-orange-100 text-orange-700",
    title: "Thiết kế hình ảnh quảng cáo trên mạng xã hội cho photographer",
    excerpt:
      "Một bộ ảnh tốt cần được trình bày đúng cách trên Facebook, Instagram và TikTok. Bài viết hướng dẫn cách chọn layout, tiêu đề và màu sắc để tăng tỷ lệ click và tương tác.",
    author: "Mai Anh",
    authorAvatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=80&q=80",
    date: "2 tháng 5, 2026",
    readTime: "5 phút đọc",
    image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "brand-storytelling",
    category: "Nghệ thuật",
    categoryColor: "bg-fuchsia-100 text-fuchsia-700",
    title: "Kể chuyện thương hiệu qua bộ ảnh: kỹ thuật và cảm hứng",
    excerpt:
      "Một bộ ảnh đẹp cần mang cảm xúc, câu chuyện và giá trị thương hiệu. Hướng dẫn cách chọn bối cảnh, tạo biểu cảm và dẫn dắt người xem qua từng khung hình.",
    author: "Hồng Nhung",
    authorAvatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=80&q=80",
    date: "28 tháng 4, 2026",
    readTime: "6 phút đọc",
    image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "commerce-photography-tips",
    category: "Kinh doanh",
    categoryColor: "bg-cyan-100 text-cyan-700",
    title: "6 mẹo tăng doanh thu chụp ảnh sản phẩm cho studio nhỏ",
    excerpt:
      "Từ cách chốt hợp đồng đến gói giá linh hoạt, bài viết này giúp studio nhỏ tối ưu hóa lợi nhuận mà vẫn giữ chất lượng hình ảnh thương mại cao.",
    author: "Quốc Huy",
    authorAvatar: "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=80&q=80",
    date: "18 tháng 4, 2026",
    readTime: "7 phút đọc",
    image: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "street-portrait-trends",
    category: "Sáng tạo",
    categoryColor: "bg-pink-100 text-pink-700",
    title: "Xu hướng nhiếp ảnh chân dung đường phố 2026",
    excerpt:
      "Chân dung đường phố đang được tái hiện bằng màu sắc tươi tắn, bố cục táo bạo và góc chụp sáng tạo. Khám phá phong cách giúp bạn nổi bật giữa biển ảnh.",
    author: "Lê Dương",
    authorAvatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=80&q=80",
    date: "12 tháng 4, 2026",
    readTime: "5 phút đọc",
    image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "media-strategy-studio",
    category: "Truyền thông",
    categoryColor: "bg-violet-100 text-violet-700",
    title: "Chiến lược truyền thông hiệu quả cho studio nhiếp ảnh",
    excerpt:
      "Bài viết giúp studio xây dựng kế hoạch nội dung, chọn kênh truyền thông phù hợp và tăng tương tác khách hàng tiềm năng trong mùa cao điểm.",
    author: "Thu Hà",
    authorAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&q=80",
    date: "5 tháng 4, 2026",
    readTime: "6 phút đọc",
    image: "https://images.unsplash.com/photo-1485217988980-11786ced9454?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "ai-color-grading",
    category: "Công nghệ",
    categoryColor: "bg-violet-100 text-violet-700",
    title: "AI và color grading: tạo preset chuyên nghiệp chỉ trong vài phút",
    excerpt:
      "Từ tự động cân bằng trắng đến phong cách màu film, AI đang giúp nhiếp ảnh gia xử lý hậu kỳ nhanh hơn mà vẫn giữ chất lượng nghệ thuật.",
    author: "Lan Anh",
    authorAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=80&q=80",
    date: "1 tháng 4, 2026",
    readTime: "5 phút đọc",
    image: "https://images.unsplash.com/photo-1499084732479-de2c02d45fcc?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "wedding-lighting-guide",
    category: "Cưới hỏi",
    categoryColor: "bg-rose-100 text-rose-700",
    title: "Ánh sáng cưới đẹp: kỹ thuật chụp lễ và tiệc tối",
    excerpt:
      "Hướng dẫn setup ánh sáng cho lễ cưới sáng, tiệc tối và ảnh cưới review — giúp bạn chụp được khoảnh khắc trọn vẹn trong mọi điều kiện.",
    author: "Vy Phạm",
    authorAvatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=80&q=80",
    date: "28 tháng 3, 2026",
    readTime: "6 phút đọc",
    image: "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "editing-workflow",
    category: "Hậu kỳ",
    categoryColor: "bg-amber-100 text-amber-700",
    title: "Workflow hậu kỳ hiệu quả cho nhiếp ảnh gia: từ chọn ảnh đến xuất file",
    excerpt:
      "Giảm thời gian xử lý và giữ chất lượng ảnh bằng quy trình rõ ràng, bao gồm chọn ảnh, chỉnh màu, gom collection và xuất file đúng chuẩn.",
    author: "Nhật Long",
    authorAvatar: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=80&q=80",
    date: "22 tháng 3, 2026",
    readTime: "7 phút đọc",
    image: "https://images.unsplash.com/photo-1518779578993-ec3579fee39f?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "studio-pitching-guide",
    category: "Kinh nghiệm",
    categoryColor: "bg-emerald-100 text-emerald-700",
    title: "Bí quyết chốt hợp đồng studio nhanh gọn và chuyên nghiệp",
    excerpt:
      "Từ cuộc gọi đầu tiên đến hợp đồng cuối cùng, bài viết chia sẻ kịch bản thuyết phục khách hàng và cách cá nhân hóa dịch vụ để tăng tỉ lệ ký hợp đồng.",
    author: "Quỳnh Anh",
    authorAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=80&q=80",
    date: "18 tháng 3, 2026",
    readTime: "8 phút đọc",
    image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=900&q=80",
  },
];

export const categories = [
  "Tất cả",
  "Công nghệ",
  "Cưới hỏi",
  "Kinh nghiệm",
  "Thiết bị",
  "Hậu kỳ",
  "Thương mại",
  "Nghệ thuật",
  "Kinh doanh",
  "Sáng tạo",
  "Truyền thông",
];
