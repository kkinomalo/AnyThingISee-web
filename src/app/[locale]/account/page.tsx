import type { Metadata } from "next";
import { getFormatter, getTranslations, setRequestLocale } from "next-intl/server";
import { Suspense } from "react";
import { redirect } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";

export async function generateMetadata({ params }: PageProps<"/[locale]/account">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Account" });
  return { title: t("title"), robots: { index: false } };
}

export default async function AccountPage({ params }: PageProps<"/[locale]/account">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Account");

  return (
    <div className="mx-auto w-full max-w-[720px] px-6 pb-16 pt-16 lg:pt-24">
      <h1 className="text-[clamp(2rem,1.6rem+1.6vw,2.75rem)]">{t("title")}</h1>
      {/* 쿠키를 읽는 부분만 요청 시점에 그린다 */}
      <Suspense fallback={<p className="mt-10 text-muted">{t("loading")}</p>}>
        <AccountBody locale={locale} />
      </Suspense>
    </div>
  );
}

async function AccountBody({ locale }: { locale: string }) {
  const t = await getTranslations("Account");
  const format = await getFormatter();
  const supabase = await createClient();
  const user = supabase ? (await supabase.auth.getUser()).data.user : null;
  if (!user) redirect({ href: "/login", locale });

  const provider = user!.app_metadata.provider ?? "email";
  const rows: [string, string][] = [
    [t("email"), user!.email ?? "-"],
    [t("provider"), provider === "github" ? "GitHub" : provider === "google" ? "Google" : t("emailLink")],
    [t("since"), format.dateTime(new Date(user!.created_at), { dateStyle: "medium" })],
  ];

  async function signOut() {
    "use server";
    const client = await createClient();
    await client?.auth.signOut();
    redirect({ href: "/", locale });
  }

  return (
    <>
      <dl className="rule-top mt-10">
        {rows.map(([k, v]) => (
          <div key={k} className="grid grid-cols-[8rem_1fr] gap-4 border-b border-border py-4 sm:grid-cols-[10rem_1fr]">
            <dt className="text-muted">{k}</dt>
            <dd className="min-w-0 break-all font-medium">{v}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-8 text-muted">{t("soon")}</p>
      <form action={signOut} className="mt-10">
        <button type="submit" className="rounded-lg border border-border bg-surface px-5 py-3 font-semibold hover:bg-ink/5">
          {t("signOut")}
        </button>
      </form>
    </>
  );
}
