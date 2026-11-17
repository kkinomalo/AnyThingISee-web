// 히어로 배경 그림: 로고의 눈을 점무늬(하프톤)로 크게 그린 장식 (스크린 리더에서 숨김)
export function HeroArt({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 900 560"
      aria-hidden
      className={className}
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <pattern id="hero-dots" width="11" height="11" patternUnits="userSpaceOnUse">
          <circle cx="5.5" cy="5.5" r="2.4" fill="currentColor" />
        </pattern>
        <pattern id="hero-dots-fine" width="8" height="8" patternUnits="userSpaceOnUse">
          <circle cx="4" cy="4" r="1.3" fill="currentColor" />
        </pattern>
        <radialGradient id="hero-fade" cx="62%" cy="50%" r="60%">
          <stop offset="0" stopColor="#fff" stopOpacity="1" />
          <stop offset="0.7" stopColor="#fff" stopOpacity="0.55" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <mask id="hero-mask">
          <rect width="900" height="560" fill="url(#hero-fade)" />
        </mask>
      </defs>
      <g mask="url(#hero-mask)">
        {/* 바탕 점무늬 */}
        <rect width="900" height="560" fill="url(#hero-dots-fine)" opacity="0.35" />
        {/* 눈 테두리 (굵은 점) */}
        <path
          d="M300 280 Q560 70 840 280 Q560 490 300 280 Z"
          fill="none"
          stroke="url(#hero-dots)"
          strokeWidth="46"
          strokeLinejoin="round"
        />
        {/* 홍채 */}
        <circle cx="570" cy="280" r="92" fill="none" stroke="url(#hero-dots)" strokeWidth="34" />
      </g>
      {/* 동공 — 로고의 노란 사각형 */}
      <rect x="532" y="242" width="76" height="76" rx="18" fill="var(--accent)" />
    </svg>
  );
}
