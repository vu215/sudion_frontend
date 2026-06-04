import Link from "next/link";

type RoutePlaceholderProps = {
  eyebrow: string;
  title: string;
  description: string;
  primaryHref?: string;
  primaryLabel?: string;
};

export function RoutePlaceholder({
  eyebrow,
  title,
  description,
  primaryHref = "/photographer",
  primaryLabel = "Khám phá photographer",
}: RoutePlaceholderProps) {
  return (
    <main className="min-h-[64vh] bg-[#fafbfc] text-[#0e111d]">
      <section className="mx-auto grid w-full max-w-[960px] gap-6 px-6 py-20 md:px-12 lg:px-20">
        <p data-reveal className="text-[12px] font-black uppercase tracking-[0.18em] text-[#ff8d28]">
          {eyebrow}
        </p>
        <h1 data-reveal data-reveal-delay="80" className="max-w-[720px] text-[38px] font-black leading-[1.08] tracking-[-0.03em] text-[#0e111d] sm:text-[48px]">
          {title}
        </h1>
        <p data-reveal data-reveal-delay="160" className="max-w-[640px] text-[16px] font-medium leading-7 text-[#4b5563] sm:text-[18px]">
          {description}
        </p>
        <div data-reveal data-reveal-delay="240" className="flex flex-wrap gap-3 pt-2">
          <Link
            href={primaryHref}
            className="rounded-lg bg-[#ff8d28] px-5 py-3 text-[14px] font-bold text-white shadow-[0_6px_14px_rgba(255,141,40,0.15)] transition-all hover:translate-y-[-1px] hover:bg-[#e0751b]"
          >
            {primaryLabel}
          </Link>
          <Link
            href="/"
            className="rounded-lg border border-[#e8eaf1] bg-white px-5 py-3 text-[14px] font-bold text-[#4b5563] transition-colors hover:text-[#0e111d]"
          >
            Về trang chủ
          </Link>
        </div>
      </section>
    </main>
  );
}
