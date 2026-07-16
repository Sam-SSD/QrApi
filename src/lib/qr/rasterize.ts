import "server-only";
import sharp from "sharp";

/** Rasteriza el SVG del renderer a PNG o JPEG. Solo servidor. */
export async function rasterizeSvg(
  svg: string,
  format: "png" | "jpeg",
): Promise<Buffer> {
  const pipeline = sharp(Buffer.from(svg));
  if (format === "jpeg") {
    return pipeline
      .flatten({ background: "#ffffff" })
      .jpeg({ quality: 92 })
      .toBuffer();
  }
  return pipeline.png().toBuffer();
}
