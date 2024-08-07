import { type FileResponse } from "@/types/api.response";
import WtsString from "@/types/wts.string";

export function readWtsFile(wtsFile: File): WtsString[] {
  const result: WtsString[] = [];

  const reader: FileReader = new FileReader();
  reader.onload = (e: ProgressEvent<FileReader>) => {
    if (!e.target) throw new Error("Target is not exist!");

    const text: string | ArrayBuffer | null = e.target.result;

    if (typeof text !== "string") throw new Error("Text is not string type!");

    if (text.length === 0) throw new Error("Text is empty!");

    const lines: string[] = text.split("STRING");

    // 길이가 1이라면 정상적인 wts 파일이 아니라고 판단한다.
    if (lines.length === 1) {
      throw new Error("Not wts file!");
    }

    for (let i = 1; i < lines.length; i++) {
      let wtsString: WtsString = {
        stringNumber: 0,
        comment: null,
        content: "",
      };
      // 수기로 작성한 것을 고려하여 캐리지리턴 제거
      const pieces: string[] = lines[i].trim().replace(/[\r]/g, "").split("\n");
      // stringNumber 구하기
      wtsString.stringNumber = Number(pieces[0].trim());
      pieces.splice(0, 1);
      // 주석이 존재하는 경우
      if (pieces[0].startsWith("// ")) {
        wtsString.comment = pieces[0].substring(3).trim();
        pieces.splice(0, 1);
      }
      // 맨 앞 {, 맨 뒤 } 는 포함아지 않고 loop
      for (let j = 1; j < pieces.length - 1; j++) {
        wtsString.content += pieces[j];
        // 마지막 행이 아니라면 줄바꿈 추가
        if (j < pieces.length - 2) wtsString.content += "\r\n";
      }
      result.push(wtsString);
    }
  };
  reader.readAsText(wtsFile);
  return result;
}

export function parseToHtml(wtsString: string, isPreview: boolean): string {
  // 미리보기 모드가 아니라면 html 태그로만 파싱
  if (!isPreview) {
    // <, > 을 이스케이프 문자로 변환
    return wtsString
      .replace(/[\r]/g, "")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/[\n]/g, "<br />");
  }

  let result: string = "";

  // <[^>]+> 부분을 0으로 치환, \r 제거, \n => <br /> 변환, |n => <br /> 변환
  wtsString = wtsString
    .replace(/<[^>]+>/g, "0")
    .replace(/[\r]/g, "")
    .replace(/[\n]/g, "<br />")
    .replace(/\|n/g, "<br />");

  // 정규 표현식으로 색상 코드와 텍스트를 분리
  const regExp: RegExp = /\|c([0-9a-fA-F]{8})([^|]*)\|r/g;

  let lastIndex: number = 0;
  let match: RegExpExecArray | null;

  while ((match = regExp.exec(wtsString)) !== null) {
    const [_, colorCode, text] = match;

    const hexColor = `#${colorCode.slice(2)}`;

    // 정규 표현식 매치 이전의 일반 텍스트를 추가
    result += wtsString.substring(lastIndex, match.index);

    // 색상 코드를 적용한 텍스트를 추가
    result += `<span style="color:${hexColor}">${text}</span>`;

    // 마지막 매치 이후 인덱스를 갱신
    lastIndex = regExp.lastIndex;
  }

  // 마지막 매치 이후의 일반 텍스트를 추가
  result += wtsString.substring(lastIndex);

  return result;
}

export function downloadFile(fileResponse: FileResponse) {
  const { fileName, fileContent } = fileResponse;

  // Base64 인코딩된 내용을 디코딩하여 Uint8Array로 변환
  const binaryString: string = atob(fileContent);
  const len: number = binaryString.length;
  const bytes: Uint8Array = new Uint8Array(len);

  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  // Uint8Array를 UTF-8 문자열로 디코딩
  const decodedString: string = new TextDecoder("utf-8").decode(bytes);

  // Windows 스타일 줄바꿈(CR LF)으로 변환
  const windowsString: string = decodedString.replace(/\r?\n/g, "\r\n");

  // UTF-8 BOM 추가
  const utf8Bom: string = "\uFEFF";
  const finalString: string = utf8Bom + windowsString;

  // 최종 데이터를 Uint8Array로 변환
  const finalUint8Array: Uint8Array = new TextEncoder().encode(finalString);

  // Uint8Array를 Blob으로 변환
  const blob = new Blob([finalUint8Array], {
    type: "application/octet-stream",
  });
  const urlCreator = window.URL || window.webkitURL;
  const url = urlCreator.createObjectURL(blob);
  const a: any = document.createElement("a");
  a.href = url;
  a.download = fileName + ".wts";
  a.style = "display: none";
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(function () {
    return window.URL.revokeObjectURL(url);
  }, 1000);
}
