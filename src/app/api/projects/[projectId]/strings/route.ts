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

    const searchParams: URLSearchParams = request.nextUrl.searchParams;

    const keyword: string | null = searchParams.get("keyword");
    const status: string | null = searchParams.get("status");

    // 검색조건
    let query: any = { projectId: params.projectId };

    // 키워드 검색조건
    if (keyword) {
      // $regex를 사용하여 대소문자 구분 없이 검색
      const keywordRegex = new RegExp(keyword, "i");
      let keywordFilter: any = {
        $or: [
          { originalText: { $regex: keywordRegex } },
          { translatedText: { $regex: keywordRegex } },
        ],
      };

      // 숫자로만 구성된 keyword인 경우 stringNumber 필드 검색 조건 추가
      const keywordNumber = Number(keyword);
      if (!isNaN(keywordNumber) && keyword.trim() !== "") {
        keywordFilter["$or"].push({ stringNumber: keywordNumber });
      }

      query = { ...query, ...keywordFilter };
    }

    // 상태 검색조건
    if (status) {
      switch (status) {
        case "unedited":
          query = {
            ...query,
            ...{
              $and: [{ completedAt: null }, { updatedAt: null }],
            },
          };
          break;
        case "complete":
          query = {
            ...query,
            ...{
              $and: [
                { completedAt: { $ne: null } },
                { updatedAt: { $ne: null } },
                { $expr: { $gte: ["$completedAt", "$updatedAt"] } },
              ],
            },
          };
          break;
        case "inProgress":
          query = {
            ...query,
            ...{
              $and: [
                { completedAt: null },
                { updatedAt: { $ne: null } },
                { $expr: { $gt: ["$updatedAt", "$createdAt"] } },
              ],
            },
          };
          break;
        case "update":
          query = {
            ...query,
            ...{
              $and: [
                { completedAt: { $ne: null } },
                { updatedAt: { $ne: null } },
                { $expr: { $gt: ["$updatedAt", "$completedAt"] } },
              ],
            },
          };
          break;
      }
    }

    await dbConnect();
    return resolveStringModelPagination(request, StringModel, query);
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
    checkRequestParams(["projectId"], params);
    const formData: FormData = await request.formData();
    checkRequestBody(["wtsStringList"], formData);

    await dbConnect();

    session = await startSession();
    session.startTransaction();

    await overwriteWtsStrings(
      params["projectId"],
      JSON.parse(formData.get("wtsStringList") as string),
      session
    );

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
