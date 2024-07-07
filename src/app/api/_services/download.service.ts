import StringModel from "@/db/models/string";

import Project from "@/types/project";
import { getLocaleTextByValue } from "@/types/locale";
import { ErrorResponse } from "@/types/api.response";

import { getProject } from "./project.service";

// 문자열을 Uint8Array로 변환
function convertToUint8Array(fileContent: string): Uint8Array {
  return new TextEncoder().encode(fileContent);
}

// Uint8Array를 Base64 형식으로 인코딩
function encodeToBase64(unit8Array: Uint8Array): string {
  return Buffer.from(unit8Array).toString("base64");
}

export async function downloadWts(
  projectId: string,
  purpose: string
): Promise<string> {
  const filter: any = { projectId };

  // 업로드 목적이라면 완료된 항목만 조회
  if (purpose === "UPLOAD") {
    filter.completedAt = { $ne: null };
  }

  const instance = await StringModel.find(filter).sort({ stringNumber: 1 });

  if (instance.length === 0) {
    throw new ErrorResponse("ERR_NO_TRANSLATED_DATA");
  }

  const fileContent = instance
    .map((instance) => {
      const lines = [
        `STRING ${instance.stringNumber}`,
        instance.comment ? `// ${instance.comment}` : "",
        "{",
        purpose === "DEBUG"
          ? `[${instance.stringNumber}]_${
              instance.completedAt
                ? instance.translatedText
                : instance.originalText
            }`
          : instance.completedAt
          ? instance.translatedText
          : instance.originalText,
        "}",
      ];
      return lines.filter(Boolean).join("\n");
    })
    .join("\n\n");

  const unit8Array: Uint8Array = convertToUint8Array(fileContent);

  const result: string = encodeToBase64(unit8Array);

  return result;
}

export async function getFileName(projectId: string): Promise<string> {
  const instance: Project = await getProject(projectId);
  let fileName: string =
    instance.title + " " + `[${getLocaleTextByValue(instance.locale)!}]`;
  if (instance.version) {
    fileName += `[${instance.version}]`;
  }
  return fileName;
}
