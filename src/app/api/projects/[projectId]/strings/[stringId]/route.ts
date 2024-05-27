import { startSession } from "mongoose";
import { type NextRequest } from "next/server";

import dbConnect from "@/db/database";

import { updateString } from "@/app/api/_services/string.service";

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

export async function PUT(
  request: NextRequest,
  { params }: { params: Params }
) {
  let session;
  try {
    session = await startSession();
    session.startTransaction();

    const body = await request.json();

    checkRequestParams(["projectId", "stringId"], params);
    checkRequestBody(["translatedText", "isSaveDraft", "isCompleted"], body);

    await dbConnect();

    const newString = await updateString(
      params["projectId"],
      params["stringId"],
      body
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
