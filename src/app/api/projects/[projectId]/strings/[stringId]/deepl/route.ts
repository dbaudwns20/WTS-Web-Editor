import { type NextRequest } from "next/server";

import {
  getUsageAndQuota,
  translateText,
} from "@/app/api/_services/deepl.service";

import {
  checkRequestBody,
  checkRequestParams,
  resolveSuccess,
  resolveErrors,
} from "@/app/api";

type Params = {
  projectId: string;
  stringId: string;
};

export async function GET(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    checkRequestParams(["projectId", "stringId"], params);

    const { usage, quota } = await getUsageAndQuota();

    return resolveSuccess({
      usage,
      quota,
    });
  } catch (error) {
    return resolveErrors(error);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    checkRequestParams(["projectId", "stringId"], params);
    const formData = await request.formData();
    checkRequestBody(["originalText", "targetLang"], formData);

    const translatedText: string = await translateText(
      formData.get("originalText") as string,
      formData.get("targetLang") as string
    );

    return resolveSuccess({
      translatedText: translatedText,
    });
  } catch (error) {
    return resolveErrors(error);
  }
}
