import "server-only";
import { contactMail, type Contact } from "./contact-mail";

// 문의 메일 알림 (#68) — Resend API. RESEND_API_KEY가 없으면 보내지 않는다 (어드민에서만 확인)
export async function notifyContact(c: Contact) {
  const key = process.env.RESEND_API_KEY;
  const to = (process.env.CONTACT_NOTIFY_TO ?? process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean);
  if (!key || to.length === 0) return { sent: false as const, reason: "not-configured" };
  const from = process.env.CONTACT_FROM ?? "AnyThingISee <onboarding@resend.dev>";
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify(contactMail(c, to, from)),
  });
  if (!res.ok) {
    console.error("[notify] 문의 메일 실패", res.status, await res.text().catch(() => ""));
    return { sent: false as const, reason: `http-${res.status}` };
  }
  return { sent: true as const };
}
