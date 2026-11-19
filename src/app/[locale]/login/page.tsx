import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";
import { Link } from "@/i18n/navigation";
import releaseBand from "../../../../public/images/release-band.jpg";

export async function generateMetadata({ params }: PageProps<"/[locale]/login">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Auth" });
  return { title: t("title"), robots: { index: false } };
}

// my.hex-rays.com/login 참고: 왼쪽 사진 + 문구, 오른쪽 로그인 폼 (사이트 헤더 · 푸터 없음)
export default async function LoginPage({ params }: PageProps<"/[locale]/login">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Auth");

  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <div className="relative hidden overflow-hidden lg:block">
        <Image src={releaseBand} alt="" fill priority sizes="50vw" placeholder="blur" className="object-cover" />
        <Link href="/" className="absolute left-8 top-8 flex items-center gap-2.5 text-lg font-bold text-white [text-shadow:0_1px_3px_rgb(0_0_0/0.35)]">
          <Image src="/brand/logo.svg" alt="" width={28} height={28} />
          <span translate="no">AnyThingISee</span>
        </Link>
        <p className="absolute bottom-[38%] left-8 max-w-[14em] text-[40px] font-bold leading-[1.15] tracking-tight">
          <span className="box-decoration-clone bg-ink px-3 py-1 text-white">{t("tagline")}</span>
        </p>
      </div>

      <div className="flex flex-col bg-surface px-6 py-8 sm:px-12">
        <Link href="/" className="inline-flex items-center gap-1.5 self-start text-sm text-muted hover:text-ink">
          <span aria-hidden>‹</span> {t("home")}
        </Link>

        <div className="mx-auto my-auto w-full max-w-[420px] py-12">
          <h1 className="text-[28px] leading-tight">{t("title")}</h1>
          <p className="mt-3 text-muted">{t("body")}</p>
          <Suspense>
            <LoginForm />
          </Suspense>
        </div>

        <p className="text-center text-sm text-muted">
          © 2026 AnyThingISee ·{" "}
          <Link href="/license" className="underline underline-offset-4 hover:text-ink">
            {t("license")}
          </Link>
        </p>
      </div>
    </div>
  );
}
