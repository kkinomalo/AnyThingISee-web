// 다운로드 집계 (#12) — 요청에서 저장할 값을 뽑는 순수 함수들. 원문 IP · User-Agent는 저장하지 않는다.
import type { Release } from "./releases-parse";

export type Os = "windows" | "mac" | "linux" | "other";
const LOCALES = ["ko", "en", "ja"] as const;

/** 사이트 안 다운로드 링크. GitHub 주소 대신 이 경로가 기록 후 302로 넘긴다 */
export function downloadPath(tag: string, file: string, locale?: string) {
  const base = `/api/download/${encodeURIComponent(tag)}/${encodeURIComponent(file)}`;
  return locale ? `${base}?l=${locale}` : base;
}

/** 실제 릴리스에 있는 tag · 파일만 허용 (오픈 리디렉트 방지). 이동할 GitHub 주소를 돌려준다 */
export function resolveAsset(releases: Release[], tag: string, file: string): string | null {
  const release = releases.find((r) => r.tag === tag);
  if (!release) return null;
  const asset = [...release.assets, ...(release.installer ? [release.installer] : [])].find((a) => a.name === file);
  if (!asset) return null;
  // 파싱 단계에서 이미 URL이지만, GitHub 릴리스 주소가 아니면 거부한다
  return asset.url.startsWith("https://github.com/kkinomalo/AnyThingISee-releases/releases/download/") ? asset.url : null;
}

const BOT = /bot|crawl|spider|slurp|preview|facebookexternalhit|embedly|whatsapp|telegram|discord|slack|headless|lighthouse|pingdom|monitor/i;
export function isBot(ua: string | null) {
  return !ua || BOT.test(ua);
}

export function osFromUa(ua: string | null): Os {
  if (!ua) return "other";
  if (/windows/i.test(ua)) return "windows";
  if (/iphone|ipad|android/i.test(ua)) return "other";
  if (/mac os x|macintosh/i.test(ua)) return "mac";
  if (/linux|x11/i.test(ua)) return "linux";
  return "other";
}

export function localeParam(value: string | null) {
  return (LOCALES as readonly string[]).includes(value ?? "") ? value : null;
}

/** 유입 도메인만. 같은 사이트에서 온 경우 null (직접 방문과 구분하지 않음) */
export function referrerHost(referer: string | null, ownHost: string | null) {
  if (!referer) return null;
  try {
    const host = new URL(referer).hostname.replace(/^www\./, "");
    return host && host !== ownHost?.replace(/^www\./, "") ? host.slice(0, 120) : null;
  } catch {
    return null;
  }
}

export function countryParam(value: string | null) {
  return value && /^[A-Z]{2}$/.test(value) ? value : null;
}
