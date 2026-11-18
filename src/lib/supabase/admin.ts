import "server-only";
import { createClient } from "@supabase/supabase-js";

/** service role 클라이언트 — RLS를 우회하므로 서버에서만, 다운로드 기록 · 어드민 통계에만 쓴다 */
export function createAdminClient() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}
