import { startSession } from "mongoose";
import { type NextRequest } from "next/server";

import dbConnect from "@/db/database";
import ProjectModel from "@/db/models/project";

import { createProject } from "@/app/api/_services/project.service";
import { uploadProjectImage } from "@/app/api/_services/project.image.service";
import { createStrings } from "@/app/api/_services/string.service";

import {
  checkRequestBody,
  resolveSuccess,
  resolveErrors,
  resolvePagination,
} from "@/app/api";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    return await resolvePagination(request, ProjectModel, {}, "projectImage");
  } catch (error) {
    return resolveErrors(error);
  }
}

export async function POST(request: NextRequest) {
  let session;
  try {
    const formData: FormData = await request.formData();
    checkRequestBody(
      ["title", "locale", "wtsStringList", "imageFile"],
      formData
    );

    await dbConnect();

    session = await startSession();
    session.startTransaction();

    const createData: any = {
      title: formData.get("title"),
      locale: Number(formData.get("locale")),
      projectImage: await uploadProjectImage(
        formData.get("imageFile") as File,
        session
      ),
    };
    if (formData.has("version")) {
      createData.version = formData.get("version");
    }
    if (formData.has("source")) {
      createData.source = formData.get("source");
    }

    const wtsStringList = JSON.parse(formData.get("wtsStringList") as string);

    // Project 생성
    const newProject = await createProject(createData, session);
    // String 생성
    await createStrings(newProject._id, wtsStringList, session);

    await session.commitTransaction();
    return resolveSuccess(newProject);
  } catch (error: any) {
    if (session && session.inTransaction()) {
      await session.abortTransaction();
    }
    return resolveErrors(error);
  } finally {
    session?.endSession();
  }
}
