"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  formatCurrency,
  getMyPhotographerProfile,
  getPhotographerPublicProfile,
  type PhotographerPackage,
} from "../photographer-api";

export default function PhotographerServicesPage() {
  const [packages, setPackages] = useState<PhotographerPackage[]>([]);
  const [photographerId, setPhotographerId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;

    async function load() {
      try {
        setLoading(true);
        setError("");
        const me = await getMyPhotographerProfile();
        const id = String(me.photographer_id || me.photographer?.id || "");
        const publicProfile = id ? await getPhotographerPublicProfile(id) : null;
        if (!alive) return;
        setPhotographerId(id);
        setPackages(publicProfile?.packages || []);
      } catch (err) {
        if (alive) setError(err instanceof Error ? err.message : "Không thể tải dịch vụ.");
      } finally {
        if (alive) setLoading(false);
      }
    }

    void load();
    return () => {
      alive = false;
    };
  }, []);

  return (
    <main className="px-6 py-7 lg:px-8 xl:px-10">
      <div className="mx-auto max-w-[1080px] space-y-6 pb-10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#1a1a2e]">Dịch vụ</h1>
            <p className="mt-1 text-sm text-slate-500">
              Danh sách gói chụp đang hiển thị cho khách hàng.
            </p>
          </div>
          <Link
            href="/profile"
            className="rounded-xl bg-[#ff8d28] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#e07820]"
          >
            Cập nhật hồ sơ
          </Link>
        </div>

        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-600">
            {error}
          </div>
        ) : null}

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          {loading ? (
            <div className="grid gap-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="h-24 animate-pulse rounded-2xl bg-slate-100" />
              ))}
            </div>
          ) : packages.length ? (
            <div className="grid gap-4">
              {packages.map((item) => (
                <article
                  key={item.id}
                  className="grid gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:grid-cols-[1fr_auto]"
                >
                  <div>
                    <p className="text-base font-bold text-slate-900">{item.name}</p>
                    <p className="mt-1 text-xs font-semibold text-slate-500">
                      {item.category?.name || "Dịch vụ"} · {item.duration_text || "Theo gói"}
                    </p>
                    <p className="mt-3 text-sm leading-6 text-slate-600">
                      {item.description || "Chưa có mô tả chi tiết."}
                    </p>
                  </div>
                  <div className="sm:text-right">
                    <p className="text-lg font-black text-[#ff8d28]">{formatCurrency(item.price)}</p>
                    {photographerId ? (
                      <Link
                        href={`/photographer/${photographerId}`}
                        className="mt-3 inline-flex rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 transition hover:border-orange-200 hover:text-[#ff8d28]"
                      >
                        Xem public profile
                      </Link>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-slate-600">
              Chưa có gói dịch vụ nào. Hãy cập nhật hồ sơ photographer để khách có thể đặt lịch.
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
