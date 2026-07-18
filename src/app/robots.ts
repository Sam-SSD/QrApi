import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants";

const BASE_URL = SITE_URL;

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/es/dashboard", "/en/dashboard"],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
