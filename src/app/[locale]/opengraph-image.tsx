import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { routing } from "@/i18n/routing";

export const alt = "AnyThingISee";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

// Pretendard에는 일본어 가나가 없어 ja는 영어 문구를 쓴다
const TITLE: Record<string, [string, string]> = {
  ko: ["어셈블리 너머의 코드를,", "내 PC에서 바로"],
  en: ["Read what's behind the assembly,", "right on your PC"],
  ja: ["Read what's behind the assembly,", "right on your PC"],
};
const NOTE: Record<string, string> = { ko: "Windows용 · 무료", en: "For Windows · Free", ja: "For Windows · Free" };

// 시안 #28: 밝은 바탕, 큰 제목, 아래 선 위 C ↔ 어셈블리 한 줄
export default async function Image({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const font = (w: string) =>
    readFile(join(process.cwd(), `node_modules/pretendard/dist/public/static/Pretendard-${w}.otf`));
  const [bold, regular, logo] = await Promise.all([
    font("Bold"),
    font("Regular"),
    readFile(join(process.cwd(), "public/brand/logo.svg"), "base64"),
  ]);
  const [l1, l2] = TITLE[locale] ?? TITLE.en;
  const mark = { background: "#eddfcf", color: "#8a3e10", padding: "2px 10px", borderRadius: 6 };

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#f7f3e8",
          padding: "64px 72px",
          fontFamily: "Pretendard",
          color: "#1f1b16",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <img src={`data:image/svg+xml;base64,${logo}`} width={64} height={64} alt="" />
            <span style={{ fontSize: 34, fontWeight: 700 }}>AnyThingISee</span>
          </div>
          <span style={{ fontSize: 22, color: "#5f574a" }}>kkinomalo.com</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", fontSize: 72, fontWeight: 700, lineHeight: 1.08, letterSpacing: -2 }}>
          <span>{l1}</span>
          <span>{l2}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 24, borderTop: "2px solid #1f1b16", paddingTop: 18, fontSize: 22 }}>
          <span style={mark}>if (n != 16) return 0;</span>
          <span style={{ color: "#6f6656" }}>↔</span>
          <span style={mark}>cmp rax, 10h · jne</span>
          <span style={{ marginLeft: "auto", fontSize: 20, color: "#5f574a" }}>{NOTE[locale] ?? NOTE.en}</span>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Pretendard", data: bold, weight: 700, style: "normal" },
        { name: "Pretendard", data: regular, weight: 400, style: "normal" },
      ],
    },
  );
}
