import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  const isProtectedRoute = path.startsWith("/events");

  // Get token from cookies
  const token = request.cookies.get("token");

  // If trying to access protected route and no token exists
  if (isProtectedRoute && !token) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/events/:path*"],
};
