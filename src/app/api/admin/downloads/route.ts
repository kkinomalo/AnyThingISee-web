import { NextResponse, type NextRequest } from "next/server";
import { getAdmin, loadEvents } from "@/lib/admin";
import { rangeStart, RANGES, toCsv, type Range } from "@/lib/stats";

// 어드민 CSV 내보내기 — 화면과 같은 권한 검사. 어드민이 아니면 404 (존재를 숨김)
export async function GET(request: NextRequest) {
  if (!(await getAdmin())) return new NextResponse("Not found", { status: 404 });
  const p = request.nextUrl.searchParams;
  const range = (RANGES as string[]).includes(p.get("range") ?? "") ? (p.get("range") as Range) : "all";
  const version = p.get("v");
  const start = rangeStart(range, Date.now());
  const rows = (await loadEvents()).filter(
    (e) => (!version || e.tag === version) && (start === null || Date.parse(e.created_at) >= start),
  );
  return new NextResponse(toCsv(rows), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="downloads-${range}${version ? `-${version}` : ""}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
