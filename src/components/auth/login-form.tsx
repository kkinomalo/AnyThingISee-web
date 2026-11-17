"use client";

import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { GitHub } from "@/components/icons";
import { createClient } from "@/lib/supabase/client";

type Status = { kind: "idle" } | { kind: "busy" } | { kind: "sent"; email: string } | { kind: "error" };

export function LoginForm() {
  const t = useTranslations("Auth");
  const locale = useLocale();
  const params = useSearchParams();
  const [status, setStatus] = useState<Status>(params.get("error") ? { kind: "error" } : { kind: "idle" });
  const supabase = createClient();

  // 로그인 뒤 돌아올 주소: 같은 언어의 내 계정
  const redirectTo = () => `${window.location.origin}/auth/callback?next=/${locale}/account`;

  const oauth = async (provider: "google" | "github") => {
    if (!supabase) return;
    setStatus({ kind: "busy" });
    const { error } = await supabase.auth.signInWithOAuth({ provider, options: { redirectTo: redirectTo() } });
    if (error) setStatus({ kind: "error" });
  };

  const emailLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!supabase) return;
    const email = String(new FormData(e.currentTarget).get("email") ?? "").trim();
    if (!email) return;
    setStatus({ kind: "busy" });
    const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: redirectTo() } });
    setStatus(error ? { kind: "error" } : { kind: "sent", email });
  };

  const disabled = !supabase || status.kind === "busy";
  const provider =
    "flex w-full items-center justify-center gap-2.5 rounded-lg border border-border bg-surface px-4 py-3 font-semibold transition-colors hover:bg-ink/5 disabled:cursor-not-allowed disabled:opacity-60";

  return (
    <div className="mt-8">
      {!supabase && <p className="mb-5 rounded-lg bg-tint px-4 py-3 text-sm text-on-tint">{t("unavailable")}</p>}

      <div className="grid gap-3">
        <button type="button" disabled={disabled} onClick={() => oauth("google")} className={provider}>
          <GoogleMark />
          {t("google")}
        </button>
        <button type="button" disabled={disabled} onClick={() => oauth("github")} className={provider}>
          <GitHub width={20} height={20} />
          {t("github")}
        </button>
      </div>

      <div className="my-7 flex items-center gap-4 text-sm text-muted" aria-hidden>
        <span className="h-px flex-1 bg-border" />
        {t("or")}
        <span className="h-px flex-1 bg-border" />
      </div>

      <form onSubmit={emailLogin}>
        <label htmlFor="login-email" className="text-sm font-semibold">
          {t("email")}
        </label>
        <input
          id="login-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          spellCheck={false}
          placeholder={t("emailPlaceholder")}
          className="mt-2 w-full rounded-lg border border-border bg-surface px-4 py-3 outline-none placeholder:text-faint focus:border-accent"
        />
        <button
          type="submit"
          disabled={disabled}
          className="mt-4 w-full rounded-lg bg-cta-dark px-4 py-3 font-semibold text-white transition-colors hover:bg-cta-dark-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          {t("submit")}
        </button>
      </form>

      <p aria-live="polite" className="mt-4 min-h-6 text-sm">
        {status.kind === "sent" && <span className="text-ink">{t("sent", { email: status.email })}</span>}
        {status.kind === "error" && <span className="text-accent">{t("error")}</span>}
      </p>
    </div>
  );
}

// Google 로고는 브랜드 가이드상 원래 색을 쓴다
function GoogleMark() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  );
}
