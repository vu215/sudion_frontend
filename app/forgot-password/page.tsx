import { RoutePlaceholder } from "../route-placeholder";

export default function ForgotPasswordPage() {
  return (
    <RoutePlaceholder
      eyebrow="Khôi phục mật khẩu"
      title="Luồng khôi phục mật khẩu sẽ được kết nối sau"
      description="Trang này sẽ gửi email xác thực và hướng dẫn người dùng đặt lại mật khẩu an toàn."
      primaryHref="/login"
      primaryLabel="Quay lại đăng nhập"
    />
  );
}
