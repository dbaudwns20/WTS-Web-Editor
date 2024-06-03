import StringModel, { IString } from "@/db/models/string";

import { updateProject } from "./project.service";

type StringInstance = {
  stringNumber: number;
  content: string;
  comment: string | null;
  isCompleted?: boolean;
};

async function computeCompletedProcess(
  projectId: string,
  isCompleted: boolean
): Promise<string> {
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
}

/**
 * 스트링 생성
 * @param newProjectId
 * @param wtsStringList
 */
export async function createStrings(newProjectId: any, wtsStringList: any[]) {
  // 새로운 스트링 생성
  let newStringData = [];
  for (let wtsString of wtsStringList) {
    newStringData.push({
      projectId: newProjectId,
      stringNumber: wtsString.stringNumber,
      originalText: wtsString.content,
      comment: wtsString.comment,
      createdAt: new Date(),
    } as IString);
  }
  // insertMany 로 실행시간 단축
  await StringModel.insertMany(newStringData);
}

/**
 * 스트링 삭제
 * @param projectId
 */
export async function deleteProjectStrings(projectId: string) {
  // 해당 projectId 로 스트링 모두 삭제
  await StringModel.deleteMany({
    projectId: projectId,
  });
}

/**
 * 스트링 수정
 * @param projectId
 * @param stringId
 * @param updateData
 * @returns
 */
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
        completedAt: new Date(), // 완료된 스트링인 경우에만 완료일자 갱신
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

  // 업데이트할 string hash map 생성
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

    // 사용중인 String 이 없을경우 삭제대상으로 취급
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
      upsertList.push({
        stringNumber: instance.stringNumber,
        content: instance.content,
        comment: instance.comment,
        isCompleted: string.completedAt !== null, // 대상 String 의 완료여부
      });
  }

  // 추가 되어야 할 string map 이 존재한다면 upsert 배열에 추가
  if (updateStringMap.size > 0) {
    Array.from(updateStringMap.values()).forEach((value) =>
      upsertList.push(value)
    );
  }

  // upsert
  const updatePromises = upsertList.map((wtsString) =>
    StringModel.findOneAndUpdate(
      { projectId: projectId, stringNumber: wtsString.stringNumber },
      {
        $setOnInsert: {
          createdAt: new Date(),
          projectId: projectId,
          stringNumber: wtsString.stringNumber,
        },
        $set: {
          originalText: wtsString.content,
          comment: wtsString.comment,
          ...(wtsString.isCompleted && { updatedAt: new Date() }), // 완료된 경우에만 수정일자 갱신
        },
      },
      { upsert: true, setDefaultsOnInsert: true }
    )
  );

  // delete
  const deletePromise = deleteList.map((wtsString) => {
    StringModel.findOneAndDelete({
      projectId: projectId,
      stringNumber: wtsString.stringNumber,
    });
  });

  // 병렬 실행
  await Promise.all(updatePromises);
  await Promise.all(deletePromise);

  if (upsertList.length > 0 || deleteList.length > 0) {
    // 진행률 갱신
    await updateProject(projectId, {
      process: await computeCompletedProcess(projectId, true),
    });
  }
}

export async function overwriteWtsStrings(
  projectId: string,
  wtsStringList: any[]
) {
  // translated text 갱신
  const updatePromises = wtsStringList.map((wtsString) =>
    StringModel.findOneAndUpdate(
      { projectId: projectId, stringNumber: wtsString.stringNumber },
      {
        $set: {
          translatedText: wtsString.content,
          comment: wtsString.comment,
          updatedAt: new Date(),
          completedAt: new Date(),
        },
      }
    )
  );

  // 병렬 실행
  await Promise.all(updatePromises);

  // 진행률 갱신
  await updateProject(projectId, {
    process: await computeCompletedProcess(projectId, true),
  });
}
