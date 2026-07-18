import { ImageResponse } from "next/og";
import { BRAND_COLORS, BRAND_GRADIENT_CSS, logoLayout } from "@/lib/brand";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

const MARK = 116;
const PAD = (size.width - MARK) / 2;
const { ring, tail } = logoLayout(MARK);

/** iOS icon: same monogram as the favicon, no corners (iOS masks them). */
export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        position: "relative",
        background: BRAND_COLORS.bgDark,
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
