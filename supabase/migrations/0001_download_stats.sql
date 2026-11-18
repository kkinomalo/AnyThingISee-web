-- #12 다운로드 집계 · #13 어드민
-- 방문자(anon) · 로그인 사용자(authenticated)는 읽기 · 쓰기 모두 불가. 서버(service role)만 접근한다.

create table if not exists public.download_events (
  id bigint generated always as identity primary key,
  tag text not null,
  file text not null,
  os text not null default 'other',          -- windows | mac | linux | other (UA에서 분류만, 원문 저장 안 함)
  locale text,                               -- 사이트 언어 ko | en | ja
  country text,                              -- Vercel x-vercel-ip-country
  referrer_host text,                        -- 유입 도메인만 (경로 · 검색어 저장 안 함)
  visitor_hash text,                         -- sha256(ip + ua + 날짜 + 비밀값) — 하루 단위 중복 판별용
  created_at timestamptz not null default now()
);
create index if not exists download_events_created_at_idx on public.download_events (created_at desc);
create index if not exists download_events_tag_idx on public.download_events (tag);

create table if not exists public.github_download_snapshots (
  captured_on date not null,
  tag text not null,
  file text not null,
  count integer not null,
  captured_at timestamptz not null default now(),
  primary key (captured_on, tag, file)
);

alter table public.download_events enable row level security;
alter table public.github_download_snapshots enable row level security;
-- 정책을 하나도 만들지 않으므로 anon · authenticated 키로는 0건. service role은 RLS를 우회한다.
revoke all on public.download_events from anon, authenticated;
revoke all on public.github_download_snapshots from anon, authenticated;
