import { createSharedPathnamesNavigation } from "next-intl/navigation";

export const locales = ["en", "ko"] as const;
export const localePrefix = "as-needed"; // 디폴트 제외 표시

// 각 링크 관련 모듈에 next-intl 기능 레핑
export const { Link, redirect, usePathname, useRouter } =
  createSharedPathnamesNavigation({ locales, localePrefix });
