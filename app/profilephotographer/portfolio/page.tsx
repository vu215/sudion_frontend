"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  getMyPhotographerProfile,
  getPhotographerPublicProfile,
  type PhotographerPackage,
} from "../photographer-api";

export default function PhotographerPortfolioPage() {
  const [portfolio, setPortfolio] = useState<string[]>([]);
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
        setPortfolio(publicProfile?.portfolio || []);
        setPackages(publicProfile?.packages || []);
      } catch (err) {
        if (alive) setError(err instanceof Error ? err.message : "Không thể tải portfolio.");
      } finally {
        if (alive) setLoading(false);
      }
    }

    void load();
    return () => {
      alive = false;
    };
  }, []);

  const packageImages = useMemo(() => {
    return packages.flatMap((item) => item.portfolio_images || []).filter(Boolean);
  }, [packages]);

  const images = portfolio.length ? portfolio : packageImages;

  return (
    <main className="px-6 py-7 lg:px-8 xl:px-10">
      <div className="mx-auto max-w-[1080px] space-y-6 pb-10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#1a1a2e]">Portfolio</h1>
            <p className="mt-1 text-sm text-slate-500">
              Ảnh mẫu đang được tổng hợp từ các gói dịch vụ của bạn.
            </p>
          </div>
          <Link
            href="/profile"
            className="inline-flex items-center justify-center rounded-xl bg-[#ff8d28] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#e07820]"
          >
            Cập nhật ảnh
          </Link>
        </div>

        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-600">
            {error}
          </div>
        ) : null}

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="min-h-[220px] animate-pulse rounded-[1.5rem] bg-slate-100" />
              ))}
            </div>
          ) : images.length ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {images.map((src, index) => (
                <a
                  key={`${src}-${index}`}
                  href={src}
                  target="_blank"
                  rel="noreferrer"
                  className="group overflow-hidden rounded-[1.5rem] border border-slate-200 bg-slate-50"
                >
                  <img
                    src={src}
                    alt={`Portfolio ${index + 1}`}
                    className="h-[240px] w-full object-cover transition duration-300 group-hover:scale-105"
                  />
                </a>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500">
              Chưa có ảnh portfolio nào. Thêm ảnh trong hồ sơ hoặc trong gói dịch vụ để ảnh xuất hiện tại đây.
              {photographerId ? (
                <div className="mt-4">
                  <Link
                    href={`/photographer/${photographerId}`}
                    className="font-bold text-[#ff8d28]"
                  >
                    Xem public profile
                  </Link>
                </div>
              ) : null}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
