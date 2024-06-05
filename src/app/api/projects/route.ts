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
    return await resolvePagination(request, ProjectModel);
  } catch (error) {
    return resolveErrors(error);
  }
}

export async function POST(request: NextRequest) {
  let session;
  try {
    session = await startSession();
    session.startTransaction();

    const form = await request.formData();

    checkRequestBody(["title", "language", "wtsStringList"], form);

    await dbConnect();

    // vercel/Blob 에 파일 업로드 후 url 리턴
    const imageUrl: string = await uploadProjectImage(
      form.get("imageFile") as File
    );
    form.set("imageUrl", imageUrl);
    // Project 생성
    const newProject = await createProject(form, session);
    // String 생성
    await createStrings(
      newProject._id,
      JSON.parse(form.get("wtsStringList") as string),
      session
    );

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
