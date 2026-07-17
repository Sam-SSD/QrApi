import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "QrAPI — Forja códigos QR que no parecen códigos QR";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 32,
          background: "#09090b",
          backgroundImage:
            "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(129,140,248,0.25), transparent)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <svg width="88" height="88" viewBox="0 0 32 32" fill="none">
            <rect
              x="3"
              y="3"
              width="22"
              height="22"
              rx="6"
              stroke="#f4f4f5"
              strokeWidth="2.5"
            />
            <rect x="10" y="10" width="8" height="8" rx="2" fill="#f4f4f5" />
            <rect x="23" y="23" width="6" height="6" rx="1.5" fill="#818cf8" />
          </svg>
          <div style={{ display: "flex", fontSize: 72, fontWeight: 600 }}>
            <span style={{ color: "#818cf8" }}>qr</span>
            <span style={{ color: "#f4f4f5" }}>api</span>
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
      </div>
    ),
    { ...size },
  );
}
