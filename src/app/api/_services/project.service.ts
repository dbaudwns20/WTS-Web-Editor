import { ClientSession } from "mongoose";

import ProjectModel from "@/db/models/project";

import {
  deleteProjectStrings,
  updateProjectStrings,
} from "@/app/api/_services/string.service";

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
    ...{ createdAt: new Date(), updatedAt: new Date() },
  });
  return await newProject.save({ session });
}

/**
 * 프로젝트 조회
 * @param projectId
 * @returns
 */
export async function getProject(projectId: string) {
  const instance = await ProjectModel.findById(projectId);
  if (!instance) throw new Error("Project is not found");
  return instance;
}

/**
 * 프로젝트 삭제
 * @param projectId
 */
export async function deleteProject(projectId: string, session: ClientSession) {
  // String 데이터를 먼저 삭제
  await deleteProjectStrings(projectId, session);
  // 프로젝트 삭제
  await ProjectModel.findByIdAndDelete(projectId, { session });
}

/**
 * 프로젝트 수정
 * @param projectId
 * @param updateData
 * @returns
 */
export async function updateProject(
  projectId: string,
  updateData: any,
  session: ClientSession
) {
  // wtsStringList 가 존재할 경우
  if (updateData["wtsStringList"]) {
    await updateProjectStrings(projectId, updateData["wtsStringList"], session);
  }
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
