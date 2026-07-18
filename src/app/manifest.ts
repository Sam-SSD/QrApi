import type { MetadataRoute } from "next";
import { BRAND_COLORS } from "@/lib/brand";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "QrAPI",
    short_name: "QrAPI",
    description: "Generador de códigos QR con editor visual y API REST",
    start_url: "/",
    display: "standalone",
    background_color: BRAND_COLORS.bgDark,
    theme_color: BRAND_COLORS.bgDark,
    icons: [
      { src: "/icon", sizes: "32x32", type: "image/png" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
