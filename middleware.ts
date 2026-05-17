import { type NextRequest, NextResponse } from "next/server";

import {
  getDefaultRoleHome,
  hasRole,
  requiredRoleForPath,
} from "@/lib/auth/roles";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const { response, user } = await updateSession(request);
  const { pathname, search } = request.nextUrl;
  const requiredRole = requiredRoleForPath(pathname);

  if (pathname === "/login" && user) {
    return NextResponse.redirect(new URL(getDefaultRoleHome(user), request.url));
  }

  if (!requiredRole) {
    return response;
  }

  if (!user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  if (!hasRole(user, requiredRole)) {
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
