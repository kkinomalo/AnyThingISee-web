// 문의 알림 메일 내용 (#68) — 순수 함수 (서버 · 테스트 공용)
import { SITE_URL } from "./seo";

export type Contact = { topicLabel: string; name: string | null; email: string; message: string; locale: string | null };

const escape = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

export function contactMail(c: Contact, to: string[], from: string) {
  const who = c.name ? `${c.name} <${c.email}>` : c.email;
  const admin = `${SITE_URL}/ko/admin/messages`;
  return {
    from,
    to,
    reply_to: c.email,
    subject: `[AnyThingISee 문의] ${c.topicLabel} — ${c.name ?? c.email}`,
    text: `${c.topicLabel}\n보낸 사람: ${who}\n언어: ${c.locale ?? "-"}\n\n${c.message}\n\n이 메일에 답장하면 보낸 사람에게 바로 갑니다.\n어드민: ${admin}\n`,
    html: `<div style="font-family:system-ui,sans-serif;line-height:1.6;color:#1f1b16">
<p style="margin:0 0 4px;color:#5f574a">${escape(c.topicLabel)} · ${escape(c.locale ?? "-")}</p>
<p style="margin:0 0 16px"><strong>${escape(who)}</strong></p>
<div style="white-space:pre-wrap;border-left:3px solid #a04914;padding:8px 14px;background:#f7f3e8">${escape(c.message)}</div>
<p style="margin:16px 0 0;color:#5f574a;font-size:14px">이 메일에 답장하면 보낸 사람에게 바로 갑니다 · <a href="${admin}" style="color:#a04914">어드민에서 보기</a></p>
</div>`,
  };
}

