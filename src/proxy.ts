import { createServerClient } from "@supabase/ssr";
import createMiddleware from "next-intl/middleware";
import type { NextRequest } from "next/server";
import { routing } from "./i18n/routing";
import { supabaseEnv } from "./lib/supabase/env";

const intl = createMiddleware(routing);

export default async function proxy(request: NextRequest) {
  const response = intl(request);

  // 로그인 쿠키가 있을 때만 Supabase 세션을 갱신한다 (방문자 대부분은 네트워크 호출 없음)
  const env = supabaseEnv();
  const hasSession = request.cookies.getAll().some((c) => c.name.startsWith("sb-"));
  if (env && hasSession) {
    const supabase = createServerClient(env.url, env.key, {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (list) => list.forEach(({ name, value, options }) => response.cookies.set(name, value, options)),
      },
    });
    await supabase.auth.getUser();
  }
  return response;
}

export const config = {
  // api, 로그인 콜백(/auth), Next 내부 파일, 확장자가 있는 정적 파일은 제외
  matcher: "/((?!api|auth|_next|_vercel|.*\\..*).*)",
};
