import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { adminSignOut } from "@/app/[locale]/admin/actions";
import { Link } from "@/i18n/navigation";

// 어드민 전용 상단 바: 다운로드 통계 · 문의 탭
export async function AdminHeader({ email, locale, current }: { email?: string; locale: string; current: "stats" | "messages" }) {
  const t = await getTranslations("Admin");
  const tabs = [
    { key: "stats", href: "/admin", label: t("heading") },
    { key: "messages", href: "/admin/messages", label: t("messages") },
  ] as const;
  return (
    <header className="border-b border-border bg-surface">
      <div className="mx-auto flex h-16 max-w-[1200px] items-center gap-6 px-6">
        <Link href="/" className="flex items-center gap-2.5 font-bold">
          <Image src="/brand/logo.svg" alt="" width={28} height={28} />
          <span translate="no">AnyThingISee</span>
        </Link>
        <span className="text-muted">/ {t("title")}</span>
        <nav aria-label={t("title")} className="flex gap-1 text-[15px]">
          {tabs.map((tab) => (
            <Link
              key={tab.key}
              href={tab.href}
              aria-current={tab.key === current ? "page" : undefined}
              className={`rounded-md px-3 py-1.5 ${tab.key === current ? "bg-ink/5 font-semibold" : "text-muted hover:text-ink"}`}
            >
              {tab.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-5 text-sm">
          <span className="hidden text-muted md:inline">{email}</span>
          <form action={adminSignOut}>
            <input type="hidden" name="locale" value={locale} />
            <button type="submit" className="underline underline-offset-4 hover:text-accent">
              {t("signOut")}
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
