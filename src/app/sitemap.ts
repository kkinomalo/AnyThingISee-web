import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { getReleases } from "@/lib/github";
import { SITE_URL } from "@/lib/seo";

const PAGES = ["", "/download", "/compare", "/releases", "/license", "/contact"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { releases } = await getReleases();
  const paths = [...PAGES, ...releases.map((r) => `/releases/${r.tag}`)];

  return paths.flatMap((path) =>
    routing.locales.map((locale) => ({
      url: `${SITE_URL}/${locale}${path}`,
      alternates: {
        languages: Object.fromEntries(routing.locales.map((l) => [l, `${SITE_URL}/${l}${path}`])),
      },
      changeFrequency: path === "" || path === "/download" ? ("weekly" as const) : ("monthly" as const),
      priority: path === "" ? 1 : path === "/download" ? 0.9 : 0.6,
    })),
  );
}
