"use client";

import AdminLayout from "../_components/admin-layout";
import ContentManager from "../_components/content-manager";

const initialItems = [
  { id: "terms", title: "Chính sách & Quy định hoạt động", audience: "Tất cả thành viên", updatedAt: "19/08/2026", content: "Điều khoản chung khi sử dụng Sudion." },
  { id: "refund", title: "Chính sách hủy lịch và hoàn tiền", audience: "Khách hàng và Photographer", updatedAt: "19/08/2026", content: "Quy định hoàn tiền theo từng trường hợp." },
  { id: "privacy", title: "Chính sách bảo mật", audience: "Tất cả thành viên", updatedAt: "19/08/2026", content: "Cách Sudion bảo vệ dữ liệu." },
];

export default function PoliciesPage() {
  return <AdminLayout active="Chính sách"><ContentManager title="Quản lý chính sách" description="Quản lý nội dung chính sách được công bố cho khách hàng và photographer." storageKey="sudion_admin_policies" fields={[{ key: "title", label: "Tên chính sách" }, { key: "audience", label: "Đối tượng áp dụng" }, { key: "updatedAt", label: "Cập nhật ngày" }, { key: "content", label: "Nội dung", type: "textarea" }]} initialItems={initialItems} addLabel="Thêm chính sách" /></AdminLayout>;
}
