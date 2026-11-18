"use client";

import type { PointerEvent, ReactNode } from "react";

// 기능 카드 (#55): 마우스 근처만 옅은 격자가 보이도록 위치를 CSS 변수로 넘긴다.
// 실제 그리기는 globals.css의 .glow-card가 맡는다 (마우스가 없으면 아무 효과 없음).
export function GlowGrid({ className, children }: { className?: string; children: ReactNode }) {
  const onPointerMove = (e: PointerEvent<HTMLUListElement>) => {
    if (e.pointerType !== "mouse") return;
    const card = (e.target as HTMLElement).closest<HTMLElement>(".glow-card");
    if (!card) return;
    const r = card.getBoundingClientRect();
    card.style.setProperty("--mx", `${e.clientX - r.left}px`);
    card.style.setProperty("--my", `${e.clientY - r.top}px`);
  };
  return (
    <ul className={className} onPointerMove={onPointerMove}>
      {children}
    </ul>
  );
}
