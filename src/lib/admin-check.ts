// 어드민 판정 (#72) — proxy · 서버 공용 순수 함수
// 1) Supabase 사용자의 app_metadata.role === "admin" (DB에서 직접 지정, 본인은 바꿀 수 없음)
// 2) 환경 변수 ADMIN_EMAILS에 있는 이메일
// 어느 쪽이든 이메일 인증이 된 사용자만
type UserLike = { email?: string | null; email_confirmed_at?: string | null; app_metadata?: Record<string, unknown> | null } | null | undefined;

export function isAdminUser(user: UserLike, adminEmails = process.env.ADMIN_EMAILS ?? "") {
  if (!user?.email_confirmed_at) return false;
  if (user.app_metadata?.role === "admin") return true;
  const email = user.email?.toLowerCase();
  const allowed = adminEmails.split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);
  return Boolean(email && allowed.includes(email));
}
