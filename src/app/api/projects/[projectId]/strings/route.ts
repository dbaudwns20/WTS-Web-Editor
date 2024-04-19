import { startSession } from "mongoose";
import { type NextRequest, NextResponse } from "next/server";

import dbConnect from "@/db/database";
import StringModel from "@/db/models/string";

import String from "@/types/string";

import {
  checkRequestBody,
  checkRequestParams,
  resolveSuccess,
  resolveErrors,
  resolvePagination,
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
    return resolvePagination(request, StringModel, {
      projectId: params.projectId,
    });
  } catch (error) {
    return resolveErrors(error);
  }
}
