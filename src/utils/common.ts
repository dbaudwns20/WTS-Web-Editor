/**
 * 난수 문자열 생성
 * @returns
 */
export function generateRandomText(): string {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result: string = "";
  for (let i = 0; i < 8; i++) {
    const randomIndex: number = Math.floor(Math.random() * characters.length);
    result += characters.charAt(randomIndex);
  }
  return result;
}

/**
 * 파일 용량 변환
 * @param size
 * @returns
 */
export function convertFileSizeToString(size: number): string {
  const sizeInKb: number = size / 1024;

  if (sizeInKb > 1024) {
    return (sizeInKb / 1024).toFixed(2) + "MB";
  } else {
    return sizeInKb.toFixed(2) + "KB";
  }
}

/**
 * Api 호출
 * @param url
 * @param opt
 * @returns
 */
export async function callApi(url: string, opt?: any): Promise<any> {
  const response = await fetch(url, opt);
  return await response.json();
}

export function emptyToNull(value: string | object | any[]): any {
  switch (typeof value) {
    case "string":
      return value === "" ? null : value;
    case "object":
      if (Array.isArray(value)) return value.length === 0 ? null : value;
      else return Object.keys(value).length === 0 ? null : value;
  }
}

export async function urlToFile(
  url: string,
  fileName: string,
  mimeType: string
): Promise<File | null> {
  const response = await fetch(url);
  if (!response.ok) return null;
  const blob = await response.blob();
  const file = new File([blob], fileName, { type: mimeType });
  return file;
}
