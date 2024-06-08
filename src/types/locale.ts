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
