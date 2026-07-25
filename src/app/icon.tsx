import { ImageResponse } from "next/og";
import { BRAND_COLORS, BRAND_GRADIENT_CSS, logoLayout } from "@/lib/brand";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

const PAD = 4;
const { ring, tail } = logoLayout(size.width - PAD * 2);

/**
 * Favicon: dark rounded tile with the brand monogram — foreground ring and
 * tail with the indigo→cyan gradient, like the header logo.
 */
export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        position: "relative",
        background: BRAND_COLORS.bgDark,
        borderRadius: 7,
      }}
    >
      {ring.map((m) => (
        <div
          key={`${m.left}-${m.top}`}
          style={{
            position: "absolute",
            left: PAD + m.left,
            top: PAD + m.top,
            width: m.size,
            height: m.size,
            borderRadius: m.radius,
            background: BRAND_COLORS.fg,
          }}
        />
      ))}
      <div
        style={{
          position: "absolute",
          left: PAD + tail.left,
          top: PAD + tail.top,
          width: tail.size,
          height: tail.size,
          borderRadius: tail.radius,
          background: BRAND_GRADIENT_CSS,
        }}
      />
    </div>,
    { ...size },
  );
}
