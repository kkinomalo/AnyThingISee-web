"use client";

import { useSyncExternalStore } from "react";
import { ArrowRight, Download, ExternalArrow } from "@/components/icons";
import { external } from "@/lib/links";

type Platform = "windows" | "other";

// 서버에서는 Windows로 그리고, 브라우저에서 실제 운영체제를 확인해 바꾼다
function readPlatform(): Platform {
  const nav = navigator as Navigator & { userAgentData?: { platform?: string } };
  const name = nav.userAgentData?.platform || nav.userAgent;
  return /win/i.test(name) ? "windows" : "other";
}
const subscribe = () => () => {};

export function DownloadCta({
  href,
  label,
  macLabel,
  windowsLinkLabel,
}: {
  href: string;
  label: string;
  macLabel: string;
  windowsLinkLabel: string;
}) {
  const platform = useSyncExternalStore<Platform>(subscribe, readPlatform, () => "windows");

  if (platform === "windows") {
    return (
      <a
        href={href}
        download
        className="inline-flex items-center justify-center gap-2 rounded-lg bg-accent px-7 py-3.5 font-semibold text-on-accent transition-colors hover:bg-accent-hover"
      >
        {label}
        <ArrowRight width={18} height={18} />
      </a>
    );
  }

  return (
    <div className="flex flex-col items-start gap-3">
      <a
        href={`${external.repo}/releases`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center gap-2 rounded-lg bg-accent px-7 py-3.5 font-semibold text-on-accent transition-colors hover:bg-accent-hover"
      >
        {macLabel}
        <ExternalArrow width={16} height={16} />
      </a>
      <a href={href} download className="text-link inline-flex items-center gap-1.5 text-sm">
        <Download width={16} height={16} />
        {windowsLinkLabel}
      </a>
    </div>
  );
}
