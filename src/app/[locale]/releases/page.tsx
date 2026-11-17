import type { Metadata } from "next";
import { alternates } from "@/lib/seo";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowRight } from "@/components/icons";
import { ReleaseBadges } from "@/components/release-meta";
import { Link } from "@/i18n/navigation";
import { getReleases } from "@/lib/github";

export async function generateMetadata({ params }: PageProps<"/[locale]/releases">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Releases" });
  return { title: t("title"), description: t("metaDescription"), alternates: alternates(locale, "/releases") };
}

export default async function ReleasesPage({ params }: PageProps<"/[locale]/releases">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Releases");
  const { releases } = await getReleases();

  return (
    <div className="mx-auto w-full max-w-[1200px] px-6 pt-12">
      <h1>{t("title")}</h1>
      <p className="mt-5 max-w-3xl text-lg leading-relaxed text-muted">{t("lead")}</p>

      {releases.length === 0 ? (
        <p className="mt-12 text-muted">{t("empty")}</p>
      ) : (
        <ul className="mt-12 space-y-4">
          {releases.map((r, i) => (
            <li key={r.tag}>
              <Link
                href={`/releases/${r.tag}`}
                className="group card flex flex-col gap-3 p-7 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <h2 className="text-xl font-bold">{r.title}</h2>
                  <div className="mt-2">
                    <ReleaseBadges release={r} latest={i === 0} />
                  </div>
                </div>
                <ArrowRight className="shrink-0 transition-transform group-hover:translate-x-1" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
