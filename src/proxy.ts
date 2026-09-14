import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Allow public rider registration route without authentication
  if (pathname.startsWith("/rider/register")) {
    return NextResponse.next();
  }

  // 2. Read session credentials from cookies
  const token = request.cookies.get("token")?.value;
  const role = request.cookies.get("role")?.value?.toLowerCase();

  // 3. Unauthenticated access check -> redirect to /login
  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 4. Role-based Route Protection
  // Admin Routes: only accessible by 'admin'
  if (pathname.startsWith("/admin")) {
    if (role !== "admin") {
      const target = role === "rider" ? "/rider/orders" : "/orders";
      return NextResponse.redirect(new URL(target, request.url));
    }
  }

  // Rider Routes: only accessible by 'rider'
  if (pathname.startsWith("/rider")) {
    if (role !== "rider") {
      const target = role === "admin" ? "/admin" : "/orders";
      return NextResponse.redirect(new URL(target, request.url));
    }
  }

  // Order creation and customer order lists: riders should use rider orders
  if (pathname.startsWith("/create-order") || pathname.startsWith("/orders")) {
    if (role === "rider") {
      return NextResponse.redirect(new URL("/rider/orders", request.url));
    }
  }

  return NextResponse.next();
}

// Support for Next.js 16 proxy convention
export function proxy(request: NextRequest) {
  return middleware(request);
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/rider/:path*",
    "/orders/:path*",
    "/create-order/:path*",
    "/profile/:path*",
  ],
};
