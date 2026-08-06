import { describe, expect, it } from "vitest";
import sharp from "sharp";
import { rasterizeSvg } from "./rasterize";

/** Wraps a data URI in the same <image> element the renderer emits for logos. */
const svgWith = (href: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512"><rect width="512" height="512" fill="#fff"/><image href="${href}" x="0" y="0" width="512" height="512"/></svg>`;

const pngDataUri = async (size: number) => {
  const buf = await sharp({
    create: {
      width: size,
      height: size,
      channels: 3,
      background: "#3355ff",
    },
  })
    .png({ compressionLevel: 9 })
    .toBuffer();
  return { uri: `data:image/png;base64,${buf.toString("base64")}` };
};

describe("rasterizeSvg resource limits", () => {
  it("rejects an embedded image far above the pixel ceiling", async () => {
    // 12000x12000 compresses to well under the 700KB data URI cap, yet librsvg
    // decodes it at native resolution: ~10s of CPU per request before the cap.
    const { uri } = await pngDataUri(12000);

    await expect(rasterizeSvg(svgWith(uri), "png")).rejects.toThrow();
  }, 60_000);

  it("still rasterizes a legitimate logo", async () => {
    const { uri } = await pngDataUri(512);
    const out = await rasterizeSvg(svgWith(uri), "png");

    expect(out.byteLength).toBeGreaterThan(0);
  }, 30_000);
});
