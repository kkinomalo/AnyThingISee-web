import Image from "next/image";
import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { use } from "react";

// 임시 첫 화면 — 실제 메인은 #3에서 만든다
export default function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = use(params);
  setRequestLocale(locale);
  const t = useTranslations("Home");

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-start justify-center gap-6 px-6 py-24">
      <Image src="/brand/logo.svg" alt="" width={72} height={72} priority />
      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">{t("title")}</h1>
      <p className="max-w-xl text-lg text-muted">{t("tagline")}</p>
      <div className="flex flex-wrap items-center gap-3">
        <span className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground">
          {t("version")}
        </span>
        <code className="font-mono text-sm text-muted">Windows 10/11 x64</code>
      </div>
    </div>
  );
}
