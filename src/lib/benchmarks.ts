import { z } from "zod";

// data/benchmarks.json 형식 — 사이트에 올리는 수치는 모두 직접 측정한 값 (docs/BENCHMARK.md)
export const METRICS = [
  "install_size_mb",
  "cold_start_s",
  "auto_analysis_s",
  "decompile_s",
  "peak_memory_mb",
  "functions_found",
] as const;
export type Metric = (typeof METRICS)[number];

/** 작을수록 좋은 항목 (함수 수만 클수록 좋음) */
export const LOWER_IS_BETTER: Record<Metric, boolean> = {
  install_size_mb: true,
  cold_start_s: true,
  auto_analysis_s: true,
  decompile_s: true,
  peak_memory_mb: true,
  functions_found: false,
};

const toolSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string(),
  version: z.string().nullable(),
  url: z.url(),
  note: z.string().optional(),
});

const sampleSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string(),
  format: z.enum(["PE", "ELF"]),
  size: z.enum(["small", "medium", "large"]),
  bytes: z.number().int().positive(),
  sha256: z.string().regex(/^[0-9a-f]{64}$/),
  source: z.url(),
});

const resultSchema = z.object({
  tool: z.string(),
  sample: z.string().nullable(), // 설치 크기처럼 샘플과 무관하면 null
  metric: z.enum(METRICS),
  value: z.number().nonnegative(),
  runs: z.number().int().min(1),
  measuredAt: z.iso.date(),
});

export const benchmarkSchema = z
  .object({
    updatedAt: z.iso.date().nullable(),
    environment: z
      .object({
        os: z.string(),
        cpu: z.string(),
        ramGB: z.number().positive(),
        disk: z.string(),
      })
      .nullable(),
    tools: z.array(toolSchema).min(1),
    samples: z.array(sampleSchema),
    results: z.array(resultSchema),
  })
  .superRefine((data, ctx) => {
    const tools = new Set(data.tools.map((t) => t.id));
    const samples = new Set(data.samples.map((s) => s.id));
    data.results.forEach((r, i) => {
      if (!tools.has(r.tool)) ctx.addIssue({ code: "custom", path: ["results", i, "tool"], message: `없는 도구: ${r.tool}` });
      if (r.sample !== null && !samples.has(r.sample))
        ctx.addIssue({ code: "custom", path: ["results", i, "sample"], message: `없는 샘플: ${r.sample}` });
    });
    if (data.results.length > 0 && (!data.environment || !data.updatedAt))
      ctx.addIssue({ code: "custom", path: ["environment"], message: "결과가 있으면 측정 환경과 측정일이 필요합니다" });
  });

export type Benchmarks = z.infer<typeof benchmarkSchema>;
export type BenchResult = Benchmarks["results"][number];

export function median(values: number[]): number {
  if (values.length === 0) throw new Error("값이 없습니다");
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

/** 같은 도구·샘플·항목의 이전 값을 새 측정값으로 바꾼다 */
export function mergeResults(current: BenchResult[], incoming: BenchResult[]): BenchResult[] {
  const key = (r: BenchResult) => `${r.tool}|${r.sample ?? "-"}|${r.metric}`;
  const map = new Map(current.map((r) => [key(r), r]));
  for (const r of incoming) map.set(key(r), r);
  return [...map.values()];
}

export function hasResults(data: Benchmarks): boolean {
  return data.results.length > 0;
}
