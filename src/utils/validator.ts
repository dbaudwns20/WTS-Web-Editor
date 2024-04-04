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
