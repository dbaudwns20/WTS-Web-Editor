import { ClientSession } from "mongoose";

import Project from "@/types/project";
import ProjectModel from "@/db/models/project";

import {
  deleteProjectStrings,
  updateProjectStrings,
} from "@/app/api/_services/string.service";
import { deleteProjectImage } from "./project.image.service";
import { formDataToObject } from "@/app/api";

/**
 * 프로젝트 생성
 * @param createData
 * @returns
 */
export async function createProject(
  formData: FormData,
  session: ClientSession
): Promise<any> {
  const newProject = new ProjectModel({
    ...formDataToObject(formData),
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
  const project: Project = await getProject(projectId);
  // vercel/Blob에 업로드 된 이미지 삭제
  await deleteProjectImage(project.imageUrl);
  // String 데이터를 삭제
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
