import { describe, expect, it } from "vitest";
import { routing } from "@/i18n/routing";
import ko from "../messages/ko.json";
import en from "../messages/en.json";
import ja from "../messages/ja.json";

const messages: Record<string, unknown> = { ko, en, ja };

// 중첩 객체를 "Home.title" 같은 키 목록으로 펼친다
function keys(value: unknown, prefix = ""): string[] {
  if (typeof value !== "object" || value === null) return [prefix];
  return Object.entries(value).flatMap(([k, v]) =>
    keys(v, prefix ? `${prefix}.${k}` : k),
  );
}

describe("번역 파일", () => {
  const base = keys(messages[routing.defaultLocale]).sort();

  it("지원 언어마다 번역 파일이 있다", () => {
    for (const locale of routing.locales) expect(messages[locale]).toBeDefined();
  });

  it.each(routing.locales.filter((l) => l !== routing.defaultLocale))(
    "%s 번역의 키가 기본 언어와 같다",
    (locale) => {
      expect(keys(messages[locale]).sort()).toEqual(base);
    },
  );

  it.each(routing.locales)("%s 번역에 빈 문구가 없다", (locale) => {
    const flat = keys(messages[locale]).map((path) =>
      path.split(".").reduce<unknown>((o, k) => (o as Record<string, unknown>)[k], messages[locale]),
    );
    for (const text of flat) expect(String(text).trim()).not.toBe("");
  });
});
