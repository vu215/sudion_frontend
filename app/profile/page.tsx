import { RoutePlaceholder } from "../route-placeholder";

export default function ProfilePage() {
  return (
    <RoutePlaceholder
      eyebrow="Hồ sơ"
      title="Hồ sơ khách hàng đang được chuẩn bị"
      description="Trang này sẽ quản lý thông tin cá nhân, lịch sử đặt lịch, địa chỉ liên hệ và sở thích phong cách chụp."
      primaryHref="/profilephotographer"
      primaryLabel="Xem hồ sơ photographer"
    />
  );
}
