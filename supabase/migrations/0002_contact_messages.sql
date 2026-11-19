-- #66 문의
-- 방문자 · 로그인 사용자는 직접 읽기 · 쓰기 불가. 서버(service role)만 저장 · 조회한다.
create table if not exists public.contact_messages (
  id bigint generated always as identity primary key,
  topic text not null,                 -- general | license | partnership | other
  name text,
  email text not null,
  message text not null,
  locale text,
  visitor_hash text,                   -- 짧은 시간 반복 제출 제한용 (IP 원문 저장 안 함)
  user_id uuid,                        -- 로그인한 상태로 보냈으면 Supabase 사용자 id
  created_at timestamptz not null default now()
);
create index if not exists contact_messages_created_at_idx on public.contact_messages (created_at desc);
create index if not exists contact_messages_visitor_idx on public.contact_messages (visitor_hash, created_at desc);

alter table public.contact_messages enable row level security;
revoke all on public.contact_messages from anon, authenticated;
