import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { parseReleases, type Release } from "./releases-parse";
import { fallbackRelease } from "./release";

const API = "https://api.github.com/repos/kkinomalo/AnyThingISee-releases/releases?per_page=30";

// 캐시 함수 안에서 오류를 던지면 빌드(프리렌더)가 멈추므로, 실패는 null로 돌려주고 짧게만 캐시한다
async function fetchReleases(): Promise<Release[] | null> {
  "use cache";
  cacheTag("releases");

  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "anythingisee-web",
  };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

  try {
    const res = await fetch(API, { headers });
    if (!res.ok) throw new Error(`GitHub releases ${res.status}`);
    const releases = parseReleases(await res.json());
    cacheLife("hours");
    return releases;
  } catch (error) {
    console.warn("[github] 릴리스 조회 실패, 기본값 사용:", error instanceof Error ? error.message : error);
    cacheLife("minutes");
    return null;
  }
}

/** 마지막으로 알려진 릴리스 — API가 실패해도 페이지가 깨지지 않게 */
export const fallback: Release = {
  tag: fallbackRelease.tag,
  version: fallbackRelease.version,
  title: `AnyThingISee Free Edition ${fallbackRelease.version}`,
  body: "",
  prerelease: true,
  publishedAt: `${fallbackRelease.publishedAt}T10:07:35Z`,
  htmlUrl: `https://github.com/kkinomalo/AnyThingISee-releases/releases/tag/${fallbackRelease.tag}`,
  assets: [],
  installer: {
    name: fallbackRelease.file,
    size: 4964416,
    url: fallbackRelease.url,
    downloadCount: 0,
    sha256: fallbackRelease.sha256,
  },
};

export async function getReleases(): Promise<{ releases: Release[]; live: boolean }> {
  const releases = await fetchReleases();
  if (releases && releases.length > 0) return { releases, live: true };
  return { releases: [fallback], live: false };
}

export async function getLatestRelease(): Promise<Release> {
  const { releases } = await getReleases();
  return releases.find((r) => r.installer) ?? releases[0];
}

export async function getRelease(tag: string): Promise<Release | null> {
  const { releases } = await getReleases();
  return releases.find((r) => r.tag === tag) ?? null;
}
