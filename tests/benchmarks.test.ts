import { describe, expect, it } from "vitest";
import data from "../data/benchmarks.json";
import { benchmarkSchema, median, mergeResults, type BenchResult } from "@/lib/benchmarks";

const base = {
  updatedAt: "2026-12-01",
  environment: { os: "Windows 11 23H2", cpu: "Ryzen 7 7840U", ramGB: 32, disk: "NVMe SSD" },
  tools: [{ id: "ghidra", name: "Ghidra", version: "11.4.3", url: "https://ghidra-sre.org/" }],
  samples: [
    {
      id: "zlib-dll",
      name: "zlib1.dll",
      format: "PE",
      size: "small",
      bytes: 120000,
      sha256: "a".repeat(64),
      source: "https://zlib.net/",
    },
  ],
  results: [] as BenchResult[],
};

const row = (value: number, measuredAt = "2026-12-01"): BenchResult => ({
  tool: "ghidra",
  sample: "zlib-dll",
  metric: "auto_analysis_s",
  value,
  runs: 3,
  measuredAt,
});

describe("성능 비교 데이터", () => {
  it("저장소의 data/benchmarks.json이 형식에 맞다", () => {
    expect(() => benchmarkSchema.parse(data)).not.toThrow();
  });

  it("결과가 있는데 측정 환경이 없으면 거부한다", () => {
    expect(() => benchmarkSchema.parse({ ...base, environment: null, results: [row(1)] })).toThrow();
  });

  it("없는 도구나 샘플을 가리키면 거부한다", () => {
    expect(() => benchmarkSchema.parse({ ...base, results: [{ ...row(1), tool: "nope" }] })).toThrow();
    expect(() => benchmarkSchema.parse({ ...base, results: [{ ...row(1), sample: "nope" }] })).toThrow();
  });

  it("중앙값을 구한다", () => {
    expect(median([3, 1, 2])).toBe(2);
    expect(median([4, 1, 3, 2])).toBe(2.5);
    expect(() => median([])).toThrow();
  });

  it("같은 도구·샘플·항목은 새 측정값으로 바꾼다", () => {
    const merged = mergeResults([row(10, "2026-11-01")], [row(8, "2026-12-01"), { ...row(5), metric: "decompile_s" }]);
    expect(merged).toHaveLength(2);
    expect(merged.find((r) => r.metric === "auto_analysis_s")?.value).toBe(8);
  });
});
