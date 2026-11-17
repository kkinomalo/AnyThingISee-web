import { describe, expect, it } from "vitest";
import { parseReleases } from "@/lib/releases-parse";

const sha = "8290fe079527806f8df7a59fcb4bd03a1b9783a4f54bb76e1761e087ce7f2ee6";

const sample = [
  {
    tag_name: "v0.1.0",
    name: "AnyThingISee Free Edition 0.1.0 Preview",
    body: "## 설치",
    draft: false,
    prerelease: true,
    published_at: "2026-11-16T10:07:35Z",
    html_url: "https://github.com/kkinomalo/AnyThingISee-releases/releases/tag/v0.1.0",
    assets: [
      {
        name: "AnyThingISee-0.1.0-windows-x64-setup.exe",
        size: 4964416,
        download_count: 18,
        browser_download_url:
          "https://github.com/kkinomalo/AnyThingISee-releases/releases/download/v0.1.0/AnyThingISee-0.1.0-windows-x64-setup.exe",
        digest: `sha256:${sha}`,
      },
      {
        name: "SHA256SUMS.txt",
        size: 108,
        download_count: 1,
        browser_download_url:
          "https://github.com/kkinomalo/AnyThingISee-releases/releases/download/v0.1.0/SHA256SUMS.txt",
        digest: null,
      },
    ],
  },
  {
    tag_name: "v0.2.0",
    name: null,
    body: null,
    draft: true,
    prerelease: false,
    published_at: null,
    html_url: "https://github.com/kkinomalo/AnyThingISee-releases/releases/tag/v0.2.0",
    assets: [],
  },
];

describe("GitHub 릴리스 파싱", () => {
  it("초안은 제외한다", () => {
    expect(parseReleases(sample).map((r) => r.tag)).toEqual(["v0.1.0"]);
  });

  it("버전 이름에서 제품명을 뗀다", () => {
    expect(parseReleases(sample)[0].version).toBe("0.1.0 Preview");
  });

  it("Windows 설치 파일과 SHA-256을 찾는다", () => {
    const [r] = parseReleases(sample);
    expect(r.installer?.name).toBe("AnyThingISee-0.1.0-windows-x64-setup.exe");
    expect(r.installer?.sha256).toBe(sha);
    expect(r.assets[1].sha256).toBeNull();
  });

  it("이름이 없으면 태그로 대신한다", () => {
    const r = parseReleases([{ ...sample[1], draft: false }])[0];
    expect(r.title).toBe("v0.2.0");
    expect(r.installer).toBeNull();
  });

  it("형식이 다르면 오류를 낸다", () => {
    expect(() => parseReleases([{ tag_name: 1 }])).toThrow();
  });
});
