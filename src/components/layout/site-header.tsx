"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { ChevronDown, Close, GitHub, Menu } from "@/components/icons";
import { NavLink } from "@/components/layout/nav-link";
import { SettingsMenu } from "@/components/layout/settings-menu";
import { Link, usePathname } from "@/i18n/navigation";
import { external, licenseItems, navGroups, type NavItem } from "@/lib/links";

const HOVER_CLOSE_DELAY = 120;

// #30: hex-rays식 떠 있는 바 — 로고 · 가운데 메뉴(▾) · 아이콘 · 다운로드 버튼
export function SiteHeader() {
  const t = useTranslations("Nav");
  const pathname = usePathname();
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const barRef = useRef<HTMLDivElement>(null);
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
      if (barRef.current && !barRef.current.contains(e.target as Node)) closeAll();
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (openGroup) document.getElementById(`${baseId}-${openGroup}-button`)?.focus();
      else mobileButtonRef.current?.focus();
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

  const license = licenseItems[0];

  return (
    // 바깥 여백 영역은 클릭이 뒤 화면으로 지나가게 둔다
    <header className="pointer-events-none sticky top-0 z-50 px-3 pt-3 sm:px-6 sm:pt-4">
      <div ref={barRef} className="pointer-events-auto relative mx-auto max-w-[1200px]">
        <nav
          aria-label={t("label")}
          className="flex h-16 items-center gap-2 rounded-xl border border-border/70 bg-surface pl-3 pr-2 shadow-float lg:h-[72px] lg:pl-4"
        >
          <Link href="/" aria-label={t("home")} className="flex shrink-0 items-center gap-3 rounded-lg px-1 py-1">
            <Image src="/brand/logo.svg" alt="" width={38} height={38} priority className="rounded-lg" />
            <span translate="no" className="text-xl font-bold tracking-tight">
              AnyThingISee
            </span>
          </Link>

          {/* 데스크톱 메뉴: 가운데 */}
          <ul className="hidden flex-1 items-center justify-center gap-1 lg:flex">
            {navGroups.map((group) => {
              const open = openGroup === group.key;
              const panelId = `${baseId}-${group.key}-panel`;
              return (
                <li
                  key={group.key}
                  className="relative"
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
                    className="flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-[16px] font-medium hover:bg-ink/5"
                  >
                    {t(`groups.${group.key}`)}
                    <ChevronDown
                      width={16}
                      height={16}
                      className={`transition-transform motion-reduce:transition-none ${open ? "rotate-180" : ""}`}
                    />
                  </button>
                  <div id={panelId} hidden={!open} className="absolute left-0 top-full pt-3">
                    <DropdownList items={group.items} isActive={isActive} />
                  </div>
                </li>
              );
            })}
            <li>
              <NavLink
                item={license}
                active={isActive(license)}
                className="block rounded-lg px-4 py-2.5 text-[16px] font-medium hover:bg-ink/5"
              >
                {t("groups.license")}
              </NavLink>
            </li>
          </ul>

          <div className="ml-auto flex items-center gap-1">
            <a
              href={external.repo}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`GitHub (${t("external")})`}
              className="hidden rounded-lg p-2.5 hover:bg-ink/5 sm:block"
            >
              <GitHub width={22} height={22} />
            </a>
            <div className="hidden lg:block">
              <SettingsMenu />
            </div>
            <Link
              href="/download"
              className="ml-2 hidden rounded-lg bg-accent px-6 py-3 text-[16px] font-semibold text-on-accent hover:bg-accent-hover sm:block"
            >
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
              className="rounded-lg p-3 hover:bg-ink/5 lg:hidden"
            >
              {mobileOpen ? <Close /> : <Menu />}
            </button>
          </div>
        </nav>

        {/* 모바일 메뉴: 바 아래로 펼침, 그룹은 선으로만 나눔 */}
        <div
          id={`${baseId}-mobile`}
          hidden={!mobileOpen}
          className="absolute inset-x-0 top-full mt-2 max-h-[calc(100dvh-96px)] overflow-y-auto overscroll-contain rounded-xl border border-border/70 bg-surface p-4 shadow-float lg:hidden"
        >
          {[...navGroups, { key: "license", items: licenseItems }].map((group) => (
            <section key={group.key} className="border-b border-border py-3 first:pt-0">
              <h2 className="px-2 pb-1 text-[13px] font-semibold text-muted">{t(`groups.${group.key}`)}</h2>
              <ul>
                {group.items.map((item) => (
                  <li key={item.key}>
                    <NavLink
                      item={item}
                      active={isActive(item)}
                      externalLabel={t("external")}
                      className="block rounded-lg px-2 py-2.5 text-base font-medium hover:bg-ink/5"
                    >
                      {t(`items.${item.key}.title`)}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </section>
          ))}
          <section className="border-b border-border py-4">
            <SettingsMenu variant="inline" />
          </section>
          <Link
            href="/download"
            className="mt-4 block rounded-lg bg-accent px-6 py-3.5 text-center font-semibold text-on-accent"
          >
            {t("download")}
          </Link>
        </div>
      </div>
    </header>
  );
}

// 드롭다운: 타일 없이 제목 + 한 줄 설명 목록
function DropdownList({ items, isActive }: { items: NavItem[]; isActive: (item: NavItem) => boolean }) {
  const t = useTranslations("Nav");
  return (
    <ul className="w-[22rem] rounded-xl border border-border/70 bg-surface p-2 shadow-float">
      {items.map((item) => (
        <li key={item.key}>
          <NavLink
            item={item}
            active={isActive(item)}
            externalLabel={t("external")}
            className="block rounded-lg px-3.5 py-3 hover:bg-ink/5"
          >
            <span className="block font-semibold">{t(`items.${item.key}.title`)}</span>
            <span className="mt-0.5 block text-sm leading-snug text-muted">{t(`items.${item.key}.desc`)}</span>
          </NavLink>
        </li>
      ))}
    </ul>
  );
}
