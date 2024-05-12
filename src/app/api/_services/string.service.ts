import mongoose from "mongoose";

import StringModel, { IString } from "@/db/models/string";

import { updateProjectProcess } from "./project.service";

export async function createString(newStringData: IString) {
  await new StringModel({
    ...newStringData,
    ...{
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  }).save();
}

export async function createStrings(newProjectId: any, wtsStringList: any[]) {
  for (let wtsString of wtsStringList) {
    await createString({
      projectId: newProjectId,
      stringNumber: wtsString.stringNumber,
      originalText: wtsString.content,
      comment: wtsString.comment,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as IString);
  }
}

export async function deleteProjectStrings(projectId: string) {
  await StringModel.deleteMany({
    projectId: projectId,
  });
}

export async function updateString(
  projectId: string,
  stringId: string,
  updateData: any
) {
  // update string
  const instance = await StringModel.findByIdAndUpdate(
    stringId,
    {
      ...updateData,
      ...{ completedAt: new Date(), updatedAt: new Date() },
    },
    { new: true }
  );

  // 완료된 string 이라면 project 의 process 값, 마지막 수정 string 번호 갱신
  try {
    const result = await StringModel.aggregate([
      {
        $facet: {
          stringNumber: [
            {
              $match: {
                projectId: projectId,
                _id: new mongoose.Types.ObjectId(stringId),
              },
            },
            { $project: { stringNumber: 1, _id: 0 } },
          ],
          totalCount: [
            { $match: { projectId: projectId } },
            { $count: "totalCount" },
          ],
          completedCount: [
            { $match: { projectId: projectId, completedAt: { $ne: null } } },
            { $count: "completedCount" },
          ],
        },
      },
      {
        $project: {
          stringNumber: { $arrayElemAt: ["$stringNumber.stringNumber", 0] },
          totalCount: { $arrayElemAt: ["$totalCount.totalCount", 0] },
          completedCount: {
            $arrayElemAt: ["$completedCount.completedCount", 0],
          },
        },
      },
    ]).exec();

    const { stringNumber, completedCount, totalCount } = result[0];
    const process: string = ((completedCount / totalCount) * 100).toFixed(1);
    await updateProjectProcess(projectId, process, stringNumber);
  } catch (error: any) {
    throw new Error(error.message);
  }
  return instance;
}
