"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { useEffect, useId, useRef, useState } from "react";
import { ArrowRight, Close, Menu } from "@/components/icons";
import { NavLink } from "@/components/layout/nav-link";
import { SettingsMenu } from "@/components/layout/settings-menu";
import { Link, usePathname } from "@/i18n/navigation";
import { external, type NavItem } from "@/lib/links";

// 시안 #28: 떠 있는 카드 대신 배경 위 평평한 헤더 + 아래 선, 글자 링크만
const primary: NavItem[] = [
  { key: "features", href: "/#features" },
  { key: "compare", href: "/compare" },
  { key: "releases", href: "/releases" },
  { key: "license", href: "/license" },
];
const secondary: NavItem[] = [
  { key: "guide", href: external.guide, external: true },
  { key: "issues", href: external.issues, external: true },
];

export function SiteHeader() {
  const t = useTranslations("Nav");
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();

  // 다른 페이지로 이동하면 메뉴를 닫는다
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const isActive = (item: NavItem) => !item.external && !item.href.includes("#") && pathname.startsWith(item.href);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
      <nav aria-label={t("label")} className="mx-auto flex h-[68px] max-w-[1200px] items-center gap-8 px-6">
        <Link href="/" aria-label={t("home")} className="flex shrink-0 items-center gap-2.5">
          <Image src="/brand/logo.svg" alt="" width={32} height={32} priority />
          <span translate="no" className="text-lg font-bold tracking-tight">
            AnyThingISee
          </span>
        </Link>

        <ul className="hidden items-center gap-7 text-[15px] lg:flex">
          {primary.map((item) => (
            <li key={item.key}>
              <NavLink item={item} active={isActive(item)} className="py-2 hover:text-accent">
                {t(`items.${item.key}.title`)}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="ml-auto flex items-center gap-5 text-[15px]">
          <div className="hidden lg:block">
            <SettingsMenu />
          </div>
          <Link
            href="/download"
            className="hidden items-center gap-1.5 font-semibold text-accent underline underline-offset-4 hover:text-accent-hover sm:inline-flex"
          >
            {t("download")}
            <ArrowRight width={16} height={16} />
          </Link>
          <button
            ref={buttonRef}
            type="button"
            aria-expanded={open}
            aria-controls={panelId}
            aria-label={open ? t("closeMenu") : t("openMenu")}
            onClick={() => setOpen((v) => !v)}
            className="-mr-3 rounded-md p-3 hover:bg-ink/5 lg:hidden"
          >
            {open ? <Close /> : <Menu />}
          </button>
        </div>
      </nav>

      {/* 모바일 메뉴: 헤더 아래 전체 폭, 선으로만 나눔 */}
      <div
        id={panelId}
        hidden={!open}
        className="max-h-[calc(100dvh-68px)] overflow-y-auto overscroll-contain border-t border-border bg-background px-6 pb-8 lg:hidden"
      >
        <ul className="divide-y divide-border">
          {[...primary, ...secondary].map((item) => (
            <li key={item.key}>
              <NavLink
                item={item}
                active={isActive(item)}
                externalLabel={t("external")}
                className="block py-4 text-lg font-medium"
              >
                {t(`items.${item.key}.title`)}
              </NavLink>
            </li>
          ))}
        </ul>
        <div className="rule-top mt-2 pt-5">
          <SettingsMenu variant="inline" />
        </div>
        <Link
          href="/download"
          className="mt-6 flex items-center justify-center gap-2 rounded-full bg-accent px-6 py-3.5 font-semibold text-on-accent"
        >
          {t("download")}
        </Link>
      </div>
    </header>
  );
}
