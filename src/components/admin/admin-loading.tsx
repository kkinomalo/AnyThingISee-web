// 어드민 데이터를 불러오는 동안 바로 보이는 화면 (#74) — 빈 화면 대신 틀을 먼저 보여 준다
export function AdminLoading({ label }: { label: string }) {
  return (
    <div className="min-h-dvh bg-background" aria-busy>
      <div className="h-16 border-b border-border bg-surface" />
      <div className="mx-auto max-w-[1200px] px-6 pt-12">
        <p role="status" className="text-muted">
          {label}
        </p>
        <div className="mt-8 h-10 w-64 animate-pulse rounded-md bg-ink/5 motion-reduce:animate-none" />
        <div className="mt-10 grid grid-cols-2 gap-6 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-md bg-ink/5 motion-reduce:animate-none" />
          ))}
        </div>
        <div className="mt-14 h-52 animate-pulse rounded-md bg-ink/5 motion-reduce:animate-none" />
      </div>
    </div>
  );
}
