import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

const DASHBOARD_PATTERN = /^\/(es|en)\/dashboard(\/|$)/;

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Optimistic guard: without a session cookie there is nothing to do in
  // /dashboard. The real session check happens server-side in dashboard/layout.tsx.
  if (DASHBOARD_PATTERN.test(pathname)) {
    const sessionCookie =
      request.cookies.get("better-auth.session_token") ??
      request.cookies.get("__Secure-better-auth.session_token");
    if (!sessionCookie) {
      const locale = pathname.split("/")[1] ?? routing.defaultLocale;
      const loginUrl = new URL(`/${locale}/login`, request.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return intlMiddleware(request);
}

export const config = {
  // Exclude api, the dynamic QR redirect (r/), static files, metadata routes
  // (icon/og/manifest) and Next internals
  matcher:
    "/((?!api|trpc|r/|_next|_vercel|icon|apple-icon|opengraph-image|manifest|.*\\..*).*)",
};
