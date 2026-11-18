import { describe, expect, it } from "vitest";
import { countryParam, downloadPath, isBot, localeParam, osFromUa, referrerHost, resolveAsset } from "@/lib/downloads";
import type { Release } from "@/lib/releases-parse";

const GH = "https://github.com/kkinomalo/AnyThingISee-releases/releases/download/v0.1.0/";
const asset = (name: string, url = GH + name) => ({ name, size: 1, url, downloadCount: 0, sha256: null });
const release = {
  tag: "v0.1.0",
  assets: [asset("setup.exe"), asset("SHA256SUMS.txt"), asset("evil.exe", "https://evil.example/x.exe")],
  installer: asset("setup.exe"),
} as unknown as Release;

describe("resolveAsset (오픈 리디렉트 방지)", () => {
  it("릴리스에 있는 파일이면 GitHub 주소", () => {
    expect(resolveAsset([release], "v0.1.0", "setup.exe")).toBe(GH + "setup.exe");
  });
  it("없는 tag · 파일 · 경로 조작은 null", () => {
    expect(resolveAsset([release], "v9.9.9", "setup.exe")).toBeNull();
    expect(resolveAsset([release], "v0.1.0", "nope.exe")).toBeNull();
    expect(resolveAsset([release], "v0.1.0", "../../evil")).toBeNull();
  });
  it("GitHub 릴리스 주소가 아니면 거부", () => {
    expect(resolveAsset([release], "v0.1.0", "evil.exe")).toBeNull();
  });
});

describe("요청 값 정리", () => {
  it("다운로드 경로는 tag · 파일을 인코딩하고 언어를 붙인다", () => {
    expect(downloadPath("v0.1.0", "a b.exe", "ko")).toBe("/api/download/v0.1.0/a%20b.exe?l=ko");
  });
  it("봇 · 빈 UA는 제외", () => {
    expect(isBot(null)).toBe(true);
    expect(isBot("Mozilla/5.0 (compatible; Googlebot/2.1)")).toBe(true);
    expect(isBot("Slackbot-LinkExpanding 1.0")).toBe(true);
    expect(isBot("Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/140")).toBe(false);
  });
  it("UA는 운영체제 분류만 남긴다", () => {
    expect(osFromUa("Mozilla/5.0 (Windows NT 10.0; Win64; x64)")).toBe("windows");
    expect(osFromUa("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)")).toBe("mac");
    expect(osFromUa("Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)")).toBe("other");
    expect(osFromUa("Mozilla/5.0 (X11; Linux x86_64)")).toBe("linux");
  });
  it("언어 · 국가 · 유입 도메인 검증", () => {
    expect(localeParam("ja")).toBe("ja");
    expect(localeParam("xx")).toBeNull();
    expect(countryParam("KR")).toBe("KR");
    expect(countryParam("kr; drop")).toBeNull();
    expect(referrerHost("https://www.github.com/kkinomalo?q=secret", "kkinomalo.com")).toBe("github.com");
    expect(referrerHost("https://kkinomalo.com/ko", "kkinomalo.com")).toBeNull();
    expect(referrerHost("not a url", "kkinomalo.com")).toBeNull();
  });
});
