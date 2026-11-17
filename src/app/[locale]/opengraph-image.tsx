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
const TAGLINE: Record<string, string> = {
  ko: "Windows용 로컬 디스어셈블러·디컴파일러",
  en: "Local disassembler and decompiler for Windows",
  ja: "Local disassembler and decompiler for Windows",
};

const C = ["int check_key(const char *key)", "{", "  size_t n = strlen(key);", "  if (n != 16) return 0;", "  for (int i = 0; i < 16; i++)"];
const ASM = ["push   rbx", "sub    rsp, 20h", "call   strlen", "cmp    rax, 10h", "jne    loc_140001058"];

export default async function Image({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const font = (w: string) =>
    readFile(join(process.cwd(), `node_modules/pretendard/dist/public/static/Pretendard-${w}.otf`));
  const [bold, regular, logo] = await Promise.all([
    font("Bold"),
    font("Regular"),
    readFile(join(process.cwd(), "public/brand/logo.svg"), "base64"),
  ]);

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#f7f3e8", padding: 64, fontFamily: "Pretendard" }}>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: 520 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <img src={`data:image/svg+xml;base64,${logo}`} width={88} height={88} alt="" />
            <span style={{ fontSize: 44, fontWeight: 700, color: "#1f1b16" }}>AnyThingISee</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <span style={{ fontSize: 46, fontWeight: 700, color: "#1f1b16", lineHeight: 1.2, wordBreak: "keep-all" }}>{TAGLINE[locale] ?? TAGLINE.en}</span>
            <span style={{ fontSize: 26, color: "#5f574a" }}>Free Edition · Windows 10/11 x64 · x64 PE · ELF</span>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", marginLeft: "auto", width: 500, borderRadius: 20, background: "#1f1b16", padding: 32, gap: 24, fontSize: 21 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {C.map((l, i) => (
              <span key={i} style={{ color: i === 3 ? "#fffdf7" : "#f7f3e8", background: i === 3 ? "#a04914" : "transparent", padding: "2px 10px", borderRadius: 6, whiteSpace: "pre" }}>
                {l}
              </span>
            ))}
          </div>
          <div style={{ display: "flex", height: 1, background: "rgba(247,243,232,0.15)" }} />
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {ASM.map((l, i) => (
              <span key={i} style={{ color: i >= 3 ? "#fffdf7" : "#b8ad94", background: i >= 3 ? "#a04914" : "transparent", padding: "2px 10px", borderRadius: 6, whiteSpace: "pre" }}>
                {l}
              </span>
            ))}
          </div>
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
