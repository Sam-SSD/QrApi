import "server-only";
import sharp from "sharp";

/**
 * Ceiling for images embedded in the SVG (logo / background data URIs).
 * librsvg decodes them at native resolution before scaling, so a 12000x12000
 * PNG fits well under the 700KB data URI cap yet costs ~10s of CPU. 16MP still
 * allows any legitimate 4000x4000 logo.
 */
const MAX_INPUT_PIXELS = 16_000_000;

/** Rasterizes the renderer's SVG to PNG or JPEG. Server only. */
export async function rasterizeSvg(
  svg: string,
  format: "png" | "jpeg",
): Promise<Buffer> {
  const pipeline = sharp(Buffer.from(svg), {
    limitInputPixels: MAX_INPUT_PIXELS,
  }).timeout({ seconds: 5 });
  if (format === "jpeg") {
    return pipeline
      .flatten({ background: "#ffffff" })
      .jpeg({ quality: 92 })
      .toBuffer();
  }
  return pipeline.png().toBuffer();
}
