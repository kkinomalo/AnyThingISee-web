"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { ArrowUp } from "@/components/icons";

const SHOW_AFTER = 640;

export function BackToTop() {
  const t = useTranslations("Footer");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > SHOW_AFTER);
    onScroll();
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
      className={`fixed bottom-6 right-6 z-40 grid size-12 place-items-center rounded-full bg-cta text-cta-foreground shadow-float transition-opacity ${
        visible ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
      tabIndex={visible ? 0 : -1}
      aria-hidden={!visible}
    >
      <ArrowUp />
    </button>
  );
}
