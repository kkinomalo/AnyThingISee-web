import { describe, expect, it } from "vitest";
import { cleanReleaseBody } from "@/lib/release-body";

const body = `AnyThingISee Free Edition 0.1.0 Preview — Windows x64

[**Windows 설치 파일 다운로드 / Download installer**](https://github.com/kkinomalo/AnyThingISee-releases/releases/download/v0.1.0/setup.exe)

## 설치 및 사용

1. 설치합니다.

자세한 사용법은 [README](https://github.com/kkinomalo/AnyThingISee-releases#readme)를 참조하십시오.

SHA-256 (\`setup.exe\`):
\`\`\`text
8290fe079527806f8df7a59fcb4bd03a1b9783a4f54bb76e1761e087ce7f2ee6
\`\`\`

This is an unsigned Windows x64 preview.`;

const title = "AnyThingISee Free Edition 0.1.0 Preview";

describe("cleanReleaseBody (릴리스 상세 중복 제거)", () => {
  const ko = cleanReleaseBody(body, { title, locale: "ko" });
  it("제목을 반복하는 첫 줄 제거", () => expect(ko).not.toContain("— Windows x64"));
  it("설치 파일 링크만 있는 줄 제거, 다른 링크는 유지", () => {
    expect(ko).not.toContain("Download installer");
    expect(ko).toContain("[README]");
  });
  it("SHA-256 줄 · 코드 블록 제거", () => {
    expect(ko).not.toContain("SHA-256");
    expect(ko).not.toContain("8290fe07");
  });
  it("한국어 페이지는 끝의 영어 요약 제거, 본문은 유지", () => {
    expect(ko).not.toContain("unsigned Windows x64 preview");
    expect(ko).toContain("## 설치 및 사용");
  });
  it("영어 · 일본어 페이지는 영어 요약 유지", () => {
    expect(cleanReleaseBody(body, { title, locale: "en" })).toContain("unsigned Windows x64 preview");
  });
});
