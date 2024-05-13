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
      const line: string = lines[i].trim();
      let pieces = line.split("\n");
      wtsString.stringNumber = Number(pieces[0].trim());
      pieces.splice(0, 1);
      if (pieces[0].startsWith("// ")) {
        wtsString.comment = pieces[0].substring(3).trim();
        pieces.splice(0, 1);
      }
      // except first and last index
      for (let i = 1; i < pieces.length - 1; i++) {
        wtsString.content += pieces[i].substring(0, pieces[i].length - 1);
      }
      result.push(wtsString);
    }
  };
  reader.readAsText(wtsFile);
  return result;
}
