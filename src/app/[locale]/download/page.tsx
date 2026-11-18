import type { Metadata } from "next";
import { alternates } from "@/lib/seo";
import { getFormatter, getTranslations, setRequestLocale } from "next-intl/server";
import { CopyButton } from "@/components/copy-button";
import { DownloadButton } from "@/components/download-button";
import { ArrowRight, ExternalArrow } from "@/components/icons";
import { Link } from "@/i18n/navigation";
import { downloadPath } from "@/lib/downloads";
import { formatBytes } from "@/lib/format";
import { getReleases } from "@/lib/github";

const WEBVIEW2_URL = "https://developer.microsoft.com/en-us/microsoft-edge/webview2/";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/download">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Download" });
  return { title: t("title"), description: t("metaDescription"), alternates: alternates(locale, "/download") };
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
        <h1>{t("title")}</h1>
        <p className="mt-5 text-lg leading-relaxed text-muted">
          {t("lead", { version: latest.version, date })}
        </p>
        {!live && <p className="mt-3 text-sm text-muted">{t("offline")}</p>}
      </header>

      {installer && (
        <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3">
          <DownloadButton label={t("button")} href={downloadPath(latest.tag, installer.name, locale)} />
          <span className="font-mono text-xs text-muted">
            {t("meta", { file: installer.name, size: formatBytes(installer.size) })}
          </span>
        </div>
      )}

      {/* 파일 목록 — 640px 이상은 표, 그 아래는 카드 */}
      <ul className="rule-top mt-12 sm:hidden">
        {installer && (
          <li className="space-y-2 border-b border-border py-5">
            <a href={downloadPath(latest.tag, installer.name, locale)} download translate="no" className="text-link block break-all font-mono text-sm">
              {installer.name}
            </a>
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
              <dt className="text-muted">{t("table.os")}</dt>
              <dd>Windows 10/11 (x64)</dd>
              <dt className="text-muted">{t("table.size")}</dt>
              <dd className="font-mono tabular-nums">{formatBytes(installer.size)}</dd>
              <dt className="text-muted">{t("table.version")}</dt>
              <dd>{latest.version}</dd>
            </dl>
          </li>
        )}
        <li className="border-b border-border py-5 text-sm">
          <p className="font-semibold">{t("table.macos")}</p>
          <p className="mt-1 text-muted">{t("table.macosStatus")}</p>
        </li>
      </ul>
      <div className="rule-top mt-12 hidden sm:block">
        <table className="w-full text-left">
          <thead className="text-sm text-muted">
            <tr className="border-b border-border">
              <th className="py-4 pr-6 font-semibold">{t("table.file")}</th>
              <th className="py-4 pr-6 font-semibold">{t("table.os")}</th>
              <th className="py-4 pr-6 font-semibold">{t("table.size")}</th>
              <th className="py-4 pr-6 font-semibold">{t("table.version")}</th>
            </tr>
          </thead>
          <tbody>
            {installer && (
              <tr className="border-b border-border">
                <td className="py-4 pr-6">
                  <a href={downloadPath(latest.tag, installer.name, locale)} download translate="no" className="text-link break-all font-mono text-sm">
                    {installer.name}
                  </a>
                </td>
                <td className="py-4 pr-6">Windows 10/11 (x64)</td>
                <td className="py-4 pr-6 font-mono text-sm tabular-nums">{formatBytes(installer.size)}</td>
                <td className="py-4 pr-6">{latest.version}</td>
              </tr>
            )}
            <tr className="text-muted">
              <td className="py-4 pr-6">{t("table.macos")}</td>
              <td className="py-4 pr-6" colSpan={2}>
                {t("table.macosStatus")}
              </td>
              <td className="py-4 pr-6">—</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mt-16 grid gap-12 lg:grid-cols-2">
        <section aria-labelledby="install-title">
          <h2 id="install-title">
            {t("install.title")}
          </h2>
          <ol className="mt-5 space-y-3">
            {(t.raw("install.steps") as string[]).map((step, i) => (
              <li key={step} className="flex gap-4">
                <span className="w-6 shrink-0 pt-0.5 font-mono text-sm text-accent">
                  {i + 1}
                </span>
                <span className="pt-0.5 leading-relaxed">{step}</span>
              </li>
            ))}
          </ol>
          <p className="mt-6 text-sm leading-relaxed text-muted">
            {t("webview")}{" "}
            <a
              href={WEBVIEW2_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-link inline-flex items-center"
            >
              {t("webviewLink")}
              <ExternalArrow width={14} height={14} className="ml-0.5" />
            </a>
          </p>
        </section>

        <section aria-labelledby="req-title">
          <h2 id="req-title">
            {t("requirements.title")}
          </h2>
          <ul className="mt-5 list-disc space-y-2 pl-5 leading-relaxed">
            {(t.raw("requirements.items") as string[]).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      </div>

      {/* 파일 확인 */}
      {installer?.sha256 && (
        <section id="verify" aria-labelledby="verify-title" className="mt-16">
          <h2 id="verify-title">{t("verify.title")}</h2>
          <div className="mt-6 max-w-3xl">
            <h3>{t("unsigned.title")}</h3>
            <p className="mt-2 text-muted">{t("unsigned.body")}</p>
          </div>
          <p className="mt-6 max-w-3xl text-muted">{t("verify.body")}</p>
          <div className="mt-6 space-y-4">
            <CodeRow label={t("verify.hash")} text={installer.sha256} copy={t("copy")} copied={t("copied")} />
            <CodeRow label={t("verify.command")} text={command} copy={t("copy")} copied={t("copied")} />
          </div>
        </section>
      )}

      <div className="mt-16 grid gap-12 lg:grid-cols-2">
        <section aria-labelledby="terms-title">
          <h2 id="terms-title">
            {t("terms.title")}
          </h2>
          <p className="mt-3 leading-relaxed text-muted">{t("terms.body")}</p>
          <Link
            href="/license"
            className="text-link mt-4 inline-flex items-center gap-1.5"
          >
            {t("terms.link")}
            <ArrowRight width={16} height={16} />
          </Link>
        </section>

        <section aria-labelledby="prev-title">
          <h2 id="prev-title">
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
                      <a href={downloadPath(r.tag, r.installer.name, locale)} download className="underline underline-offset-4">
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
    <div className="rule-top border-b border-border py-4">
      <div className="flex items-center justify-between gap-4">
        <span className="text-xs font-semibold text-muted">{label}</span>
        <CopyButton text={text} label={copy} done={copied} />
      </div>
      <code translate="no" className="mt-3 block break-all font-mono text-sm leading-relaxed">{text}</code>
    </div>
  );
}
