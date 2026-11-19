// 문의 (#66) — 입력 검증 (서버 · 테스트 공용)
import { z } from "zod";

export const TOPICS = ["general", "license", "partnership", "other"] as const;
export type Topic = (typeof TOPICS)[number];

export const contactSchema = z.object({
  topic: z.enum(TOPICS),
  name: z.string().trim().max(80).optional().transform((v) => v || null),
  email: z.email().trim().max(200),
  message: z.string().trim().min(10).max(5000),
  // 사람에게는 보이지 않는 칸. 값이 있으면 봇
  website: z.string().max(0).optional(),
});

export type ContactInput = z.infer<typeof contactSchema>;
export type ContactState =
  | { status: "idle" }
  | { status: "sent" }
  | { status: "invalid"; fields: string[] }
  | { status: "limited" }
  | { status: "error" };

/** 짧은 시간 같은 방문자의 반복 제출 제한: 10분에 3건 */
export const RATE_WINDOW_MS = 10 * 60 * 1000;
export const RATE_MAX = 3;

export function parseContact(form: FormData) {
  const raw = Object.fromEntries(["topic", "name", "email", "message", "website"].map((k) => [k, form.get(k) ?? undefined]));
  const result = contactSchema.safeParse(raw);
  if (result.success) return { ok: true as const, data: result.data };
  return { ok: false as const, fields: [...new Set(result.error.issues.map((i) => String(i.path[0])))] };
}
