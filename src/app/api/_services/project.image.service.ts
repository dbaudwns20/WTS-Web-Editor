import { ClientSession } from "mongoose";
import { put, del, type PutBlobResult } from "@vercel/blob";

import ProjectModel from "@/db/models/project";
import ProjectImageModel from "@/db/models/project.image";
import {
  DefaultImage,
  getDefaultImageByFileNameAndType,
  checkDefaultImage,
} from "@/types/default.image";

import { getProject } from "@/app/api/_services/project.service";

async function createProjectImage(newData: any, session: ClientSession) {
  const instance = new ProjectImageModel({
    url: newData.url,
    pathname: newData.pathname,
    downloadUrl: newData.downloadUrl,
    contentType: newData.contentType,
    createdAt: new Date(),
  });
  return await instance.save({ session });
}

/**
 * 프로젝트 이미지 업로드 & 생성
 * @param imageFile
 * @param session
 * @returns
 */
export async function uploadProjectImage(
  imageFile: File,
  session: ClientSession
) {
  // 파일명.확장자 가 동일한 파일 체크 (같은 파일 업로드 방지)
  const existingProjectImage = await ProjectImageModel.findOne({
    pathname: imageFile.name,
    contentType: imageFile.type,
  }).session(session);
  if (existingProjectImage) return existingProjectImage;

  const defaultImage: DefaultImage | undefined =
    getDefaultImageByFileNameAndType(imageFile.name, imageFile.type);
  if (defaultImage) {
    // 기본이미지 정보를 데이터베이스에 저장
    return await createProjectImage(
      {
        url: defaultImage.url,
        pathname: defaultImage.file.name,
        downloadUrl: defaultImage.url,
        contentType: defaultImage.file.type,
      },
      session
    );
  } else {
    // Vercel Blob에 파일 업로드
    const putBlobResult: PutBlobResult = await put(imageFile.name, imageFile, {
      access: "public",
    });
    // 업로드된 파일 정보를 데이터베이스에 저장
    return await createProjectImage(putBlobResult, session);
  }
}

/**
 * 프로젝트 이미지 삭제
 * @param imageUrl
 */
export async function deleteProjectImage(
  projectId: string,
  session: ClientSession
) {
  // 프로젝트 조회 및 이미지 데이터 로드
  const project = await getProject(projectId);

  const projectImage = project.projectImage;

  // 동일한 이미지를 다른 프로젝트에서 사용하는지 확인
  const count: number = await ProjectModel.countDocuments({
    projectImage: projectImage,
  });

  // DB 이미지 데이터 삭제
  if (count == 1) {
    // 기본이미지 체크
    if (
      !checkDefaultImage(
        projectImage.url,
        projectImage.pathname,
        projectImage.contentType
      )
    ) {
      // 기본이미지가 아니라면 vercel/Blob 데이터 삭제
      await del(projectImage.url);
    }
    await ProjectImageModel.findByIdAndDelete(projectImage.id, {
      session,
    });
  }
}
