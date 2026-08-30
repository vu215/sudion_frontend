"use client";

import AdminLayout from "../_components/admin-layout";
import ContentManager from "../_components/content-manager";

const initialItems = [
  { id: "camera", name: "Máy ảnh", slug: "may-anh", description: "Máy ảnh mirrorless và DSLR" },
  { id: "lens", name: "Ống kính", slug: "ong-kinh", description: "Ống kính chính hãng" },
  { id: "accessories", name: "Phụ kiện", slug: "phu-kien", description: "Pin, thẻ nhớ và phụ kiện" },
];

export default function ProductCategoriesPage() {
  return <AdminLayout active="Danh mục bán hàng"><ContentManager title="Quản lý danh mục bán hàng" description="Tạo và cập nhật nhóm sản phẩm hiển thị trong cửa hàng máy ảnh." storageKey="sudion_admin_product_categories" fields={[{ key: "name", label: "Tên danh mục", placeholder: "Ví dụ: Máy ảnh" }, { key: "slug", label: "Đường dẫn", placeholder: "may-anh" }, { key: "description", label: "Mô tả", type: "textarea" }]} initialItems={initialItems} addLabel="Thêm danh mục" /></AdminLayout>;
}
