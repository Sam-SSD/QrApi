/**
 * Lightweight User-Agent parser (no dependencies). Returns coarse-grained
 * signals sufficient for scan analytics: device type, operating system and
 * browser. It does not try to be exhaustive.
 */
export interface UaInfo {
  deviceType: "mobile" | "tablet" | "desktop" | "bot";
  os: string | null;
  browser: string | null;
}

export function parseUserAgent(ua: string | null | undefined): UaInfo {
  if (!ua) return { deviceType: "desktop", os: null, browser: null };
  const s = ua.toLowerCase();

  const isBot = /bot|crawler|spider|crawling|facebookexternalhit|preview/.test(
    s,
  );
  const isTablet = /ipad|tablet|(android(?!.*mobile))/.test(s);
  const isMobile = /mobile|iphone|ipod|android|blackberry|windows phone/.test(
    s,
  );

  const deviceType: UaInfo["deviceType"] = isBot
    ? "bot"
    : isTablet
      ? "tablet"
      : isMobile
        ? "mobile"
        : "desktop";

  let os: string | null = null;
  if (/windows/.test(s)) os = "Windows";
  else if (/iphone|ipad|ipod|ios/.test(s)) os = "iOS";
  else if (/mac os x|macintosh/.test(s)) os = "macOS";
  else if (/android/.test(s)) os = "Android";
  else if (/linux/.test(s)) os = "Linux";

  let browser: string | null = null;
  // Order matters: Edge/Opera/Brave also advertise themselves as Chrome.
  if (/edg\//.test(s)) browser = "Edge";
  else if (/opr\/|opera/.test(s)) browser = "Opera";
  else if (/firefox|fxios/.test(s)) browser = "Firefox";
  else if (/chrome|crios/.test(s)) browser = "Chrome";
  else if (/safari/.test(s)) browser = "Safari";

  return { deviceType, os, browser };
}
