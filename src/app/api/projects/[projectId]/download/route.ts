import { type NextRequest } from "next/server";

import dbConnect from "@/db/database";

import { type FileResponse } from "@/types/api.response";

import { downloadWts, getFileName } from "@/app/api/_services/download.service";

import {
  checkRequestParams,
  checkRequestQuery,
  resolveSuccess,
  resolveErrors,
} from "@/app/api";

type Params = {
  projectId: string;
};

export async function GET(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const searchParams: URLSearchParams = request.nextUrl.searchParams;

    checkRequestParams(["projectId"], params);
    checkRequestQuery(["purpose"], request.nextUrl.searchParams);

    await dbConnect();

    const fileContent: string = await downloadWts(
      params["projectId"],
      searchParams.get("purpose")!
    );

    const fileName: string = await getFileName(params["projectId"]);

    return resolveSuccess({
      fileName,
      fileContent,
    } as FileResponse);
  } catch (error) {
    return resolveErrors(error);
  }
}
