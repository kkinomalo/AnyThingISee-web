"use client";

import { useLocale, useTranslations } from "next-intl";
import { useActionState } from "react";
import { sendContact } from "@/app/[locale]/contact/actions";
import { ArrowRight, Check } from "@/components/icons";
import { TOPICS, type ContactState } from "@/lib/contact";

const field =
  "mt-2 w-full rounded-lg border border-border bg-surface px-4 py-3 outline-none placeholder:text-faint focus:border-accent aria-[invalid=true]:border-accent";

export function ContactForm({ defaultEmail }: { defaultEmail?: string }) {
  const t = useTranslations("Contact");
  const locale = useLocale();
  const [state, action, pending] = useActionState<ContactState, FormData>(sendContact, { status: "idle" });
  const bad = (name: string) => state.status === "invalid" && state.fields.includes(name);

  if (state.status === "sent") {
    return (
      <div role="status" className="py-10">
        <p className="flex items-center gap-2 text-xl font-semibold">
          <Check width={24} height={24} className="text-accent" />
          {t("sentTitle")}
        </p>
        <p className="mt-3 text-muted">{t("sentBody")}</p>
      </div>
    );
  }

  return (
    <form action={action} noValidate className="space-y-7">
      <input type="hidden" name="locale" value={locale} />
      {/* 사람에게는 보이지 않는 칸 (봇 걸러내기) */}
      <div aria-hidden className="absolute -left-[9999px] h-0 overflow-hidden">
        <label>
          Website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
        </label>
      </div>

      <fieldset>
        <legend className="text-sm font-semibold">
          {t("topic")} <span className="text-accent">*</span>
        </legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {TOPICS.map((topic, i) => (
            <label
              key={topic}
              className="cursor-pointer rounded-full border border-border bg-surface px-4 py-2 text-[15px] has-[:checked]:border-ink has-[:checked]:bg-ink has-[:checked]:text-white has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-accent"
            >
              <input type="radio" name="topic" value={topic} defaultChecked={i === 0} className="sr-only" />
              {t(`topics.${topic}`)}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-7 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-semibold">{t("name")}</span>
          <span className="ml-1 text-sm text-muted">({t("optional")})</span>
          <input name="name" autoComplete="name" maxLength={80} className={field} />
        </label>
        <label className="block">
          <span className="text-sm font-semibold">
            {t("email")} <span className="text-accent">*</span>
          </span>
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            spellCheck={false}
            defaultValue={defaultEmail}
            placeholder="name@example.com"
            aria-invalid={bad("email")}
            aria-describedby={bad("email") ? "email-error" : undefined}
            className={field}
          />
          {bad("email") && (
            <span id="email-error" className="mt-1.5 block text-sm text-accent">
              {t("emailError")}
            </span>
          )}
        </label>
      </div>

      <label className="block">
        <span className="text-sm font-semibold">
          {t("message")} <span className="text-accent">*</span>
        </span>
        <textarea
          name="message"
          required
          rows={7}
          minLength={10}
          maxLength={5000}
          placeholder={t("messagePlaceholder")}
          aria-invalid={bad("message")}
          aria-describedby={bad("message") ? "message-error" : undefined}
          className={`${field} resize-y`}
        />
        {bad("message") && (
          <span id="message-error" className="mt-1.5 block text-sm text-accent">
            {t("messageError")}
          </span>
        )}
      </label>

      <div>
        <button
          type="submit"
          disabled={pending}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-cta-dark px-7 py-4 font-semibold text-white transition-colors hover:bg-cta-dark-hover disabled:opacity-60 sm:w-auto"
        >
          {pending ? t("sending") : t("submit")}
          {!pending && <ArrowRight width={18} height={18} />}
        </button>
        <p aria-live="polite" className="mt-3 min-h-6 text-sm text-accent">
          {state.status === "limited" && t("limited")}
          {state.status === "error" && t("error")}
        </p>
        <p className="text-sm text-muted">{t("privacy")}</p>
      </div>
    </form>
  );
}
