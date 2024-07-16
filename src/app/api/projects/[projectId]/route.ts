import { startSession } from "mongoose";
import { type NextRequest } from "next/server";

import dbConnect from "@/db/database";

import {
  deleteProject,
  getProject,
  updateProject,
} from "@/app/api/_services/project.service";
import { updateProjectStrings } from "@/app/api/_services/string.service";
import { uploadProjectImage } from "@/app/api/_services/project.image.service";

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
    checkRequestParams(["projectId"], params);
    const formData: FormData = await request.formData();
    checkRequestBody(["title", "locale"], formData);

    await dbConnect();

    session = await startSession();
    session.startTransaction();

    const updateData: any = {
      title: formData.get("title"),
      locale: Number(formData.get("locale")),
    };
    if (formData.has("version")) {
      updateData.version = formData.get("version");
    }
    if (formData.has("source")) {
      updateData.source = formData.get("source");
    }
    if (formData.has("imageFile")) {
      updateData.projectImage = await uploadProjectImage(
        formData.get("imageFile") as File,
        session
      );
    }
    if (formData.has("wtsStringList")) {
      const wtsStringList = JSON.parse(formData.get("wtsStringList") as string);
      // string 데이터 갱신
      await updateProjectStrings(params["projectId"], wtsStringList, session);
    }

    // 프로젝트 업데이트
    const instance = await updateProject(params.projectId, updateData, session);

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

    await dbConnect();

    session = await startSession();
    session.startTransaction();

    // 프로젝트와 하위 string 제거
    await deleteProject(params.projectId, session);

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
