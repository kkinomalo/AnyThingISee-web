# AnyThingISee Web

[AnyThingISee(ATIS)](https://github.com/kkinomalo/AnyThingISee-releases) 소개·다운로드 사이트입니다. 배포 주소: https://kkinomalo.com

## 구성
- 메인: 서비스 소개 (기능, 사용 흐름, 지원 환경)
- 성능 비교: 다른 디스어셈블러·디컴파일러와 측정 결과 비교
- 다운로드 · 릴리스 노트: GitHub Releases 연동
- 사용권 · 외부 구성요소 고지

## 기술
pnpm · Next.js 16 (App Router) · React 19 · TypeScript 5 · Tailwind CSS 4 · next-intl (ko/en/ja) · next-themes · Vitest · Vercel

## 실행
```bash
pnpm install
pnpm dev        # http://localhost:3000 → /ko 등으로 이동
pnpm lint && pnpm typecheck && pnpm test && pnpm build
```

## 폴더
- `src/app/[locale]/` 언어별 페이지 · `src/i18n/` 언어 설정 · `src/proxy.ts` 언어 판별
- `messages/{ko,en,ja}.json` 화면 문구 (키가 언어끼리 다르면 테스트 실패)
- `public/brand/logo.svg` 로고 · `src/app/globals.css` 디자인 토큰

## 디자인
- 레퍼런스: hex-rays.com의 레이아웃·구성만 참고하고 코드·이미지·문구는 가져오지 않습니다.
- 메인 컬러: 상아색 `#EEE6C4`

## 브랜치
- `main`: 배포 · `dev`: 통합
- 작업: `feat/<이슈번호>-<요약>` → `dev` PR → `dev` → `main` 릴리스 PR
