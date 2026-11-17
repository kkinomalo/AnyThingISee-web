import type { SVGProps } from "react";

const base = {
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
} as const;

type P = SVGProps<SVGSVGElement>;

// 기능 카드 6개에 대응하는 선 아이콘 (순서 = messages Home.features.items)
export const featureIcons = [
  (p: P) => (
    <svg {...base} {...p}>
      <path d="M8 7 3 12l5 5M16 7l5 5-5 5M13.5 4l-3 16" />
    </svg>
  ),
  (p: P) => (
    <svg {...base} {...p}>
      <rect x="9" y="3" width="6" height="5" rx="1" />
      <rect x="3" y="16" width="6" height="5" rx="1" />
      <rect x="15" y="16" width="6" height="5" rx="1" />
      <path d="M12 8v4M6 16v-2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2" />
    </svg>
  ),
  (p: P) => (
    <svg {...base} {...p}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m20 20-4.2-4.2M8.5 11h5M11 8.5v5" />
    </svg>
  ),
  (p: P) => (
    <svg {...base} {...p}>
      <path d="M6 3h9l4 4v14H6z" />
      <path d="M14 3v5h5M9 13h7M9 17h5" />
    </svg>
  ),
  (p: P) => (
    <svg {...base} {...p}>
      <path d="M14.5 6.5a4 4 0 0 0-5.4 5.2L3.5 17.3a1.8 1.8 0 0 0 2.6 2.6l5.6-5.6a4 4 0 0 0 5.2-5.4l-2.6 2.6-2.4-.4-.4-2.4z" />
    </svg>
  ),
  (p: P) => (
    <svg {...base} {...p}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.6 2.6 3.8 5.6 3.8 9s-1.2 6.4-3.8 9c-2.6-2.6-3.8-5.6-3.8-9S9.4 5.6 12 3z" />
    </svg>
  ),
];
