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

export function convertDateToString(date: Date): string {
  return (
    date.getFullYear() +
    "-" +
    String(date.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(date.getDate()).padStart(2, "0")
  );
}
