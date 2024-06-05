import { put, del, list, type PutBlobResult } from "@vercel/blob";

/**
 * 같은 이미지 파일 업로드 방지 (임시)
 * @param imageFile
 * @returns
 */
async function checkSameFileBlobExists(imageFile: File): Promise<string> {
  let result: string = "";

  // 파일명.확장자 가 동일한 파일 체크
  for (const blob of (await list()).blobs) {
    if (blob.pathname === imageFile.name) {
      result = blob.url;
      break;
    }
  }
  return result;
}

/**
 * 프로젝트 이미지 업로드
 * @param imageFile
 * @returns
 */
export async function uploadProjectImage(imageFile: File): Promise<string> {
  // 파일명.확장자 가 동일한 파일 체크 (같은 파일 업로드 방지)
  let result: string = await checkSameFileBlobExists(imageFile);
  if (!result) {
    const blob: PutBlobResult = await put(imageFile.name, imageFile, {
      access: "public",
    });
    result = blob.url;
  }
  return result;
}

/**
 * 프로젝트 이미지 삭제
 * @param imageUrl
 */
export async function deleteProjectImage(imageUrl: string) {
  if (imageUrl) {
    // 기본이미지 체크
    // await del(imageUrl);
  }
}
