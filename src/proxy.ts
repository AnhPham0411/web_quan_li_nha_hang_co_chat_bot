import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { NextResponse } from "next/server";

// We use a separate instance of NextAuth with the base config to avoid importing Prisma in the Proxy
const { auth } = NextAuth(authConfig);

export const proxy = auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const role = (req.auth?.user as any)?.role;

  const isApiAuthRoute = nextUrl.pathname.startsWith("/api/auth");
  const isApiPublicRoute =
    nextUrl.pathname.startsWith("/api/menu") ||
    nextUrl.pathname.startsWith("/api/tables") ||
    nextUrl.pathname === "/api/reservations" ||
    nextUrl.pathname.startsWith("/api/webhook");

  const isPublicRoute =
    nextUrl.pathname === "/" ||
    nextUrl.pathname === "/login" ||
    nextUrl.pathname === "/register" ||
    isApiPublicRoute;

  const isAuthRoute = ["/login", "/register"].includes(nextUrl.pathname);

  if (isApiAuthRoute || isApiPublicRoute) return NextResponse.next();

  if (isAuthRoute) {
    if (isLoggedIn) {
      if (role === "CUSTOMER") {
        return NextResponse.redirect(new URL("/", nextUrl));
      }
      return NextResponse.redirect(new URL("/admin", nextUrl));
    }
    return NextResponse.next();
  }

  // Role-based protection
  if (!isLoggedIn && !isPublicRoute) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  // Admin dashboard protection (ADMIN and STAFF có thể vào admin)
  if (nextUrl.pathname.startsWith("/admin") && role === "CUSTOMER") {
    return NextResponse.redirect(new URL("/", nextUrl));
  }

  return NextResponse.next();
});

export default proxy;

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
