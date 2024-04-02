import { startSession } from "mongoose";
import { type NextRequest, NextResponse } from "next/server";

import dbConnect from "@/db/database";
import ProjectModel from "@/db/models/project";

import Project from "@/types/project";

import { deleteProject } from "@/services/project.service";

import { checkRequestBody, checkRequestParams } from "@/utils/api";

type Params = {
  projectId: string;
};

export async function GET(request: NextRequest, params: Params) {
  try {
    checkRequestParams(["projectId"], params);

    await dbConnect();
    return NextResponse.json(await ProjectModel.findById(params.projectId));
  } catch (error) {
    return NextResponse.json({ message: "Internal server error" });
  }
}

export async function PUT(request: NextRequest, params: Params) {
  let session;
  try {
    session = await startSession();
    session.startTransaction();

    const body = await request.json();
    checkRequestParams(["projectId"], params);

    await dbConnect();

    return Response.json("the project is updated");
  } catch (error: any) {
    if (session) {
      session.abortTransaction();
      session.endSession();
    }
    return NextResponse.json(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Params }
) {
  let session;
  try {
    session = await startSession();
    session.startTransaction();

    checkRequestParams(["projectId"], params);

    await dbConnect();

    // 프로젝트와 하위 string 제거
    await deleteProject(params.projectId);

    await session.commitTransaction();
    return Response.json("the project is deleted");
  } catch (error: any) {
    if (session) {
      session.abortTransaction();
      session.endSession();
    }
    return NextResponse.json(error);
  }
}
