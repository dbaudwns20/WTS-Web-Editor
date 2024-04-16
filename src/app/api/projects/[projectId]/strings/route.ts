import { startSession } from "mongoose";
import { type NextRequest, NextResponse } from "next/server";

import dbConnect from "@/db/database";
import StringModel from "@/db/models/string";

import String from "@/types/string";

import { getStringList } from "@/app/api/_services/string.service";

import {
  checkRequestBody,
  checkRequestParams,
  handleSuccess,
  handleErrors,
} from "@/app/api/api";

type Params = {
  projectId: string;
  stringId: string;
};

export async function GET(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    checkRequestParams(["projectId"], params);
    await dbConnect();
    return handleSuccess(await getStringList(params.projectId));
  } catch (error) {
    return handleErrors(error);
  }
}
