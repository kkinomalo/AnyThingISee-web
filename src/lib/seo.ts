import { routing, type Locale } from "@/i18n/routing";

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://kkinomalo.com";

/** 언어별 같은 페이지 주소 (hreflang). path는 "/download"처럼 언어 접두어 없이 */
export function alternates(locale: Locale | string, path = "") {
  const languages: Record<string, string> = Object.fromEntries(
    routing.locales.map((l) => [l, `/${l}${path}`]),
  );
  // 언어를 정하지 않은 주소는 proxy가 브라우저 언어로 보낸다
  languages["x-default"] = path || "/";
  return { canonical: `/${locale}${path}`, languages };
}
