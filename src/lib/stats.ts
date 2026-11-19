// 어드민 다운로드 통계 (#13) — DB 행을 화면용 숫자로 바꾸는 순수 함수
export type Range = "today" | "7d" | "30d" | "all";
export const RANGES: Range[] = ["today", "7d", "30d", "all"];

export type EventRow = {
  tag: string;
  file: string;
  os: string;
  locale: string | null;
  country: string | null;
  referrer_host: string | null;
  visitor_hash: string | null;
  created_at: string;
};
export type SnapshotRow = { captured_on: string; tag: string; file: string; count: number };

const DAY = 86_400_000;
const KST = 9 * 3_600_000;
/** 한국 시간 기준 날짜 문자열 YYYY-MM-DD */
export const kstDate = (t: number) => new Date(t + KST).toISOString().slice(0, 10);

export function rangeDays(range: Range) {
  return range === "today" ? 1 : range === "7d" ? 7 : range === "30d" ? 30 : null;
}

/** 범위 시작 시각(한국 자정 기준). all이면 null */
export function rangeStart(range: Range, now: number) {
  const days = rangeDays(range);
  if (!days) return null;
  const todayStart = Date.parse(`${kstDate(now)}T00:00:00Z`) - KST;
  return todayStart - (days - 1) * DAY;
}

export type Count = { key: string; count: number };
export type ChartDay = {
  date: string;
  site: number;
  /** GitHub download_count 전날 대비 증가분. 스냅샷이 없거나 기준일이면 null */
  github: number | null;
  /** 첫 스냅샷 날 (증가분 계산 불가) */
  baseline: boolean;
  today: boolean;
  monday: boolean;
};

/** 차트 y축 위쪽 값: 1 · 2 · 5 × 10ⁿ 중 최댓값 이상인 가장 작은 수 (최소 1) */
export function niceMax(value: number) {
  if (value <= 1) return 1;
  const p = 10 ** Math.floor(Math.log10(value));
  for (const m of [1, 2, 5, 10]) if (m * p >= value) return m * p;
  return 10 * p;
}

const unknownLast = (rows: Count[]) => [...rows.filter((r) => r.key !== "-"), ...rows.filter((r) => r.key === "-")];
const tally = (rows: EventRow[], pick: (r: EventRow) => string | null, fallback: string): Count[] => {
  const map = new Map<string, number>();
  for (const r of rows) {
    const k = pick(r) ?? fallback;
    map.set(k, (map.get(k) ?? 0) + 1);
  }
  return [...map].map(([key, count]) => ({ key, count })).sort((a, b) => b.count - a.count);
};

export function summarize({
  events,
  snapshots,
  range,
  version,
  now,
  githubTotal,
}: {
  events: EventRow[];
  snapshots: SnapshotRow[];
  range: Range;
  version: string | null;
  now: number;
  githubTotal: number;
}) {
  const scoped = version ? events.filter((e) => e.tag === version) : events;
  const start = rangeStart(range, now);
  const inRange = start === null ? scoped : scoped.filter((e) => Date.parse(e.created_at) >= start);

  // 지난 기간: 같은 길이의 바로 앞 구간
  const days = rangeDays(range);
  const previous =
    start === null || !days
      ? null
      : scoped.filter((e) => {
          const t = Date.parse(e.created_at);
          return t >= start - days * DAY && t < start;
        }).length;

  const today = kstDate(now);
  const yesterday = kstDate(now - DAY);
  const byDay = new Map<string, number>();
  for (const e of scoped) {
    const d = kstDate(Date.parse(e.created_at));
    byDay.set(d, (byDay.get(d) ?? 0) + 1);
  }
  const last7 = Array.from({ length: 7 }, (_, i) => byDay.get(kstDate(now - i * DAY)) ?? 0).reduce((a, b) => a + b, 0);

  // 차트: 범위가 today · 7d면 14일, 그 외 30일
  const chartDays = range === "today" || range === "7d" ? 14 : 30;
  const scopedSnapshots = version ? snapshots.filter((s) => s.tag === version) : snapshots;
  const ghByDay = githubIncrements(scopedSnapshots);
  // 첫 스냅샷 날은 비교할 전날이 없어 증가분을 낼 수 없다 → '기준일' (누적값을 증가분으로 쓰지 않음)
  const baseline = scopedSnapshots.map((s) => s.captured_on).sort()[0] ?? null;
  const chart: ChartDay[] = Array.from({ length: chartDays }, (_, i) => {
    const d = kstDate(now - (chartDays - 1 - i) * DAY);
    return {
      date: d,
      site: byDay.get(d) ?? 0,
      github: ghByDay.get(d) ?? null,
      baseline: d === baseline,
      today: d === today,
      monday: new Date(`${d}T00:00:00Z`).getUTCDay() === 1,
    };
  });
  const hasGithub = chart.some((d) => d.github !== null);

  return {
    total: inRange.length,
    previous,
    unique: new Set(inRange.map((e) => e.visitor_hash).filter(Boolean)).size,
    today: byDay.get(today) ?? 0,
    yesterday: byDay.get(yesterday) ?? 0,
    last7,
    githubTotal,
    allSite: scoped.length,
    chart,
    hasGithub,
    chartMax: niceMax(Math.max(0, ...chart.map((d) => Math.max(d.site, d.github ?? 0)))),
    versions: tally(inRange, (e) => e.tag, "-"),
    os: tally(inRange, (e) => e.os, "other"),
    locales: tally(inRange, (e) => e.locale, "-"),
    // 국가 정보가 없는 요청('-')은 순위와 상관없이 맨 아래
    countries: unknownLast(tally(inRange, (e) => e.country, "-")),
    referrers: tally(inRange, (e) => e.referrer_host, ""),
  };
}

/** 스냅샷 누적값을 날짜별 증가분으로 (전날 스냅샷이 있어야 계산) */
export function githubIncrements(snapshots: SnapshotRow[]) {
  const totals = new Map<string, number>();
  for (const s of snapshots) totals.set(s.captured_on, (totals.get(s.captured_on) ?? 0) + s.count);
  const dates = [...totals.keys()].sort();
  const out = new Map<string, number>();
  for (let i = 1; i < dates.length; i++) out.set(dates[i], Math.max(0, totals.get(dates[i])! - totals.get(dates[i - 1])!));
  return out;
}

export function toCsv(rows: EventRow[]) {
  const head = ["created_at", "tag", "file", "os", "locale", "country", "referrer_host"] as const;
  const esc = (v: string | null) => (v == null ? "" : /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
  return [head.join(","), ...rows.map((r) => head.map((k) => esc(r[k])).join(","))].join("\n") + "\n";
}
