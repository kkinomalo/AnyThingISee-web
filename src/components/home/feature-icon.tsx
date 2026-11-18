import type { SVGProps } from "react";

// 기능 격자용 선 아이콘 (#34)
const paths = {
  // 문서 안 코드 괄호
  decompile: (
    <>
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
      <path d="M14 3v5h5M10 12l-2 2 2 2M14 12l2 2-2 2" />
    </>
  ),
  // 돋보기 안 코드 괄호
  disassemble: (
    <>
      <circle cx="10.5" cy="10.5" r="7" />
      <path d="m20 20-4-4M9 8.5 7 10.5l2 2M12 8.5l2 2-2 2" />
    </>
  ),
  // 연결된 두 상자
  navigate: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
      <path d="M6.5 10v4.5a2 2 0 0 0 2 2H14" />
    </>
  ),
  // 렌치
  patch: <path d="M14.7 6.3a4 4 0 0 0 5 5L21 13l-8 8-3-3 1.3-1.3a4 4 0 0 1-5-5L3 8.3 8.3 3l3.4 3.4a4 4 0 0 0 3 0" />,
  // 책갈피
  project: <path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1z" />,
  // 자물쇠
  local: (
    <>
      <rect x="4" y="10" width="16" height="11" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
      <circle cx="12" cy="15.5" r="1.2" fill="currentColor" />
    </>
  ),
  // 상자 (설치)
  package: (
    <>
      <path d="m12 3 8 4.5v9L12 21l-8-4.5v-9z" />
      <path d="m4 7.5 8 4.5 8-4.5M12 12v9" />
    </>
  ),
  // 모니터 (내 PC)
  monitor: (
    <>
      <rect x="3" y="4" width="18" height="12" rx="2" />
      <path d="M8 20h8M12 16v4" />
    </>
  ),
  // 방패 (원본 보호)
  shield: (
    <>
      <path d="M12 3 4.5 6v5.5c0 4.6 3.2 8.2 7.5 9.5 4.3-1.3 7.5-4.9 7.5-9.5V6z" />
      <path d="m9 12 2 2 4-4" />
    </>
  ),
  // 돋보기 + 체크 (근거)
  evidence: (
    <>
      <circle cx="10.5" cy="10.5" r="7" />
      <path d="m20 20-4-4M7.5 10.5l2 2 4-4" />
    </>
  ),
  // 선물 (무료)
  gift: (
    <>
      <rect x="3.5" y="8" width="17" height="4" rx="1" />
      <path d="M5 12v8h14v-8M12 8v12M12 8S10.5 3.5 8 4.5 9 8 12 8zM12 8s1.5-4.5 4-3.5S15 8 12 8z" />
    </>
  ),
  // 지구본 (언어)
  globe: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
    </>
  ),
};

export type FeatureIconName = keyof typeof paths;

export function FeatureIcon({ name, ...p }: { name: FeatureIconName } & SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...p}
    >
      {paths[name]}
    </svg>
  );
}
