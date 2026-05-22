/**
 * Next.js Middleware — Route Protection Layer
 *
 * Runs on every request before the page renders.
 * Protects all authenticated routes under /(app)/* and redirects
 * unauthenticated users to the sign-in page.
 *
 * Public routes (marketing pages, auth endpoints, API, static assets)
 * are explicitly allowed through without a session check.
 */

import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

/**
 * Routes that do NOT require authentication.
 * Everything else under /(app)/* is protected.
 */
const PUBLIC_ROUTES = [
  "/",              // Marketing landing page
  "/auth/signin",   // Sign-in page
  "/auth/signup",   // Sign-up page
  "/api/auth",      // NextAuth API routes (OAuth callbacks, CSRF, etc.)
  "/results",       // Guest analysis results
];

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // Allow public routes, static assets, and API routes through
  const isPublicRoute =
    pathname === "/" ||
    PUBLIC_ROUTES.slice(1).some((route) =>
      pathname.startsWith(route)
    );
  const isStaticAsset =
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".");

  if (isPublicRoute || isStaticAsset) {
    return NextResponse.next();
  }

  // Protected route: redirect to sign-in if not authenticated
  if (!req.auth?.user) {
    const signInUrl = new URL("/auth/signin", req.url);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
});

/**
 * Matcher config — run middleware on all routes except
 * static files and Next.js internals.
 */
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
