import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Suspense } from "react";
import { Link, redirect } from "@/i18n/navigation";
import { getAdmin, loadEvents, loadSnapshots, requestTime } from "@/lib/admin";
import { getReleases } from "@/lib/github";
import { RANGES, summarize, type Count, type Range } from "@/lib/stats";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };

// #13 어드민 다운로드 통계 — 시안(Admin.dc.html): 카드 없이 선 · 숫자 · 막대
export default async function AdminPage({ params, searchParams }: PageProps<"/[locale]/admin">) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <Suspense>
      <AdminBody locale={locale} searchParams={searchParams} />
    </Suspense>
  );
}

async function AdminBody({
  locale,
  searchParams,
}: {
  locale: string;
  searchParams: PageProps<"/[locale]/admin">["searchParams"];
}) {
  const admin = await getAdmin();
  // 어드민이 아니면 페이지가 없는 것처럼 404
  if (!admin) notFound();

  const t = await getTranslations("Admin");
  const sp = await searchParams;
  const range: Range = (RANGES as string[]).includes(String(sp.range)) ? (sp.range as Range) : "30d";
  const version = typeof sp.v === "string" && sp.v ? sp.v : null;

  const [{ releases, live }, events, snapshots] = await Promise.all([getReleases(), loadEvents(), loadSnapshots()]);
  const githubTotal = releases
    .filter((r) => !version || r.tag === version)
    .reduce((sum, r) => sum + r.assets.reduce((s, a) => s + a.downloadCount, 0), 0);
  const s = summarize({ events, snapshots, range, version, now: requestTime(), githubTotal });

  const num = new Intl.NumberFormat(locale);
  const pct = (n: number, total: number) => (total ? `${Math.round((n / total) * 100)}%` : "-");
  const regions = new Intl.DisplayNames([locale], { type: "region" });
  const languages: Record<string, string> = { ko: "한국어", en: "English", ja: "日本語", "-": t("unknown") };
  const osNames: Record<string, string> = { windows: "Windows", mac: "macOS", linux: "Linux", other: t("other") };
  const q = (next: Partial<{ range: Range; v: string | null }>) => {
    const p = new URLSearchParams();
    p.set("range", next.range ?? range);
    const v = next.v === undefined ? version : next.v;
    if (v) p.set("v", v);
    return `?${p}`;
  };
  const diff = s.previous === null ? null : s.total - s.previous;
  // 사이트 · GitHub 증가분은 같은 y축(정직한 비교). 시리즈별로 따로 늘리지 않는다
  const max = s.chartMax;
  const hasBaseline = s.chart.some((d) => d.baseline);
  const githubDirect = Math.max(0, s.githubTotal - s.allSite);
  const compareTotal = s.allSite + githubDirect;
  const unknownShare = s.total ? (s.countries.find((c) => c.key === "-")?.count ?? 0) / s.total : 0;

  async function signOut() {
    "use server";
    const client = await createClient();
    await client?.auth.signOut();
    redirect({ href: "/", locale });
  }

  return (
    <div className="min-h-dvh bg-background">
      {/* 어드민 전용 상단 바 */}
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex h-16 max-w-[1200px] items-center gap-6 px-6">
          <Link href="/" className="flex items-center gap-2.5 font-bold">
            <Image src="/brand/logo.svg" alt="" width={28} height={28} />
            <span translate="no">AnyThingISee</span>
          </Link>
          <span className="text-muted">/ {t("title")}</span>
          <div className="ml-auto flex items-center gap-5 text-sm">
            <span className="hidden text-muted sm:inline">{admin.email}</span>
            <form action={signOut}>
              <button type="submit" className="underline underline-offset-4 hover:text-accent">
                {t("signOut")}
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1200px] px-6 pb-20 pt-12">
        <h1 className="text-[clamp(2rem,1.6rem+1.6vw,2.75rem)]">{t("heading")}</h1>
        <p className="mt-2 text-muted">{t("subtitle")}</p>

        {/* 필터 */}
        <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4 border-y border-border py-4 text-[15px]">
          <nav aria-label={t("range")} className="flex gap-1">
            {RANGES.map((r) => (
              <Link
                key={r}
                href={`/admin${q({ range: r })}`}
                aria-current={r === range ? "page" : undefined}
                className={`rounded-md px-3 py-1.5 ${r === range ? "bg-ink text-white" : "hover:bg-ink/5"}`}
              >
                {t(`ranges.${r}`)}
              </Link>
            ))}
          </nav>
          <nav aria-label={t("version")} className="flex flex-wrap items-center gap-1">
            <span className="mr-2 text-muted">{t("version")}</span>
            {[null, ...releases.map((r) => r.tag)].map((v) => (
              <Link
                key={v ?? "all"}
                href={`/admin${q({ v })}`}
                aria-current={v === version ? "page" : undefined}
                className={`rounded-md px-3 py-1.5 font-mono text-sm ${v === version ? "bg-ink text-white" : "hover:bg-ink/5"}`}
              >
                {v ?? t("allVersions")}
              </Link>
            ))}
          </nav>
          <a
            href={`/api/admin/downloads${q({})}`}
            className="ml-auto font-semibold text-accent underline underline-offset-4 hover:text-accent-hover"
          >
            {t("csv")} ↓
          </a>
        </div>

        {/* 핵심 숫자 4개: 칸 대신 세로선으로 나눔 */}
        <dl className="mt-10 grid grid-cols-2 gap-y-8 lg:grid-cols-4 lg:divide-x lg:divide-border">
          <Stat label={t("total")} value={num.format(s.total)}>
            {diff === null
              ? t("allTime")
              : s.previous === 0
                ? t("noPrevious")
                : t("vsPrevious", { diff: `${diff >= 0 ? "+" : ""}${num.format(diff)}` })}
          </Stat>
          <Stat label={t("today")} value={num.format(s.today)}>
            {t("yesterday", { n: num.format(s.yesterday) })}
          </Stat>
          <Stat label={t("last7")} value={num.format(s.last7)}>
            {t("dailyAvg", { n: (s.last7 / 7).toFixed(1) })}
          </Stat>
          <Stat label={t("github")} value={num.format(s.githubTotal)}>
            {live ? t("githubLive") : t("githubOffline")}
          </Stat>
        </dl>

        {/* 일별 막대 */}
        <section className="rule-top mt-14 pt-6" aria-labelledby="daily">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h2 id="daily" className="text-xl">
              {t("daily")}
            </h2>
            {/* 범례: 색 하나 = 의미 하나. 강조색은 차트에 쓰지 않는다 */}
            <p className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted">
              <span className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-sm bg-ink" /> {t("site")}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-sm bg-[#b49a74]" /> {t("githubDelta")}
                {!s.hasGithub && <span className="text-xs">({t("collecting")})</span>}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-px bg-ink" /> {t("todayMark")}
              </span>
            </p>
          </div>

          <div className="mt-6 grid grid-cols-[2.5rem_1fr] gap-x-2">
            {/* y축: 위쪽 값 · 0 */}
            <div className="relative h-52 font-mono text-xs text-muted" aria-hidden>
              <span className="absolute right-0 top-0 -translate-y-1/2">{num.format(max)}</span>
              <span className="absolute right-0 top-1/2 -translate-y-1/2">{num.format(max / 2)}</span>
              <span className="absolute bottom-0 right-0 translate-y-1/2">0</span>
            </div>
            <div className="relative h-52">
              {/* 가이드라인: 위쪽 값 · 절반 · 0 */}
              <div aria-hidden className="absolute inset-x-0 top-0 border-t border-dashed border-border" />
              <div aria-hidden className="absolute inset-x-0 top-1/2 border-t border-dashed border-border" />
              <div aria-hidden className="absolute inset-x-0 bottom-0 border-t border-ink/40" />
              <ol className="relative flex h-full items-end" aria-label={t("dailyAria", { days: s.chart.length })}>
                {s.chart.map((d) => {
                  const gh = d.baseline ? t("tipBaseline") : d.github === null ? t("tipNone") : `+${num.format(d.github)}`;
                  const tip = t("tip", { date: d.date.slice(5), today: d.today ? ` (${t("todayMark")})` : "", site: num.format(d.site), github: gh });
                  return (
                    <li
                      key={d.date}
                      tabIndex={0}
                      aria-label={tip}
                      className={`group relative flex h-full min-w-0 flex-1 items-end justify-center gap-px px-px outline-none hover:bg-ink/[0.04] focus-visible:bg-ink/[0.06] ${d.today ? "bg-ink/[0.03]" : ""}`}
                    >
                      <Bar value={d.site} max={max} className={d.today ? "bg-ink ring-1 ring-ink ring-offset-1 ring-offset-background" : "bg-ink"} />
                      <Bar value={d.github ?? 0} max={max} className="bg-[#b49a74]" empty={d.github === null} />
                      {/* 툴팁: 날짜 칸 전체에 마우스 · 포커스 · 탭 */}
                      <span
                        role="tooltip"
                        className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-ink px-2.5 py-1.5 text-xs text-white shadow-float group-hover:block group-focus-visible:block"
                      >
                        {tip}
                      </span>
                    </li>
                  );
                })}
              </ol>
            </div>
            {/* x축: 월요일 눈금 + 오늘 */}
            <div />
            <div className="relative mt-2 flex h-5 font-mono text-xs text-muted" aria-hidden>
              {s.chart.map((d) => (
                <span key={d.date} className="relative min-w-0 flex-1">
                  {(d.monday || d.today) && (
                    <span className={`absolute left-1/2 top-0 -translate-x-1/2 whitespace-nowrap ${d.today ? "font-semibold text-ink" : ""}`}>
                      {d.today ? t("todayMark") : d.date.slice(5)}
                    </span>
                  )}
                </span>
              ))}
            </div>
          </div>
          <p className="mt-4 text-sm text-muted">
            {t("chartNote")}
            {hasBaseline && ` ${t("baselineNote")}`}
          </p>
        </section>

        {/* 분포 */}
        <div className="mt-14 grid gap-x-16 gap-y-12 md:grid-cols-3">
          <Breakdown title={t("byVersion")} rows={s.versions} total={s.total} label={(k) => k} empty={t("empty")} pct={pct} />
          <Breakdown title={t("byOs")} rows={s.os} total={s.total} label={(k) => osNames[k] ?? k} empty={t("empty")} pct={pct} />
          <Breakdown title={t("byLocale")} rows={s.locales} total={s.total} label={(k) => languages[k] ?? k} empty={t("empty")} pct={pct} />
        </div>

        <div className="mt-14 grid gap-x-16 gap-y-12 md:grid-cols-2">
          <Table
            title={t("byCountry")}
            head={[t("country"), t("downloads"), t("share")]}
            rows={s.countries.slice(0, 10).map((c) => [c.key === "-" ? t("unknown") : (regions.of(c.key) ?? c.key), num.format(c.count), pct(c.count, s.total)])}
            mutedRow={t("unknown")}
            note={unknownShare >= 0.3 ? t("unknownNote") : undefined}
            empty={t("empty")}
          />
          <Table
            title={t("byReferrer")}
            head={[t("domain"), t("downloads"), t("share")]}
            rows={s.referrers.slice(0, 10).map((r) => [r.key || t("direct"), num.format(r.count), pct(r.count, s.total)])}
            empty={t("empty")}
          />
        </div>

        <section className="rule-top mt-14 pt-6" aria-labelledby="compare">
          <h2 id="compare" className="text-xl">
            {t("compare")}
          </h2>
          <p className="mt-2 text-sm text-muted">{t("compareLead")}</p>
          {compareTotal === 0 ? (
            <p className="mt-4 text-sm text-muted">{t("empty")}</p>
          ) : (
            <>
              <div className="mt-5 flex h-8 overflow-hidden rounded-md" role="img" aria-label={t("compareAria", { site: s.allSite, direct: githubDirect })}>
                <div className="bg-ink" style={{ width: `${(s.allSite / compareTotal) * 100}%` }} />
                <div className="bg-[#b49a74]" style={{ width: `${(githubDirect / compareTotal) * 100}%` }} />
              </div>
              <dl className="mt-3 flex flex-wrap gap-x-8 gap-y-1 text-sm">
                <div className="flex items-center gap-2">
                  <span className="size-2.5 rounded-sm bg-ink" />
                  <dt>{t("viaSite")}</dt>
                  <dd className="font-mono">
                    {num.format(s.allSite)} · {pct(s.allSite, compareTotal)}
                  </dd>
                </div>
                <div className="flex items-center gap-2">
                  <span className="size-2.5 rounded-sm bg-[#b49a74]" />
                  <dt>{t("viaGithub")}</dt>
                  <dd className="font-mono">
                    {num.format(githubDirect)} · {pct(githubDirect, compareTotal)}
                  </dd>
                </div>
              </dl>
            </>
          )}
          <p className="mt-6 text-sm text-muted">{t("privacy")}</p>
        </section>
      </div>
    </div>
  );
}

