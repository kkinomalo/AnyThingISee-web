// supabase/migrations/*.sql을 이름 순서대로 적용한다. 적용 기록은 public._migrations에 남긴다.
// 사용: pnpm db:migrate  (.env.local의 POSTGRES_URL_NON_POOLING 사용)
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import postgres from "postgres";

const url = process.env.POSTGRES_URL_NON_POOLING;
if (!url) throw new Error("POSTGRES_URL_NON_POOLING이 없습니다 (vercel env pull)");

const sql = postgres(url, { ssl: "require", max: 1, onnotice: () => {} });
const dir = join(process.cwd(), "supabase/migrations");

try {
  await sql`create table if not exists public._migrations (name text primary key, applied_at timestamptz default now())`;
  await sql`alter table public._migrations enable row level security`;
  const done = new Set((await sql<{ name: string }[]>`select name from public._migrations`).map((r) => r.name));
  for (const name of (await readdir(dir)).filter((f) => f.endsWith(".sql")).sort()) {
    if (done.has(name)) continue;
    const body = await readFile(join(dir, name), "utf8");
    await sql.begin(async (tx) => {
      await tx.unsafe(body);
      await tx`insert into public._migrations (name) values (${name})`;
    });
    console.log(`적용: ${name}`);
  }
  console.log("마이그레이션 완료");
} finally {
  await sql.end();
}
