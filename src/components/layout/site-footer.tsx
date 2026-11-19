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
  { key: "contact", href: "/contact" },
];

// 한 줄 푸터 — 이름 · 소개 · 링크 / 저작권. #76: 진한 갈색 바탕 + 밝은 글자
export function SiteFooter() {
  const t = useTranslations("Nav");
  const f = useTranslations("Footer");

  return (
    <footer className="mt-32 bg-cta-dark text-on-ink">
      <div className="mx-auto flex max-w-[1200px] flex-wrap items-baseline gap-x-12 gap-y-4 px-6 py-12 text-[15px]">
        <span translate="no" className="font-bold">
          AnyThingISee
        </span>
        <span className="text-on-ink-muted">{f("tagline")}</span>
        <nav aria-label={t("label")} className="flex flex-wrap gap-x-5 gap-y-2 lg:ml-auto">
          {links.map((item) => (
            <NavLink key={item.key} item={item} externalLabel={t("external")} className="hover:text-white hover:underline hover:underline-offset-4">
              {t(`items.${item.key}.title`)}
            </NavLink>
          ))}
          <a href={external.repo} target="_blank" rel="noopener noreferrer" className="hover:text-white hover:underline hover:underline-offset-4">
            GitHub ↗<span className="sr-only"> ({t("external")})</span>
          </a>
        </nav>
        <p className="basis-full border-t border-white/10 pt-4 text-sm text-on-ink-muted">
          {f("copyright", { year: COPYRIGHT_YEAR })} · {f("free")}
        </p>
      </div>
    </footer>
  );
}
