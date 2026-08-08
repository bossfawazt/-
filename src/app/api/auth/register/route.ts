import { apiError, apiOk, apiValidationError } from "@/lib/api-response";
import { registerSchema } from "@/lib/validations/auth";
import { PhoneAlreadyRegisteredError, registerOrganization } from "@/server/services/auth.service";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) return apiValidationError(parsed.error);

  try {
    const result = await registerOrganization(parsed.data);
    return apiOk(result, 201);
  } catch (error) {
    if (error instanceof PhoneAlreadyRegisteredError) {
      return apiError("phone_already_registered", "هذا الرقم مسجل بالفعل، يرجى تسجيل الدخول", 409);
    }
    console.error("register error", error);
    return apiError("internal_error", "حدث خطأ غير متوقع، حاول مرة أخرى", 500);
  }
}
