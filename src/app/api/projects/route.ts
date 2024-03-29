import { type NextRequest } from "next/server";

import dbConnect from "@/db/database";
import ProjectModel from "@/db/models/project";

export async function GET(request: NextRequest) {
  try {
    dbConnect();
    return Response.json(await ProjectModel.find({}));
  } catch (error) {
    return Response.json({ message: "Internal server error" });
  }
}

export async function POST(request: NextRequest) {
  try {
    dbConnect();
    const body = await request.json();
    const newProject = new ProjectModel(body);
    newProject.save();
    return Response.json(newProject);
  } catch (error) {
    return Response.json({ message: "Internal server error" });
  }
}
