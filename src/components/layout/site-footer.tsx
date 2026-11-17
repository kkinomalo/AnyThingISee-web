import Image from "next/image";
import { useTranslations } from "next-intl";
import { GitHub } from "@/components/icons";
import { NavLink } from "@/components/layout/nav-link";
import { external, licenseItems, navGroups } from "@/lib/links";

// 빌드 시점 날짜를 쓰면 정적 페이지가 날짜에 묶이므로 고정값을 쓴다
const COPYRIGHT_YEAR = 2026;

// hex-rays 푸터 형식: 밝은 바탕, 작은 대문자 열 제목, 아래 줄에 저작권
export function SiteFooter() {
  const t = useTranslations("Nav");
  const f = useTranslations("Footer");
  const groups = [...navGroups, { key: "license", items: licenseItems }];

  return (
    <footer className="mt-24 border-t border-border">
      <div className="mx-auto grid max-w-[1200px] gap-10 px-6 py-14 md:grid-cols-[1.5fr_repeat(3,1fr)]">
        <div className="space-y-4">
          <div className="flex items-center gap-2.5">
            <Image src="/brand/logo.svg" alt="" width={36} height={36} />
            <span translate="no" className="text-lg font-bold tracking-tight">AnyThingISee</span>
          </div>
          <p className="max-w-xs text-sm text-muted">{f("tagline")}</p>
          <p className="text-sm font-semibold">{f("free")}</p>
        </div>

        {groups.map((group) => (
          <nav key={group.key} aria-label={t(`groups.${group.key}`)}>
            <h2 className="text-sm uppercase tracking-wide text-muted">{t(`groups.${group.key}`)}</h2>
            <ul className="mt-4 space-y-3">
              {group.items.map((item) => (
                <li key={item.key}>
                  <NavLink item={item} externalLabel={t("external")} className="hover:underline">
                    {t(`items.${item.key}.title`)}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-4 border-t border-border px-6 py-6 text-sm text-muted">
        <a
          href={external.repo}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${f("github")} (${t("external")})`}
          className="rounded-md p-1 hover:text-foreground"
        >
          <GitHub width={20} height={20} />
        </a>
        <span>
          {f("copyright", { year: COPYRIGHT_YEAR })} · <span className="font-mono">Free Edition 0.1.0 Preview</span>
        </span>
      </div>
    </footer>
  );
}
