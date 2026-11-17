"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { ChevronDown, Close, Download, GitHub, Menu } from "@/components/icons";
import { NavLink } from "@/components/layout/nav-link";
import { Link, usePathname } from "@/i18n/navigation";
import { external, licenseItems, navGroups, type NavItem } from "@/lib/links";

const HOVER_CLOSE_DELAY = 120;

export function SiteHeader() {
  const t = useTranslations("Nav");
  const pathname = usePathname();
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const mobileButtonRef = useRef<HTMLButtonElement>(null);
  const baseId = useId();

  const closeAll = useCallback(() => {
    setOpenGroup(null);
    setMobileOpen(false);
  }, []);

  // 다른 페이지로 이동하면 메뉴를 닫는다
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpenGroup(null);
    setMobileOpen(false);
  }

  // 바깥 클릭 · Escape로 닫기
  useEffect(() => {
    if (!openGroup && !mobileOpen) return;

    const onPointerDown = (e: PointerEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) closeAll();
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (openGroup) {
        document.getElementById(`${baseId}-${openGroup}-button`)?.focus();
      } else if (mobileOpen) {
        mobileButtonRef.current?.focus();
      }
      closeAll();
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [openGroup, mobileOpen, closeAll, baseId]);

  // 모바일 메뉴가 열려 있으면 뒤 화면 스크롤을 막는다
  useEffect(() => {
    if (!mobileOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [mobileOpen]);

  const cancelClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  };
  const scheduleClose = () => {
    cancelClose();
    closeTimer.current = setTimeout(() => setOpenGroup(null), HOVER_CLOSE_DELAY);
  };

  const isActive = (item: NavItem) =>
    !item.external && (item.href === "/" ? pathname === "/" : pathname.startsWith(item.href));

  return (
    <header className="fixed inset-x-0 top-4 z-50 px-4 sm:px-6">
      <div ref={navRef} className="relative mx-auto max-w-[1200px]">
        <nav
          aria-label={t("label")}
          className="flex h-[72px] items-center gap-2 rounded-lg bg-header px-3.5 shadow-float"
        >
          <Link
            href="/"
            aria-label={t("home")}
            className="flex shrink-0 items-center gap-2.5 rounded-md px-1.5 py-1"
          >
            <Image src="/brand/logo.svg" alt="" width={36} height={36} priority />
            <span translate="no" className="text-lg font-bold tracking-tight">AnyThingISee</span>
          </Link>

          {/* 데스크톱 메뉴 */}
          <ul className="ml-8 hidden items-center gap-1 lg:flex">
            {navGroups.map((group) => {
              const open = openGroup === group.key;
              const panelId = `${baseId}-${group.key}-panel`;
              return (
                <li
                  key={group.key}
                  onPointerEnter={(e) => {
                    if (e.pointerType !== "mouse") return;
                    cancelClose();
                    setOpenGroup(group.key);
                  }}
                  onPointerLeave={(e) => {
                    if (e.pointerType === "mouse") scheduleClose();
                  }}
                >
                  <button
                    id={`${baseId}-${group.key}-button`}
                    type="button"
                    aria-expanded={open}
                    aria-controls={panelId}
                    onClick={(e) => {
                      // 마우스는 올리는 순간 이미 열려 있으므로 클릭으로 닫지 않는다 (키보드·터치는 토글)
                      const isMouse = (e.nativeEvent as PointerEvent).pointerType === "mouse";
                      setOpenGroup(open && !isMouse ? null : group.key);
                    }}
                    className="flex items-center gap-1 rounded-md px-3 py-3 text-[15px] font-medium hover:bg-foreground/5"
                  >
                    {t(`groups.${group.key}`)}
                    <ChevronDown
                      width={16}
                      height={16}
                      className={`transition-transform ${open ? "rotate-180" : ""}`}
                    />
                  </button>
                  <div
                    id={panelId}
                    hidden={!open}
                    className="absolute left-0 top-full w-full pt-2"
                  >
                    <MegaPanel items={group.items} isActive={isActive} />
                  </div>
                </li>
              );
            })}
            <li>
              <NavLink
                item={licenseItems[0]}
                className="block rounded-md px-3 py-3 text-[15px] font-medium hover:bg-foreground/5"
                active={isActive(licenseItems[0])}
              >
                {t("groups.license")}
              </NavLink>
            </li>
          </ul>

          <div className="ml-auto flex items-center gap-1.5">
            <a
              href={external.repo}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${t("items.issues.title")} · GitHub (${t("external")})`}
              className="hidden rounded-md p-3 hover:bg-foreground/5 sm:block"
            >
              <GitHub />
            </a>
            {/* #14 설정(언어·화면 모드) 버튼 자리 */}
            <Link
              href="/download"
              className="hidden items-center gap-2 rounded-lg bg-cta px-6 py-3 text-[15px] font-semibold text-cta-foreground hover:opacity-90 sm:flex"
            >
              <Download width={18} height={18} />
              {t("download")}
            </Link>
            <button
              ref={mobileButtonRef}
              type="button"
              aria-expanded={mobileOpen}
              aria-controls={`${baseId}-mobile`}
              aria-label={mobileOpen ? t("closeMenu") : t("openMenu")}
              onClick={() => {
                setOpenGroup(null);
                setMobileOpen((v) => !v);
              }}
              className="rounded-md p-3 hover:bg-foreground/5 lg:hidden"
            >
              {mobileOpen ? <Close /> : <Menu />}
            </button>
          </div>
        </nav>

        {/* 모바일 메뉴 */}
        <div
          id={`${baseId}-mobile`}
          hidden={!mobileOpen}
          className="absolute inset-x-0 top-full mt-2 max-h-[calc(100dvh-112px)] overflow-y-auto overscroll-contain rounded-lg bg-header p-4 shadow-float lg:hidden"
        >
          {[...navGroups, { key: "license", items: licenseItems }].map((group) => (
            <section key={group.key} className="border-b border-border py-3 last:border-0">
              <h2 className="px-2 pb-1 text-xs font-semibold uppercase tracking-wider text-muted">
                {t(`groups.${group.key}`)}
              </h2>
              <ul>
                {group.items.map((item) => (
                  <li key={item.key}>
                    <NavLink
                      item={item}
                      active={isActive(item)}
                      externalLabel={t("external")}
                      className="block rounded-md px-2 py-2.5 text-base font-medium hover:bg-foreground/5"
                    >
                      {t(`items.${item.key}.title`)}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </section>
          ))}
          <Link
            href="/download"
            className="mt-3 flex items-center justify-center gap-2 rounded-lg bg-cta px-6 py-3 font-semibold text-cta-foreground"
          >
            <Download width={18} height={18} />
            {t("download")}
          </Link>
        </div>
      </div>
    </header>
  );
}

function MegaPanel({
  items,
  isActive,
}: {
  items: NavItem[];
  isActive: (item: NavItem) => boolean;
}) {
  const t = useTranslations("Nav");
  return (
    <ul className="grid grid-cols-3 gap-2 rounded-lg bg-header p-3 shadow-float">
      {items.map((item) => (
        <li key={item.key}>
          <NavLink
            item={item}
            active={isActive(item)}
            externalLabel={t("external")}
            className="block h-full rounded-md p-4 hover:bg-foreground/5"
          >
            <span className="block font-semibold">{t(`items.${item.key}.title`)}</span>
            <span className="mt-1 block text-sm leading-relaxed text-muted">
              {t(`items.${item.key}.desc`)}
            </span>
          </NavLink>
        </li>
      ))}
    </ul>
  );
}
