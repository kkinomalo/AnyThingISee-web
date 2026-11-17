import type { Metadata } from "next";
import { getFormatter, getTranslations, setRequestLocale } from "next-intl/server";
import { CopyButton } from "@/components/copy-button";
import { DownloadButton } from "@/components/download-button";
import { ArrowRight, ExternalArrow } from "@/components/icons";
import { Link } from "@/i18n/navigation";
import { formatBytes } from "@/lib/format";
import { getReleases } from "@/lib/github";

const WEBVIEW2_URL = "https://developer.microsoft.com/en-us/microsoft-edge/webview2/";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/download">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Download" });
  return { title: t("title"), description: t("metaDescription") };
}

export default async function DownloadPage({ params }: PageProps<"/[locale]/download">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Download");
  const format = await getFormatter();

  const { releases, live } = await getReleases();
  const latest = releases.find((r) => r.installer) ?? releases[0];
  const installer = latest.installer;
  const previous = releases.filter((r) => r.tag !== latest.tag);

  const date = latest.publishedAt
    ? format.dateTime(new Date(latest.publishedAt), { dateStyle: "medium" })
    : "";
  const command = installer
    ? `Get-FileHash -LiteralPath "$env:USERPROFILE\\Downloads\\${installer.name}" -Algorithm SHA256`
    : "";

  return (
    <div className="mx-auto w-full max-w-[1200px] px-6 pt-12">
      <header className="max-w-3xl">
        <h1 className="display first-underline">{t("title")}</h1>
        <p className="mt-5 text-lg leading-relaxed text-muted">
          {t("lead", { version: latest.version, date })}
        </p>
        {!live && <p className="mt-3 text-sm text-muted">{t("offline")}</p>}
      </header>

      {installer && (
        <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3">
          <DownloadButton label={t("button")} href={installer.url} />
          <span className="font-mono text-xs text-muted">
            {t("meta", { file: installer.name, size: formatBytes(installer.size) })}
          </span>
        </div>
      )}

      {/* 파일 표 */}
      <div className="mt-12 overflow-x-auto card">
        <table className="w-full min-w-[560px] text-left">
          <thead className="text-sm text-muted">
            <tr className="border-b border-border">
              <th className="px-6 py-4 font-semibold">{t("table.file")}</th>
              <th className="px-6 py-4 font-semibold">{t("table.os")}</th>
              <th className="px-6 py-4 font-semibold">{t("table.size")}</th>
              <th className="px-6 py-4 font-semibold">{t("table.version")}</th>
            </tr>
          </thead>
          <tbody>
            {installer && (
              <tr className="border-b border-border">
                <td className="px-6 py-4">
                  <a
                    href={installer.url}
                    download
                    translate="no" className="break-all font-mono text-sm underline underline-offset-4"
                  >
                    {installer.name}
                  </a>
                </td>
                <td className="px-6 py-4">Windows 10/11 (x64)</td>
                <td className="px-6 py-4 font-mono text-sm tabular-nums">{formatBytes(installer.size)}</td>
                <td className="px-6 py-4">{latest.version}</td>
              </tr>
            )}
            <tr className="text-muted">
              <td className="px-6 py-4">{t("table.macos")}</td>
              <td className="px-6 py-4" colSpan={2}>
                {t("table.macosStatus")}
              </td>
              <td className="px-6 py-4">—</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mt-16 grid gap-12 lg:grid-cols-2">
        <section aria-labelledby="install-title">
          <h2 id="install-title" className="subtitle">
            {t("install.title")}
          </h2>
          <ol className="mt-5 space-y-3">
            {(t.raw("install.steps") as string[]).map((step, i) => (
              <li key={step} className="flex gap-4">
                <span className="grid size-7 shrink-0 place-items-center rounded-full bg-ink font-mono text-xs font-bold text-accent">
                  {i + 1}
                </span>
                <span className="pt-0.5 leading-relaxed">{step}</span>
              </li>
            ))}
          </ol>
          <p className="mt-6 rounded-lg border border-foreground/15 p-4 text-sm leading-relaxed text-muted">
            {t("webview")}{" "}
            <a
              href={WEBVIEW2_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center font-semibold text-foreground underline underline-offset-4"
            >
              {t("webviewLink")}
              <ExternalArrow width={14} height={14} className="ml-0.5" />
            </a>
          </p>
        </section>

        <section aria-labelledby="req-title">
          <h2 id="req-title" className="subtitle">
            {t("requirements.title")}
          </h2>
          <ul className="mt-5 list-disc space-y-2 pl-5 leading-relaxed">
            {(t.raw("requirements.items") as string[]).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <div className="mt-8 rounded-lg bg-accent/20 p-5">
            <h3 className="font-bold">{t("unsigned.title")}</h3>
            <p className="mt-2 text-sm leading-relaxed">{t("unsigned.body")}</p>
          </div>
        </section>
      </div>

      {/* 파일 확인 */}
      {installer?.sha256 && (
        <section aria-labelledby="verify-title" className="mt-16">
          <h2 id="verify-title" className="subtitle">
            {t("verify.title")}
          </h2>
          <p className="mt-3 max-w-3xl leading-relaxed text-muted">{t("verify.body")}</p>
          <div className="mt-6 space-y-4">
            <CodeRow label={t("verify.hash")} text={installer.sha256} copy={t("copy")} copied={t("copied")} />
            <CodeRow label={t("verify.command")} text={command} copy={t("copy")} copied={t("copied")} />
          </div>
        </section>
      )}

      <div className="mt-16 grid gap-12 lg:grid-cols-2">
        <section aria-labelledby="terms-title">
          <h2 id="terms-title" className="subtitle">
            {t("terms.title")}
          </h2>
          <p className="mt-3 leading-relaxed text-muted">{t("terms.body")}</p>
          <Link
            href="/license"
            className="mt-4 inline-flex items-center gap-1.5 font-semibold underline underline-offset-4"
          >
            {t("terms.link")}
            <ArrowRight width={16} height={16} />
          </Link>
        </section>

        <section aria-labelledby="prev-title">
          <h2 id="prev-title" className="subtitle">
            {t("previous.title")}
          </h2>
          {previous.length === 0 ? (
            <p className="mt-3 text-muted">{t("previous.empty")}</p>
          ) : (
            <ul className="mt-4 divide-y divide-border">
              {previous.map((r) => (
                <li key={r.tag} className="flex flex-wrap items-center justify-between gap-3 py-3">
                  <span className="font-semibold">{r.version}</span>
                  <span className="flex items-center gap-4 text-sm">
                    {r.installer && (
                      <a href={r.installer.url} download className="underline underline-offset-4">
                        {r.installer.name}
                      </a>
                    )}
                    <Link href={`/releases/${r.tag}`} className="text-muted underline underline-offset-4">
                      {t("previous.notes")}
                    </Link>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

function CodeRow({ label, text, copy, copied }: { label: string; text: string; copy: string; copied: string }) {
  return (
    <div className="rounded-lg bg-ink p-4 text-ivory-light">
      <div className="flex items-center justify-between gap-4">
        <span className="text-xs font-semibold text-ivory-light/60">{label}</span>
        <CopyButton text={text} label={copy} done={copied} />
      </div>
      <code translate="no" className="mt-3 block break-all font-mono text-sm leading-relaxed">{text}</code>
    </div>
  );
}
