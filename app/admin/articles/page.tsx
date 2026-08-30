"use client";

import AdminLayout from "../_components/admin-layout";
import ContentManager from "../_components/content-manager";
import { articles } from "@/app/news/data";

const initialItems = articles.map((article) => ({ id: article.id, title: article.title, category: article.category, author: article.author, content: article.excerpt }));

export default function ArticlesPage() {
  return <AdminLayout active="Bài viết"><ContentManager title="Quản lý bài viết" description="Soạn, cập nhật và bật tắt bài viết trên trang tin tức Sudion." storageKey="sudion_admin_articles" fields={[{ key: "title", label: "Tiêu đề" }, { key: "category", label: "Danh mục" }, { key: "author", label: "Tác giả" }, { key: "content", label: "Nội dung tóm tắt", type: "textarea" }]} initialItems={initialItems} addLabel="Thêm bài viết" /></AdminLayout>;
}
