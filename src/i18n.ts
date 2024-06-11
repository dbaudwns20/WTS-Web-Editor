import { notFound } from "next/navigation";
import { getRequestConfig } from "next-intl/server";
import { locales } from "@/navigation";

export default getRequestConfig(async ({ locale }) => {
  let messages;
  try {
    // Validate that the incoming `locale` parameter is valid
    if (!locales.includes(locale as any)) notFound();

    messages = (await import(`../messages/${locale}.json`)).default;
  } catch (e) {
    // 파일이 없는 경우 공용어인 영어 리턴
    messages = (await import(`../messages/en.json`)).default;
  } finally {
    // 위치 확인
    return {
      messages,
      now: new Date(),
    };
  }
});
