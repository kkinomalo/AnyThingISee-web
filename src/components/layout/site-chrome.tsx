"use client";

import type { ReactNode } from "react";
import { usePathname } from "@/i18n/navigation";

// 로그인 화면은 레퍼런스처럼 사이트 헤더 · 푸터 없이 전체 화면으로 쓴다
const BARE = ["/login", "/admin"];

export function SiteChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return BARE.includes(pathname) ? null : children;
}
