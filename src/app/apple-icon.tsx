import { ImageResponse } from "next/og";
import {
  BRAND_COLORS,
  LOGO_MODULE,
  LOGO_RING_MODULES,
  LOGO_TAIL,
  LOGO_VIEWBOX,
} from "@/lib/brand";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: BRAND_COLORS.bgDark,
        }}
      >
        <svg
          width="116"
          height="116"
          viewBox={`0 0 ${LOGO_VIEWBOX} ${LOGO_VIEWBOX}`}
          fill="none"
        >
          {LOGO_RING_MODULES.map(({ x, y }) => (
            <rect
              key={`${x}-${y}`}
              x={x}
              y={y}
              width={LOGO_MODULE.size}
              height={LOGO_MODULE.size}
              rx={LOGO_MODULE.radius}
              fill={BRAND_COLORS.fg}
            />
          ))}
          <rect
            x={LOGO_TAIL.x}
            y={LOGO_TAIL.y}
            width={LOGO_TAIL.size}
            height={LOGO_TAIL.size}
            rx={LOGO_TAIL.radius}
            fill={BRAND_COLORS.cyanLight}
          />
        </svg>
      </div>
    ),
    { ...size },
  );
}
