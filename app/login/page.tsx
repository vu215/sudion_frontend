import { RoutePlaceholder } from "../route-placeholder";

export default function LoginPage() {
  return (
    <RoutePlaceholder
      eyebrow="Đăng nhập"
      title="Đăng nhập sẽ được nối với hệ thống tài khoản"
      description="Trang này đang giữ chỗ cho luồng đăng nhập khách hàng và photographer."
      primaryHref="/register"
      primaryLabel="Tạo tài khoản"
    />
  );
}
