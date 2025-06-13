import { NextResponse } from "next/server";
import { ApiResponse } from "./types";

export function successResponse<T>(
  data: T,
  status = 200,
): NextResponse<ApiResponse<T>> {
  return NextResponse.json({ success: true, data }, { status });
}

export function errorResponse(
  error: string,
  status = 400,
): NextResponse<ApiResponse> {
  return NextResponse.json({ success: false, error }, { status });
}

export function notFoundResponse(
  message = "resource not found",
): NextResponse<ApiResponse> {
  return errorResponse(message, 404);
}

export function unauthorizedResponse(
  message = "unauthorized access",
): NextResponse<ApiResponse> {
  return errorResponse(message, 401);
}

export function serverErrorResponse(
  message = "server error",
): NextResponse<ApiResponse> {
  return errorResponse(message, 500);
}

export async function handleApiError(
  error: unknown,
): Promise<NextResponse<ApiResponse>> {
  console.error("API error:", error);

  if (error instanceof Error) {
    return serverErrorResponse(error.message);
  }

  return serverErrorResponse();
}
