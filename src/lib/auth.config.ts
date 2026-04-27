import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.role = (user as any).role;
        token.id = user.id;
        token.name = user.name;
      }
      if (trigger === "update" && session?.role) {
        token.role = session.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).id = token.id;
        (session.user as any).name = token.name;
      }
      return session;
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const role = (auth?.user as any)?.role;

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
        nextUrl.pathname === "/forgot-password" ||
        nextUrl.pathname === "/reset-password" ||
        nextUrl.pathname === "/menu" ||
        nextUrl.pathname === "/reservation" ||
        nextUrl.pathname.startsWith("/order") ||
        isApiPublicRoute;

      const isAuthRoute = 
        nextUrl.pathname === "/login" || 
        nextUrl.pathname === "/register" ||
        nextUrl.pathname === "/forgot-password" ||
        nextUrl.pathname === "/reset-password";

      if (isApiAuthRoute || isApiPublicRoute) return true;

      if (isAuthRoute) {
        if (isLoggedIn) {
          if (role === "CUSTOMER") {
            return Response.redirect(new URL("/", nextUrl));
          }
          return Response.redirect(new URL("/admin", nextUrl));
        }
        return true;
      }

      if (!isLoggedIn && !isPublicRoute) {
        return false;
      }

      // Admin dashboard protection (ADMIN and STAFF)
      if (nextUrl.pathname.startsWith("/admin") && role === "CUSTOMER") {
        return Response.redirect(new URL("/", nextUrl));
      }

      return true;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
