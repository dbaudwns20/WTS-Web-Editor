import { type NextRequest } from "next/server";

import dbConnect from "@/db/database";
import ProjectModel from "@/db/models/project";

import Project from "@/types/project";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    if (!params.projectId) return Response.json({ message: "Invalid id" });
    dbConnect();
    const project: Project | null = await ProjectModel.findById(
      params.projectId
    );
    if (!project) return Response.json({ message: "Project not found" });
    await ProjectModel.findByIdAndDelete(params.projectId);
    return Response.json(`${project.title} is deleted`);
  } catch (error) {
    return Response.json({ message: "Internal server error" });
  }
}
