import StringModel, { IString } from "@/db/models/string";

import { updateProjectProcess } from "./project.service";

import { ObjectId } from "@/app/api";

export async function createString(newStringData: IString) {
  await new StringModel(newStringData).save();
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
      ...{ lastUpdated: new Date() },
    },
    { new: true }
  );

  // 완료된 string 이라면 project 의 process 값, 마지막 수정 string 번호 갱신
  if (updateData["isCompleted"]) {
    try {
      const result = await StringModel.aggregate([
        {
          $facet: {
            stringNumber: [
              { $match: { projectId: projectId, _id: new ObjectId(stringId) } },
              { $project: { stringNumber: 1, _id: 0 } },
            ],
            totalCount: [{ $count: "totalCount" }],
            completedCount: [
              { $match: { isCompleted: true } },
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
      const process = ((completedCount / totalCount) * 100).toFixed(1);
      await updateProjectProcess(projectId, process, stringNumber);
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
  return instance;
}
