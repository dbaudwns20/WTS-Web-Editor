import { type NextRequest } from "next/server";

import dbConnect from "@/db/database";

import StringModel from "@/db/models/string";

import { getString } from "@/app/api/_services/string.service";

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
    await dbConnect();
    const string = await getString(params["projectId"], params["stringId"]);
    return resolveSuccess(string);
  } catch (error) {
    return resolveErrors(error);
  }
}
