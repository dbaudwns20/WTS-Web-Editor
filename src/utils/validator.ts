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
