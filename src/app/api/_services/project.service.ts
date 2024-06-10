import { ClientSession } from "mongoose";

import ProjectModel from "@/db/models/project";
import { ErrorResponse } from "@/types/api.response";

import { deleteProjectStrings } from "@/app/api/_services/string.service";
import { deleteProjectImage } from "@/app/api/_services/project.image.service";

/**
 * 프로젝트 생성
 * @param createData
 * @returns
 */
export async function createProject(
  createData: any,
  session: ClientSession
): Promise<any> {
  const newProject = new ProjectModel({
    ...createData,
    ...{
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });
  return await newProject.save({ session });
}

/**
 * 프로젝트 조회
 * @param projectId
 * @returns
 */
export async function getProject(projectId: string) {
  const instance = await ProjectModel.findById(projectId).populate(
    "projectImage"
  );
  if (!instance) throw new ErrorResponse("ERR_NO_PROJECT");
  return instance;
}

/**
 * 프로젝트 삭제
 * @param projectId
 */
export async function deleteProject(projectId: string, session: ClientSession) {
  // 프로젝트 이미지 삭제
  await deleteProjectImage(projectId, session);
  // String 데이터를 삭제
  await deleteProjectStrings(projectId, session);
  // 프로젝트 삭제
  await ProjectModel.findByIdAndDelete(projectId, { session });
}

/**
 * 프로젝트 수정
 * @param projectId
 * @param formData
 * @returns
 */
export async function updateProject(
  projectId: string,
  updateData: any,
  session: ClientSession
) {
  const instance = await ProjectModel.findByIdAndUpdate(
    projectId,
    {
      ...updateData,
      ...{ updatedAt: new Date() },
    },
    { new: true, session }
  );
  return instance;
}
