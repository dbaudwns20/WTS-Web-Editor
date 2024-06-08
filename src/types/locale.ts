import { locales, defaultLocale } from "@/navigation";

enum Locale {
  en_US = 1,
  ko_KR = 2,
  zh_CN = 3,
  zh_TW = 4,
  de_DE = 5,
  es_ES = 6,
  es_MX = 7,
  fr_FR = 8,
  it_IT = 9,
  pl_PL = 10,
  ru_RU = 11,
  ja_JP = 12,
}

type LocaleData = {
  locale: string;
  text: string;
  isActive: boolean;
};

const PAGE_LOCALE_MAP: Map<string, LocaleData> = new Map([
  ["ko", { locale: "ko", text: "한국어", isActive: true }],
  ["en", { locale: "en", text: "English", isActive: true }],
  ["cn", { locale: "cn", text: "简体中文", isActive: false }],
  ["tw", { locale: "tw", text: "繁體中文", isActive: false }],
  ["de", { locale: "de", text: "Deutsch", isActive: false }],
  ["es", { locale: "es", text: "Español", isActive: false }],
  ["mx", { locale: "mx", text: "Español (México)", isActive: false }],
  ["fr", { locale: "fr", text: "Français", isActive: false }],
  ["it", { locale: "it", text: "Italiano", isActive: false }],
  ["pl", { locale: "pl", text: "Polski", isActive: false }],
  ["ru", { locale: "ru", text: "Русский", isActive: false }],
  ["ja", { locale: "ja", text: "日本語", isActive: false }],
]);

export type PageLocale = {
  locale: string;
  text: string;
};

export function getPageLocaleList(): PageLocale[] {
  return Array.from(PAGE_LOCALE_MAP.values())
    .filter((locale) => locale.isActive)
    .map(({ locale, text }) => ({ locale, text }));
}

export function getLocaleList() {
  const result = [];
  for (const [k, v] of Object.entries(Locale)) {
    if (!Number.isNaN(Number(k))) continue;
    result.push({ id: v, value: k });
  }
  return result;
}

export function getLocaleTextByValue(value: number) {
  for (const [k, v] of Object.entries(Locale)) if (v === value) return k;
}

export function getLocaleOptions() {
  const result = getLocaleList();
  result.unshift({ id: "", value: "Select your locale" });
  return result;
}

export default Locale;
