import { type NextRequest, NextResponse } from "next/server";

import { type PageInfo } from "@/types/pagination";

type ApiResponse = {
  success: boolean;
  message?: string;
  data?: any;
  pageInfo?: PageInfo;
};

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
    if (!params[key]) {
      arr.push(key);
    }
  }
  if (arr.length > 0) {
    throw new Error(`Missing parameters - [ ${arr.join(",")} ]`);
  }
}

export function checkRequestBody(keys: string[], body: any) {
  const arr: string[] = [];
  for (const key of keys) {
    if (!body[key]) {
      arr.push(key);
    }
  }
  if (arr.length > 0) {
    throw new Error(`Missing parameters - [ ${arr.join(", ")} ]`);
  }
}

export async function resolveStringModelPagination(
  req: NextRequest,
  model: any,
  query: any = {}
) {
  // 총 개수
  const totalCount: number = await model.countDocuments(query);
  // 현재 페이지
  let currentPage = Number(req.nextUrl.searchParams.get("currentPage"));
  // 제한
  let offset: number = Number(req.nextUrl.searchParams.get("offset"));

  // 마지막 수정된 string number
  const lastModifiedStringNumber: string | null = req.nextUrl.searchParams.get(
    "lastModifiedStringNumber"
  );

  if (lastModifiedStringNumber) {
    let target: number = Number(lastModifiedStringNumber);
    while (true) {
      target += 1;
      if (target % 10 === 0) break;
    }
    offset = target;
  }

  // 정렬
  const order = setOrder(req);

  const data = await model
    .find(query)
    .sort(order) // 정렬
    .skip((currentPage - 1) * offset)
    .limit(offset);

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
