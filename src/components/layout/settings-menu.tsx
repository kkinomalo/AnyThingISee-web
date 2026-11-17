"use client";

import { useLocale, useTranslations } from "next-intl";
import { useEffect, useId, useRef, useState, useTransition } from "react";
import { Check, Globe } from "@/components/icons";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";

// 언어 이름은 번역하지 않고 각 언어로 표기
const LANGUAGE_NAMES: Record<Locale, string> = { ko: "한국어", en: "English", ja: "日本語" };

export function SettingsMenu({ variant = "popover" }: { variant?: "popover" | "inline" }) {
  const t = useTranslations("Settings");
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const ref = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const id = useId();

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const changeLocale = (next: Locale) => {
    if (next === locale) return;
    // 같은 페이지의 다른 언어 주소로 이동 (next-intl이 NEXT_LOCALE 쿠키에 저장)
    startTransition(() => router.replace(pathname, { locale: next }));
  };

  const panel = (
    <div className="space-y-5">
      <fieldset>
        <legend className="text-xs font-semibold uppercase tracking-wide text-muted">{t("language")}</legend>
        <div className="mt-2 grid gap-1" aria-busy={pending}>
          {routing.locales.map((l) => (
            <Choice
              key={l}
              name={`${id}-lang`}
              checked={l === locale}
              onChange={() => changeLocale(l)}
              lang={l}
            >
              {LANGUAGE_NAMES[l]}
            </Choice>
          ))}
        </div>
      </fieldset>
    </div>
  );

  if (variant === "inline") return panel;

  return (
    <div ref={ref} className="relative">
      <button
        ref={buttonRef}
        type="button"
        aria-label={`${t("language")}: ${LANGUAGE_NAMES[locale]}`}
        aria-expanded={open}
        aria-controls={`${id}-panel`}
        onClick={() => setOpen((v) => !v)}
        className="rounded-lg p-2.5 hover:bg-ink/5"
      >
        <Globe width={22} height={22} />
      </button>
      <div
        id={`${id}-panel`}
        role="dialog"
        aria-label={t("title")}
        hidden={!open}
        className="absolute right-0 top-full mt-3 w-60 rounded-lg border border-border bg-surface p-3 shadow-float"
      >
        {panel}
      </div>
    </div>
  );
}

function Choice({
  name,
  checked,
  onChange,
  children,
  lang,
}: {
  name: string;
  checked: boolean;
  onChange: () => void;
  children: React.ReactNode;
  lang?: string;
}) {
  return (
    <label
      lang={lang}
      className={`flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-accent ${
        checked ? "border-transparent bg-tint text-on-tint" : "border-transparent hover:bg-ink/5"
      } justify-between`}
    >
      <input type="radio" name={name} checked={checked} onChange={onChange} className="sr-only" />
      {children}
      {checked && <Check width={16} height={16} />}
    </label>
  );
}
