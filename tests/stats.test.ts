import { describe, expect, it } from "vitest";
import { githubIncrements, niceMax, summarize, type EventRow, type SnapshotRow } from "@/lib/stats";

const NOW = Date.parse("2026-11-19T03:00:00Z"); // KST 11-19 12:00
const ev = (created_at: string, country: string | null = "KR"): EventRow => ({
  tag: "v0.1.0", file: "a.exe", os: "windows", locale: "ko", country, referrer_host: null, visitor_hash: null, created_at,
});
const snap = (captured_on: string, count: number): SnapshotRow => ({ captured_on, tag: "v0.1.0", file: "a.exe", count });

describe("GitHub 증가분", () => {
  it("전날 대비 증가분만 낸다 (첫날은 없음)", () => {
    const m = githubIncrements([snap("2026-11-17", 20), snap("2026-11-18", 22), snap("2026-11-19", 27)]);
    expect(m.get("2026-11-17")).toBeUndefined();
    expect(m.get("2026-11-18")).toBe(2);
    expect(m.get("2026-11-19")).toBe(5);
  });
  it("첫 스냅샷 날은 기준일이고 누적값을 증가분으로 쓰지 않는다", () => {
    const s = summarize({ events: [], snapshots: [snap("2026-11-18", 22)], range: "30d", version: null, now: NOW, githubTotal: 22 });
    const day = s.chart.find((d) => d.date === "2026-11-18")!;
    expect(day.baseline).toBe(true);
    expect(day.github).toBeNull();
    expect(s.hasGithub).toBe(false);
  });
});

describe("차트 · 집계", () => {
  const s = summarize({
    events: [ev("2026-11-19T01:00:00Z"), ev("2026-11-19T02:00:00Z", null), ev("2026-11-19T02:30:00Z", null)],
    snapshots: [],
    range: "30d",
    version: null,
    now: NOW,
    githubTotal: 0,
  });
  it("0인 날도 30일 모두 칸이 있다", () => {
    expect(s.chart).toHaveLength(30);
    expect(s.chart.filter((d) => d.site === 0)).toHaveLength(29);
    expect(s.chart.at(-1)).toMatchObject({ date: "2026-11-19", site: 3, today: true });
  });
  it("월요일 눈금", () => {
    expect(s.chart.find((d) => d.date === "2026-11-16")?.monday).toBe(true);
    expect(s.chart.find((d) => d.date === "2026-11-17")?.monday).toBe(false);
  });
  it("국가 '알 수 없음'은 많아도 맨 아래", () => {
    expect(s.countries.map((c) => c.key)).toEqual(["KR", "-"]);
  });
  it("y축 위쪽 값", () => {
    expect([niceMax(0), niceMax(2), niceMax(3), niceMax(7), niceMax(12), niceMax(250)]).toEqual([1, 2, 5, 10, 20, 500]);
    expect(s.chartMax).toBe(5);
  });
});
