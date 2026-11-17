// GitHub API를 못 쓸 때 쓰는 마지막으로 알려진 릴리스 (#6에서 API 연동)
export const fallbackRelease = {
  tag: "v0.1.0",
  version: "0.1.0 Preview",
  publishedAt: "2026-11-16",
  file: "AnyThingISee-0.1.0-windows-x64-setup.exe",
  url: "https://github.com/kkinomalo/AnyThingISee-releases/releases/download/v0.1.0/AnyThingISee-0.1.0-windows-x64-setup.exe",
  sha256: "8290fe079527806f8df7a59fcb4bd03a1b9783a4f54bb76e1761e087ce7f2ee6",
} as const;
