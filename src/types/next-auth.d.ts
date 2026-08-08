import type { DefaultSession } from "next-auth";
import type { OrganizationType, OrganizationStatus, VerificationStatus } from "@/generated/prisma/client";
import type { RoleName } from "@/lib/rbac";

export interface SessionOrganization {
  id: string;
  type: OrganizationType;
  legalNameAr: string;
  roleName: RoleName;
  verificationStatus: VerificationStatus;
  status: OrganizationStatus;
}

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      phone: string;
      locale: string;
      platformRole: RoleName | null;
      organization: SessionOrganization | null;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    phone: string;
  }
}

/**
 * `next-auth/jwt` re-exports `JWT` from `@auth/core/jwt` (`export * from
 * "@auth/core/jwt"`) rather than declaring it locally, so augmenting
 * "next-auth/jwt" does not merge into the interface actually used by
 * NextAuth's callback types — the augmentation has to target the module
 * that declares `interface JWT` itself.
 */
declare module "@auth/core/jwt" {
  interface JWT {
    userId: string;
    name: string;
    email: string | null;
    phone: string;
    locale: string;
    platformRole: RoleName | null;
    organization: SessionOrganization | null;
    loaded: boolean;
  }
}
