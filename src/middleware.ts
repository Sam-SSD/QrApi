import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

const DASHBOARD_PATTERN = /^\/(es|en)\/dashboard(\/|$)/;

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Guard optimista: sin cookie de sesión no hay nada que hacer en /dashboard.
  // La verificación real de sesión ocurre server-side en dashboard/layout.tsx.
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
  // Excluir api, la redirección de QR dinámicos (r/), archivos estáticos, rutas
  // de metadata (icon/og/manifest) e internals de Next
  matcher:
    "/((?!api|trpc|r/|_next|_vercel|icon|apple-icon|opengraph-image|manifest|.*\\..*).*)",
};
