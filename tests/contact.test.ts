import { describe, expect, it } from "vitest";
import { parseContact } from "@/lib/contact";
import { contactMail } from "@/lib/contact-mail";

const form = (o: Record<string, string>) => {
  const f = new FormData();
  for (const [k, v] of Object.entries(o)) f.set(k, v);
  return f;
};
const ok = { topic: "general", email: "a@example.com", message: "열 글자 이상인 문의 내용입니다." };

describe("문의 입력 검증", () => {
  it("필수 값이 맞으면 통과, 이름은 비면 null", () => {
    const r = parseContact(form(ok));
    expect(r.ok && r.data.name).toBeNull();
  });
  it("이메일 · 내용 오류 표시", () => {
    const r = parseContact(form({ ...ok, email: "nope", message: "짧음" }));
    expect(r.ok).toBe(false);
    expect(!r.ok && r.fields.sort()).toEqual(["email", "message"]);
  });
  it("모르는 문의 유형 거부", () => {
    expect(parseContact(form({ ...ok, topic: "spam" })).ok).toBe(false);
  });
  it("숨은 칸이 채워지면 봇", () => {
    const r = parseContact(form({ ...ok, website: "http://spam" }));
    expect(!r.ok && r.fields).toContain("website");
  });
});

describe("문의 메일 내용", () => {
  const mail = contactMail(
    { topicLabel: "라이선스 · 구매", name: "<b>홍길동</b>", email: "a@example.com", message: "줄1\n<script>x</script>", locale: "ko" },
    ["admin@example.com"],
    "AnyThingISee <contact@example.com>",
  );
  it("답장하면 보낸 사람에게 가도록 reply_to", () => expect(mail.reply_to).toBe("a@example.com"));
  it("제목에 종류와 이름", () => expect(mail.subject).toBe("[AnyThingISee 문의] 라이선스 · 구매 — <b>홍길동</b>"));
  it("HTML은 이스케이프", () => {
    expect(mail.html).not.toContain("<script>");
    expect(mail.html).toContain("&#60;script&#62;");
  });
});
