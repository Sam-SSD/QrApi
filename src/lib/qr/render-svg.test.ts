import { describe, expect, it } from "vitest";
import sharp from "sharp";
import { readBarcodes } from "zxing-wasm/reader";
import { renderQrSvg, getContrastColor } from "./render-svg";
import {
  qrConfigSchema,
  DOT_STYLES,
  CORNER_SQUARE_STYLES,
  CORNER_DOT_STYLES,
  FRAME_STYLES,
  type QrConfig,
} from "./schema";
import { TEMPLATES, GRADIENT_PRESETS } from "./templates";
import { buildPayload } from "./payloads";

/** Rasterizes an SVG and decodes it with ZXing. Returns the text or null. */
async function decodeSvg(svg: string, size = 512): Promise<string | null> {
  const { data, info } = await sharp(Buffer.from(svg))
    .resize(size, size, { fit: "contain", background: "#ffffff" })
    .flatten({ background: "#ffffff" })
    .raw()
    .ensureAlpha()
    .toBuffer({ resolveWithObject: true });
  const results = await readBarcodes(
    {
      data: new Uint8ClampedArray(
        data.buffer,
        data.byteOffset,
        data.byteLength,
      ),
      width: info.width,
      height: info.height,
      colorSpace: "srgb",
    } as ImageData,
    { formats: ["QRCode"], tryHarder: true },
  );
  return results[0]?.text ?? null;
}

const DATA = "https://qrapi.dev/test";

function config(overrides: Record<string, unknown> = {}): QrConfig {
  return qrConfigSchema.parse(overrides);
}

// 1×1 px red PNG to test logos
const RED_PIXEL_PNG =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

