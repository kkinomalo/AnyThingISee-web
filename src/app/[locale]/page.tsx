import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { use } from "react";
import { DownloadButton } from "@/components/download-button";
import { CodeSplit } from "@/components/home/code-split";
import { featureIcons } from "@/components/home/feature-icons";
import { HeroArt } from "@/components/home/hero-art";
import { ArrowRight, Check, ExternalArrow, Plus } from "@/components/icons";
import { Link } from "@/i18n/navigation";
import { external } from "@/lib/links";
import { fallbackRelease } from "@/lib/release";

type Feature = { title: string; sub: string; body: string };
type Item = { title: string; body: string };
type Row = { label: string; value: string };
type Faq = { q: string; a: string };

// 레이아웃 기준: hex-rays.com 메인 (히어로 상자 + 붙은 버전 배너 → 기능 카드 → 패널 → 활용 카드 → 표 → 패널 → 문의)
export default function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = use(params);
  setRequestLocale(locale);
  const t = useTranslations("Home");

  const releaseItems = t.raw("release.items") as string[];
  const strip = t.raw("strip") as string[];
  const features = t.raw("features.items") as Feature[];
  const steps = t.raw("flow.steps") as Item[];
  const rows = t.raw("setup.rows") as Row[];
  const faqs = t.raw("faq.items") as Faq[];

  return (
    <>
      {/* 히어로 상자 + 버전 배너 (헤더가 상자 위에 떠 있음) */}
      <div className="mx-auto -mt-[96px] w-full max-w-[1340px] px-3 sm:px-6">
        <section className="dots relative overflow-hidden rounded-t-xl border border-b-0 border-foreground/35 bg-surface px-5 [--dots:rgb(34_30_25/0.07)] xl:bg-none dark:[--dots:rgb(245_238_223/0.06)] pb-16 pt-[152px] sm:px-10 lg:pb-20 lg:pt-[168px]">
          <HeroArt className="pointer-events-none absolute inset-y-0 right-0 hidden h-full w-[68%] text-ink/45 xl:block dark:text-ivory-light/40" />
          <div className="relative mx-auto max-w-[1200px]">
            <div className="max-w-[640px]">
              <p className="text-sm font-semibold text-muted">{t("hero.eyebrow")}</p>
              <h1 className="display first-underline mt-4 whitespace-pre-line">{t("hero.title")}</h1>
              <p className="mt-5 max-w-[560px] leading-6">{t("hero.body")}</p>
              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
                <DownloadButton label={t("hero.download")} />
                <Link
                  href="/compare"
                  className="inline-flex items-center gap-2 font-semibold underline underline-offset-4"
                >
                  {t("hero.compare")}
                  <ArrowRight width={18} height={18} />
                </Link>
              </div>
              <p className="mt-4 font-mono text-xs text-muted">
                {t("hero.downloadMeta", { version: fallbackRelease.version })}
              </p>
            </div>
          </div>
        </section>

        <section
          aria-labelledby="release-title"
          className="dots relative overflow-hidden rounded-b-xl bg-ink px-5 py-12 text-ivory-light [--dots:rgb(245_238_223/0.09)] sm:px-10 lg:py-14"
        >
          <div className="mx-auto grid max-w-[1200px] items-center gap-10 lg:grid-cols-2">
            <div>
              <span className="inline-block rounded-full bg-accent px-3 py-1 text-xs font-bold text-ink">
                {t("release.badge")}
              </span>
              <h2 id="release-title" className="title mt-4">
                {t("release.title")}
              </h2>
              <p className="mt-3 max-w-md text-ivory-light/80">{t("release.body")}</p>
              <Link
                href="/releases"
                className="mt-7 inline-flex items-center gap-2 rounded-lg bg-[#fffdf7] px-6 py-3 font-semibold text-ink hover:bg-ivory"
              >
                {t("release.notes")}
                <ArrowRight width={18} height={18} />
              </Link>
            </div>
            <ul className="space-y-3">
              {releaseItems.map((item) => (
                <li key={item} className="flex gap-3">
                  <Check width={20} height={20} className="mt-0.5 shrink-0 text-accent" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>

      <div className="mx-auto w-full max-w-[1200px] px-6">
        {/* 지원 형식 띠 (mobbin 로고 줄 형식) */}
        <ul className="reveal flex flex-wrap items-center justify-center gap-x-10 gap-y-3 py-12 text-sm font-semibold text-muted">
          {strip.map((s) => (
            <li key={s} className="font-mono">
              {s}
            </li>
          ))}
        </ul>

        {/* 기능 카드 3열 */}
        <section aria-labelledby="features-title" className="pb-24 pt-6">
          <h2 id="features-title" className="title first-underline reveal">
            {t("features.title")}
          </h2>
          <p className="reveal mt-3 max-w-2xl text-muted">{t("features.body")}</p>
          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => {
              const Icon = featureIcons[i];
              return (
                <li key={f.title} className="card reveal p-6">
                  <span className="grid size-[50px] place-items-center rounded-[7px] bg-card shadow-[0_0_4px_0_rgb(242_195_80/0.45)] ring-1 ring-border">
                    {Icon && <Icon />}
                  </span>
                  <h3 className="subtitle mt-10">{f.title}</h3>
                  <p className="mt-2 font-semibold">{f.sub}</p>
                  <p className="mt-3 text-muted">{f.body}</p>
                </li>
              );
            })}
          </ul>
        </section>

        {/* 코드 연결 패널 (hex-rays 플러그인 패널 형식) */}
        <section
          aria-labelledby="linked-title"
          className="dots reveal grid items-center gap-10 rounded-xl border border-border bg-surface p-6 sm:p-10 lg:grid-cols-[0.9fr_1.1fr]"
        >
          <div>
            <h2 id="linked-title" className="title first-underline">
              {t("linked.title")}
            </h2>
            <p className="mt-4 text-muted">{t("linked.body")}</p>
            <a
              href={external.guide}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-7 inline-flex items-center gap-2 rounded-lg bg-cta px-6 py-3 font-semibold text-cta-foreground hover:opacity-90"
            >
              {t("linked.cta")}
              <ExternalArrow width={16} height={16} />
            </a>
          </div>
          <div>
            <CodeSplit label={t("hero.visualLabel")} />
            <p className="mt-3 text-xs text-muted">{t("linked.note")}</p>
          </div>
        </section>

        {/* 사용 흐름 4열 카드 (hex-rays 활용 사례 형식) */}
        <section aria-labelledby="flow-title" className="py-24">
          <h2 id="flow-title" className="title first-underline reveal">
            {t("flow.title")}
          </h2>
          <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s, i) => (
              <li key={s.title} className="card reveal flex flex-col p-6">
                <h3 className="text-lg font-semibold">{s.title}</h3>
                <p className="mt-2 flex-1 text-muted">{s.body}</p>
                <span className="mt-6 grid size-9 place-items-center rounded-md border border-border font-mono text-sm font-semibold">
                  {i + 1}
                </span>
              </li>
            ))}
          </ol>
        </section>

        {/* 설치 환경 표 (hex-rays 에디션 비교 자리) */}
        <section aria-labelledby="setup-title" className="grid gap-10 pb-24 lg:grid-cols-[1fr_1.4fr]">
          <div className="reveal">
            <h2 id="setup-title" className="title first-underline">
              {t("setup.title")}
            </h2>
            <p className="mt-4 text-muted">{t("setup.body")}</p>
            <Link
              href="/download"
              className="mt-7 inline-flex items-center gap-2 font-semibold underline underline-offset-4"
            >
              {t("hero.download")}
              <ArrowRight width={18} height={18} />
            </Link>
          </div>
          <dl className="card reveal divide-y divide-border px-6">
            {rows.map((r) => (
              <div key={r.label} className="grid gap-1 py-4 sm:grid-cols-[10rem_1fr] sm:gap-4">
                <dt className="text-sm font-semibold text-muted">{r.label}</dt>
                <dd>{r.value}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* 성능 비교 패널 (hex-rays 교육 과정 패널 형식) */}
        <section className="dots reveal grid items-center gap-8 rounded-xl border border-border bg-accent/25 p-6 [--dots:rgb(34_30_25/0.1)] sm:p-10 lg:grid-cols-[1fr_auto]">
          <div className="max-w-2xl">
            <h2 className="title first-underline">{t("compare.title")}</h2>
            <p className="mt-4">{t("compare.body")}</p>
          </div>
          <Link
            href="/compare"
            className="inline-flex w-fit items-center gap-2 rounded-lg bg-cta px-6 py-3 font-semibold text-cta-foreground hover:opacity-90"
          >
            {t("compare.cta")}
            <ArrowRight width={18} height={18} />
          </Link>
        </section>

        {/* FAQ */}
        <section aria-labelledby="faq-title" className="py-24">
          <h2 id="faq-title" className="title first-underline reveal">
            {t("faq.title")}
          </h2>
          <div className="mt-10 divide-y divide-border border-y border-border">
            {faqs.map((f) => (
              <details key={f.q} className="group">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-lg font-semibold [&::-webkit-details-marker]:hidden">
                  {f.q}
                  <span className="grid size-9 shrink-0 place-items-center rounded-md border border-border">
                    <Plus width={18} height={18} className="transition-transform group-open:rotate-45" />
                  </span>
                </summary>
                <p className="max-w-3xl pb-6 text-muted">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* 문의 (hex-rays "Still have questions?" 형식) */}
        <section className="reveal flex flex-col items-center pb-8 text-center">
          <h2 className="title first-underline">{t("contact.title")}</h2>
          <p className="mt-3 max-w-xl text-muted">{t("contact.body")}</p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <a
              href={external.issues}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-foreground/70 px-6 py-3 font-semibold hover:bg-foreground/5"
            >
              {t("contact.issues")}
              <ArrowRight width={18} height={18} />
            </a>
            <a
              href={external.guide}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-foreground/70 px-6 py-3 font-semibold hover:bg-foreground/5"
            >
              {t("contact.guide")}
              <ArrowRight width={18} height={18} />
            </a>
          </div>
        </section>
      </div>
    </>
  );
}
