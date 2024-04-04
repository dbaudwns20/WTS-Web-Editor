import { type NextRequest, NextResponse } from "next/server";

export function checkRequestParams(keys: string[], params: any) {
  for (const key of keys) {
    if (!params[key]) {
      throw new Error(`Missing ${key} in params`);
    }
  }
}

export function checkRequestBody(keys: string[], body: any) {
  for (const key of keys) {
    if (!body[key]) {
      throw new Error(`Missing ${key} in body`);
    }
  }
}

export function handleSuccess(data: any) {
  return NextResponse.json({
    success: true,
    data: data,
  });
}

export function handleErrors(error: any) {
  return NextResponse.json({
    success: false,
    message: error.message,
  });
}
