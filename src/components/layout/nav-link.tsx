import type { ReactNode } from "react";
import { ExternalArrow } from "@/components/icons";
import { Link } from "@/i18n/navigation";
import type { NavItem } from "@/lib/links";

// 사이트 안 링크는 언어 주소를 붙이고, 밖으로 나가는 링크는 새 창으로 연다
export function NavLink({
  item,
  active = false,
  externalLabel,
  externalIcon = true,
  className = "",
  children,
}: {
  item: NavItem;
  active?: boolean;
  externalLabel?: string;
  /** false면 바깥 링크 화살표를 직접 그린다 (드롭다운에서 제목 옆에 두기 위해) */
  externalIcon?: boolean;
  className?: string;
  children: ReactNode;
}) {
  if (item.external) {
    return (
      <a href={item.href} target="_blank" rel="noopener noreferrer" className={className}>
        {children}
        {externalIcon && (
          <ExternalArrow width={14} height={14} className="ml-1 inline-block align-[-1px] opacity-60" />
        )}
        {externalLabel && <span className="sr-only"> ({externalLabel})</span>}
      </a>
    );
  }
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={`${className} ${active ? "text-foreground underline decoration-accent decoration-2 underline-offset-4" : ""}`}
    >
      {children}
    </Link>
  );
}
