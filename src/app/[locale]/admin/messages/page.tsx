import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getFormatter, getTranslations, setRequestLocale } from "next-intl/server";
import { Suspense } from "react";
import { AdminHeader } from "@/components/admin/admin-header";
import { getAdmin } from "@/lib/admin";
import { createAdminClient } from "@/lib/supabase/admin";

export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };

type Row = { id: number; topic: string; name: string | null; email: string; message: string; locale: string | null; created_at: string };

// #66 어드민 문의 목록 — 최신 200건
export default async function AdminMessagesPage({ params }: PageProps<"/[locale]/admin/messages">) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <Suspense>
      <Body locale={locale} />
    </Suspense>
  );
}

async function Body({ locale }: { locale: string }) {
  const admin = await getAdmin();
  if (!admin) notFound();
  const t = await getTranslations("Admin");
  const c = await getTranslations("Contact");
  const format = await getFormatter();

  const db = createAdminClient();
  const { data } = db
    ? await db.from("contact_messages").select("id,topic,name,email,message,locale,created_at").order("created_at", { ascending: false }).limit(200)
    : { data: [] };
  const rows = (data ?? []) as Row[];

  return (
    <div className="min-h-dvh bg-background">
      <AdminHeader email={admin.email} locale={locale} current="messages" />
      <div className="mx-auto max-w-[1200px] px-6 pb-20 pt-12">
        <h1 className="text-[clamp(2rem,1.6rem+1.6vw,2.75rem)]">{t("messages")}</h1>
        <p className="mt-2 text-muted">{t("messagesLead", { n: rows.length })}</p>
        {rows.length === 0 ? (
          <p className="rule-top mt-10 pt-6 text-muted">{t("empty")}</p>
        ) : (
          <ul className="rule-top mt-10">
            {rows.map((r) => (
              <li key={r.id} className="grid gap-x-10 gap-y-3 border-b border-border py-6 md:grid-cols-[14rem_1fr]">
                <div className="text-sm">
                  <p className="font-semibold">{c(`topics.${r.topic}` as never)}</p>
                  <p className="mt-1 text-muted">{format.dateTime(new Date(r.created_at), { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Seoul" })}</p>
                  <p className="mt-2 break-all">
                    {r.name && <span>{r.name} · </span>}
                    <a href={`mailto:${r.email}`} className="underline underline-offset-4 hover:text-accent">
                      {r.email}
                    </a>
                  </p>
                  {r.locale && <p className="mt-1 font-mono text-xs text-muted">{r.locale}</p>}
                </div>
                <p className="whitespace-pre-wrap break-words">{r.message}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
