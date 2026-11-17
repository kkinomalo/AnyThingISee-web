import type { Metadata } from "next";
import { getFormatter, getTranslations, setRequestLocale } from "next-intl/server";
import raw from "../../../../data/benchmarks.json";
import { ExternalArrow } from "@/components/icons";
import { benchmarkSchema, LOWER_IS_BETTER, METRICS, type Metric } from "@/lib/benchmarks";
import { external } from "@/lib/links";
import { alternates } from "@/lib/seo";

// 빌드할 때 형식을 검사한다 — 틀린 데이터는 배포되지 않는다
const data = benchmarkSchema.parse(raw);
const METHOD_DOC = "https://github.com/parkjinuk09/AnyThingISee-web/blob/main/docs/BENCHMARK.md";

export async function generateMetadata({ params }: PageProps<"/[locale]/compare">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Compare" });
  return { title: t("title"), description: t("metaDescription"), alternates: alternates(locale, "/compare") };
}

export default async function ComparePage({ params }: PageProps<"/[locale]/compare">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Compare");
  const format = await getFormatter();
  const toolName = new Map(data.tools.map((tool) => [tool.id, tool.name]));
  const measured = METRICS.filter((m) => data.results.some((r) => r.metric === m));

  return (
    <div className="mx-auto w-full max-w-[1200px] px-6 pt-12">
      <h1>{t("title")}</h1>
      <p className="mt-5 max-w-3xl text-lg text-muted">{t("lead")}</p>

      {measured.length === 0 ? (
        <section className="mt-12 rounded-2xl bg-ink p-8 text-on-ink sm:p-12">
          <h2>{t("pending.title")}</h2>
          <p className="mt-4 max-w-2xl text-on-ink-muted">{t("pending.body")}</p>
        </section>
      ) : (
        <section className="mt-12 space-y-6">
          <p className="text-sm text-muted">
            {data.updatedAt && t("updated", { date: format.dateTime(new Date(data.updatedAt), { dateStyle: "long" }) })}
            {data.environment &&
              ` · ${t("env")}: ${data.environment.os} · ${data.environment.cpu} · ${data.environment.ramGB}GB · ${data.environment.disk}`}
          </p>
          <div className="grid gap-4 lg:grid-cols-2">
            {measured.map((metric) => (
              <MetricCard
                key={metric}
                title={t(`metrics.${metric}`)}
                unit={t(`units.${metric}`)}
                hint={LOWER_IS_BETTER[metric] ? t("lower") : t("higher")}
                rows={data.results
                  .filter((r) => r.metric === metric)
                  .map((r) => ({
                    label: `${toolName.get(r.tool) ?? r.tool}${r.sample ? ` · ${r.sample}` : ""}`,
                    value: r.value,
                    ours: r.tool === "anythingisee",
                  }))}
                metric={metric}
              />
            ))}
          </div>
        </section>
      )}

      {/* 비교 대상 */}
      <section aria-labelledby="tools-title" className="mt-20">
        <h2 id="tools-title">{t("tools")}</h2>
        <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {data.tools.map((tool) => (
            <li key={tool.id} className="card p-5">
              <a
                href={tool.url}
                target="_blank"
                rel="noopener noreferrer"
                translate="no"
                className="inline-flex items-center gap-1 font-semibold hover:underline"
              >
                {tool.name}
                <ExternalArrow width={14} height={14} />
              </a>
              <p className="mt-1 text-sm text-muted">
                {t("version")}: {tool.version ?? t("versionPending")}
              </p>
            </li>
          ))}
        </ul>
        <p className="mt-4 max-w-3xl text-sm text-muted">{t("ghidraNote")}</p>
      </section>

      {/* 측정 항목 · 방법 */}
      <div className="mt-20 grid gap-12 lg:grid-cols-2">
        <section aria-labelledby="metrics-title">
          <h2 id="metrics-title">{t("metrics.title")}</h2>
          <ul className="mt-6 divide-y divide-border border-y border-border">
            {METRICS.map((m) => (
              <li key={m} className="flex items-center justify-between gap-4 py-3">
                <span>{t(`metrics.${m}`)}</span>
                <span className="text-sm text-muted">{LOWER_IS_BETTER[m] ? t("lower") : t("higher")}</span>
              </li>
            ))}
          </ul>
        </section>
        <section aria-labelledby="method-title">
          <h2 id="method-title">{t("method.title")}</h2>
          <ul className="mt-6 list-disc space-y-2 pl-5">
            {(t.raw("method.items") as string[]).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <a href={METHOD_DOC} target="_blank" rel="noopener noreferrer" className="text-link mt-6 inline-flex items-center gap-1">
            {t("method.doc")}
            <ExternalArrow width={14} height={14} />
          </a>
        </section>
      </div>

      {data.samples.length > 0 && (
        <section aria-labelledby="samples-title" className="mt-20">
          <h2 id="samples-title">{t("samples")}</h2>
          <ul className="mt-6 space-y-3">
            {data.samples.map((s) => (
              <li key={s.id} className="card p-5 text-sm">
                <a href={s.source} target="_blank" rel="noopener noreferrer" className="text-link" translate="no">
                  {s.name}
                </a>{" "}
                <span className="text-muted">
                  · {s.format} · {s.size} · {format.number(s.bytes)} B
                </span>
                <p translate="no" className="mt-1 break-all font-mono text-xs text-muted">
                  {s.sha256}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="mt-12 text-sm text-muted">
        <a href={external.issues} target="_blank" rel="noopener noreferrer" className="hover:underline">
          GitHub Issues
        </a>
      </p>
    </div>
  );
}

function MetricCard({
  title,
  unit,
  hint,
  rows,
  metric,
}: {
  title: string;
  unit: string;
  hint: string;
  rows: { label: string; value: number; ours: boolean }[];
  metric: Metric;
}) {
  const max = Math.max(...rows.map((r) => r.value), 1);
  const sorted = [...rows].sort((a, b) => (LOWER_IS_BETTER[metric] ? a.value - b.value : b.value - a.value));
  return (
    <figure className="card p-6">
      <figcaption className="flex items-baseline justify-between gap-4">
        <h3>{title}</h3>
        <span className="text-sm text-muted">{hint}</span>
      </figcaption>
      <dl className="mt-5 space-y-3">
        {sorted.map((r) => (
          <div key={r.label}>
            <dt className={`flex justify-between gap-4 text-sm ${r.ours ? "font-semibold" : ""}`}>
              <span translate="no">{r.label}</span>
              <span className="font-mono tabular-nums">
                {r.value} {unit}
              </span>
            </dt>
            <dd className="mt-1 h-2 rounded-full bg-border" aria-hidden>
              <div
                className={`h-full rounded-full ${r.ours ? "bg-accent" : "bg-muted/60"}`}
                style={{ width: `${(r.value / max) * 100}%` }}
              />
            </dd>
          </div>
        ))}
      </dl>
    </figure>
  );
}
