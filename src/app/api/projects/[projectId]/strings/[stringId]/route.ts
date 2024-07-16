import { startSession } from "mongoose";
import { type NextRequest } from "next/server";

import dbConnect from "@/db/database";

import { getLocaleValueByText } from "@/types/locale";
import { ErrorResponse } from "@/types/api.response";

import {
  updateString,
  getTranslatedTextList,
} from "@/app/api/_services/string.service";

import {
  checkRequestBody,
  checkRequestParams,
  checkRequestQuery,
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
  let session;
  try {
    checkRequestParams(["projectId", "stringId"], params);
    const searchParams: URLSearchParams = request.nextUrl.searchParams;
    checkRequestQuery(["originalText", "locale"], searchParams);

    const originalText: string | null = searchParams.get("originalText");
    if (!originalText) throw new ErrorResponse("NO_ORIGINAL_TEXT");
    const locale: number = getLocaleValueByText(searchParams.get("locale")!);

    await dbConnect();

    session = await startSession();
    session.startTransaction();

    const translatedStringList = await getTranslatedTextList(
      originalText,
      locale,
      session
    );

    return resolveSuccess({
      count: translatedStringList.length,
      translatedStringList,
    });
  } catch (error) {
    if (session && session.inTransaction()) {
      session.abortTransaction();
    }
    return resolveErrors(error);
  } finally {
    session?.endSession();
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Params }
) {
  let session;
  try {
    checkRequestParams(["projectId", "stringId"], params);
    const formData = await request.formData();
    checkRequestBody(
      ["translatedText", "isSaveDraft", "isCompleted"],
      formData
    );

    const updateData: any = {
      translatedText: formData.get("translatedText"),
      isSaveDraft: formData.get("isSaveDraft") === "true",
      isCompleted: formData.get("isCompleted") === "true",
    };

    await dbConnect();

    session = await startSession();
    session.startTransaction();

    const newString = await updateString(
      params["projectId"],
      params["stringId"],
      updateData,
      session
    );

    await session.commitTransaction();
    return resolveSuccess(newString);
  } catch (error) {
    if (session && session.inTransaction()) {
      session.abortTransaction();
    }
    return resolveErrors(error);
  } finally {
    session?.endSession();
  }
}
