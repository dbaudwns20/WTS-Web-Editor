import createMiddleware from "next-intl/middleware";
import { locales, localePrefix } from "@/navigation";

export default createMiddleware({
  defaultLocale: "ko", // 기본 언어
  locales, // 지원 언어
  localePrefix,
});

export const config = {
  // Match only internationalized pathnames
  // project, test 경로 추가
  matcher: ["/", "/(ko|en)/:path*", "/projects/:path*", "/test"],
};
