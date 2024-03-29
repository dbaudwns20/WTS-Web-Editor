export function validateForm(form: HTMLFormElement): boolean {
  let isValid: boolean = true;
  for (const input of Object.assign(form)) {
    if (!(<HTMLInputElement>input).checkValidity()) {
      isValid = false;
      // break 이용하면 모든 필드에 입력여부를 확인할 수 없다.
    }
  }
  return isValid;
}
