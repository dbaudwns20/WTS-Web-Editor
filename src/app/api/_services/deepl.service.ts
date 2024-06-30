import * as deepl from "deepl-node";

export async function translateText(
  originalText: string,
  targetLang: string
): Promise<string> {
  // 인증 키
  const authKey: string = process.env.DEEPL_API_KEY as string;
  const translator = new deepl.Translator(authKey);
  const result: deepl.TextResult = await translator.translateText(
    originalText,
    null,
    targetLang as deepl.TargetLanguageCode
  );
  return result.text;
}
