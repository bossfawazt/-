import { db } from "@/lib/db";
import { issueOtp } from "@/lib/otp";
import { ROLES } from "@/lib/rbac";
import type { RegisterInput } from "@/lib/validations/auth";

export class PhoneAlreadyRegisteredError extends Error {
  constructor() {
    super("phone_already_registered");
  }
}

/**
 * Registration use-case (docs/ARCHITECTURE-touq.md #7.1 application layer):
 * creates the User + Organization + owning OrganizationMember in one
 * transaction, then issues the phone-verification OTP. Mirrors the
 * Registration screen flow in docs/UIUX-touq.md #C.12.
 */
export async function registerOrganization(input: RegisterInput) {
  const existingUser = await db.user.findUnique({ where: { phone: input.phone } });

  if (existingUser?.phoneVerifiedAt) {
    throw new PhoneAlreadyRegisteredError();
  }

  if (existingUser && !existingUser.phoneVerifiedAt) {
    // Unverified partial registration — resend the OTP rather than
    // duplicating the user/organization (idempotent restart).
    await issueOtp(input.phone, "REGISTER");
    return { userId: existingUser.id };
  }

  const ownerRole = await db.role.findUniqueOrThrow({ where: { name: ROLES.ORG_OWNER } });

  const user = await db.$transaction(async (tx) => {
    const createdUser = await tx.user.create({
      data: { name: input.name, phone: input.phone },
    });

    await tx.organization.create({
      data: {
        type: input.organizationType,
        legalNameAr: input.businessNameAr,
        members: {
          create: { userId: createdUser.id, roleId: ownerRole.id, status: "ACTIVE" },
        },
      },
    });

    return createdUser;
  });

  await issueOtp(input.phone, "REGISTER");

  return { userId: user.id };
}
