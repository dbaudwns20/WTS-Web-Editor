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

export function parseToHtml(wtsString: string): string {
  let result: string = "";
  // \r 제거, \n => <br /> 변환
  wtsString = wtsString.replace(/[\r]/g, "").replace(/[\n]/g, "<br />");

  // 정규 표현식으로 색상 코드와 텍스트를 분리
  const regex: RegExp = /\|c([0-9a-fA-F]{8})([^|]*)\|r/g;

  let lastIndex: number = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(wtsString)) !== null) {
    const [_, colorCode, text] = match;

    // rgbA 값 추출
    const alpha: number = parseInt(colorCode.slice(0, 2), 16) / 255;
    const red: number = parseInt(colorCode.slice(2, 4), 16);
    const green: number = parseInt(colorCode.slice(4, 6), 16);
    const blue: number = parseInt(colorCode.slice(6, 8), 16);

    const rgbaColor = `rgba(${red}, ${green}, ${blue}, ${alpha})`;

    // 정규 표현식 매치 이전의 일반 텍스트를 추가
    result += wtsString.substring(lastIndex, match.index);

    // 색상 코드를 적용한 텍스트를 추가
    result += `<span style="color:${rgbaColor}">${text}</span>`;

    // 마지막 매치 이후 인덱스를 갱신
    lastIndex = regex.lastIndex;
  }

  // 마지막 매치 이후의 일반 텍스트를 추가
  result += wtsString.substring(lastIndex);

  return result;
}
