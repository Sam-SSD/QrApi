import { NextRequest, NextResponse } from "next/server";
import { after } from "next/server";
import { randomBytes } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { parseUserAgent } from "@/lib/dynamic-qr/parse-ua";
import { hashIp } from "@/lib/dynamic-qr/ip-hash";
import { verifyPassword } from "@/lib/dynamic-qr/password";
import { httpUrl } from "@/lib/dynamic-qr/redirect-url";
import { checkRateLimit } from "@/lib/rate-limit";
import { SITE_URL } from "@/lib/constants";

export const runtime = "nodejs";

/**
 * Password attempts allowed per slug. Far stricter than the public API budget:
 * a human types a password a handful of times, a script tries thousands.
 */
const PASSWORD_ATTEMPT_LIMITS = { perMinute: 5, perDay: 100 };

type DynamicRow = {
  id: string;
  slug: string;
  targetUrl: string;
  active: boolean;
  expiresAt: Date | null;
  passwordHash: string | null;
};

async function findBySlug(slug: string): Promise<DynamicRow | null> {
  return prisma.dynamicQr.findUnique({
    where: { slug },
    select: {
      id: true,
      slug: true,
      targetUrl: true,
      active: true,
      expiresAt: true,
      passwordHash: true,
    },
  });
}

function isUnavailable(dynamic: DynamicRow | null): dynamic is null {
  return (
    !dynamic ||
    !dynamic.active ||
    (dynamic.expiresAt !== null && dynamic.expiresAt < new Date())
  );
}

/** Redirects are never cacheable: targetUrl is editable after the QR is printed. */
const NO_STORE = { "Cache-Control": "no-store" };

const notFound = () =>
  NextResponse.redirect(new URL("/es", SITE_URL), {
    status: 302,
    headers: NO_STORE,
  });

/**
 * Redirects to the stored target. Re-validates it on read: every write path
 * already enforces http(s) via `httpUrl`, so this only guards against a row
 * written outside them (a seed, a manual fix, future code).
 */
function redirectToTarget(targetUrl: string, status: 302 | 303) {
  if (!httpUrl.safeParse(targetUrl).success) return notFound();
  return NextResponse.redirect(targetUrl, { status, headers: NO_STORE });
}

/** Records the scan in after() so it never delays the redirect. */
function recordScan(request: NextRequest, dynamicQrId: string) {
  const ua = request.headers.get("user-agent");
  const country =
    request.headers.get("x-vercel-ip-country") ??
    request.headers.get("cf-ipcountry") ??
    null;
  const rawIp =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    null;
  const referrer = request.headers.get("referer");

  after(async () => {
    const { deviceType, os, browser } = parseUserAgent(ua);
    try {
      await prisma.$transaction([
        prisma.scanEvent.create({
          data: {
            dynamicQrId,
            country,
            deviceType,
            os,
            browser,
            referrer,
            ipHash: hashIp(rawIp),
          },
        }),
        prisma.dynamicQr.update({
          where: { id: dynamicQrId },
          data: { scanCount: { increment: 1 } },
        }),
      ]);
    } catch {
      // Best-effort: recording must never affect the redirect.
    }
  });
}

/**
 * Minimal interstitial page asking for the password (bilingual, no assets).
 * The inline <style> carries a per-response nonce so the page needs no
 * 'unsafe-inline' in its own (deliberately tighter) CSP.
 */
function passwordPage(slug: string, error: boolean): NextResponse {
  const nonce = randomBytes(16).toString("base64");
  const html = `<!DOCTYPE html>
<html lang="es"><head><meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<meta name="robots" content="noindex"/>
<title>QR protegido · QrAPI</title>
<style nonce="${nonce}">
  body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;
    background:#09090b;color:#f4f4f5;font-family:system-ui,-apple-system,'Segoe UI',sans-serif}
  .card{width:min(92vw,360px);background:#141419;border:1px solid rgba(255,255,255,.09);
    border-radius:16px;padding:32px 28px;text-align:center}
  h1{font-size:18px;margin:0 0 6px}
  p{font-size:13px;color:#a1a1aa;margin:0 0 20px}
  input{width:100%;box-sizing:border-box;background:#0e0e12;color:#f4f4f5;
    border:1px solid rgba(255,255,255,.13);border-radius:10px;padding:10px 12px;
    font-size:14px;margin-bottom:12px;outline:none}
  input:focus{border-color:#818cf8}
  button{width:100%;background:linear-gradient(135deg,#4f46e5,#0891b2);color:#fff;
    border:0;border-radius:10px;padding:10px;font-size:14px;font-weight:600;cursor:pointer}
  .err{color:#f87171;font-size:12px;margin:0 0 12px}
</style></head>
<body><form class="card" method="post" action="/r/${slug}">
  <h1>Contenido protegido</h1>
  <p>Introduce la contraseña para continuar &middot; Enter the password to continue</p>
  ${error ? '<p class="err">Contraseña incorrecta &middot; Wrong password</p>' : ""}
  <input type="password" name="password" autofocus required aria-label="Contraseña"/>
  <button type="submit">Continuar &middot; Continue</button>
</form></body></html>`;
  return new NextResponse(html, {
    status: error ? 401 : 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      ...NO_STORE,
      "Content-Security-Policy": [
        "default-src 'none'",
        `style-src 'nonce-${nonce}'`,
        "form-action 'self'",
        "frame-ancestors 'none'",
        "base-uri 'none'",
      ].join("; "),
    },
  });
}

/**
 * Dynamic QR redirect: /r/{slug} → targetUrl. When the QR is protected, it
 * shows an interstitial page asking for the password (POST).
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const dynamic = await findBySlug(slug);
  if (isUnavailable(dynamic)) return notFound();

  // dynamic.slug, not the request param: the DB value is known-safe base62.
  if (dynamic.passwordHash) return passwordPage(dynamic.slug, false);

  recordScan(request, dynamic.id);
  return redirectToTarget(dynamic.targetUrl, 302);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const dynamic = await findBySlug(slug);
  if (isUnavailable(dynamic)) return notFound();

  if (!dynamic.passwordHash) {
    // Without a password there is nothing to verify: redirect just like GET.
    recordScan(request, dynamic.id);
    return redirectToTarget(dynamic.targetUrl, 302);
  }

  // Before scrypt, not after: hashing is the expensive part an attacker would
  // otherwise get for free on an unauthenticated route.
  const rate = await checkRateLimit(
    `r:${dynamic.slug}`,
    PASSWORD_ATTEMPT_LIMITS,
  );
  if (!rate.allowed) {
    return new NextResponse(null, {
      status: 429,
      headers: {
        ...NO_STORE,
        "Retry-After": String(rate.retryAfterSeconds ?? 60),
      },
    });
  }

  const form = await request.formData().catch(() => null);
  const password = String(form?.get("password") ?? "");
  if (!password || !(await verifyPassword(password, dynamic.passwordHash))) {
    return passwordPage(dynamic.slug, true);
  }

  recordScan(request, dynamic.id);
  // 303: after a POST, redirect to the destination with GET.
  return redirectToTarget(dynamic.targetUrl, 303);
}
