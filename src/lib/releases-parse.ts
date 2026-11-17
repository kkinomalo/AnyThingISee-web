import { z } from "zod";

// GitHub Releases API 응답 중 사이트가 쓰는 부분만 검증한다
const assetSchema = z.object({
  name: z.string(),
  size: z.number(),
  download_count: z.number(),
  browser_download_url: z.url(),
  digest: z.string().nullish(),
});

const releaseSchema = z.object({
  tag_name: z.string(),
  name: z.string().nullish(),
  body: z.string().nullish(),
  draft: z.boolean(),
  prerelease: z.boolean(),
  published_at: z.string().nullish(),
  html_url: z.url(),
  assets: z.array(assetSchema),
});

export const releasesSchema = z.array(releaseSchema);

export type ReleaseAsset = {
  name: string;
  size: number;
  url: string;
  downloadCount: number;
  sha256: string | null;
};

export type Release = {
  tag: string;
  /** "0.1.0 Preview" 처럼 화면에 보여줄 버전 */
  version: string;
  title: string;
  body: string;
  prerelease: boolean;
  publishedAt: string | null;
  htmlUrl: string;
  assets: ReleaseAsset[];
  /** Windows 설치 파일 (없으면 null) */
  installer: ReleaseAsset | null;
};

const TITLE_PREFIX = /^AnyThingISee(\s+Free Edition)?\s+/i;
const INSTALLER = /-windows-x64-setup\.exe$/i;
const SHA256 = /^sha256:([0-9a-f]{64})$/i;

export function toRelease(raw: z.infer<typeof releaseSchema>): Release {
  const title = raw.name?.trim() || raw.tag_name;
  const assets = raw.assets.map((a) => ({
    name: a.name,
    size: a.size,
    url: a.browser_download_url,
    downloadCount: a.download_count,
    sha256: a.digest?.match(SHA256)?.[1]?.toLowerCase() ?? null,
  }));
  return {
    tag: raw.tag_name,
    version: title.replace(TITLE_PREFIX, "") || raw.tag_name.replace(/^v/, ""),
    title,
    body: raw.body ?? "",
    prerelease: raw.prerelease,
    publishedAt: raw.published_at ?? null,
    htmlUrl: raw.html_url,
    assets,
    installer: assets.find((a) => INSTALLER.test(a.name)) ?? null,
  };
}

/** 초안을 빼고 최신순으로 정리한다 */
export function parseReleases(json: unknown): Release[] {
  return releasesSchema
    .parse(json)
    .filter((r) => !r.draft)
    .map(toRelease)
    .sort((a, b) => (b.publishedAt ?? "").localeCompare(a.publishedAt ?? ""));
}
