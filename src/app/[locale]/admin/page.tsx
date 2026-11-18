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
  const maxBar = Math.max(1, ...s.chart.map((d) => Math.max(d.site, d.github ?? 0)));

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
            {diff === null ? t("allTime") : t("vsPrevious", { diff: `${diff >= 0 ? "+" : ""}${num.format(diff)}` })}
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
            <p className="flex gap-5 text-sm text-muted">
              <span className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-sm bg-ink" /> {t("site")}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-sm bg-[#c9b79c]" /> {t("githubDelta")}
              </span>
            </p>
          </div>
          <div className="mt-6 flex h-48 items-end gap-[3px]" role="img" aria-label={t("dailyAria", { days: s.chart.length })}>
            {s.chart.map((d) => (
              <div key={d.date} className="flex h-full min-w-0 flex-1 items-end gap-px" title={`${d.date} · ${d.site} / ${d.github ?? "-"}`}>
                <span
                  className={`block flex-1 rounded-t-sm ${d.today ? "bg-accent" : "bg-ink"}`}
                  style={{ height: `${(d.site / maxBar) * 100}%`, minHeight: d.site ? 2 : 0 }}
                />
                <span
                  className="block flex-1 rounded-t-sm bg-[#c9b79c]"
                  style={{ height: `${((d.github ?? 0) / maxBar) * 100}%`, minHeight: d.github ? 2 : 0 }}
                />
              </div>
            ))}
          </div>
          <div className="mt-2 flex justify-between font-mono text-xs text-muted">
            <span>{s.chart[0]?.date.slice(5)}</span>
            <span>{s.chart.at(-1)?.date.slice(5)}</span>
          </div>
        </section>

        {/* 분포 */}
        <div className="mt-14 grid gap-x-16 gap-y-12 md:grid-cols-3">
          <Breakdown title={t("byVersion")} rows={s.versions} total={s.total} label={(k) => k} empty={t("empty")} />
          <Breakdown title={t("byOs")} rows={s.os} total={s.total} label={(k) => osNames[k] ?? k} empty={t("empty")} />
          <Breakdown title={t("byLocale")} rows={s.locales} total={s.total} label={(k) => languages[k] ?? k} empty={t("empty")} />
        </div>

        <div className="mt-14 grid gap-x-16 gap-y-12 md:grid-cols-2">
          <Table
            title={t("byCountry")}
            head={[t("country"), t("downloads"), t("share")]}
            rows={s.countries.slice(0, 10).map((c) => [c.key === "-" ? t("unknown") : (regions.of(c.key) ?? c.key), num.format(c.count), pct(c.count, s.total)])}
            empty={t("empty")}
          />
          <Table
            title={t("byReferrer")}
            head={[t("domain"), t("downloads"), t("share")]}
            rows={s.referrers.slice(0, 10).map((r) => [r.key || t("direct"), num.format(r.count), pct(r.count, s.total)])}
            empty={t("empty")}
          />
        </div>

        <section className="rule-top mt-14 pt-6">
          <h2 className="text-xl">{t("compare")}</h2>
          <p className="mt-3">
            {t("compareBody", {
              site: num.format(s.allSite),
              github: num.format(s.githubTotal),
              diff: num.format(Math.max(0, s.githubTotal - s.allSite)),
            })}
          </p>
          <p className="mt-2 text-sm text-muted">{t("privacy")}</p>
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

function Breakdown({
  title,
  rows,
  total,
  label,
  empty,
}: {
  title: string;
  rows: Count[];
  total: number;
  label: (key: string) => string;
  empty: string;
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
              <div className="flex justify-between text-[15px]">
                <span>{label(r.key)}</span>
                <span className="font-mono">{r.count}</span>
              </div>
              <div className="mt-1.5 h-1.5 bg-border">
                <div className="h-full bg-ink" style={{ width: `${total ? (r.count / total) * 100 : 0}%` }} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function Table({ title, head, rows, empty }: { title: string; head: string[]; rows: string[][]; empty: string }) {
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
              <tr key={r[0]} className="border-b border-border">
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
    </section>
  );
}
