import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

/**
 * Route-protection gate for every (dashboard) route (docs/UIUX-touq.md
 * Part B.3). This is a fast-fail check only — each protected layout/route
 * re-verifies the session server-side too (docs/ARCHITECTURE-touq.md #9.4:
 * "the gateway check is a fast-fail optimization, not the sole
 * authorization boundary"), per Next.js's own guidance not to rely on
 * Proxy alone for auth.
 *
 * Renamed from `middleware.ts` per the Next.js 16 upgrade
 * (node_modules/next/dist/docs/.../version-16.md #middleware-to-proxy).
 */
const PROTECTED_PREFIXES = ["/merchant", "/supplier", "/admin", "/settings", "/notifications", "/onboarding"];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isProtected = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  if (isProtected && !req.auth) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }
});

export const config = {
  matcher: [
    "/merchant/:path*",
    "/supplier/:path*",
    "/admin/:path*",
    "/settings/:path*",
    "/notifications/:path*",
    "/onboarding/:path*",
  ],
};
