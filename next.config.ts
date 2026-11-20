import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  // 앱 화면 · 배경 사진은 글자가 뭉개지지 않게 90 사용
  images: { qualities: [75, 90] },
  // OG 이미지는 실행 중에 readFile로 폰트 · 로고를 읽는데, 이 경로는 자동 추적되지 않아
  // 배포 번들에서 빠졌다 (프로덕션 500 · ENOENT). 직접 포함시킨다
  outputFileTracingIncludes: {
    "/\\[locale\\]/opengraph-image": [
      "./node_modules/pretendard/dist/public/static/Pretendard-{Bold,Regular}.otf",
      "./public/brand/logo.svg",
    ],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

export default withNextIntl(nextConfig);
