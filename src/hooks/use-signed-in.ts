"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

// 헤더용 로그인 여부 (#75). 브라우저에 저장된 세션만 읽어서 네트워크 호출이 없다.
// 정적 페이지라 서버에서는 알 수 없으므로 처음엔 false(= 로그인)로 그리고, 확인 후 바꾼다
export function useSignedIn() {
  const [signedIn, setSignedIn] = useState(false);
  useEffect(() => {
    const supabase = createClient();
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => setSignedIn(Boolean(data.session)));
    const { data } = supabase.auth.onAuthStateChange((_event, session) => setSignedIn(Boolean(session)));
    return () => data.subscription.unsubscribe();
  }, []);
  return signedIn;
}
