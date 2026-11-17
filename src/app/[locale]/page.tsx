import Image from "next/image";
import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { use } from "react";
import { DownloadButton } from "@/components/download-button";
import { CodeSplit } from "@/components/home/code-split";
import { ArrowRight, Check, Plus } from "@/components/icons";
import { Link } from "@/i18n/navigation";
import { fallbackRelease } from "@/lib/release";

type Item = { title: string; body: string };
type Row = { label: string; value: string };
type Faq = { q: string; a: string };

export default function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = use(params);
  setRequestLocale(locale);
  const t = useTranslations("Home");

  const releaseItems = t.raw("release.items") as string[];
  const features = t.raw("features.items") as Item[];
  const steps = t.raw("flow.steps") as Item[];
  const rows = t.raw("setup.rows") as Row[];
  const faqs = t.raw("faq.items") as Faq[];

  return (
    <div className="mx-auto w-full max-w-[1200px] px-6">
      {/* 히어로 */}
      <section className="grid items-center gap-12 pb-20 pt-12 lg:grid-cols-[1.05fr_1fr] lg:pt-20">
        <div>
          <p className="text-sm font-semibold text-muted">{t("hero.eyebrow")}</p>
          <h1 className="mt-4 whitespace-pre-line text-4xl font-bold leading-[1.15] tracking-tight sm:text-5xl">
            {t("hero.title")}
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">{t("hero.body")}</p>
          <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-4">
            <DownloadButton label={t("hero.download")} />
            <Link
              href="/compare"
              className="inline-flex items-center gap-2 font-semibold underline decoration-foreground/30 underline-offset-4 hover:decoration-foreground"
            >
              {t("hero.compare")}
              <ArrowRight width={18} height={18} />
            </Link>
          </div>
          <p className="mt-4 font-mono text-xs text-muted">
            {t("hero.downloadMeta", { version: fallbackRelease.version })}
          </p>
        </div>
        <CodeSplit label={t("hero.visualLabel")} />
      </section>

      {/* 최신 버전 배너 */}
      <section
        aria-labelledby="release-title"
        className="grid gap-10 rounded-2xl bg-ink p-8 text-ivory-light sm:p-12 lg:grid-cols-2"
      >
        <div>
          <span className="inline-block rounded-full bg-accent px-3 py-1 text-xs font-bold text-ink">
            {t("release.badge")}
          </span>
          <h2 id="release-title" className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
            {t("release.title")}
          </h2>
          <p className="mt-4 max-w-md leading-relaxed text-ivory-light/75">{t("release.body")}</p>
          <Link
            href="/releases"
            className="mt-8 inline-flex items-center gap-2 rounded-lg bg-ivory px-6 py-3 font-semibold text-ink hover:bg-ivory-light"
          >
            {t("release.notes")}
            <ArrowRight width={18} height={18} />
          </Link>
        </div>
        <ul className="space-y-4 self-center">
          {releaseItems.map((item) => (
            <li key={item} className="flex gap-3">
              <Check width={20} height={20} className="mt-0.5 shrink-0 text-accent" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* 기능 */}
      <section aria-labelledby="features-title" className="py-24">
        <h2 id="features-title" className="text-3xl font-bold tracking-tight sm:text-4xl">
          {t("features.title")}
        </h2>
        <p className="mt-4 max-w-2xl text-lg text-muted">{t("features.body")}</p>
        <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <li key={f.title} className="rounded-xl bg-header p-7 shadow-float">
              <span className="font-mono text-sm text-muted">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="mt-3 text-lg font-bold">{f.title}</h3>
              <p className="mt-2 leading-relaxed text-muted">{f.body}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* 사용 흐름 */}
      <section aria-labelledby="flow-title" className="border-t border-foreground/10 py-24">
        <h2 id="flow-title" className="text-3xl font-bold tracking-tight sm:text-4xl">
          {t("flow.title")}
        </h2>
        <ol className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <li key={s.title} className="relative">
              <span className="grid size-10 place-items-center rounded-full bg-ink font-mono text-sm font-bold text-accent">
                {i + 1}
              </span>
              <h3 className="mt-5 text-lg font-bold">{s.title}</h3>
              <p className="mt-2 leading-relaxed text-muted">{s.body}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* 설치 환경 */}
      <section
        aria-labelledby="setup-title"
        className="grid gap-10 border-t border-foreground/10 py-24 lg:grid-cols-[1fr_1.3fr]"
      >
        <div>
          <h2 id="setup-title" className="text-3xl font-bold tracking-tight sm:text-4xl">
            {t("setup.title")}
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-muted">{t("setup.body")}</p>
        </div>
        <dl className="divide-y divide-foreground/10 rounded-xl bg-header px-6 shadow-float">
          {rows.map((r) => (
            <div key={r.label} className="grid gap-1 py-4 sm:grid-cols-[10rem_1fr] sm:gap-4">
              <dt className="text-sm font-semibold text-muted">{r.label}</dt>
              <dd>{r.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* 성능 비교 안내 */}
      <section className="flex flex-col items-start justify-between gap-6 rounded-2xl bg-header p-8 shadow-float sm:p-12 lg:flex-row lg:items-center">
        <div className="max-w-2xl">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{t("compare.title")}</h2>
          <p className="mt-3 leading-relaxed text-muted">{t("compare.body")}</p>
        </div>
        <Link
          href="/compare"
          className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-cta px-6 py-3 font-semibold text-cta-foreground hover:opacity-90"
        >
          {t("compare.cta")}
          <ArrowRight width={18} height={18} />
        </Link>
      </section>

      {/* FAQ */}
      <section aria-labelledby="faq-title" className="py-24">
        <h2 id="faq-title" className="text-3xl font-bold tracking-tight sm:text-4xl">
          {t("faq.title")}
        </h2>
        <div className="mt-10 divide-y divide-foreground/10 border-y border-foreground/10">
          {faqs.map((f) => (
            <details key={f.q} className="group">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-lg font-semibold [&::-webkit-details-marker]:hidden">
                {f.q}
                <Plus className="shrink-0 transition-transform group-open:rotate-45" />
              </summary>
              <p className="max-w-3xl pb-6 leading-relaxed text-muted">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* 마지막 다운로드 */}
      <section className="flex flex-col items-center rounded-2xl bg-ink px-8 py-16 text-center text-ivory-light">
        <Image src="/brand/logo.svg" alt="" width={64} height={64} />
        <h2 className="mt-6 text-3xl font-bold tracking-tight sm:text-4xl">{t("cta.title")}</h2>
        <p className="mt-3 text-ivory-light/75">{t("cta.body")}</p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-4">
          <DownloadButton label={t("cta.download")} variant="ivory" />
          <Link href="/download" className="font-semibold underline underline-offset-4">
            {t("cta.more")}
          </Link>
        </div>
      </section>
    </div>
  );
}
