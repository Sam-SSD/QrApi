/**
 * Samples the dominant hue of an image (data URI) and returns a PALE tint
 * in hex, meant for the finder plates over a background image: it keeps the
 * photo's hue (so it "matches") but forces high lightness and low saturation
 * (to not lose contrast against the dark modules).
 *
 * Client only (uses canvas). Returns null if sampling is not possible.
 */
export async function sampleTint(dataUri: string): Promise<string | null> {
  if (typeof document === "undefined") return null;
  const img = await loadImage(dataUri).catch(() => null);
  if (!img) return null;

  const size = 16; // cheap downscale: representative average, not pixel-perfect
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.drawImage(img, 0, 0, size, size);

  let data: Uint8ClampedArray;
  try {
    data = ctx.getImageData(0, 0, size, size).data;
  } catch {
    return null; // tainted canvas (should not happen with a same-origin data URI)
  }

  // Alpha-weighted average.
  let r = 0,
    g = 0,
    b = 0,
    n = 0;
  for (let i = 0; i < data.length; i += 4) {
    const a = data[i + 3] / 255;
    if (a === 0) continue;
    r += data[i] * a;
    g += data[i + 1] * a;
    b += data[i + 2] * a;
    n += a;
  }
  if (n === 0) return null;
  r /= n;
  g /= n;
  b /= n;

  // Take the photo's hue but clamp to a pale tint (high L, medium S)
  // to guarantee contrast against dark modules by construction.
  const [h, s] = rgbToHsl(r, g, b);
  const paleS = Math.min(s, 0.4);
  const paleL = 0.9;
  return hslToHex(h, paleS, paleL);
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/** RGB (0-255) → HSL (h in 0-1, s/l in 0-1). */
function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;
  return [h, s, l];
}

/** HSL (0-1) → hex #rrggbb. */
function hslToHex(h: number, s: number, l: number): string {
  const f = (n: number) => {
    const k = (n + h * 12) % 12;
    const a = s * Math.min(l, 1 - l);
    const c = l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
    return Math.round(c * 255);
  };
  const toHex = (v: number) => v.toString(16).padStart(2, "0");
  return `#${toHex(f(0))}${toHex(f(8))}${toHex(f(4))}`;
}
