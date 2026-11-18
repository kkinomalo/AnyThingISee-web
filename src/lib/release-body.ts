// 릴리스 상세 (#53) — GitHub 릴리스 본문에서 페이지의 다른 곳과 겹치는 부분을 뺀다.
// 원문은 GitHub에 그대로 있고, 사이트에서만 정리해서 보여 준다.

const HANGUL = /[가-힣]/;

export function cleanReleaseBody(body: string, { title, locale }: { title: string; locale: string }) {
  let text = body.replace(/\r\n/g, "\n");

  // 1) 첫 줄이 제목을 반복하면 제거 (예: "AnyThingISee Free Edition 0.1.0 Preview — Windows x64")
  const lines = text.split("\n");
  const first = lines.findIndex((l) => l.trim() !== "");
  if (first >= 0 && !lines[first].startsWith("#") && lines[first].includes(title)) lines.splice(first, 1);
  text = lines.join("\n");

  // 2) 설치 파일로 바로 가는 링크만 있는 줄 제거 (오른쪽 파일 목록과 중복)
  text = text.replace(/^\s*\[[^\]]*\]\(https:\/\/github\.com\/[^)]*\/releases\/download\/[^)]*\)\s*$/gm, "");

  // 3) "SHA-256 (`파일`):" 줄과 바로 뒤 코드 블록 제거 (파일 목록에 SHA-256이 있음)
  text = text.replace(/^SHA-256[^\n]*:\s*\n+```[^\n]*\n[\s\S]*?\n```\s*$/gm, "");

  // 4) 한국어 페이지에서는 한국어 본문 뒤에 붙은 영어 요약 문단 제거
  if (locale === "ko" && HANGUL.test(text)) {
    const paragraphs = text.trimEnd().split(/\n{2,}/);
    while (paragraphs.length > 1 && !HANGUL.test(paragraphs.at(-1)!) && !paragraphs.at(-1)!.trim().startsWith("```")) {
      paragraphs.pop();
    }
    text = paragraphs.join("\n\n");
  }

  return text.replace(/\n{3,}/g, "\n\n").trim();
}
