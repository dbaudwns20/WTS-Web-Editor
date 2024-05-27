import { type NextRequest } from "next/server";

import dbConnect from "@/db/database";

import {
  checkRequestParams,
  checkRequestBody,
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
    await dbConnect();

    console.log(222);

    return resolveSuccess({});
  } catch (error) {
    return resolveErrors(error);
  }
}
