import { NextResponse } from "next/server"

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

/**
 * Success response
 */
export function successResponse<T>(data: T, statusCode = 200): NextResponse<ApiResponse<T>> {
  return NextResponse.json({ success: true, data }, { status: statusCode })
}

/**
 * Error response
 */
export function errorResponse(error: string, statusCode = 400): NextResponse<ApiResponse> {
  return NextResponse.json({ success: false, error }, { status: statusCode })
}

/**
 * Unauthorized response
 */
export function unauthorizedResponse(): NextResponse<ApiResponse> {
  return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
}

/**
 * Forbidden response
 */
export function forbiddenResponse(): NextResponse<ApiResponse> {
  return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 })
}

/**
 * Not found response
 */
export function notFoundResponse(): NextResponse<ApiResponse> {
  return NextResponse.json({ success: false, error: "Not found" }, { status: 404 })
}
