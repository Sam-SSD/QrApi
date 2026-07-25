import { describe, expect, it } from "vitest";
import {
  qrConfigSchema,
  DEFAULT_QR_CONFIG,
  DOT_STYLES,
  CORNER_SQUARE_STYLES,
  CORNER_DOT_STYLES,
  FRAME_STYLES,
  FRAME_POSITIONS,
} from "./schema";

describe("qrConfigSchema", () => {
  it("parses the default config without throwing", () => {
    expect(() => qrConfigSchema.parse({})).not.toThrow();
    expect(DEFAULT_QR_CONFIG.style.dots.style).toBe("square");
  });

  it("exposes the new styles in the constant lists", () => {
    expect(DOT_STYLES).toContain("star");
    expect(DOT_STYLES).toContain("vertical-line");
    expect(CORNER_SQUARE_STYLES).toContain("outpoint");
    expect(CORNER_DOT_STYLES).toContain("diamond");
    expect(FRAME_STYLES).toContain("speech-bubble");
    expect(FRAME_STYLES).toContain("scanner-brackets");
  });

  describe("frame", () => {
    it("applies the position default", () => {
      const parsed = qrConfigSchema.parse({
        frame: { style: "modern", text: "HOLA", color: "#4f46e5" },
      });
      expect(parsed.frame?.position).toBe("bottom");
    });

    it("accepts explicit position and textColor", () => {
      const parsed = qrConfigSchema.parse({
        frame: {
          style: "banner-top",
          text: "HOLA",
          color: "#4f46e5",
          position: "top",
          textColor: "#ffffff",
        },
      });
      expect(parsed.frame?.position).toBe("top");
      expect(parsed.frame?.textColor).toBe("#ffffff");
    });

    it("rejects a position outside the enum", () => {
      expect(() =>
        qrConfigSchema.parse({
          frame: {
            style: "modern",
            text: "x",
            color: "#4f46e5",
            position: "side",
          },
        }),
      ).toThrow();
      expect(FRAME_POSITIONS).toEqual(["bottom", "top"]);
    });
  });

  describe("background.image", () => {
    const PNG =
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

    it("applies the opacity default", () => {
      const parsed = qrConfigSchema.parse({
        style: { background: { image: { dataUri: PNG } } },
      });
      expect(parsed.style.background.image?.opacity).toBe(0.35);
    });

    it("rejects an svg+xml data URI (avoids <script>)", () => {
      const svg = "data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=";
      expect(() =>
        qrConfigSchema.parse({
          style: { background: { image: { dataUri: svg } } },
        }),
      ).toThrow();
    });

    it("accepts a gradient on the background and the corners", () => {
      const grad = {
        type: "linear" as const,
        rotation: 45,
        stops: [
          { offset: 0, color: "#4f46e5" },
          { offset: 1, color: "#0891b2" },
        ],
      };
      const parsed = qrConfigSchema.parse({
        style: {
          background: { gradient: grad },
          cornersSquare: { style: "rounded", gradient: grad },
          cornersDot: { style: "dot", gradient: grad },
        },
      });
      expect(parsed.style.background.gradient?.type).toBe("linear");
      expect(parsed.style.cornersSquare.gradient?.stops).toHaveLength(2);
      expect(parsed.style.cornersDot.gradient?.rotation).toBe(45);
    });
  });
});
