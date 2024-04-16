import ProjectModel from "@/db/models/project";
import Project from "@/types/project";
import StringModel, { IString } from "@/db/models/string";

export async function createProject(body: any): Promise<any> {
  const newProject = new ProjectModel(body);
  return await newProject.save();
}

async function createString(newStringData: IString) {
  await new StringModel(newStringData).save();
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
  if (!instance) throw new Error("instance not found");
  return instance;
}

/**
 * String 도큐먼트 데이터를 삭제 후 프로젝트 삭제
 * @param projectId
 */
export async function deleteProject(projectId: string) {
  await StringModel.deleteMany({
    projectId: projectId,
  });
  await ProjectModel.findByIdAndDelete(projectId);
}
