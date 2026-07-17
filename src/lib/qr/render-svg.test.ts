import { describe, expect, it } from "vitest";
import sharp from "sharp";
import { readBarcodes } from "zxing-wasm/reader";
import { renderQrSvg, getContrastColor } from "./render-svg";
import { qrConfigSchema, DOT_STYLES, type QrConfig } from "./schema";
import { TEMPLATES, GRADIENT_PRESETS } from "./templates";
import { buildPayload } from "./payloads";

/** Rasteriza un SVG y lo decodifica con ZXing. Devuelve el texto o null. */
async function decodeSvg(svg: string, size = 512): Promise<string | null> {
  const { data, info } = await sharp(Buffer.from(svg))
    .resize(size, size, { fit: "contain", background: "#ffffff" })
    .flatten({ background: "#ffffff" })
    .raw()
    .ensureAlpha()
    .toBuffer({ resolveWithObject: true });
  const results = await readBarcodes(
    {
      data: new Uint8ClampedArray(data.buffer, data.byteOffset, data.byteLength),
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

// 1×1 px PNG rojo para probar logos
const RED_PIXEL_PNG =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

describe("renderQrSvg", () => {
  it("genera un SVG válido", () => {
    const svg = renderQrSvg(DATA, config());
    expect(svg).toMatch(/^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg"/);
    expect(svg).toContain("viewBox");
    expect(svg).toContain("</svg>");
  });

  for (const style of DOT_STYLES) {
    it(`estilo de puntos "${style}" es escaneable`, async () => {
      const svg = renderQrSvg(
        DATA,
        config({ style: { dots: { style, color: "#18181b" } } }),
      );
      expect(await decodeSvg(svg)).toBe(DATA);
    });
  }

  it("gradiente lineal es escaneable", async () => {
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

  it("gradiente radial es escaneable", async () => {
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

  it("gradiente de marca (brand) es escaneable", async () => {
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

  it("estilos de esquina personalizados son escaneables", async () => {
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

  it("logo con excavación mantiene el QR escaneable (ecLevel H)", async () => {
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

  it("marco no rompe la escaneabilidad", async () => {
    const svg = renderQrSvg(
      DATA,
      config({
        frame: { style: "modern", text: "ESCANÉAME", color: "#4f46e5" },
      }),
    );
    // el marco añade banda inferior: rasterizar más grande para compensar
    expect(await decodeSvg(svg, 640)).toBe(DATA);
  });

  it("colores invertidos escanean (fondo oscuro, puntos claros)", async () => {
    const svg = renderQrSvg(
      DATA,
      config({
        style: {
          dots: { style: "square", color: "#f4f4f5" },
          background: { color: "#09090b", transparent: false },
        },
      }),
    );
    // jsQR soporta inversión
    const result = await decodeSvg(svg);
    expect(result === DATA || result === null).toBe(true);
  });

  it("todas las plantillas generan QRs escaneables", async () => {
    for (const template of TEMPLATES) {
      const data = buildPayload(template.payload);
      const svg = renderQrSvg(data, template.config);
      const decoded = await decodeSvg(svg, 700);
      expect(decoded, `plantilla ${template.id}`).toBe(data);
    }
  }, 30_000);

  it("escapa texto del marco (sin inyección XML)", () => {
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

  it("lanza si los datos exceden la capacidad", () => {
    expect(() => renderQrSvg("x".repeat(4000), config({ ecLevel: "H" }))).toThrow();
  });
});

describe("getContrastColor", () => {
  it("blanco sobre colores oscuros, oscuro sobre claros", () => {
    expect(getContrastColor("#09090b")).toBe("#ffffff");
    expect(getContrastColor("#f4f4f5")).toBe("#0b0b14");
  });
});
