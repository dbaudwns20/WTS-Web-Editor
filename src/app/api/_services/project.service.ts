import ProjectModel from "@/db/models/project";

import {
  deleteProjectStrings,
  updateProjectStrings,
} from "@/app/api/_services/string.service";

export async function createProject(createData: any): Promise<any> {
  const newProject = new ProjectModel({
    ...createData,
    ...{ createdAt: new Date(), updatedAt: new Date() },
  });
  return await newProject.save();
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
  // wtsStringList 가 존재할 경우
  if (updateData["wtsStringList"]) {
    await updateProjectStrings(projectId, updateData["wtsStringList"]);
  }
  const instance = await ProjectModel.findByIdAndUpdate(
    projectId,
    {
      ...updateData,
      ...{ updatedAt: new Date() },
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
  await updateProject(projectId, {
    process: process,
    lastModifiedStringNumber: stringNumber,
  });
}
