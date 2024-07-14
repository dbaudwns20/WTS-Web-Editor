import { startSession } from "mongoose";
import { type NextRequest } from "next/server";

import dbConnect from "@/db/database";

import {
  updateString,
  getTranslatedTextList,
} from "@/app/api/_services/string.service";

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
  let session;
  try {
    await dbConnect();

    session = await startSession();
    session.startTransaction();

    checkRequestParams(["projectId", "stringId"], params);

    const originalText: string | null =
      request.nextUrl.searchParams.get("originalText");

    await getTranslatedTextList(originalText, session);
    return resolveSuccess({});
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
    await dbConnect();

    session = await startSession();
    session.startTransaction();

    const formData = await request.formData();

    checkRequestParams(["projectId", "stringId"], params);
    checkRequestBody(
      ["translatedText", "isSaveDraft", "isCompleted"],
      formData
    );

    const updateData: any = {
      translatedText: formData.get("translatedText"),
      isSaveDraft: formData.get("isSaveDraft") === "true",
      isCompleted: formData.get("isCompleted") === "true",
    };

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
