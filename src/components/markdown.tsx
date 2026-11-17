import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// GitHub 릴리스 본문을 사이트 글꼴·색에 맞춰 보여준다 (HTML은 그대로 출력하지 않음)
export function Markdown({ children }: { children: string }) {
  return (
    <div className="space-y-4 leading-relaxed">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: (p) => <h2 className="pt-4 text-2xl font-bold" {...p} />,
          h2: (p) => <h2 className="pt-4 text-xl font-bold" {...p} />,
          h3: (p) => <h3 className="pt-2 text-lg font-bold" {...p} />,
          ul: (p) => <ul className="list-disc space-y-1.5 pl-5" {...p} />,
          ol: (p) => <ol className="list-decimal space-y-1.5 pl-5" {...p} />,
          a: ({ href, ...p }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold underline underline-offset-4"
              {...p}
            />
          ),
          code: (p) => <code className="rounded bg-foreground/10 px-1.5 py-0.5 font-mono text-[0.9em]" {...p} />,
          pre: (p) => (
            <pre
              className="overflow-x-auto rounded-lg bg-ink p-4 font-mono text-sm text-ivory-light [&_code]:bg-transparent [&_code]:p-0"
              {...p}
            />
          ),
          table: (p) => (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm [&_td]:border-t [&_td]:border-foreground/10 [&_td]:py-2 [&_td]:pr-4 [&_th]:py-2 [&_th]:pr-4" {...p} />
            </div>
          ),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
