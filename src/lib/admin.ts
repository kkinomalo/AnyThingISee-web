import "server-only";
import type { User } from "@supabase/supabase-js";
import { createAdminClient } from "./supabase/admin";
import { createClient } from "./supabase/server";
import type { EventRow, SnapshotRow } from "./stats";

/** ADMIN_EMAILS(쉼표 구분)에 있는 로그인 사용자만. 아니면 null */
export async function getAdmin(): Promise<User | null> {
  const supabase = await createClient();
  if (!supabase) return null;
  const { data } = await supabase.auth.getUser();
  const email = data.user?.email?.toLowerCase();
  const allowed = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return email && data.user?.email_confirmed_at && allowed.includes(email) ? data.user : null;
}

/** 다운로드 기록 전체 (1000행씩 나눠 읽음, 최대 100,000행) */
export async function loadEvents(): Promise<EventRow[]> {
  const db = createAdminClient();
  if (!db) return [];
  const rows: EventRow[] = [];
  for (let from = 0; from < 100_000; from += 1000) {
    const { data, error } = await db
      .from("download_events")
      .select("tag,file,os,locale,country,referrer_host,visitor_hash,created_at")
      .order("created_at", { ascending: false })
      .range(from, from + 999);
    if (error) throw new Error(error.message);
    rows.push(...(data as EventRow[]));
    if (!data || data.length < 1000) break;
  }
  return rows;
}

export async function loadSnapshots(): Promise<SnapshotRow[]> {
  const db = createAdminClient();
  if (!db) return [];
  const { data, error } = await db
    .from("github_download_snapshots")
    .select("captured_on,tag,file,count")
    .order("captured_on", { ascending: true })
    .limit(5000);
  if (error) throw new Error(error.message);
  return data as SnapshotRow[];
}

/** 통계 기준 시각 (요청 시점) */
export function requestTime() {
  return Date.now();
}
