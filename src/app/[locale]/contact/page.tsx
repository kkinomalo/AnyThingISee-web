import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Suspense } from "react";
import { ContactForm } from "@/components/contact/contact-form";
import { ExternalArrow, GitHub } from "@/components/icons";
import { external } from "@/lib/links";
import { alternates } from "@/lib/seo";
import { createClient } from "@/lib/supabase/server";

export async function generateMetadata({ params }: PageProps<"/[locale]/contact">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Contact" });
  return { title: t("title"), description: t("lead"), alternates: alternates(locale, "/contact") };
}

// 문의 (#66): 왼쪽은 문의 전에 볼 곳, 오른쪽은 폼. 주소 · 전화 같은 정보는 두지 않는다
export default async function ContactPage({ params }: PageProps<"/[locale]/contact">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Contact");

  const shortcuts = [
    { title: t("shortcuts.bug.title"), body: t("shortcuts.bug.body"), href: external.issues },
    { title: t("shortcuts.guide.title"), body: t("shortcuts.guide.body"), href: external.guide },
  ];

  return (
    <div className="mx-auto w-full max-w-[1200px] px-6 pb-8 pt-16 lg:pt-24">
      <h1>{t("title")}</h1>
      <p className="mt-5 max-w-2xl text-lg text-muted">{t("lead")}</p>

      <div className="mt-12 grid overflow-hidden rounded-2xl border border-border lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)]">
        <aside className="flex flex-col gap-8 bg-surface p-8 lg:p-10">
          <h2 className="text-2xl">{t("before")}</h2>
          <ul className="space-y-6">
            {shortcuts.map((s) => (
              <li key={s.title}>
                <a href={s.href} target="_blank" rel="noopener noreferrer" className="group inline-flex items-center gap-1.5 font-semibold">
                  <span className="underline underline-offset-4 group-hover:text-accent">{s.title}</span>
                  <ExternalArrow width={14} height={14} className="opacity-60" />
                </a>
                <p className="mt-1.5 text-muted">{s.body}</p>
              </li>
            ))}
          </ul>
          <p className="mt-auto flex items-center gap-2 border-t border-border pt-6 text-sm text-muted">
            <GitHub width={18} height={18} />
            <a href={external.repo} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:text-ink">
              kkinomalo/AnyThingISee-releases
            </a>
          </p>
        </aside>
        <div className="relative bg-background p-8 lg:p-10">
          <h2 className="text-2xl">{t("formTitle")}</h2>
          <div className="mt-8">
            {/* 로그인 상태면 이메일을 미리 채운다 (쿠키를 읽는 부분만 요청 시점) */}
            <Suspense fallback={<ContactForm />}>
              <PrefilledForm />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}

async function PrefilledForm() {
  const supabase = await createClient();
  const email = supabase ? (await supabase.auth.getUser()).data.user?.email : undefined;
  return <ContactForm defaultEmail={email ?? undefined} />;
}
