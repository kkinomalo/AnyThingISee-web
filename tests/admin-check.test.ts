import { describe, expect, it } from "vitest";
import { isAdminUser } from "@/lib/admin-check";

const user = (o: object) => ({ email: "a@example.com", email_confirmed_at: "2026-11-19", app_metadata: {}, ...o });

describe("어드민 판정", () => {
  it("DB 역할 admin이면 어드민", () => expect(isAdminUser(user({ app_metadata: { role: "admin" } }), "")).toBe(true));
  it("ADMIN_EMAILS에 있으면 어드민 (대소문자 무시)", () => expect(isAdminUser(user({ email: "A@Example.com" }), "x@y.z, a@example.com")).toBe(true));
  it("둘 다 아니면 아님", () => expect(isAdminUser(user({}), "x@y.z")).toBe(false));
  it("이메일 인증 전이면 역할이 있어도 아님", () => expect(isAdminUser(user({ email_confirmed_at: null, app_metadata: { role: "admin" } }), "")).toBe(false));
  it("로그인 안 함", () => expect(isAdminUser(null, "a@example.com")).toBe(false));
});
