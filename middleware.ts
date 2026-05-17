import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import {
  getDefaultRoleHome,
  getUserRoles,
  hasRoleFromRoles,
  requiredRoleForPath,
} from "@/lib/auth/roles";
import { updateSession } from "@/lib/supabase/middleware";

function redirectWithSessionCookies(
  request: NextRequest,
  response: NextResponse,
  pathname: string,
) {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  url.search = "";

  const redirectResponse = NextResponse.redirect(url);
  response.cookies.getAll().forEach((cookie) => {
    redirectResponse.cookies.set(cookie);
  });

  return redirectResponse;
}

export async function middleware(request: NextRequest) {
  const { response, user } = await updateSession(request);
  const { pathname } = request.nextUrl;
  const requiredRole = requiredRoleForPath(pathname);

  if (pathname === "/login" && user) {
    return redirectWithSessionCookies(
      request,
      response,
      getDefaultRoleHome(user),
    );
  }

  if (requiredRole && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);

    const redirectResponse = NextResponse.redirect(url);
    response.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie);
    });

    return redirectResponse;
  }

  const metadataRoles = getUserRoles(user, { fallbackToEmployee: false });

  if (
    requiredRole &&
    metadataRoles.length > 0 &&
    !hasRoleFromRoles(metadataRoles, requiredRole)
  ) {
    return redirectWithSessionCookies(request, response, "/unauthorized");
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
