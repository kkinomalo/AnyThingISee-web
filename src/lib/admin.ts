import "server-only";
import type { User } from "@supabase/supabase-js";
import { isAdminUser } from "./admin-check";
import { createAdminClient } from "./supabase/admin";
import { createClient } from "./supabase/server";
import type { EventRow, SnapshotRow } from "./stats";

/** 어드민(DB 역할 또는 ADMIN_EMAILS)인 로그인 사용자. 아니면 null */
export async function getAdmin(): Promise<User | null> {
  const supabase = await createClient();
  if (!supabase) return null;
  const { data } = await supabase.auth.getUser();
  return isAdminUser(data.user) ? data.user : null;
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
