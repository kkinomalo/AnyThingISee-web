import type { Metadata } from "next";
import { alternates } from "@/lib/seo";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowRight, Download, ExternalArrow } from "@/components/icons";
import { Markdown } from "@/components/markdown";
import { ReleaseBadges } from "@/components/release-meta";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { downloadPath } from "@/lib/downloads";
import { cleanReleaseBody } from "@/lib/release-body";
import { formatBytes } from "@/lib/format";
import { getReleases } from "@/lib/github";

export async function generateStaticParams() {
  const { releases } = await getReleases();
  return routing.locales.flatMap((locale) => releases.map((r) => ({ locale, tag: r.tag })));
}

export async function generateMetadata({ params }: PageProps<"/[locale]/releases/[tag]">): Promise<Metadata> {
  const { locale, tag } = await params;
  const { releases } = await getReleases();
  const release = releases.find((r) => r.tag === tag);
  return release ? { title: release.title, alternates: alternates(locale, `/releases/${tag}`) } : {};
}

export default async function ReleasePage({ params }: PageProps<"/[locale]/releases/[tag]">) {
  const { locale, tag } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Releases");
  const { releases } = await getReleases();
  const index = releases.findIndex((r) => r.tag === tag);
  if (index === -1) notFound();
  const release = releases[index];

  return (
    <div className="mx-auto w-full max-w-[1200px] px-6 pt-12">
      <Link href="/releases" className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-foreground">
        <ArrowRight width={16} height={16} className="rotate-180" />
        {t("back")}
      </Link>
      <h1 className="mt-6">{release.title}</h1>
      <div className="mt-4">
        <ReleaseBadges release={release} latest={index === 0} />
      </div>

      <div className="mt-12 grid gap-12 lg:grid-cols-[1fr_22rem]">
        <article className="min-w-0">
          <Markdown>{cleanReleaseBody(release.body, { title: release.title, locale })}</Markdown>
        </article>

        <aside className="rule-top h-fit space-y-4 pt-5 lg:sticky lg:top-24">
          <h2 className="font-bold">{t("assets")}</h2>
          <ul className="space-y-4">
            {release.assets.map((a) => (
              <li key={a.name} className="space-y-1.5">
                <a href={downloadPath(release.tag, a.name, locale)} download className="flex items-start gap-2 break-all font-mono text-sm font-semibold underline underline-offset-4">
                  <Download width={16} height={16} className="mt-0.5 shrink-0" />
                  {a.name}
                </a>
                <p className="font-mono text-xs text-muted">{formatBytes(a.size)}</p>
                {a.sha256 && (
                  <p className="break-all font-mono text-xs text-muted">
                    {t("sha")}: {a.sha256}
                  </p>
                )}
              </li>
            ))}
          </ul>
          <a
            href={release.htmlUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm font-semibold underline underline-offset-4"
          >
            {t("github")}
            <ExternalArrow width={14} height={14} />
          </a>
        </aside>
      </div>
    </div>
  );
}
