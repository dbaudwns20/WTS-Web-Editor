import { type NextRequest, NextResponse } from "next/server";

import { type PageInfo, type ApiResponse } from "@/types/api.response";

function setOrder(req: NextRequest) {
  const sort = req.nextUrl.searchParams.get("sort") || null;
  const order = req.nextUrl.searchParams.get("order") || "ASC";
  if (!sort) return {};
  return {
    [sort]: order === "ASC" ? 1 : -1,
    _id: 1,
  };
}

export function checkRequestParams(keys: string[], params: any) {
  const arr: string[] = [];
  for (const key of keys) {
    if (!(key in params)) {
      arr.push(key);
    }
  }
  if (arr.length > 0) {
    throw new Error(`Required parameters are missing - [ ${arr.join(",")} ]`);
  }
}

export function checkRequestBody(keys: string[], body: any) {
  const arr: string[] = [];
  for (const key of keys) {
    if (!(key in body)) {
      arr.push(key);
    }
  }
  if (arr.length > 0) {
    throw new Error(`Required payloads are missing  - [ ${arr.join(", ")} ]`);
  }
}

export async function resolveStringModelPagination(
  req: NextRequest,
  model: any,
  query: any = {}
) {
  // 현재 페이지
  let currentPage = Number(req.nextUrl.searchParams.get("currentPage"));
  // 제한
  let offset: number = Number(req.nextUrl.searchParams.get("offset"));
  // 마지막 수정된 string number
  const lastModifiedStringNumber: string | null = req.nextUrl.searchParams.get(
    "lastModifiedStringNumber"
  );
  // 자동이동 설정 여부
  const skipCompleted: boolean =
    req.nextUrl.searchParams.get("skipCompleted") === "true";

  const keyword: string | null = req.nextUrl.searchParams.get("keyword");
  const status: string | null = req.nextUrl.searchParams.get("status");

  if (lastModifiedStringNumber) {
    let target: number = Number(lastModifiedStringNumber);
    offset = target + (10 - (target % 10));
  }

  // 키워드 검색조건
  if (keyword) {
    // $regex를 사용하여 대소문자 구분 없이 검색
    const keywordRegex = new RegExp(keyword, "i");
    let keywordFilter: any = {
      $or: [
        { originalText: { $regex: keywordRegex } },
        { translatedText: { $regex: keywordRegex } },
      ],
    };

    // 숫자로만 구성된 keyword인 경우 stringNumber 필드 검색 조건 추가
    const keywordNumber = Number(keyword);
    if (!isNaN(keywordNumber) && keyword.trim() !== "") {
      keywordFilter["$or"].push({ stringNumber: keywordNumber });
    }

    query = { ...query, ...keywordFilter };
  }

  // 상태 검색조건
  if (status) {
    switch (status) {
      case "none":
        query = {
          ...query,
          ...{
            $and: [{ completedAt: null }, { updatedAt: null }],
          },
        };
        break;
      case "complete":
        query = {
          ...query,
          ...{
            $and: [
              { completedAt: { $ne: null } },
              { updatedAt: { $ne: null } },
              { $expr: { $gte: ["$completedAt", "$updatedAt"] } },
            ],
          },
        };
        break;
      case "inProgress":
        query = {
          ...query,
          ...{
            $and: [
              { completedAt: null },
              { updatedAt: { $ne: null } },
              { $expr: { $gte: ["$updatedAt", "$createdAt"] } },
            ],
          },
        };
        break;
      case "update":
        query = {
          ...query,
          ...{
            $and: [
              { completedAt: { $ne: null } },
              { updatedAt: { $ne: null } },
              { $expr: { $gt: ["$updatedAt", "$completedAt"] } },
            ],
          },
        };
        break;
    }
  }

  // 정렬
  const order = setOrder(req);
  // 조회
  let data = await model
    .find(query)
    .sort(order) // 정렬
    .skip((currentPage - 1) * offset)
    .limit(offset);

  // 총 개수
  const totalCount: number = await model.countDocuments(query);

  // skipCompleted 가 true 일 경우
  if (skipCompleted) {
    // 미완료된 String 찾기
    while (
      data.findIndex((item: any) => !item.completedAt && !item.updatedAt) === -1
    ) {
      // data 길이가 모든 도큐먼트의 길이와 동일하다면 break
      if (data.length >= totalCount) break;
      // offset 2배 증가
      offset *= 2;
      // 다시 조회
      data = await model
        .find(query)
        .sort(order) // 정렬
        .skip((currentPage - 1) * offset)
        .limit(offset);
    }
  }

  if (lastModifiedStringNumber) {
    currentPage = offset / 10;
    offset = 10;
  }

  // 총 페이지 수
  const totalPage: number = Math.floor(totalCount / offset) + 1;

  return NextResponse.json({
    success: true,
    data: data,
    pageInfo: {
      offset: offset,
      currentPage: currentPage,
      totalCount: totalCount,
      totalPage: totalPage,
    } as PageInfo,
  } as ApiResponse);
}

export async function resolvePagination(
  req: NextRequest,
  model: any,
  query: any = {}
) {
  // 현재 페이지
  const currentPage = Number(req.nextUrl.searchParams.get("currentPage"));
  // 제한
  const offset: number = Number(req.nextUrl.searchParams.get("offset"));
  // 총 개수
  const totalCount: number = await model.countDocuments(query);
  // 총 페이지 수
  const totalPage: number = Math.floor(totalCount / offset) + 1;
  // 정렬
  const order = setOrder(req);

  const data = await model
    .find(query)
    .sort(order) // 정렬
    .skip((currentPage - 1) * offset)
    .limit(offset);

  return NextResponse.json({
    success: true,
    data: data,
    pageInfo: {
      offset: offset,
      currentPage: currentPage,
      totalCount: totalCount,
      totalPage: totalPage,
    } as PageInfo,
  } as ApiResponse);
}

export function resolveSuccess(data: any) {
  return NextResponse.json({
    success: true,
    data: data,
  } as ApiResponse);
}

export function resolveErrors(error: any) {
  return NextResponse.json({
    success: false,
    message: error.message,
  } as ApiResponse);
}
