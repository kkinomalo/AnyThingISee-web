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
