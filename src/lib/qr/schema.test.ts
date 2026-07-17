import { describe, expect, it } from "vitest";
import {
  qrConfigSchema,
  DEFAULT_QR_CONFIG,
  DOT_STYLES,
  CORNER_SQUARE_STYLES,
  CORNER_DOT_STYLES,
  FRAME_STYLES,
  FRAME_POSITIONS,
  FRAME_ICONS,
} from "./schema";

describe("qrConfigSchema", () => {
  it("parsea la config por defecto sin lanzar", () => {
    expect(() => qrConfigSchema.parse({})).not.toThrow();
    expect(DEFAULT_QR_CONFIG.style.dots.style).toBe("square");
  });

  it("expone los estilos nuevos en las listas de constantes", () => {
    expect(DOT_STYLES).toContain("star");
    expect(DOT_STYLES).toContain("vertical-line");
    expect(CORNER_SQUARE_STYLES).toContain("outpoint");
    expect(CORNER_DOT_STYLES).toContain("diamond");
    expect(FRAME_STYLES).toContain("speech-bubble");
    expect(FRAME_STYLES).toContain("scanner-brackets");
  });

  describe("frame", () => {
    it("aplica defaults de position e icon", () => {
      const parsed = qrConfigSchema.parse({
        frame: { style: "modern", text: "HOLA", color: "#4f46e5" },
      });
      expect(parsed.frame?.position).toBe("bottom");
      expect(parsed.frame?.icon).toBe("none");
    });

    it("acepta position e icon explícitos", () => {
      const parsed = qrConfigSchema.parse({
        frame: {
          style: "banner-top",
          text: "HOLA",
          color: "#4f46e5",
          position: "top",
          icon: "camera",
        },
      });
      expect(parsed.frame?.position).toBe("top");
      expect(parsed.frame?.icon).toBe("camera");
    });

    it("rechaza position/icon fuera del enum", () => {
      expect(() =>
        qrConfigSchema.parse({
          frame: { style: "modern", text: "x", color: "#4f46e5", icon: "emoji" },
        }),
      ).toThrow();
      expect(FRAME_POSITIONS).toEqual(["bottom", "top"]);
      expect(FRAME_ICONS).toContain("none");
    });
  });

  describe("background.image", () => {
    const PNG =
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

    it("aplica defaults seguros (opacity, plate)", () => {
      const parsed = qrConfigSchema.parse({
        style: { background: { image: { dataUri: PNG } } },
      });
      expect(parsed.style.background.image?.opacity).toBe(0.35);
      expect(parsed.style.background.image?.plate).toBe(true);
    });

    it("rechaza un data URI svg+xml (evita <script>)", () => {
      const svg =
        "data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=";
      expect(() =>
        qrConfigSchema.parse({
          style: { background: { image: { dataUri: svg } } },
        }),
      ).toThrow();
    });

    it("acepta gradiente en background y en las esquinas", () => {
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
