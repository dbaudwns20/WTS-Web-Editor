import StringModel, { IString } from "@/db/models/string";

import { updateProject } from "./project.service";

type StringInstance = {
  stringNumber: number;
  content: string;
  comment: string | null;
};

async function computeCompletedProcess(
  projectId: string,
  isCompleted: boolean
): Promise<string> {
  try {
    const result = await StringModel.aggregate([
      {
        $facet: {
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
          totalCount: { $arrayElemAt: ["$totalCount.totalCount", 0] },
          completedCount: {
            $arrayElemAt: ["$completedCount.completedCount", 0],
          },
        },
      },
    ]).exec();
    let { completedCount = 0, totalCount } = result[0];
    // 완료된 String 이 아니라면 => 신규, process 계산 기존 완료된 건수 + 1
    if (!isCompleted) {
      completedCount += 1;
    }
    return ((completedCount / totalCount) * 100).toFixed(1);
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function createString(newStringData: IString) {
  await new StringModel({
    ...newStringData,
    ...{
      createdAt: new Date(),
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
  // 프로젝트 업데이트 데이터
  let projectUpdateData = {};
  let isCompleted: boolean = false;

  // 임시 저장 여부 확인
  if (!updateData["isSaveDraft"]) {
    // 이미 완료된 경우엔 계산할 필요 없음
    if (!updateData["isCompleted"]) {
      // 완료된 string 이라면 project 의 process 갱신
      projectUpdateData = {
        ...projectUpdateData,
        ...{
          process: await computeCompletedProcess(projectId, false),
        },
      };
    }
    // completedAt 갱신
    isCompleted = true;
  }

  // update string
  const instance = await StringModel.findByIdAndUpdate(
    stringId,
    {
      ...updateData,
      ...{ updatedAt: new Date() },
      ...(isCompleted && {
        completedAt: new Date(),
      }),
    },
    {
      new: true,
    }
  );

  // 마지막 수정 String number 갱신
  await updateProject(projectId, {
    ...projectUpdateData,
    ...{
      lastModifiedStringNumber: instance.stringNumber,
    },
  });

  return instance;
}

export async function updateProjectStrings(
  projectId: string,
  newWtsStringList: any
) {
  // upsert 용 list
  const upsertList: StringInstance[] = [];
  // 삭제용 list
  const deleteList: StringInstance[] = [];

  // 사용중인 string 리스트
  const usingStringList: IString[] = await StringModel.find({
    projectId: projectId,
  });

  // 업데이트 할 string hash map
  const updateStringMap: Map<number, StringInstance> = new Map<
    number,
    StringInstance
  >();
  for (const wtsString of newWtsStringList) {
    updateStringMap.set(wtsString.stringNumber, wtsString);
  }

  for (const string of usingStringList) {
    const instance: StringInstance | undefined = updateStringMap.get(
      string.stringNumber
    );
    if (!instance) {
      deleteList.push({
        stringNumber: string.stringNumber,
        content: string.originalText,
        comment: string.comment,
      } as StringInstance);
      continue;
    } else {
      // map 에서 대상 삭제
      updateStringMap.delete(string.stringNumber);
    }
    // 기존 string 과 다른 경우에만 갱신
    if (
      string.originalText !== instance.content ||
      string.comment !== instance.comment
    )
      upsertList.push(instance);
  }

  // 추가 되어야 할 string map 이 존재한다면 upsert 배열에 추가
  if (updateStringMap.size > 0) {
    Array.from(updateStringMap.values()).forEach((value) =>
      upsertList.push(value)
    );
  }

  // upsert
  for (const wtsString of upsertList) {
    await StringModel.findOneAndUpdate(
      { stringNumber: wtsString.stringNumber },
      {
        $setOnInsert: {
          createdAt: new Date(),
          projectId: projectId,
          stringNumber: wtsString.stringNumber,
        },
        $set: {
          originalText: wtsString.content,
          comment: wtsString.comment,
          updatedAt: new Date(),
        },
      },
      { upsert: true, setDefaultsOnInsert: true }
    );
  }

  // delete
  for (const wtsString of deleteList) {
    await StringModel.findOneAndDelete({
      stringNumber: wtsString.stringNumber,
    });
  }
}

export async function overwriteWtsStrings(
  projectId: string,
  wtsStringList: any[]
) {
  // translated text 갱신
  for (let wtsString of wtsStringList) {
    await StringModel.findOneAndUpdate(
      { projectId: projectId, stringNumber: wtsString.stringNumber },
      {
        $set: {
          translatedText: wtsString.content,
          comment: wtsString.comment,
          updatedAt: new Date(),
          completedAt: new Date(),
        },
      }
    );
  }

  // 진행룰 갱신
  await updateProject(projectId, {
    process: await computeCompletedProcess(projectId, true),
  });
}
