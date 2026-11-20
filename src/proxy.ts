import { createServerClient } from "@supabase/ssr";
import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "./i18n/routing";
import { isAdminUser } from "./lib/admin-check";
import { supabaseEnv } from "./lib/supabase/env";

const intl = createMiddleware(routing);
const ADMIN_PATH = new RegExp(`^/(${routing.locales.join("|")})/admin(/|$)`);
// 로그인 정보를 쓰는 페이지에서만 Supabase 세션을 갱신한다 (#73).
// 메인 · 다운로드 같은 정적 페이지로 이동할 때는 Supabase를 부르지 않아 로그인 상태여도 빠르다
const AUTH_PATH = new RegExp(`^/(${routing.locales.join("|")})/(account|admin|contact|login)(/|$)`);

export default async function proxy(request: NextRequest) {
  const adminMatch = request.nextUrl.pathname.match(ADMIN_PATH);
  const env = supabaseEnv();
  const hasSession = request.cookies.getAll().some((c) => c.name.startsWith("sb-"));

  // 어드민은 화면을 그리기 전에 막는다 (상태 코드 404, 페이지 존재를 숨김). 서버 컴포넌트도 한 번 더 확인한다
  if (adminMatch) {
    const user = env && hasSession ? await sessionUser(request, env) : null;
    if (!isAdminUser(user)) {
      return NextResponse.rewrite(new URL(`/${adminMatch[1]}/404`, request.url), { status: 404 });
    }
  }

  const response = intl(request);

  // 로그인 쿠키가 있고, 로그인 정보를 쓰는 페이지일 때만 세션을 갱신한다
  if (env && hasSession && AUTH_PATH.test(request.nextUrl.pathname)) {
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

async function sessionUser(request: NextRequest, env: { url: string; key: string }) {
  const supabase = createServerClient(env.url, env.key, {
    cookies: { getAll: () => request.cookies.getAll(), setAll: () => {} },
  });
  const { data } = await supabase.auth.getUser();
  return data.user;
}

// proxy가 돌면 CDN 캐시에 있는 페이지도 매 요청 함수를 한 번 거친다 (실측 TTFB 82ms → 190ms).
// 그래서 꼭 필요한 곳에서만 돌린다:
//  1) 언어가 없는 주소 (/, /download 등) → 언어 판별 후 /ko 등으로 이동
//  2) 로그인 정보를 쓰는 페이지 → 어드민 차단 · 세션 갱신
// /ko/download 같은 언어 있는 일반 페이지는 건너뛴다. 언어 쿠키는 언어 변경 시
// next-intl이 브라우저에서 저장하고, hreflang은 페이지 메타데이터에 이미 있다.
// matcher 값은 빌드 때 정적으로 읽히므로 locale 목록을 변수로 쓸 수 없다 (routing.ts와 맞출 것)
export const config = {
  matcher: [
    // api, 로그인 콜백(/auth), Next 내부 파일, 확장자가 있는 정적 파일, 언어 있는 주소는 제외
    "/((?!api|auth|_next|_vercel|(?:ko|en|ja)(?:/|$)|.*\\..*).*)",
    "/:locale(ko|en|ja)/:section(account|admin|contact|login)/:path*",
  ],
};
