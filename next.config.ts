import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

/**
 * 'unsafe-inline' on style-src is unavoidable: Next injects inline styles, and
 * a nonce cannot be applied to them from next.config. script-src keeps
 * 'unsafe-eval' in dev only (React Refresh needs it).
 * img-src allows data: because QR logos and previews are data URIs.
 */
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${process.env.NODE_ENV === "production" ? "" : " 'unsafe-eval'"}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "connect-src 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  ...(process.env.NODE_ENV === "production"
    ? [
        {
          key: "Strict-Transport-Security",
          value: "max-age=63072000; includeSubDomains",
        },
      ]
    : []),
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // /r/ is excluded: its route handler sets a stricter, nonce-based CSP
        // of its own, and headers declared here would override it.
        source: "/((?!r/).*)",
        headers: securityHeaders,
      },
      {
        source: "/r/:slug*",
        headers: securityHeaders.filter(
          (h) => h.key !== "Content-Security-Policy",
        ),
      },
    ];
  },
};

export default withNextIntl(nextConfig);
