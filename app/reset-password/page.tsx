import { RoutePlaceholder } from "../route-placeholder";

export default function ResetPasswordPage() {
  return (
    <RoutePlaceholder
      eyebrow="Đặt lại mật khẩu"
      title="Đặt lại mật khẩu đang chờ tích hợp xác thực"
      description="Sau khi có backend, trang này sẽ nhận token khôi phục và cho phép người dùng tạo mật khẩu mới."
      primaryHref="/login"
      primaryLabel="Quay lại đăng nhập"
    />
  );
}
