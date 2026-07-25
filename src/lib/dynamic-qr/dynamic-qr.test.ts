import { describe, expect, it } from "vitest";
import { generateSlug } from "./slug";
import { parseUserAgent } from "./parse-ua";
import { buildRedirectUrl } from "./redirect-url";

describe("generateSlug", () => {
  it("generates 8-char base62 slugs", () => {
    const s = generateSlug();
    expect(s).toHaveLength(8);
    expect(s).toMatch(/^[0-9a-zA-Z]{8}$/);
  });

  it("is reasonably unique (no collisions in 1000)", () => {
    const set = new Set<string>();
    for (let i = 0; i < 1000; i++) set.add(generateSlug());
    expect(set.size).toBe(1000);
  });
});

describe("buildRedirectUrl", () => {
  it("composes /r/{slug} on top of SITE_URL", () => {
    expect(buildRedirectUrl("abc123")).toMatch(/\/r\/abc123$/);
  });
});

describe("parseUserAgent", () => {
  it("detects iOS mobile + Safari", () => {
    const r = parseUserAgent(
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
    );
    expect(r.deviceType).toBe("mobile");
    expect(r.os).toBe("iOS");
    expect(r.browser).toBe("Safari");
  });

  it("detects Windows desktop + Chrome", () => {
    const r = parseUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
    );
    expect(r.deviceType).toBe("desktop");
    expect(r.os).toBe("Windows");
    expect(r.browser).toBe("Chrome");
  });

  it("detects Android tablets", () => {
    const r = parseUserAgent(
      "Mozilla/5.0 (Linux; Android 13; SM-X710) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
    );
    expect(r.deviceType).toBe("tablet");
    expect(r.os).toBe("Android");
  });

  it("detects bots", () => {
    const r = parseUserAgent("Mozilla/5.0 (compatible; Googlebot/2.1)");
    expect(r.deviceType).toBe("bot");
  });

  it("does not mistake Edge for Chrome", () => {
    const r = parseUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36 Edg/120.0",
    );
    expect(r.browser).toBe("Edge");
  });

  it("empty UA → desktop with no data", () => {
    const r = parseUserAgent(null);
    expect(r).toEqual({ deviceType: "desktop", os: null, browser: null });
  });
});
