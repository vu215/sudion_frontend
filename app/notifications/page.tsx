import { RoutePlaceholder } from "../route-placeholder";

export default function NotificationsPage() {
  return (
    <RoutePlaceholder
      eyebrow="Thông báo"
      title="Thông báo hệ thống sẽ được kết nối sau"
      description="Khu vực này sẽ báo booking mới, phản hồi từ photographer, nhắc lịch chụp và cập nhật trạng thái đơn."
      primaryHref="/bookings"
      primaryLabel="Xem lịch đặt"
    />
  );
}
