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
  const from = process.env.CONTACT_FROM ?? TEST_FROM;
  let res = await send(key, contactMail(c, to, from));
  // 발신 도메인 인증 전이면(403 · 422) Resend 테스트 주소로 다시 보낸다.
  // 테스트 주소는 Resend 계정 주인 이메일로만 가므로 어드민 알림에는 충분하다. 인증이 끝나면 자동으로 원래 주소 사용
  if (!res.ok && (res.status === 403 || res.status === 422) && from !== TEST_FROM) {
    console.warn("[notify] 발신 도메인 미인증 — 테스트 주소로 재시도", res.status);
    res = await send(key, contactMail(c, to, TEST_FROM));
  }
  if (!res.ok) {
    console.error("[notify] 문의 메일 실패", res.status, await res.text().catch(() => ""));
    return { sent: false as const, reason: `http-${res.status}` };
  }
  return { sent: true as const };
}

const TEST_FROM = "AnyThingISee <onboarding@resend.dev>";

function send(key: string, mail: ReturnType<typeof contactMail>) {
  return fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify(mail),
  });
}
