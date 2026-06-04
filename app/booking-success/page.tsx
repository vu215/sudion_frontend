import { RoutePlaceholder } from "../route-placeholder";

export default function BookingSuccessPage() {
  return (
    <RoutePlaceholder
      eyebrow="Đặt lịch thành công"
      title="Màn xác nhận booking sẽ nằm tại đây"
      description="Sau khi hoàn tất form đặt lịch, trang này sẽ hiển thị mã booking, thông tin photographer và bước tiếp theo."
      primaryHref="/bookings"
      primaryLabel="Xem lịch đặt"
    />
  );
}
