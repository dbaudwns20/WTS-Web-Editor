import { startSession } from "mongoose";
import { type NextRequest, NextResponse } from "next/server";

import dbConnect from "@/db/database";
import ProjectModel from "@/db/models/project";

import {
  createProject,
  createStrings,
} from "@/app/api/_services/project.service";

import {
  checkRequestBody,
  resolveSuccess,
  resolveErrors,
  resolvePagination,
} from "@/app/api/api";

export async function GET(request: NextRequest) {
  try {
    dbConnect();
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

    const body = await request.json();
    checkRequestBody(["title", "language", "wtsStringList"], body);

    await dbConnect();

    const newProject = await createProject(body);
    await createStrings(newProject._id, body["wtsStringList"]);

    await session.commitTransaction();
    return resolveSuccess(newProject);
  } catch (error: any) {
    if (session) {
      session.abortTransaction();
      session.endSession();
    }
    return resolveErrors(error);
  }
}
