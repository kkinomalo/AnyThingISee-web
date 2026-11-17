// 사이트 밖으로 나가는 고정 주소
const RELEASES_REPO = "https://github.com/kkinomalo/AnyThingISee-releases";

export const external = {
  repo: RELEASES_REPO,
  issues: `${RELEASES_REPO}/issues`,
  guide: `${RELEASES_REPO}#처음-사용하기`,
  thirdParty: `${RELEASES_REPO}/blob/main/THIRD-PARTY-NOTICES.md`,
} as const;

export type NavItem = {
  /** messages의 Nav.items.<key> */
  key: string;
  href: string;
  external?: boolean;
};

export type NavGroup = { key: string; items: NavItem[] };

// 헤더 드롭다운과 푸터가 같은 목록을 쓴다
export const navGroups: NavGroup[] = [
  {
    key: "product",
    items: [
      { key: "overview", href: "/" },
      { key: "compare", href: "/compare" },
      { key: "download", href: "/download" },
    ],
  },
  {
    key: "resources",
    items: [
      { key: "releases", href: "/releases" },
      { key: "guide", href: external.guide, external: true },
      { key: "issues", href: external.issues, external: true },
    ],
  },
];

export const licenseItems: NavItem[] = [
  { key: "license", href: "/license" },
  { key: "thirdParty", href: external.thirdParty, external: true },
];
