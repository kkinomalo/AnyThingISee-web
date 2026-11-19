import "server-only";
import { createHash } from "node:crypto";

/** 하루 단위 방문자 해시 — IP · User-Agent 원문은 저장하지 않고 중복 판별에만 쓴다 */
export function visitorHash(headers: Headers) {
  const ip = headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "";
  const ua = headers.get("user-agent") ?? "";
  const day = new Date().toISOString().slice(0, 10);
  const pepper = process.env.SUPABASE_JWT_SECRET ?? "";
  return createHash("sha256").update(`${ip}|${ua}|${day}|${pepper}`).digest("hex").slice(0, 32);
}
