// 히어로 오른쪽 그림: C 의사코드와 어셈블리가 연결되는 모습을 보여주는 예시 (실제 분석 결과 아님)
const cLines = [
  { text: "int check_key(const char *key)", link: false },
  { text: "{", link: false },
  { text: "  size_t n = strlen(key);", link: false },
  { text: "  if (n != 16) return 0;", link: true },
  { text: "  for (int i = 0; i < 16; i++)", link: false },
  { text: "    if ((key[i] ^ 0x5a) != table[i])", link: false },
  { text: "      return 0;", link: false },
  { text: "  return 1;", link: false },
  { text: "}", link: false },
];

const asmLines = [
  { addr: "140001020", op: "push", arg: "rbx", link: false },
  { addr: "140001022", op: "sub", arg: "rsp, 20h", link: false },
  { addr: "140001026", op: "mov", arg: "rbx, rcx", link: false },
  { addr: "140001029", op: "call", arg: "strlen", link: false },
  { addr: "14000102e", op: "cmp", arg: "rax, 10h", link: true },
  { addr: "140001032", op: "jne", arg: "loc_140001060", link: true },
  { addr: "140001034", op: "xor", arg: "edx, edx", link: false },
  { addr: "140001036", op: "movzx", arg: "eax, byte [rbx+rdx]", link: false },
  { addr: "14000103a", op: "xor", arg: "al, 5ah", link: false },
];

export function CodeSplit({ label }: { label: string }) {
  return (
    <figure
      aria-label={label}
      className="overflow-hidden rounded-xl bg-ink text-[13px] leading-6 text-ivory-light shadow-float"
    >
      <div className="flex items-center gap-1.5 border-b border-ivory-light/10 px-4 py-3">
        <span className="size-2.5 rounded-full bg-ivory-light/20" />
        <span className="size-2.5 rounded-full bg-ivory-light/20" />
        <span className="size-2.5 rounded-full bg-accent" />
        <span className="ml-3 font-mono text-xs text-ivory-light/50">check_key · 140001020</span>
      </div>
      <div className="grid font-mono sm:grid-cols-2" aria-hidden>
        <pre className="overflow-x-auto border-ivory-light/10 p-4 sm:border-r">
          {cLines.map((l, i) => (
            <div key={i} className={l.link ? "-mx-2 rounded bg-accent/15 px-2 text-accent" : ""}>
              {l.text || " "}
            </div>
          ))}
        </pre>
        <pre className="overflow-x-auto border-t border-ivory-light/10 p-4 sm:border-t-0">
          {asmLines.map((l) => (
            <div key={l.addr} className={l.link ? "-mx-2 rounded bg-accent/15 px-2 text-accent" : ""}>
              <span className="text-ivory-light/40">{l.addr}</span>{" "}
              <span className="inline-block w-12 text-ivory">{l.op}</span>
              {l.arg}
            </div>
          ))}
        </pre>
      </div>
    </figure>
  );
}
