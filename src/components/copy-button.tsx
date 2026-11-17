"use client";

import { useState } from "react";
import { Check } from "@/components/icons";

export function CopyButton({ text, label, done }: { text: string; label: string; done: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 1600);
        } catch {
          // 클립보드 권한이 없으면 아무것도 하지 않는다 (텍스트는 화면에서 선택 가능)
        }
      }}
      className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-border px-3 py-1.5 font-sans text-xs font-semibold text-ink hover:bg-ink/5"
    >
      {copied && <Check width={14} height={14} className="text-accent" />}
      <span aria-live="polite">{copied ? done : label}</span>
    </button>
  );
}
