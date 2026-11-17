import { useTranslations } from "next-intl";
import { ArrowRight } from "@/components/icons";
import { Link } from "@/i18n/navigation";

export default function NotFound() {
  const t = useTranslations("NotFound");
  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-1 flex-col items-start justify-center gap-5 px-6 py-24">
      <p className="font-mono text-sm text-muted">404</p>
      <h1>{t("title")}</h1>
      <p className="text-muted">{t("body")}</p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 rounded-lg bg-cta px-6 py-3 font-semibold text-cta-foreground hover:opacity-90"
      >
        {t("home")}
        <ArrowRight width={18} height={18} />
      </Link>
    </div>
  );
}
