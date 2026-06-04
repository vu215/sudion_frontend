import { RoutePlaceholder } from "../route-placeholder";

export default function MessagesPage() {
  return (
    <RoutePlaceholder
      eyebrow="Tin nhắn"
      title="Tin nhắn giữa khách hàng và photographer sẽ được nối sau"
      description="Đây sẽ là nơi trao đổi concept, lịch chụp, file tham khảo và cập nhật trạng thái booking."
      primaryHref="/booking"
      primaryLabel="Tạo booking"
    />
  );
}
