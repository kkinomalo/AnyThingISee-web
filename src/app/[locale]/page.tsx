import { getFormatter, getTranslations, setRequestLocale } from "next-intl/server";
import { CodeDemo } from "@/components/home/code-demo";
import { DownloadCta } from "@/components/home/download-cta";
import { featureIcons } from "@/components/home/feature-icons";
import { ArrowRight, ExternalArrow, Plus } from "@/components/icons";
import { Link } from "@/i18n/navigation";
import { formatBytes } from "@/lib/format";
import { getLatestRelease } from "@/lib/github";
import { external } from "@/lib/links";

type Item = { title: string; body: string };
type Faq = { q: string; a: string };

// 섹션 순서: 히어로(+데모) → 기능 → 처음 쓰는 순서 → 성능 비교 → FAQ → 다운로드
export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Home");
  const format = await getFormatter();

  const release = await getLatestRelease();
  const installer = release.installer;
  const date = release.publishedAt
    ? format.dateTime(new Date(release.publishedAt), { dateStyle: "medium" })
    : "";
  const meta = t("hero.meta", {
    size: installer ? formatBytes(installer.size) : "",
    version: release.version,
  });

  const features = t.raw("features.items") as Item[];
  const steps = t.raw("flow.steps") as Item[];
  const faqs = t.raw("faq.items") as Faq[];

  const cta = installer && (
    <DownloadCta
      href={installer.url}
      label={t("hero.download")}
      macLabel={t("hero.mac")}
      windowsLinkLabel={t("hero.windowsLink")}
    />
  );

  return (
    <div className="mx-auto w-full max-w-[1200px] px-6">
      {/* 히어로 */}
      <section className="grid items-center gap-12 pb-24 pt-10 lg:grid-cols-[1fr_1.05fr] lg:pt-16 [&>*]:min-w-0">
        <div>
          <Link
            href={`/releases/${release.tag}`}
            className="inline-flex flex-wrap items-center gap-x-2 rounded-full border border-border bg-surface px-3.5 py-1.5 text-sm hover:border-muted"
          >
            <span className="font-semibold">{t("hero.badge", { version: release.version, date })}</span>
            <span aria-hidden className="text-muted">·</span>
            <span className="inline-flex items-center gap-1 text-accent">
              {t("hero.notes")}
              <ArrowRight width={14} height={14} />
            </span>
          </Link>
          <p className="mt-8 text-sm font-semibold text-muted">{t("hero.eyebrow")}</p>
          <h1 className="mt-3 whitespace-pre-line">{t("hero.title")}</h1>
          <p className="mt-6 max-w-[34rem] text-muted">{t("hero.body")}</p>
          <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-4">
            {cta}
            <Link href="/download#verify" className="text-link text-sm">
              {t("hero.warning")}
            </Link>
          </div>
          <p className="mt-4 font-mono text-sm text-muted">{meta}</p>
        </div>

        {/* 데모 (실제 앱 화면을 받으면 같은 자리에 스크린샷 · 짧은 영상 추가) */}
        <div>
          <h2 className="sr-only">{t("demo.title")}</h2>
          <CodeDemo />
          <p className="mt-3 text-sm text-muted">{t("demo.body")}</p>
          <p className="mt-1 text-xs text-muted">{t("demo.note")}</p>
        </div>
      </section>

      {/* 기능 */}
      <section aria-labelledby="features-title" className="border-t border-border py-24">
        <h2 id="features-title">{t("features.title")}</h2>
        <p className="mt-4 max-w-2xl text-muted">{t("features.body")}</p>
        <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => {
            const Icon = featureIcons[i];
            return (
              <li key={f.title} className="card p-7">
                {Icon && <Icon className="text-ink" />}
                <h3 className="mt-6">{f.title}</h3>
                <p className="mt-2 text-muted">{f.body}</p>
              </li>
            );
          })}
        </ul>
      </section>

      {/* 처음 쓰는 순서 */}
      <section aria-labelledby="flow-title" className="border-t border-border py-24">
        <h2 id="flow-title">{t("flow.title")}</h2>
        <ol className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <li key={s.title} className="card flex flex-col p-7">
              <span className="font-mono text-sm font-semibold text-muted">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="mt-4">{s.title}</h3>
              <p className="mt-2 text-muted">{s.body}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* 성능 비교 (데이터 공개 전) */}
      <section className="grid items-center gap-8 rounded-2xl bg-ink p-8 text-on-ink sm:p-12 lg:grid-cols-[1fr_auto]">
        <div className="max-w-2xl">
          <h2>{t("compare.title")}</h2>
          <p className="mt-4 text-on-ink-muted">{t("compare.body")}</p>
        </div>
        <span className="inline-flex w-fit items-center rounded-lg border border-on-ink/30 px-6 py-3 font-semibold text-on-ink-muted">
          {t("compare.cta")}
        </span>
      </section>

      {/* FAQ */}
      <section aria-labelledby="faq-title" className="py-24">
        <h2 id="faq-title">{t("faq.title")}</h2>
        <div className="mt-10 divide-y divide-border border-y border-border">
          {faqs.map((f) => (
            <details key={f.q} className="group">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-lg font-semibold [&::-webkit-details-marker]:hidden">
                {f.q}
                <span className="grid size-9 shrink-0 place-items-center rounded-md border border-border">
                  <Plus width={18} height={18} className="transition-transform group-open:rotate-45 motion-reduce:transition-none" />
                </span>
              </summary>
              <p className="max-w-3xl pb-6 text-muted">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* 다운로드 */}
      <section className="card flex flex-col items-center px-6 py-16 text-center">
        <h2>{t("download.title")}</h2>
        <p className="mt-4 max-w-xl text-muted">{t("download.body")}</p>
        <div className="mt-8">{cta}</div>
        <p className="mt-4 font-mono text-sm text-muted">{meta}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <a
            href={external.issues}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-ink/70 px-6 py-3 font-semibold transition-colors hover:bg-ink/5"
          >
            {t("download.issues")}
            <ExternalArrow width={16} height={16} />
          </a>
          <a
            href={external.guide}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-ink/70 px-6 py-3 font-semibold transition-colors hover:bg-ink/5"
          >
            {t("download.guide")}
            <ExternalArrow width={16} height={16} />
          </a>
        </div>
      </section>
    </div>
  );
}
