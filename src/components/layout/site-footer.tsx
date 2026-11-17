import Image from "next/image";
import { useTranslations } from "next-intl";
import { GitHub } from "@/components/icons";
import { NavLink } from "@/components/layout/nav-link";
import { external, licenseItems, navGroups } from "@/lib/links";

// 빌드 시점 날짜를 쓰면 정적 페이지가 날짜에 묶이므로 고정값을 쓴다
const COPYRIGHT_YEAR = 2026;

export function SiteFooter() {
  const t = useTranslations("Nav");
  const f = useTranslations("Footer");
  const groups = [...navGroups, { key: "license", items: licenseItems }];

  return (
    <footer className="mt-24 bg-ink text-ivory-light">
      <div className="mx-auto grid max-w-[1200px] gap-12 px-6 py-16 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Image src="/brand/logo.svg" alt="" width={40} height={40} />
            <span className="text-lg font-bold">AnyThingISee</span>
          </div>
          <p className="max-w-xs text-sm leading-relaxed text-ivory-light/70">{f("tagline")}</p>
          <p className="text-sm text-ivory">{f("free")}</p>
          <a
            href={external.repo}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-ivory-light/80 hover:text-ivory-light"
          >
            <GitHub width={18} height={18} />
            {f("github")}
            <span className="sr-only"> ({t("external")})</span>
          </a>
        </div>

        {groups.map((group) => (
          <nav key={group.key} aria-label={t(`groups.${group.key}`)}>
            <h2 className="text-sm font-semibold text-ivory">{t(`groups.${group.key}`)}</h2>
            <ul className="mt-4 space-y-3">
              {group.items.map((item) => (
                <li key={item.key}>
                  <NavLink
                    item={item}
                    externalLabel={t("external")}
                    className="text-sm text-ivory-light/70 hover:text-ivory-light"
                  >
                    {t(`items.${item.key}.title`)}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="border-t border-ivory-light/10">
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-2 px-6 py-6 text-xs text-ivory-light/60">
          <span>{f("copyright", { year: COPYRIGHT_YEAR })}</span>
          <span className="font-mono">Free Edition 0.1.0 Preview</span>
        </div>
      </div>
    </footer>
  );
}
