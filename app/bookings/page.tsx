import { RoutePlaceholder } from "../route-placeholder";

export default function BookingsPage() {
  return (
    <RoutePlaceholder
      eyebrow="Booking history"
      title="Lịch sử đặt lịch sẽ được hiển thị tại đây"
      description="Sau khi có backend, trang này sẽ theo dõi yêu cầu đặt lịch, trạng thái thanh toán, lịch hẹn và trao đổi với photographer."
      primaryHref="/booking"
      primaryLabel="Đặt lịch mới"
    />
  );
}
