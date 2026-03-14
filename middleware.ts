import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { hasSupabaseClientEnv } from "@/lib/env";
import { PUBLIC_PATHS, PROTECTED_PREFIXES } from "@/lib/routes";
import { updateSession } from "@/lib/supabase/middleware";

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((path) => pathname === path);
}

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (!hasSupabaseClientEnv()) {
    if (isProtectedPath(pathname)) {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      url.searchParams.set(
        "error",
        "Supabase environment variables are missing. Configure .env.local first.",
      );
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  const { response, user } = await updateSession(request);

  if (isPublicPath(pathname)) {
    if (user && (pathname === "/auth/login" || pathname === "/auth/signup")) {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }
    return response;
  }

  if (isProtectedPath(pathname) && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
