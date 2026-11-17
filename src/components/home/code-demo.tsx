"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

// 연결 방식을 보여 주는 예시 코드 (실제 분석 결과 아님). asm은 각 C 줄과 같은 일을 하는 어셈블리 줄 번호
const cLines: { text: string; asm: number[] }[] = [
  { text: "int check_key(const char *key)", asm: [0, 1, 2] },
  { text: "{", asm: [] },
  { text: "  size_t n = strlen(key);", asm: [3] },
  { text: "  if (n != 16) return 0;", asm: [4, 5, 16] },
  { text: "  for (int i = 0; i < 16; i++)", asm: [6, 11, 12, 13] },
  { text: "    if ((key[i] ^ 0x5a) != table[i])", asm: [7, 8, 9, 10] },
  { text: "      return 0;", asm: [16] },
  { text: "  return 1;", asm: [14, 15] },
  { text: "}", asm: [17, 18, 19] },
];

const asmLines = [
  ["140001020", "push", "rbx"],
  ["140001021", "sub", "rsp, 20h"],
  ["140001025", "mov", "rbx, rcx"],
  ["140001028", "call", "strlen"],
  ["14000102d", "cmp", "rax, 10h"],
  ["140001031", "jne", "loc_140001058"],
  ["140001033", "xor", "edx, edx"],
  ["140001035", "movzx", "eax, byte [rbx+rdx]"],
  ["140001039", "xor", "al, 5Ah"],
  ["14000103b", "cmp", "al, [table+rdx]"],
  ["140001042", "jne", "loc_140001058"],
  ["140001044", "inc", "rdx"],
  ["140001047", "cmp", "rdx, 10h"],
  ["14000104b", "jb", "140001035"],
  ["14000104d", "mov", "eax, 1"],
  ["140001052", "jmp", "loc_14000105a"],
  ["140001058", "xor", "eax, eax"],
  ["14000105a", "add", "rsp, 20h"],
  ["14000105e", "pop", "rbx"],
  ["14000105f", "ret", ""],
] as const;

const DEFAULT_LINE = 3;

export function CodeDemo() {
  const t = useTranslations("Home.demo");
  const [active, setActive] = useState(DEFAULT_LINE);
  const linked = new Set(cLines[active].asm);

  return (
    <figure aria-label={t("label")} className="overflow-hidden rounded-xl bg-ink text-[13px] leading-6 text-on-ink shadow-float">
      <div className="flex items-center gap-1.5 border-b border-on-ink/10 px-4 py-3">
        <span className="size-2.5 rounded-full bg-on-ink/20" />
        <span className="size-2.5 rounded-full bg-on-ink/20" />
        <span className="size-2.5 rounded-full bg-on-ink/20" />
        <span translate="no" className="ml-3 font-mono text-xs text-on-ink-muted">
          check_key · 140001020
        </span>
      </div>

      <div translate="no" className="grid font-mono md:grid-cols-[1fr_1.05fr] [&>*]:min-w-0">
        <div className="overflow-x-auto border-on-ink/10 p-3 md:border-r">
          <p className="px-2 pb-2 font-sans text-xs font-semibold text-on-ink-muted">{t("c")}</p>
          <ol>
            {cLines.map((line, i) => {
              const on = i === active;
              const usable = line.asm.length > 0;
              return (
                <li key={i}>
                  <button
                    type="button"
                    disabled={!usable}
                    aria-pressed={on}
                    onMouseEnter={() => usable && setActive(i)}
                    onFocus={() => usable && setActive(i)}
                    onClick={() => usable && setActive(i)}
                    className={`block w-full whitespace-pre rounded px-2 text-left transition-colors focus-visible:outline-offset-0 ${
                      on ? "bg-accent text-on-accent" : usable ? "hover:bg-on-ink/10" : "cursor-default"
                    }`}
                  >
                    <span className="mr-3 inline-block w-4 select-none text-right opacity-50">{i + 1}</span>
                    {line.text}
                  </button>
                </li>
              );
            })}
          </ol>
        </div>

        <div className="overflow-x-auto border-t border-on-ink/10 p-3 md:border-t-0">
          <p className="px-2 pb-2 font-sans text-xs font-semibold text-on-ink-muted">{t("asm")}</p>
          <ol aria-hidden>
            {asmLines.map(([addr, op, arg], i) => (
              <li
                key={addr}
                className={`whitespace-pre rounded px-2 transition-colors ${linked.has(i) ? "bg-accent text-on-accent" : ""}`}
              >
                <span className={linked.has(i) ? "" : "text-on-ink-muted"}>{addr}</span>{" "}
                <span className="inline-block w-12">{op}</span>
                {arg}
              </li>
            ))}
          </ol>
        </div>
      </div>

      <p aria-live="polite" className="sr-only">
        {t("live", { line: active + 1, count: cLines[active].asm.length })}
      </p>
    </figure>
  );
}
