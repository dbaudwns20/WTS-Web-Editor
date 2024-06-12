import { ClientSession } from "mongoose";

import StringModel, { IString } from "@/db/models/string";

import { updateProject } from "@/app/api/_services/project.service";

type StringInstance = {
  stringNumber: number;
  content: string;
  comment: string | null;
};

async function computeCompletedProcess(
  projectId: string,
  isCompleted: boolean,
  session: ClientSession
): Promise<string> {
  const result = await StringModel.aggregate(
    [
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
    ],
    { session }
  ).exec();
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
export async function createStrings(
  newProjectId: any,
  wtsStringList: any[],
  session: ClientSession
) {
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
  await StringModel.insertMany(newStringData, { session });
}

/**
 * 스트링 삭제
 * @param projectId
 */
export async function deleteProjectStrings(
  projectId: string,
  session: ClientSession
) {
  // 해당 projectId 로 스트링 모두 삭제
  await StringModel.deleteMany(
    {
      projectId: projectId,
    },
    { session }
  );
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
  updateData: any,
  session: ClientSession
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
          process: await computeCompletedProcess(projectId, false, session),
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
      session,
    }
  );

  // 마지막 수정 String number 갱신
  await updateProject(
    projectId,
    {
      ...projectUpdateData,
      ...{
        lastModifiedStringNumber: instance.stringNumber,
      },
    },
    session
  );

  return instance;
}

export async function updateProjectStrings(
  projectId: string,
  newWtsStringList: any,
  session: ClientSession
) {
  // 사용중인 string 리스트
  const usingStringList: IString[] = await StringModel.find({
    projectId: projectId,
  }).session(session);

  // 업데이트할 string hash map 생성
  const updateStringMap: Map<number, StringInstance> = new Map<
    number,
    StringInstance
  >();
  for (const wtsString of newWtsStringList) {
    updateStringMap.set(wtsString.stringNumber, wtsString);
  }

  const bulkOps: any[] = [];
  const currentDate: Date = new Date();

  for (const string of usingStringList) {
    const instance: StringInstance | undefined = updateStringMap.get(
      string.stringNumber
    );

    // 사용중인 String 이 없을경우 삭제대상으로 취급
    if (!instance) {
      bulkOps.push({
        deleteOne: {
          filter: {
            projectId: projectId,
            stringNumber: string.stringNumber,
          },
        },
      });
    } else {
      // map 에서 대상 삭제
      updateStringMap.delete(string.stringNumber);
      // 기존 string 과 다른 경우에만 갱신
      if (
        string.originalText !== instance.content ||
        string.comment !== instance.comment
      ) {
        bulkOps.push({
          updateOne: {
            filter: {
              projectId: projectId,
              stringNumber: instance.stringNumber,
            },
            update: {
              $set: {
                originalText: instance.content,
                comment: instance.comment,
                ...(string.completedAt !== null && { updatedAt: currentDate }), // 완료된 경우에만 수정일자 갱신
              },
              upsert: true,
            },
          },
        });
      }
    }
  }

  // 추가 되어야 할 string map 이 존재한다면 bulkOps 배열에 추가
  updateStringMap.forEach((value) => {
    bulkOps.push({
      insertOne: {
        document: {
          projectId: projectId,
          stringNumber: value.stringNumber,
          originalText: value.content,
          comment: value.comment,
          createdAt: currentDate,
        },
      },
    });
  });

  if (bulkOps.length > 0) {
    await StringModel.bulkWrite(bulkOps, { session });
    // 진행률 갱신
    await updateProject(
      projectId,
      {
        process: await computeCompletedProcess(projectId, true, session),
      },
      session
    );
  }
}

export async function overwriteWtsStrings(
  projectId: string,
  wtsStringList: any[],
  session: ClientSession
) {
  // 업데이트에 사용할 현재 시간
  const currentTime = new Date();

  // 성능 향상을 위한 대량 쓰기 작업 준비
  const bulkOps = wtsStringList.map((wtsString) => {
    return {
      updateOne: {
        filter: { projectId: projectId, stringNumber: wtsString.stringNumber },
        update: {
          $set: {
            translatedText: wtsString.content,
            updatedAt: currentTime,
            completedAt: currentTime,
          },
        },
      },
    };
  });

  if (bulkOps.length > 0) {
    // 대량 쓰기 작업 수행
    await StringModel.bulkWrite(bulkOps, { session });
    // 진행률 갱신
    await updateProject(
      projectId,
      {
        process: await computeCompletedProcess(projectId, true, session),
      },
      session
    );
  }
}
