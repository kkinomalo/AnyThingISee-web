import { useTranslations } from "next-intl";
import { NavLink } from "@/components/layout/nav-link";
import { external, type NavItem } from "@/lib/links";

// 빌드 시점 날짜를 쓰면 정적 페이지가 날짜에 묶이므로 고정값을 쓴다
const COPYRIGHT_YEAR = 2026;

const links: NavItem[] = [
  { key: "releases", href: "/releases" },
  { key: "compare", href: "/compare" },
  { key: "license", href: "/license" },
  { key: "thirdParty", href: external.thirdParty, external: true },
  { key: "issues", href: external.issues, external: true },
];

// 시안 #28: 한 줄 푸터 — 이름 · 소개 · 링크 / 저작권
export function SiteFooter() {
  const t = useTranslations("Nav");
  const f = useTranslations("Footer");

  return (
    <footer className="mt-32 border-t border-border">
      <div className="mx-auto flex max-w-[1200px] flex-wrap items-baseline gap-x-12 gap-y-4 px-6 py-12 text-[15px]">
        <span translate="no" className="font-bold">
          AnyThingISee
        </span>
        <span className="text-muted">{f("tagline")}</span>
        <nav aria-label={t("label")} className="flex flex-wrap gap-x-5 gap-y-2 lg:ml-auto">
          {links.map((item) => (
            <NavLink key={item.key} item={item} externalLabel={t("external")} className="hover:text-accent">
              {t(`items.${item.key}.title`)}
            </NavLink>
          ))}
          <a href={external.repo} target="_blank" rel="noopener noreferrer" className="hover:text-accent">
            GitHub ↗<span className="sr-only"> ({t("external")})</span>
          </a>
        </nav>
        <p className="basis-full text-sm text-muted">
          {f("copyright", { year: COPYRIGHT_YEAR })} · {f("free")}
        </p>
      </div>
    </footer>
  );
}
