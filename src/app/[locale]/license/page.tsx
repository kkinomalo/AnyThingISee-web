import type { Metadata } from "next";
import { alternates } from "@/lib/seo";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Check, ExternalArrow } from "@/components/icons";
import { routing, type Locale } from "@/i18n/routing";
import { external } from "@/lib/links";

const BLOB = `${external.repo}/blob/main`;

// 릴리스 저장소 THIRD-PARTY-NOTICES.md와 같은 목록
const components = [
  { name: "Ghidra 11.4.3 native C++ decompiler · SLEIGH subset", license: "Apache License 2.0", file: "Ghidra-Apache-2.0.txt" },
  { name: "zlib", license: "zlib license", file: "zlib.txt" },
  { name: "Zydis", license: "MIT", file: "Zydis-MIT.txt" },
  { name: "Zycore", license: "MIT", file: "Zycore-MIT.txt" },
  { name: "Microsoft WebView2 SDK components", license: "License · Notice", file: "WebView2-LICENSE.txt" },
];

export async function generateMetadata({ params }: PageProps<"/[locale]/license">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "License" });
  return { title: t("title"), description: t("metaDescription"), alternates: alternates(locale, "/license") };
}

export default async function LicensePage({ params }: PageProps<"/[locale]/license">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("License");

  // 현재 언어의 원문을 먼저 보여준다
  const order = [locale, ...routing.locales.filter((l) => l !== locale)] as Locale[];

  return (
    <div className="mx-auto w-full max-w-[1200px] px-6 pt-12">
      <h1 className="display first-underline">{t("title")}</h1>
      <p className="mt-5 max-w-3xl text-lg text-muted">{t("lead")}</p>

      <div className="mt-12 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <section aria-labelledby="summary-title" className="card p-6 sm:p-8">
          <h2 id="summary-title" className="subtitle">
            {t("summary.title")}
          </h2>
          <ul className="mt-5 space-y-4">
            {(t.raw("summary.items") as string[]).map((item) => (
              <li key={item} className="flex gap-3">
                <Check width={20} height={20} className="mt-0.5 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-sm text-muted">{t("notice")}</p>
        </section>

        <section aria-labelledby="originals-title" className="card h-fit p-6 sm:p-8">
          <h2 id="originals-title" className="subtitle">
            {t("originals.title")}
          </h2>
          <ul className="mt-5 space-y-3">
            {order.map((l) => (
              <li key={l}>
                <a
                  href={`${BLOB}/licenses/AnyThingISee-Free-${l}.txt`}
                  target="_blank"
                  rel="noopener noreferrer"
                  hrefLang={l}
                  className="inline-flex items-center gap-1.5 font-semibold underline underline-offset-4"
                >
                  {t(`originals.${l}`)}
                  <ExternalArrow width={14} height={14} />
                </a>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section aria-labelledby="third-title" className="mt-16">
        <h2 id="third-title" className="title first-underline">
          {t("third.title")}
        </h2>
        <p className="mt-3 max-w-3xl text-muted">{t("third.lead")}</p>
        <div className="card mt-8 overflow-x-auto">
          <table className="w-full min-w-[520px] text-left">
            <thead className="text-sm text-muted">
              <tr className="border-b border-border">
                <th className="px-6 py-4 font-semibold">{t("third.component")}</th>
                <th className="px-6 py-4 font-semibold">{t("third.license")}</th>
              </tr>
            </thead>
            <tbody>
              {components.map((c) => (
                <tr key={c.name} className="border-b border-border last:border-0">
                  <td translate="no" className="px-6 py-4">
                    {c.name}
                  </td>
                  <td className="px-6 py-4">
                    <a
                      href={`${BLOB}/licenses/${c.file}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      translate="no"
                      className="inline-flex items-center gap-1 underline underline-offset-4"
                    >
                      {c.license}
                      <ExternalArrow width={14} height={14} />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-6 space-y-3 text-sm text-muted">
          <p>{t("third.ghidraNote")}</p>
          <p>{t("third.webviewNote")}</p>
        </div>
        <a
          href={external.thirdParty}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex items-center gap-1.5 font-semibold underline underline-offset-4"
        >
          {t("third.full")}
          <ExternalArrow width={14} height={14} />
        </a>
      </section>
    </div>
  );
}
