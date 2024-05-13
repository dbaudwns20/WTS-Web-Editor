import { startSession } from "mongoose";
import { type NextRequest } from "next/server";

import dbConnect from "@/db/database";

import {
  deleteProject,
  getProject,
  updateProject,
} from "@/app/api/_services/project.service";

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
    checkRequestParams(["projectId"], params);
    await dbConnect();
    const project = await getProject(params.projectId);
    return resolveSuccess(project);
  } catch (error: any) {
    return resolveErrors(error);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Params }
) {
  let session;
  try {
    const body = await request.json();
    checkRequestParams(["projectId"], params);
    checkRequestBody(["title", "language"], body);
    session = await startSession();
    session.startTransaction();
    await dbConnect();
    const instance = await updateProject(params.projectId, body);
    await session.commitTransaction();
    return resolveSuccess(instance);
  } catch (error: any) {
    if (session && session.inTransaction()) {
      session.abortTransaction();
    }
    return resolveErrors(error);
  } finally {
    session?.endSession();
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Params }
) {
  let session;
  try {
    checkRequestParams(["projectId"], params);
    session = await startSession();
    session.startTransaction();
    await dbConnect();
    // 프로젝트와 하위 string 제거
    await deleteProject(params.projectId);
    await session.commitTransaction();
    return resolveSuccess("the project is deleted");
  } catch (error) {
    if (session && session.inTransaction()) {
      session.abortTransaction();
    }
    return resolveErrors(error);
  } finally {
    session?.endSession();
  }
}
