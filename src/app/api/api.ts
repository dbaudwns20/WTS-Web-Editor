import { type NextRequest, NextResponse } from "next/server";

type ApiResponse = {
  success: boolean;
  message?: string;
  data?: any;
};

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

export function handleSuccess(data: any) {
  return NextResponse.json({
    success: true,
    data: data,
  } as ApiResponse);
}

export function handleErrors(error: any) {
  return NextResponse.json({
    success: false,
    message: error.message,
  } as ApiResponse);
}
