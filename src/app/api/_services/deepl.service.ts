type DeepLApiType = "usage" | "translate";

function getDeepLApiFetchingData(
  type: DeepLApiType,
  payload?: any
): {
  method: string;
  url: string;
  headers: {
    Authorization: string;
    "Content-Type"?: string;
  };
  body?: any;
} {
  switch (type) {
    case "usage":
      return {
        method: "GET",
        url: process.env.DEEPL_API_URL + "usage",
        headers: {
          Authorization: "DeepL-Auth-Key " + process.env.DEEPL_API_KEY,
        },
      };
    case "translate":
      return {
        method: "POST",
        url: process.env.DEEPL_API_URL + "translate",
        headers: {
          Authorization: "DeepL-Auth-Key " + process.env.DEEPL_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      };
    default:
      throw new Error("Invalid DeepL API type");
  }
}

async function callDeepLApi(type: DeepLApiType, payload?: any) {
  const { method, url, headers, body } = getDeepLApiFetchingData(type, payload);
  const res = await fetch(url, {
    method,
    headers,
    body,
  });
  if (res.ok) return await res.json();
  else throw new Error(await res.text());
}

export async function getUsageAndQuota(): Promise<{
  usage: number;
  quota: number;
}> {
  const res = await callDeepLApi("usage");
  return {
    usage: res.character_count,
    quota: res.character_limit,
  };
}

export async function translateText(
  originalText: string,
  targetLang: string
): Promise<string> {
  const res = await callDeepLApi("translate", {
    text: [originalText],
    target_lang: targetLang,
  });
  return res.translations[0].text;
}
