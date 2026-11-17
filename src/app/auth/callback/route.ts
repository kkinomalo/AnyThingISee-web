import { NextResponse, type NextRequest } from "next/server";
import { routing } from "@/i18n/routing";
import { createClient } from "@/lib/supabase/server";

// OAuth · 이메일 링크에서 돌아온 code를 세션으로 바꾼다
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const raw = searchParams.get("next") ?? "/";
  // 같은 사이트 경로만 허용 (열린 리디렉션 방지)
  const next = raw.startsWith("/") && !raw.startsWith("//") && !raw.startsWith("/\\") ? raw : "/";
  const segment = next.split("/")[1];
  const locale = (routing.locales as readonly string[]).includes(segment) ? segment : routing.defaultLocale;

  const supabase = await createClient();
  if (code && supabase) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}${next}`);
  }
  return NextResponse.redirect(`${origin}/${locale}/login?error=1`);
}
