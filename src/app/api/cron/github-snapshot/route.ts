import { NextResponse, type NextRequest } from "next/server";
import { parseReleases } from "@/lib/releases-parse";
import { createAdminClient } from "@/lib/supabase/admin";

// Vercel Cron이 하루 1회 호출: GitHub download_count를 날짜별로 저장한다 (#12)
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  const db = createAdminClient();
  if (!db) return new NextResponse("Supabase not configured", { status: 500 });

  const headers: Record<string, string> = { Accept: "application/vnd.github+json", "User-Agent": "anythingisee-web" };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  const res = await fetch("https://api.github.com/repos/kkinomalo/AnyThingISee-releases/releases?per_page=30", {
    headers,
    cache: "no-store",
  });
  if (!res.ok) return new NextResponse(`GitHub ${res.status}`, { status: 502 });

  const today = new Date().toISOString().slice(0, 10);
  const rows = parseReleases(await res.json()).flatMap((r) =>
    [...r.assets, ...(r.installer ? [r.installer] : [])]
      .filter((a, i, all) => all.findIndex((b) => b.name === a.name) === i)
      .map((a) => ({ captured_on: today, tag: r.tag, file: a.name, count: a.downloadCount, captured_at: new Date().toISOString() })),
  );
  const { error } = await db.from("github_download_snapshots").upsert(rows, { onConflict: "captured_on,tag,file" });
  if (error) return new NextResponse(error.message, { status: 500 });
  return NextResponse.json({ saved: rows.length });
}