function Stat({ label, value, children }: { label: string; value: string; children: React.ReactNode }) {
  return (
    <div className="lg:px-8 lg:first:pl-0">
      <dt className="text-sm text-muted">{label}</dt>
      <dd className="mt-2 font-mono text-[40px] font-semibold leading-none tracking-tight">{value}</dd>
      <dd className="mt-2 text-sm text-muted">{children}</dd>
    </div>
  );
}

/** 막대 하나. 0이면 옅은 2px 기준선으로 날짜 칸이 보이게, 데이터가 없으면(empty) 그리지 않음 */
function Bar({ value, max, className, empty = false }: { value: number; max: number; className: string; empty?: boolean }) {
  if (empty) return <span className="block w-full max-w-3 flex-1" />;
  if (value === 0) return <span className="block h-0.5 w-full max-w-3 flex-1 rounded-sm bg-ink/15" />;
  return <span className={`block w-full max-w-3 flex-1 rounded-t-sm ${className}`} style={{ height: `${(value / max) * 100}%`, minHeight: 2 }} />;
}

/** 분포 (버전 · OS · 언어 공통): 이름 · 개수 · 비율 + 트랙 위 막대. 항목이 하나면 막대 없이 숫자만 */
function Breakdown({
  title,
  rows,
  total,
  label,
  empty,
  pct,
}: {
  title: string;
  rows: Count[];
  total: number;
  label: (key: string) => string;
  empty: string;
  pct: (n: number, total: number) => string;
}) {
  return (
    <section className="rule-top pt-5">
      <h2 className="text-lg">{title}</h2>
      {rows.length === 0 ? (
        <p className="mt-4 text-sm text-muted">{empty}</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {rows.map((r) => (
            <li key={r.key}>
              <div className="flex justify-between gap-3 text-[15px]">
                <span>{label(r.key)}</span>
                <span className="font-mono">
                  {r.count} <span className="text-muted">· {pct(r.count, total)}</span>
                </span>
              </div>
              {rows.length > 1 && (
                <div className="mt-1.5 h-1.5 rounded-full bg-ink/10">
                  <div className="h-full rounded-full bg-ink" style={{ width: `${total ? (r.count / total) * 100 : 0}%` }} />
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function Table({
  title,
  head,
  rows,
  empty,
  mutedRow,
  note,
}: {
  title: string;
  head: string[];
  rows: string[][];
  empty: string;
  /** 이 이름의 행은 회색 (예: 알 수 없음) */
  mutedRow?: string;
  note?: string;
}) {
  return (
    <section className="rule-top pt-5">
      <h2 className="text-lg">{title}</h2>
      {rows.length === 0 ? (
        <p className="mt-4 text-sm text-muted">{empty}</p>
      ) : (
        <table className="mt-3 w-full text-[15px]">
          <thead>
            <tr className="border-b border-border text-left text-sm text-muted">
              {head.map((h, i) => (
                <th key={h} className={`py-2 font-normal ${i > 0 ? "text-right" : ""}`}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r[0]} className={`border-b border-border ${r[0] === mutedRow ? "text-muted" : ""}`}>
                {r.map((c, i) => (
                  <td key={i} className={`py-2.5 ${i > 0 ? "text-right font-mono" : ""}`}>
                    {c}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {note && <p className="mt-3 text-sm text-muted">{note}</p>}
    </section>
  );
}
