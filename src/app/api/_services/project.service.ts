import ProjectModel from "@/db/models/project";
import { type IString } from "@/db/models/string";

import {
  createString,
  deleteProjectStrings,
} from "@/app/api/_services/string.service";

export async function createProject(body: any): Promise<any> {
  const newProject = new ProjectModel(body);
  return await newProject.save();
}

export async function createStrings(newProjectId: any, wtsStringList: any[]) {
  for (let wtsString of wtsStringList) {
    await createString({
      projectId: newProjectId,
      stringNumber: wtsString.stringNumber,
      originalText: wtsString.content,
      comment: wtsString.comment,
    } as IString);
  }
}

export async function getProject(projectId: string) {
  const instance = await ProjectModel.findById(projectId);
  if (!instance) throw new Error("Project is not found");
  return instance;
}

/**
 * String 데이터를 삭제 후 프로젝트 삭제
 * @param projectId
 */
export async function deleteProject(projectId: string) {
  await deleteProjectStrings(projectId);
  await ProjectModel.findByIdAndDelete(projectId);
}

export async function updateProject(projectId: string, updateData: any) {
  if (updateData["wtsStringList"]) {
  }
  const instance = await ProjectModel.findByIdAndUpdate(
    projectId,
    {
      ...updateData,
      ...{ lastUpdated: new Date() },
    },
    { new: true }
  );
  return instance;
}

// 프로젝트 진행률 갱신
export async function updateProjectProcess(
  projectId: string,
  process: string,
  stringNumber: number
) {
  await ProjectModel.findByIdAndUpdate(projectId, {
    process: process,
    lastModifiedStringNumber: stringNumber,
    lastUpdated: new Date(),
  });
}
