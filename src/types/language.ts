enum Language {
  en_US = 0,
  ko_KR = 1,
  zh_CN = 2,
  zh_TW = 3,
  de_DE = 4,
  es_ES = 5,
  es_MX = 6,
  fr_FR = 7,
  it_IT = 8,
  pl_PL = 9,
  ru_RU = 10,
  ja_JP = 11,
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
