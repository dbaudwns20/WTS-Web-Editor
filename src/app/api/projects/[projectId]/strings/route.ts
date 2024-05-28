import { startSession } from "mongoose";
import { type NextRequest } from "next/server";

import dbConnect from "@/db/database";

import StringModel from "@/db/models/string";

import { overwriteWtsStrings } from "@/app/api/_services/string.service";

import {
  checkRequestBody,
  checkRequestParams,
  resolveSuccess,
  resolveErrors,
  resolveStringModelPagination,
} from "@/app/api";

type Params = {
  projectId: string;
};

export async function GET(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    checkRequestParams(["projectId"], params);
    await dbConnect();
    return resolveStringModelPagination(request, StringModel, {
      projectId: params.projectId,
    });
  } catch (error) {
    return resolveErrors(error);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Params }
) {
  let session;
  try {
    session = await startSession();
    session.startTransaction();

    const body = await request.json();

    checkRequestParams(["projectId"], params);
    checkRequestBody(["wtsStringList"], body);

    await dbConnect();

    await overwriteWtsStrings(params["projectId"], body["wtsStringList"]);

    await session.commitTransaction();
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
