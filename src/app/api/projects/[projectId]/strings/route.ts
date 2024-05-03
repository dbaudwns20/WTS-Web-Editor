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
  resolveStringModelPagination,
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
    checkRequestParams(["projectId"], params);
    await dbConnect();
    return resolveStringModelPagination(request, StringModel, {
      projectId: params.projectId,
    });
  } catch (error) {
    return resolveErrors(error);
  }
}
