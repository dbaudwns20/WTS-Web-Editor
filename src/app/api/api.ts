import { type NextRequest, NextResponse } from "next/server";

type ApiResponse = {
  success: boolean;
  message?: string;
  data?: any;
  pageInfo?: Pagination;
};

type Pagination = {
  offset: number;
  currentPage: number;
  totalPage: number;
  totalCount: number;
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

export async function resolvePagination(req: NextRequest, model: any) {
  // 현재 페이지
  const currentPage = Number(req.nextUrl.searchParams.get("currentPage"));
  // 제한
  const offset: number = Number(req.nextUrl.searchParams.get("offset") || "8");
  // 총 개수
  const totalCount: number = await model.countDocuments();
  // 총 페이지 수
  const totalPage: number = Math.floor(totalCount / offset) + 1;
  // 정렬
  const order = setOrder(req);

  const data = await model
    .find({})
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
    } as Pagination,
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
