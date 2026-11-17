// results.jsonl(측정 스크립트 출력)을 data/benchmarks.json에 합친다.
// 실행: pnpm bench:merge [-- --env-os "Windows 11 24H2" --env-cpu "..." --env-ram 32 --env-disk "NVMe"]
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { benchmarkSchema, median, mergeResults, METRICS, type BenchResult } from "../../src/lib/benchmarks.ts";

const root = join(import.meta.dirname, "../..");
const dataPath = join(root, "data/benchmarks.json");
const inputPath = join(import.meta.dirname, "results.jsonl");

if (!existsSync(inputPath)) {
  console.error(`측정 결과가 없습니다: ${inputPath}`);
  process.exit(1);
}

const arg = (name: string) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? process.argv[i + 1] : undefined;
};

type Row = { tool: string; sample: string | null; metric: string; values: number[]; measuredAt: string };
const rows: Row[] = readFileSync(inputPath, "utf8")
  .replace(/^\uFEFF/, "")
  .split(/\r?\n/)
  .filter((l) => l.trim())
  .map((l) => JSON.parse(l.replace(/^\uFEFF/, "")));

const incoming: BenchResult[] = rows.map((r) => {
  if (!METRICS.includes(r.metric as (typeof METRICS)[number])) throw new Error(`알 수 없는 항목: ${r.metric}`);
  const values = Array.isArray(r.values) ? r.values : [r.values];
  return {
    tool: r.tool,
    sample: r.sample || null,
    metric: r.metric as BenchResult["metric"],
    value: Math.round(median(values) * 100) / 100,
    runs: values.length,
    measuredAt: r.measuredAt,
  };
});

const data = JSON.parse(readFileSync(dataPath, "utf8"));
data.results = mergeResults(data.results, incoming);
data.updatedAt = incoming.map((r) => r.measuredAt).sort().at(-1) ?? data.updatedAt;
if (arg("env-os")) {
  data.environment = {
    os: arg("env-os"),
    cpu: arg("env-cpu") ?? "",
    ramGB: Number(arg("env-ram") ?? 0),
    disk: arg("env-disk") ?? "",
  };
}

const parsed = benchmarkSchema.parse(data); // 형식이 틀리면 여기서 멈춘다
writeFileSync(dataPath, JSON.stringify(parsed, null, 2) + "\n");
console.log(`${incoming.length}개 결과를 합쳤습니다 → data/benchmarks.json`);
