import { ImageResponse } from "next/og";
import {
  BRAND_COLORS,
  LOGO_MODULE,
  LOGO_RING_MODULES,
  LOGO_TAIL,
  LOGO_VIEWBOX,
} from "@/lib/brand";

export const runtime = "edge";
export const alt = "QrAPI — Forja códigos QR que no parecen códigos QR";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 32,
        background: BRAND_COLORS.bgDark,
        backgroundImage:
          "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(129,140,248,0.25), transparent)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <svg
          width="88"
          height="88"
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
            fill="url(#og-brand)"
          />
          <defs>
            <linearGradient
              id="og-brand"
              x1={LOGO_TAIL.x}
              y1={LOGO_TAIL.y}
              x2={LOGO_TAIL.x + LOGO_TAIL.size}
              y2={LOGO_TAIL.y + LOGO_TAIL.size}
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor={BRAND_COLORS.indigoLight} />
              <stop offset="1" stopColor={BRAND_COLORS.cyanLight} />
            </linearGradient>
          </defs>
        </svg>
        <div style={{ display: "flex", fontSize: 72, fontWeight: 600 }}>
          <span style={{ color: BRAND_COLORS.indigoLight }}>Qr</span>
          <span style={{ color: BRAND_COLORS.fg }}>Api</span>
        </div>
      </div>
      <div
        style={{
          color: "#a1a1aa",
          fontSize: 32,
          textAlign: "center",
          maxWidth: 800,
        }}
      >
        Forja códigos QR que no parecen códigos QR
      </div>
    </div>,
    { ...size },
  );
}
