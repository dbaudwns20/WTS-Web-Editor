const FILE_SIZE_LIMIT: number = 2;

/**
 * form 데이터 validate 체크
 * @param form
 * @returns
 */
export function validateForm(form: HTMLFormElement): boolean {
  let isValid: boolean = true;
  for (const element of Object.assign(form)) {
    if (!element.checkValidity()) {
      isValid = false;
      // break 이용하면 모든 필드에 입력여부를 확인할 수 없다.
    }
  }
  return isValid;
}

/**
 * 파일 용량 체크
 * @param fileSize
 * @returns
 */
export function checkUploadedFileSize(fileSize: number): boolean {
  const mbSize: number = fileSize / 1024 / 1024;
  if (mbSize > FILE_SIZE_LIMIT) {
    return false;
  } else {
    return true;
  }
}

/**
 * 기존 Object 데이터가 변경되었는지 체크
 * @param preObj
 * @param newObj
 * @returns
 */
export function checkDataEdited(preObj: Object, newObj: Object): boolean {
  return JSON.stringify(preObj) !== JSON.stringify(newObj);
}

/**
 * 업로드 파일 타입 체크
 * @param file
 * @param accepts
 * @returns
 */
export function checkFileType(file: File, accepts: string[]) {
  // 확장자 추출
  const extension: string | undefined = file.name.slice(
    ((file.name.lastIndexOf(".") - 1) >>> 0) + 1
  );
  if (extension && accepts.includes(extension)) return true;
  return false;
}
