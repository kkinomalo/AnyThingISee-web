import { after, NextResponse, type NextRequest } from "next/server";
import { countryParam, isBot, localeParam, osFromUa, referrerHost, resolveAsset } from "@/lib/downloads";
import { getReleases } from "@/lib/github";
import { createAdminClient } from "@/lib/supabase/admin";
import { visitorHash } from "@/lib/visitor";

// 기록을 남긴 뒤 GitHub 릴리스 파일로 302. 기록이 실패해도 다운로드는 막지 않는다.
export async function GET(request: NextRequest, ctx: RouteContext<"/api/download/[tag]/[file]">) {
  const { tag, file } = await ctx.params;
  const { releases } = await getReleases();
  const target = resolveAsset(releases, tag, file);
  if (!target) return new NextResponse("Not found", { status: 404 });

  const h = request.headers;
  const ua = h.get("user-agent");
  if (!isBot(ua)) {
    const row = {
      tag,
      file,
      os: osFromUa(ua),
      locale: localeParam(request.nextUrl.searchParams.get("l")),
      country: countryParam(h.get("x-vercel-ip-country")),
      referrer_host: referrerHost(h.get("referer"), request.nextUrl.hostname),
      visitor_hash: visitorHash(h),
    };
    // 응답을 먼저 보내고 기록한다
    after(async () => {
      const db = createAdminClient();
      if (!db) return;
      const { error } = await db.from("download_events").insert(row);
      if (error) console.error("[download] 기록 실패", error.message);
    });
  }

  return NextResponse.redirect(target, { status: 302, headers: { "Cache-Control": "no-store" } });
}

// HEAD(링크 미리보기 · 확인 요청)는 기록하지 않는다
export async function HEAD(_request: NextRequest, ctx: RouteContext<"/api/download/[tag]/[file]">) {
  const { tag, file } = await ctx.params;
  const target = resolveAsset((await getReleases()).releases, tag, file);
  return target
    ? NextResponse.redirect(target, { status: 302, headers: { "Cache-Control": "no-store" } })
    : new NextResponse(null, { status: 404 });
}