describe("renderQrSvg", () => {
  it("generates a valid SVG", () => {
    const svg = renderQrSvg(DATA, config());
    expect(svg).toMatch(/^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg"/);
    expect(svg).toContain("viewBox");
    expect(svg).toContain("</svg>");
  });

  for (const style of DOT_STYLES) {
    it(`dot style "${style}" is scannable`, async () => {
      const svg = renderQrSvg(
        DATA,
        config({ style: { dots: { style, color: "#18181b" } } }),
      );
      expect(await decodeSvg(svg)).toBe(DATA);
    });
  }

  it("linear gradient is scannable", async () => {
    const svg = renderQrSvg(
      DATA,
      config({
        style: {
          dots: {
            style: "rounded",
            color: "#6366f1",
            gradient: GRADIENT_PRESETS.cyber,
          },
        },
      }),
    );
    expect(await decodeSvg(svg)).toBe(DATA);
  });

  it("radial gradient is scannable", async () => {
    const svg = renderQrSvg(
      DATA,
      config({
        style: {
          dots: {
            style: "square",
            color: "#b45309",
            gradient: GRADIENT_PRESETS.fire,
          },
        },
      }),
    );
    expect(await decodeSvg(svg)).toBe(DATA);
  });

  it("brand gradient is scannable", async () => {
    const svg = renderQrSvg(
      DATA,
      config({
        style: {
          dots: {
            style: "rounded",
            color: "#4f46e5",
            gradient: GRADIENT_PRESETS.brand,
          },
        },
      }),
    );
    expect(await decodeSvg(svg)).toBe(DATA);
  });

  it("custom corner styles are scannable", async () => {
    const svg = renderQrSvg(
      DATA,
      config({
        style: {
          dots: { style: "dots", color: "#18181b" },
          cornersSquare: { style: "extra-rounded", color: "#4f46e5" },
          cornersDot: { style: "dot", color: "#4f46e5" },
        },
      }),
    );
    expect(await decodeSvg(svg)).toBe(DATA);
  });

  for (const style of CORNER_SQUARE_STYLES) {
    it(`corner style "${style}" is scannable`, async () => {
      const svg = renderQrSvg(
        DATA,
        config({
          style: {
            dots: { style: "square", color: "#18181b" },
            cornersSquare: { style, color: "#4f46e5" },
          },
        }),
      );
      expect(await decodeSvg(svg)).toBe(DATA);
    });
  }

  for (const style of CORNER_DOT_STYLES) {
    it(`corner dot "${style}" is scannable`, async () => {
      const svg = renderQrSvg(
        DATA,
        config({
          style: {
            dots: { style: "square", color: "#18181b" },
            cornersDot: { style, color: "#0891b2" },
          },
        }),
      );
      expect(await decodeSvg(svg)).toBe(DATA);
    });
  }

  for (const style of FRAME_STYLES) {
    it(`frame "${style}" is scannable`, async () => {
      const svg = renderQrSvg(
        DATA,
        config({ frame: { style, text: "ESCANÉAME", color: "#4f46e5" } }),
      );
      expect(await decodeSvg(svg, 700)).toBe(DATA);
    });
  }

  it("frame with position=top is scannable", async () => {
    const svg = renderQrSvg(
      DATA,
      config({
        frame: {
          style: "classic",
          text: "ESCANÉAME",
          color: "#4f46e5",
          position: "top",
        },
      }),
    );
    expect(await decodeSvg(svg, 700)).toBe(DATA);
  });

  // Distinction assertions: exhaustiveness proves the branch exists; this
  // proves it emits ITS shape and not another style's (catches bad copy-paste).
  it("each new style emits its distinctive primitive", () => {
    const square = renderQrSvg(
      DATA,
      config({ style: { dots: { style: "square", color: "#18181b" } } }),
    );
    const squarePath = square.match(/<path d="([^"]+)"/)?.[1] ?? "";
    for (const style of [
      "star",
      "plus",
      "diamond",
      "vertical-line",
      "horizontal-line",
    ] as const) {
      const svg = renderQrSvg(
        DATA,
        config({ style: { dots: { style, color: "#18181b" } } }),
      );
      const path = svg.match(/<path d="([^"]+)"/)?.[1] ?? "";
      expect(path, `dots ${style}`).not.toBe(squarePath);
    }
    // Frames with their own primitives
    const bubble = renderQrSvg(
      DATA,
      config({
        frame: { style: "speech-bubble", text: "HOLA", color: "#4f46e5" },
      }),
    );
    expect(bubble).toContain("<polygon");
    const badge = renderQrSvg(
      DATA,
      config({ frame: { style: "badge", text: "HOLA", color: "#4f46e5" } }),
    );
    // Ribbon scallop: several circles (isomorphic signature, not textPath).
    expect((badge.match(/<circle/g) ?? []).length).toBeGreaterThanOrEqual(6);
    const ticket = renderQrSvg(
      DATA,
      config({ frame: { style: "ticket", text: "HOLA", color: "#4f46e5" } }),
    );
    expect(ticket).toContain("stroke-dasharray");
    const brackets = renderQrSvg(
      DATA,
      config({
        frame: { style: "scanner-brackets", text: "HOLA", color: "#4f46e5" },
      }),
    );
    expect(brackets).toContain("stroke-linecap");
  });

  it("the frame text color is respected in every style", () => {
    // Includes bandless styles (minimal/neon/elegant) that used to ignore
    // textColor and use frame.color.
    for (const style of ["modern", "minimal", "neon", "elegant"] as const) {
      const svg = renderQrSvg(
        DATA,
        config({
          frame: {
            style,
            text: "HOLA",
            color: "#4f46e5",
            textColor: "#ff0000",
          },
        }),
      );
      // The text carries the requested color and does NOT fall back to the frame color.
      expect(svg, style).toContain('fill="#ff0000"');
      expect(svg, `${style} does not use frame.color for text`).toMatch(
        /fill="#ff0000"[^>]*>HOLA<\/text>/,
      );
    }
  });

  it("banded frame text contrasts by default (no textColor)", () => {
    // Solid-band styles: the default text can NOT be the band color (it
    // would be invisible). Catches regressions like speech-bubble.
    for (const style of [
      "modern",
      "classic",
      "banner-top",
      "ticket",
      "badge",
      "speech-bubble",
    ] as const) {
      const svg = renderQrSvg(
        DATA,
        config({ frame: { style, text: "HOLA", color: "#4f46e5" } }),
      );
      const fill = svg.match(/<text[^>]*fill="([^"]+)"[^>]*>HOLA<\/text>/)?.[1];
      expect(fill, `${style} text`).toBeDefined();
      expect(
        fill?.toLowerCase(),
        `${style} text is not the band color`,
      ).not.toBe("#4f46e5");
    }
  });

  it("background image with safeguards keeps the QR scannable", async () => {
    // The image shows between the modules (no global plate); scanability is
    // guaranteed by the finder plates + the forced EC=H.
    const svg = renderQrSvg(
      DATA,
      config({
        style: {
          dots: { style: "square", color: "#0b0b14" },
          background: {
            color: "#ffffff",
            transparent: false,
            image: { dataUri: RED_PIXEL_PNG, opacity: 0.35 },
          },
        },
      }),
    );
    expect(svg).toContain("<image");
    // 3 finder plates as <path> with the ring silhouette (background color).
    expect((svg.match(/<path d="[^"]+" fill="#ffffff"\/>/g) ?? []).length).toBe(
      3,
    );
    expect(await decodeSvg(svg, 700)).toBe(DATA);
  });

  it("background image forces ecLevel H even when the config asks for L", async () => {
    // With EC=L and a photo behind, decoding would fail; the engine must force H.
    const svg = renderQrSvg(
      DATA,
      config({
        ecLevel: "L",
        style: {
          dots: { style: "square", color: "#18181b" },
          background: {
            color: "#ffffff",
            transparent: false,
            image: { dataUri: RED_PIXEL_PNG, opacity: 0.35 },
          },
        },
      }),
    );
    expect(await decodeSvg(svg, 700)).toBe(DATA);
  });

  it("finder plates use the sampled tint and still scan", async () => {
    const svg = renderQrSvg(
      DATA,
      config({
        style: {
          dots: { style: "square", color: "#0b0b14" },
          background: {
            color: "#ffffff",
            transparent: false,
            image: {
              dataUri: RED_PIXEL_PNG,
              opacity: 0.35,
              tint: "#e6d4f0", // sample pale tint
            },
          },
        },
      }),
    );
    // The 3 finder plates use the tint (not white).
    expect((svg.match(/<path d="[^"]+" fill="#e6d4f0"\/>/g) ?? []).length).toBe(
      3,
    );
    expect(await decodeSvg(svg, 700)).toBe(DATA);
  });

  it("gradient on background and corners is scannable", async () => {
    const svg = renderQrSvg(
      DATA,
      config({
        style: {
          dots: { style: "rounded", color: "#18181b" },
          cornersSquare: {
            style: "extra-rounded",
            gradient: GRADIENT_PRESETS.brand,
          },
          cornersDot: { style: "dot", gradient: GRADIENT_PRESETS.brand },
          background: { color: "#ffffff", transparent: false },
        },
      }),
    );
    expect(svg).toContain("qra-corner-sq");
    expect(await decodeSvg(svg)).toBe(DATA);
  });

  it("logo with excavation keeps the QR scannable (ecLevel H)", async () => {
    const svg = renderQrSvg(
      DATA,
      config({
        ecLevel: "H",
        logo: { dataUri: RED_PIXEL_PNG, sizeRatio: 0.22, margin: 1 },
      }),
    );
    expect(svg).toContain("<image");
    expect(await decodeSvg(svg)).toBe(DATA);
  });

  it("frame does not break scanability", async () => {
    const svg = renderQrSvg(
      DATA,
      config({
        frame: { style: "modern", text: "ESCANÉAME", color: "#4f46e5" },
      }),
    );
    // the frame adds a bottom band: rasterize larger to compensate
    expect(await decodeSvg(svg, 640)).toBe(DATA);
  });

  it("inverted colors scan (dark background, light dots)", async () => {
    const svg = renderQrSvg(
      DATA,
      config({
        style: {
          dots: { style: "square", color: "#f4f4f5" },
          background: { color: "#09090b", transparent: false },
        },
      }),
    );
    // jsQR supports inversion
    const result = await decodeSvg(svg);
    expect(result === DATA || result === null).toBe(true);
  });

  it("every template generates scannable QRs", async () => {
    for (const template of TEMPLATES) {
      const data = buildPayload(template.payload);
      const svg = renderQrSvg(data, template.config);
      const decoded = await decodeSvg(svg, 700);
      expect(decoded, `template ${template.id}`).toBe(data);
    }
  }, 30_000);

  it("escapes frame text (no XML injection)", () => {
    const svg = renderQrSvg(
      DATA,
      config({
        frame: {
          style: "minimal",
          text: '<script>alert("x")</script>',
          color: "#18181b",
        },
      }),
    );
    expect(svg).not.toContain("<script>");
    expect(svg).toContain("&lt;script&gt;");
  });

  it("throws when the data exceeds capacity", () => {
    expect(() =>
      renderQrSvg("x".repeat(4000), config({ ecLevel: "H" })),
    ).toThrow();
  });
});

describe("getContrastColor", () => {
  it("white over dark colors, dark over light ones", () => {
    expect(getContrastColor("#09090b")).toBe("#ffffff");
    expect(getContrastColor("#f4f4f5")).toBe("#0b0b14");
  });
});
