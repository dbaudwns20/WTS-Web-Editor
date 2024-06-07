import createMiddleware from "next-intl/middleware";
import { locales, localePrefix } from "@/navigation";

export default createMiddleware({
  defaultLocale: "ko", // 기본 언어
  locales, // 지원 언어
  localePrefix,
});

export const config = {
  // Match only internationalized pathnames
  matcher: ["/", "/(ko|en)/:path*"],
};
