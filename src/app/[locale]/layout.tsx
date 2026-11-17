import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { useTranslations } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import { Analytics } from "@vercel/analytics/next";
import "pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css";
import { BackToTop } from "@/components/layout/back-to-top";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { routing } from "@/i18n/routing";
import { alternates, SITE_URL } from "@/lib/seo";
import "../globals.css";

export const viewport: Viewport = {
  themeColor: "#f7f3e8",
  colorScheme: "light",
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: LayoutProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: t("title"), template: `%s · AnyThingISee` },
    description: t("description"),
    alternates: alternates(locale),
  };
}

export default async function LocaleLayout({
  children,
  params,
}: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  return (
    <html
      lang={locale}
      className={`${GeistSans.variable} ${GeistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans">
          <NextIntlClientProvider>
            <SkipLink />
            <SiteHeader />
            <main id="main" tabIndex={-1} className="flex flex-1 flex-col outline-none">
              {children}
            </main>
            <SiteFooter />
            <BackToTop />
            <Analytics />
          </NextIntlClientProvider>
      </body>
    </html>
  );
}

function SkipLink() {
  const t = useTranslations("Nav");
  return (
    <a
      href="#main"
      className="sr-only z-[60] rounded-md bg-cta px-4 py-2 text-cta-foreground focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
    >
      {t("skip")}
    </a>
  );
}
