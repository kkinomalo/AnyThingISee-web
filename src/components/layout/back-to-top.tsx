"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { ArrowUp } from "@/components/icons";

const SHOW_AFTER = 640;

export function BackToTop() {
  const t = useTranslations("Footer");
  const [visible, setVisible] = useState(false);

  // 위로 스크롤할 때만 보여서 읽는 중인 본문을 가리지 않는다 (#63)
  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setVisible(y > SHOW_AFTER && y < last);
      last = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
      type="button"
      aria-label={t("toTop")}
      onClick={() => {
        window.scrollTo({ top: 0 });
        document.getElementById("main")?.focus({ preventScroll: true });
      }}
      className={`fixed bottom-5 right-5 z-40 grid size-11 place-items-center rounded-full bg-cta text-cta-foreground shadow-float transition-opacity ${
        visible ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
      tabIndex={visible ? 0 : -1}
      aria-hidden={!visible}
    >
      <ArrowUp />
    </button>
  );
}
