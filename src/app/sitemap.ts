import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";

const BASE_URL = process.env.BETTER_AUTH_URL ?? "http://localhost:3000";

const PAGES = ["", "/generator", "/docs/api", "/login", "/register"];

export default function sitemap(): MetadataRoute.Sitemap {
  return PAGES.map((page) => ({
    url: `${BASE_URL}/${routing.defaultLocale}${page}`,
    lastModified: new Date(),
    changeFrequency: page === "" ? "weekly" : "monthly",
    priority: page === "" ? 1 : page === "/generator" ? 0.9 : 0.7,
    alternates: {
      languages: Object.fromEntries(
        routing.locales.map((locale) => [locale, `${BASE_URL}/${locale}${page}`]),
      ),
    },
  }));
}
