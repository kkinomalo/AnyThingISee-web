import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  return {
    locale,
    // 날짜는 서버·브라우저 모두 같은 기준으로 표시
    timeZone: "Asia/Seoul",
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
