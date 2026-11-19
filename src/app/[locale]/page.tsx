import Image from "next/image";
import { getFormatter, getTranslations, setRequestLocale } from "next-intl/server";
import { CodeDemo } from "@/components/home/code-demo";
import { FeatureIcon, type FeatureIconName } from "@/components/home/feature-icon";
import { GlowGrid } from "@/components/home/glow-grid";
import { Screenshot } from "@/components/home/screenshot";
import { ArrowRight, Check } from "@/components/icons";
import { Link } from "@/i18n/navigation";
import { getLatestRelease } from "@/lib/github";
import releaseBand from "../../../public/images/release-band.jpg";
import cEn from "../../../public/screens/c-en.webp";
import cJa from "../../../public/screens/c-ja.webp";
import cKo from "../../../public/screens/c-ko.webp";
import graphEn from "../../../public/screens/graph-en.webp";
import graphJa from "../../../public/screens/graph-ja.webp";
import graphKo from "../../../public/screens/graph-ko.webp";
import startEn from "../../../public/screens/start-en.webp";
import startJa from "../../../public/screens/start-ja.webp";

type Item = { title: string; body: string };
type Faq = { q: string; a: string };

// 시안 #28: 카드 · 어두운 블록 없이 여백 · 선 · 번호 · 큰 글자로 구성
// 순서: 히어로 → 실제 화면(지그재그) → 기능(+코드 데모) → 처음 쓰는 순서 → 성능 비교 → FAQ → 다운로드
export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Home");
  const format = await getFormatter();

  const release = await getLatestRelease();
  const date = release.publishedAt
    ? format.dateTime(new Date(release.publishedAt), { dateStyle: "medium" })
    : "";

  const features = t.raw("features.items") as (Item & { icon: FeatureIconName; lead: string })[];
  const steps = t.raw("flow.steps") as Item[];
  const faqs = t.raw("faq.items") as Faq[];
  const releaseItems = t.raw("release.items") as string[];
  // 앱 화면: ko · ja는 각 언어 화면, 그 외는 영어 화면
  const shot = { zoomLabel: t("screens.zoom"), closeLabel: t("screens.close") };
  const tour = t.raw("tour.items") as { label: string; title: string; body: string; points: string[] }[];
  // 언어별 앱 화면 (한국어 시작 화면은 아직 없어 영어판 사용)
  const shots = {
    ko: [cKo, graphKo, startEn],
    ja: [cJa, graphJa, startJa],
    en: [cEn, graphEn, startEn],
  };
  const tourShots = shots[locale as keyof typeof shots] ?? shots.en;
  const tourAlts = [t("screens.cAlt"), t("screens.graphAlt"), t("screens.startAlt")];


  return (
    <>
      {/* 히어로: 헤더가 겹쳐 올라가는 큰 박스 + 아래 릴리스 띠 (#32) */}
      <div className="-mt-[70px] px-1.5 sm:-mt-[74px] sm:px-2.5 lg:-mt-[80px]">
        <section className="dot-grid mx-auto max-w-[1440px] overflow-hidden rounded-2xl border border-border">
          <div className="mx-auto max-w-[1200px] px-5 pb-16 pt-[120px] sm:px-8 lg:pb-24 lg:pt-[184px]">
            <h1 className="max-w-[17em]">
              {t.rich("hero.title", {
                u: (chunks) => <span className="underline decoration-[0.06em] underline-offset-[0.12em]">{chunks}</span>,
              })}
            </h1>
            <p className="mt-7 max-w-[40rem] text-lg">{t("hero.body")}</p>
            <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-5">
              <Link
                href="/download"
                className="inline-flex items-center gap-2 rounded-lg bg-cta-dark px-7 py-3.5 font-semibold text-white transition-colors hover:bg-cta-dark-hover"
              >
                {t("hero.goDownload")}
                <ArrowRight width={18} height={18} />
              </Link>
              <a href="#features" className="inline-flex items-center gap-2 font-semibold underline underline-offset-4 hover:text-accent">
                {t("hero.explore")}
                <ArrowRight width={18} height={18} />
              </a>
            </div>
            <p className="mt-6 text-sm text-muted">
              <Link href="/download#verify" className="underline underline-offset-4 hover:text-accent">
                {t("hero.warning")}
              </Link>
            </p>
          </div>

          {/* 릴리스 띠 */}
          <div className="relative isolate">
            <Image
              src={releaseBand}
              alt=""
              fill
              sizes="(min-width: 1440px) 1440px, 100vw"
              placeholder="blur"
              className="-z-20 object-cover object-[50%_44%] brightness-[0.88]"
            />
            {/* 레퍼런스와 같은 방향: 왼쪽 단색 → 42% 지점 → 오른쪽으로 옅어짐. 흰 글자 대비를 위해 끝까지 완전히 투명하게는 두지 않는다 */}
            <div
              aria-hidden
              className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,rgba(176,96,56,1)_0%,rgba(170,92,54,0.92)_42.31%,rgba(160,86,50,0.5)_100%)]"
            />
            <div className="mx-auto grid max-w-[1200px] gap-x-16 gap-y-8 px-5 py-12 text-white [text-shadow:0_1px_2px_rgb(0_0_0/0.25)] sm:px-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:py-14">
              <div>
                <p className="text-sm font-semibold">
                  {t("release.label")}
                  {date && <span className="font-normal"> · {date}</span>}
                </p>
                <h2 className="mt-2 text-[clamp(2rem,1.6rem+1.4vw,2.75rem)]">{release.version}</h2>
                <p className="mt-4 max-w-[30rem] text-lg">{t("release.summary")}</p>
                <Link
                  href={`/releases/${release.tag}`}
                  className="mt-8 inline-flex items-center gap-2 rounded-lg bg-surface px-6 py-3.5 font-semibold text-ink shadow-float [text-shadow:none] hover:bg-background"
                >
                  {t("release.cta")}
                  <ArrowRight width={18} height={18} />
                </Link>
              </div>
              <ul className="space-y-3 self-center text-[17px]">
                {releaseItems.map((item) => (
                  <li key={item} className="flex gap-3">
                    <Check width={20} height={20} className="mt-[3px] shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </div>

    <div className="mx-auto w-full max-w-[1200px] px-6">
      {/* 실제 화면: 사진 · 글을 번갈아 (지그재그) */}
      <section aria-labelledby="tour-title" className="overflow-x-clip pt-28 lg:pt-36">
        <h2 id="tour-title" className="sr-only">
          {t("tour.title")}
        </h2>
        <div className="space-y-24 lg:space-y-32">
          {tour.map((item, i) => (
            <article
              key={item.label}
              className={`grid items-center gap-x-14 gap-y-8 ${
                i % 2 === 1 ? "lg:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)]" : "lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]"
              }`}
            >
              <div className={`reveal-shot ${i % 2 === 1 ? "from-right lg:order-2" : ""}`}>
                <Screenshot src={tourShots[i]} alt={tourAlts[i]} sizes="(min-width: 1200px) 660px, 94vw" priority={i === 0} {...shot} />
              </div>
              <div className="reveal-text">
                <p className="font-mono text-sm text-accent">
                  {String(i + 1).padStart(2, "0")} · {item.label}
                </p>
                <h3 className="mt-3 text-[clamp(1.5rem,1.3rem+0.8vw,2rem)] leading-tight">{item.title}</h3>
                <p className="mt-4 text-muted">{item.body}</p>
                <ul className="mt-6 space-y-2.5">
                  {item.points.map((pt) => (
                    <li key={pt} className="flex gap-3">
                      <Check width={20} height={20} className="mt-[3px] shrink-0 text-accent" />
                      {pt}
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* 기능: 가운데 큰 제목 + 3×2 격자 (#34) */}
      <section id="features" aria-labelledby="features-title" className="scroll-mt-24 pt-32 lg:pt-40">
        <h2 id="features-title" className="mx-auto max-w-[22em] text-center">
          {t.rich("features.title", {
            u: (chunks) => <span className="underline decoration-[3px] underline-offset-[6px]">{chunks}</span>,
          })}
        </h2>
        <GlowGrid className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <li key={f.title} className="glow-card rounded-lg border border-border bg-surface p-8">
              <span className="flex size-14 items-center justify-center rounded-md bg-tint text-on-tint">
                <FeatureIcon name={f.icon} width={28} height={28} />
              </span>
              <h3 className="mt-8 text-2xl">{f.title}</h3>
              <p className="mt-4 font-semibold">{f.lead}</p>
              <p className="mt-3 text-muted">{f.body}</p>
            </li>
          ))}
        </GlowGrid>

        {/* 직접 눌러 보는 C ↔ 어셈블리 연결 예시 */}
        <div className="mt-24">
          <h3 className="text-[clamp(1.5rem,1.3rem+0.8vw,2rem)]">{t("demo.title")}</h3>
          <p className="mt-3 max-w-2xl text-muted">{t("demo.body")}</p>
          <div className="mt-8">
            <CodeDemo />
          </div>
          <p className="mt-3 text-sm text-muted">{t("demo.note")}</p>
        </div>
      </section>

      {/* 처음 쓰는 순서: 가로 단계 */}
      <section aria-labelledby="flow-title" className="pt-40">
        <h2 id="flow-title">{t("flow.title")}</h2>
        <ol className="mt-12 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => {
            const last = i === steps.length - 1;
            return (
              <li key={s.title} className={`flow-step step-${i} pt-5 ${last ? "text-accent" : "text-ink"}`}>
                <span className={`font-mono text-sm ${last ? "text-accent" : "text-muted"}`}>STEP {i + 1}</span>
                <h3 className="mt-2.5 text-ink">{s.title}</h3>
                <p className="mt-2 text-muted">{s.body}</p>
              </li>
            );
          })}
        </ol>
      </section>

      {/* 성능 비교 (데이터 공개 전) */}
      <section className="rule-top mt-40 grid gap-x-20 gap-y-6 pt-10 lg:grid-cols-2">
        <h2>{t.rich("compare.title", { em: (chunks) => <span className="text-accent">{chunks}</span> })}</h2>
        <div>
          <p className="text-muted">{t("compare.body")}</p>
          <Link href="/compare" className="text-link mt-4 inline-flex items-center gap-1.5">
            {t("compare.cta")}
            <ArrowRight width={16} height={16} />
          </Link>
        </div>
      </section>

      {/* FAQ: 2단, 선만 */}
      <section aria-labelledby="faq-title" className="grid gap-x-20 gap-y-8 pt-40 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <h2 id="faq-title">{t("faq.title")}</h2>
        <div className="rule-top">
          {faqs.map((f, i) => (
            <details key={f.q} className="group border-b border-border" open={i === 0}>
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-lg font-semibold [&::-webkit-details-marker]:hidden">
                {f.q}
                <span aria-hidden className="text-2xl font-normal leading-none text-muted transition-transform group-open:rotate-45 motion-reduce:transition-none">
                  +
                </span>
              </summary>
              <p className="max-w-2xl pb-6 text-muted">{f.a}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
    </>
  );
}
