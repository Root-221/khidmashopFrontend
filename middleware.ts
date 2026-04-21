import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const role = request.cookies.get("khidma_role")?.value;
  const refreshToken = request.cookies.get("refresh_token")?.value;
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (request.nextUrl.pathname === "/admin" && (token || (refreshToken && role === "ADMIN"))) {
    return NextResponse.redirect(new URL("/admin/dashboard", request.url));
  }

  if (request.nextUrl.pathname.startsWith("/admin") && request.nextUrl.pathname !== "/admin") {
    if (!token && !(refreshToken && role === "ADMIN")) {
      const redirectUrl = new URL("/admin", request.url);
      redirectUrl.searchParams.set("next", request.nextUrl.pathname);
      return NextResponse.redirect(redirectUrl);
    }
    return NextResponse.next();
  }

  return NextResponse.next();

}

export const config = {
  matcher: ["/admin/:path*"],
};
