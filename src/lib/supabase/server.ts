import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { supabaseEnv } from "./env";

/** 서버 컴포넌트 · 서버 함수 · 라우트 핸들러용. 환경 변수가 없으면 null */
export async function createClient() {
  // 환경 변수가 없어도 먼저 쿠키를 읽어, 이 함수를 쓰는 화면이 빌드 때 고정되지 않게 한다
  const store = await cookies();
  const env = supabaseEnv();
  if (!env) return null;
  return createServerClient(env.url, env.key, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (list) => {
        try {
          list.forEach(({ name, value, options }) => store.set(name, value, options));
        } catch {
          // 서버 컴포넌트에서는 쿠키를 쓸 수 없다. 세션 갱신은 proxy가 맡는다
        }
      },
    },
  });
}
