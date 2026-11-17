import { getFormatter, getTranslations } from "next-intl/server";
import type { Release } from "@/lib/releases-parse";

export async function ReleaseBadges({ release, latest }: { release: Release; latest: boolean }) {
  const t = await getTranslations("Releases");
  const format = await getFormatter();
  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      {latest && <span className="rounded-full bg-accent px-2.5 py-0.5 text-xs font-bold text-ink">{t("latest")}</span>}
      {release.prerelease && (
        <span className="rounded-full border border-foreground/20 px-2.5 py-0.5 text-xs font-semibold">{t("prerelease")}</span>
      )}
      <span className="font-mono text-muted">{release.tag}</span>
      {release.publishedAt && (
        <span className="text-muted">
          · {t("published", { date: format.dateTime(new Date(release.publishedAt), { dateStyle: "long" }) })}
        </span>
      )}
    </div>
  );
}
