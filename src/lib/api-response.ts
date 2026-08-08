import { NextResponse } from "next/server";
import type { ZodError } from "zod";

/** Standardized API error envelope (docs/ARCHITECTURE-touq.md #8). */
export function apiError(code: string, message: string, status: number, details?: unknown) {
  return NextResponse.json({ error: { code, message, details } }, { status });
}

export function apiValidationError(error: ZodError) {
  return apiError("validation_error", "بيانات غير صحيحة", 422, error.flatten());
}

export function apiOk<T>(data: T, status = 200) {
  return NextResponse.json({ data }, { status });
}
