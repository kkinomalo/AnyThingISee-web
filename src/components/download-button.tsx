import { Download } from "@/components/icons";
import { fallbackRelease } from "@/lib/release";

// 누르면 설치 파일이 바로 내려받아진다 (GitHub가 attachment로 응답)
export function DownloadButton({
  label,
  href = fallbackRelease.url,
  variant = "cta",
  className = "",
}: {
  label: string;
  href?: string;
  variant?: "cta" | "ivory";
  className?: string;
}) {
  const color =
    variant === "ivory"
      ? "bg-surface text-ink hover:bg-background"
      : "bg-cta text-cta-foreground hover:opacity-90";
  return (
    <a
      href={href}
      download
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3 font-semibold transition ${color} ${className}`}
    >
      <Download width={18} height={18} />
      {label}
    </a>
  );
}
