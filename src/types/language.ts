enum Language {
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

export function getLangList() {
  const result = [];
  for (const [k, v] of Object.entries(Language)) {
    if (!Number.isNaN(Number(k))) continue;
    result.push({ id: v, value: k });
  }
  return result;
}

export function getLangTextByValue(value: number) {
  for (const [k, v] of Object.entries(Language)) if (v === value) return k;
}

export function getLangOptions() {
  const result = getLangList();
  result.unshift({ id: "", value: "Select your language" });
  return result;
}

export default Language;
