"use server";

import { headers } from "next/headers";
import { parseContact, RATE_MAX, RATE_WINDOW_MS, type ContactState } from "@/lib/contact";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { visitorHash } from "@/lib/visitor";

// 문의 저장 (#66): 검증 → 숨은 칸(봇) → 반복 제출 제한 → service role로 저장
export async function sendContact(_prev: ContactState, form: FormData): Promise<ContactState> {
  const parsed = parseContact(form);
  if (!parsed.ok) {
    // 숨은 칸이 채워졌으면 봇: 보낸 것처럼 응답하고 저장하지 않는다
    if (parsed.fields.includes("website")) return { status: "sent" };
    return { status: "invalid", fields: parsed.fields };
  }

  const db = createAdminClient();
  if (!db) return { status: "error" };

  const h = await headers();
  const visitor = visitorHash(h);
  const since = new Date(Date.now() - RATE_WINDOW_MS).toISOString();
  const { count } = await db
    .from("contact_messages")
    .select("id", { count: "exact", head: true })
    .eq("visitor_hash", visitor)
    .gte("created_at", since);
  if ((count ?? 0) >= RATE_MAX) return { status: "limited" };

  const supabase = await createClient();
  const user = supabase ? (await supabase.auth.getUser()).data.user : null;
  const { data } = parsed;
  const { error } = await db.from("contact_messages").insert({
    topic: data.topic,
    name: data.name,
    email: data.email,
    message: data.message,
    locale: String(form.get("locale") ?? "").slice(0, 5) || null,
    visitor_hash: visitor,
    user_id: user?.id ?? null,
  });
  if (error) {
    console.error("[contact] 저장 실패", error.message);
    return { status: "error" };
  }
  return { status: "sent" };
}
