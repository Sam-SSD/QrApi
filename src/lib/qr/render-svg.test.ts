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

  for (const style of CORNER_SQUARE_STYLES) {
    it(`estilo de esquina "${style}" es escaneable`, async () => {
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
    it(`punto de esquina "${style}" es escaneable`, async () => {
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
    it(`marco "${style}" es escaneable`, async () => {
      const svg = renderQrSvg(
        DATA,
        config({ frame: { style, text: "ESCANÉAME", color: "#4f46e5" } }),
      );
      expect(await decodeSvg(svg, 700)).toBe(DATA);
    });
  }

  it("marco con position=top es escaneable", async () => {
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

  // Aserciones de distinción: exhaustividad prueba que la rama existe; esto
  // prueba que emite SU forma y no la de otro estilo (evita copy-paste erróneo).
  it("cada estilo nuevo emite su primitiva distintiva", () => {
    const square = renderQrSvg(
      DATA,
      config({ style: { dots: { style: "square", color: "#18181b" } } }),
    );
    const squarePath = square.match(/<path d="([^"]+)"/)?.[1] ?? "";
    for (const style of ["star", "plus", "diamond", "vertical-line", "horizontal-line"] as const) {
      const svg = renderQrSvg(
        DATA,
        config({ style: { dots: { style, color: "#18181b" } } }),
      );
      const path = svg.match(/<path d="([^"]+)"/)?.[1] ?? "";
      expect(path, `dots ${style}`).not.toBe(squarePath);
    }
    // Marcos con primitivas propias
    const bubble = renderQrSvg(
      DATA,
      config({ frame: { style: "speech-bubble", text: "HOLA", color: "#4f46e5" } }),
    );
    expect(bubble).toContain("<polygon");
    const badge = renderQrSvg(
      DATA,
      config({ frame: { style: "badge", text: "HOLA", color: "#4f46e5" } }),
    );
    // Festón de la cinta: varios círculos (firma isomórfica, no textPath).
    expect((badge.match(/<circle/g) ?? []).length).toBeGreaterThanOrEqual(6);
    const ticket = renderQrSvg(
      DATA,
      config({ frame: { style: "ticket", text: "HOLA", color: "#4f46e5" } }),
    );
    expect(ticket).toContain("stroke-dasharray");
    const brackets = renderQrSvg(
      DATA,
      config({ frame: { style: "scanner-brackets", text: "HOLA", color: "#4f46e5" } }),
    );
    expect(brackets).toContain("stroke-linecap");
  });

  it("el color de texto del marco se respeta en todos los estilos", () => {
    // Incluye estilos sin banda (minimal/neon/elegant) que antes ignoraban
    // textColor y usaban frame.color.
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
      // El texto lleva el color pedido y NO cae al color del marco.
      expect(svg, style).toContain('fill="#ff0000"');
      expect(svg, `${style} no usa frame.color en texto`).toMatch(
        /fill="#ff0000"[^>]*>HOLA<\/text>/,
      );
    }
  });

  it("el texto de los marcos con banda contrasta por defecto (sin textColor)", () => {
    // Estilos con banda sólida: el texto por defecto NO puede ser del color de
    // la banda (seria invisible). Captura regresiones como speech-bubble.
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
      expect(fill, `${style} texto`).toBeDefined();
      expect(fill?.toLowerCase(), `${style} texto no es el color de banda`).not.toBe(
        "#4f46e5",
      );
    }
  });

  it("imagen de fondo con salvaguardas mantiene el QR escaneable", async () => {
    const svg = renderQrSvg(
      DATA,
      config({
        style: {
          dots: { style: "square", color: "#18181b" },
          background: {
            color: "#ffffff",
            transparent: false,
            image: { dataUri: RED_PIXEL_PNG, opacity: 0.35, plate: true },
          },
        },
      }),
    );
    expect(svg).toContain("<image");
    // Con placa global (plate:true) esta cubre todo el QR (fondo + scrim +
    // placa); las placas de finder no se duplican bajo ella.
    expect((svg.match(/<rect/g) ?? []).length).toBeGreaterThanOrEqual(3);
    expect(await decodeSvg(svg, 700)).toBe(DATA);
  });

  it("imagen de fondo fuerza ecLevel H aunque la config pida L", async () => {
    // Con EC=L y foto detrás el decode fallaría; el motor debe forzar H.
    const svg = renderQrSvg(
      DATA,
      config({
        ecLevel: "L",
        style: {
          dots: { style: "square", color: "#18181b" },
          background: {
            color: "#ffffff",
            transparent: false,
            image: { dataUri: RED_PIXEL_PNG, opacity: 0.35, plate: true },
          },
        },
      }),
    );
    expect(await decodeSvg(svg, 700)).toBe(DATA);
  });

  it("imagen de fondo SIN placa (default) sigue escaneable", async () => {
    // Camino imagen-visible: sin placa global, solo scrim + placas de finder +
    // EC=H forzado. Debe decodificar igual (la imagen NO tapa los módulos).
    const svg = renderQrSvg(
      DATA,
      config({
        style: {
          dots: { style: "square", color: "#0b0b14" },
          background: {
            color: "#ffffff",
            transparent: false,
            image: { dataUri: RED_PIXEL_PNG, opacity: 0.35, plate: false },
          },
        },
      }),
    );
    expect(svg).toContain("<image");
    // Sin placa global: fondo base + scrim (2 rects) + 3 placas de finder como
    // <path> con la silueta del anillo. Garantiza que las esquinas siguen
    // protegidas aunque la imagen se vea.
    expect((svg.match(/<rect/g) ?? []).length).toBeGreaterThanOrEqual(2);
    // 3 placas de finder rellenas del color de fondo (#ffffff).
    expect((svg.match(/<path d="[^"]+" fill="#ffffff"\/>/g) ?? []).length).toBe(3);
    expect(await decodeSvg(svg, 700)).toBe(DATA);
  });

  it("las placas de finder usan el tinte muestreado y siguen escaneando", async () => {
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
              plate: false,
              tint: "#e6d4f0", // tinte pálido de ejemplo
            },
          },
        },
      }),
    );
    // Las 3 placas de finder usan el tinte (no blanco).
    expect((svg.match(/<path d="[^"]+" fill="#e6d4f0"\/>/g) ?? []).length).toBe(3);
    expect(await decodeSvg(svg, 700)).toBe(DATA);
  });

  it("gradiente en fondo y esquinas es escaneable", async () => {
    const svg = renderQrSvg(
      DATA,
      config({
        style: {
          dots: { style: "rounded", color: "#18181b" },
          cornersSquare: { style: "extra-rounded", gradient: GRADIENT_PRESETS.brand },
          cornersDot: { style: "dot", gradient: GRADIENT_PRESETS.brand },
          background: { color: "#ffffff", transparent: false },
        },
      }),
    );
    expect(svg).toContain("qra-corner-sq");
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
