import { createMatrix, isDark, isFinderZone, type QrMatrix } from "./matrix";
import type { QrConfig, QrGradient } from "./schema";

/**
 * Renderer SVG isomorfo: matriz + config → string SVG.
 * Corre igual en el navegador (preview del editor) y en Node (API pública).
 */

const FRAME_PAD = 3; // unidades (módulos) de padding del marco
const FRAME_BAND = 7; // unidades de la banda de texto del marco

// ---------- Helpers de geometría ----------

function round(n: number): string {
  return Number(n.toFixed(3)).toString();
}

/** Path de rectángulo con radio independiente por esquina [tl, tr, br, bl]. */
function roundedRectPath(
  x: number,
  y: number,
  w: number,
  h: number,
  radii: [number, number, number, number],
): string {
  const [tl, tr, br, bl] = radii.map((r) =>
    Math.max(0, Math.min(r, w / 2, h / 2)),
  ) as [number, number, number, number];
  return [
    `M${round(x + tl)},${round(y)}`,
    `h${round(w - tl - tr)}`,
    tr ? `a${round(tr)},${round(tr)} 0 0 1 ${round(tr)},${round(tr)}` : "",
    `v${round(h - tr - br)}`,
    br ? `a${round(br)},${round(br)} 0 0 1 ${round(-br)},${round(br)}` : "",
    `h${round(-(w - br - bl))}`,
    bl ? `a${round(bl)},${round(bl)} 0 0 1 ${round(-bl)},${round(-bl)}` : "",
    `v${round(-(h - bl - tl))}`,
    tl ? `a${round(tl)},${round(tl)} 0 0 1 ${round(tl)},${round(-tl)}` : "",
    "z",
  ]
    .filter(Boolean)
    .join("");
}

function circlePath(cx: number, cy: number, r: number): string {
  return (
    `M${round(cx - r)},${round(cy)}` +
    `a${round(r)},${round(r)} 0 1 0 ${round(2 * r)},0` +
    `a${round(r)},${round(r)} 0 1 0 ${round(-2 * r)},0z`
  );
}

// ---------- Módulos (dots) ----------

interface Neighbors {
  top: boolean;
  right: boolean;
  bottom: boolean;
  left: boolean;
}

function modulePath(
  style: QrConfig["style"]["dots"]["style"],
  x: number,
  y: number,
  n: Neighbors,
): string {
  switch (style) {
    case "square":
      return `M${round(x)},${round(y)}h1v1h-1z`;
    case "dots":
      return circlePath(x + 0.5, y + 0.5, 0.44);
    case "rounded": {
      const r = 0.4;
      return roundedRectPath(x, y, 1, 1, [
        !n.top && !n.left ? r : 0,
        !n.top && !n.right ? r : 0,
        !n.bottom && !n.right ? r : 0,
        !n.bottom && !n.left ? r : 0,
      ]);
    }
    case "extra-rounded": {
      const r = 0.5;
      return roundedRectPath(x, y, 1, 1, [
        !n.top && !n.left ? r : 0,
        !n.top && !n.right ? r : 0,
        !n.bottom && !n.right ? r : 0,
        !n.bottom && !n.left ? r : 0,
      ]);
    }
    case "classy": {
      const r = 0.5;
      return roundedRectPath(x, y, 1, 1, [
        !n.top && !n.left ? r : 0,
        0,
        !n.bottom && !n.right ? r : 0,
        0,
      ]);
    }
  }
}

// ---------- Finder patterns ----------

function cornerSquarePath(
  style: QrConfig["style"]["cornersSquare"]["style"],
  x: number,
  y: number,
): string {
  // anillo 7×7 con hueco 5×5 (fill-rule evenodd)
  const radii: Record<string, [number, number]> = {
    square: [0, 0],
    rounded: [1.9, 1.2],
    "extra-rounded": [3, 2.2],
  };
  const [rOut, rIn] = radii[style];
  const outer = roundedRectPath(x, y, 7, 7, [rOut, rOut, rOut, rOut]);
  const inner = roundedRectPath(x + 1, y + 1, 5, 5, [rIn, rIn, rIn, rIn]);
  return outer + inner;
}

function cornerDotPath(
  style: QrConfig["style"]["cornersDot"]["style"],
  x: number,
  y: number,
): string {
  switch (style) {
    case "square":
      return `M${round(x + 2)},${round(y + 2)}h3v3h-3z`;
    case "dot":
      return circlePath(x + 3.5, y + 3.5, 1.5);
    case "rounded":
      return roundedRectPath(x + 2, y + 2, 3, 3, [1, 1, 1, 1]);
  }
}

// ---------- Gradientes ----------

function gradientDef(
  id: string,
  gradient: QrGradient,
  box: { x: number; y: number; size: number },
): string {
  const stops = gradient.stops
    .map(
      (s) =>
        `<stop offset="${round(s.offset * 100)}%" stop-color="${s.color}"/>`,
    )
    .join("");

  if (gradient.type === "radial") {
    const c = box.size / 2;
    return `<radialGradient id="${id}" gradientUnits="userSpaceOnUse" cx="${round(box.x + c)}" cy="${round(box.y + c)}" r="${round(c * Math.SQRT2)}">${stops}</radialGradient>`;
  }

  const rad = ((gradient.rotation - 90) * Math.PI) / 180;
  const half = box.size / 2;
  const cx = box.x + half;
  const cy = box.y + half;
  const dx = Math.cos(rad) * half;
  const dy = Math.sin(rad) * half;
  return `<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="${round(cx - dx)}" y1="${round(cy - dy)}" x2="${round(cx + dx)}" y2="${round(cy + dy)}">${stops}</linearGradient>`;
}

// ---------- Contraste ----------

export function getContrastColor(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
  return luminance > 140 ? "#0b0b14" : "#ffffff";
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ---------- Marcos ----------

function renderFrame(
  frame: NonNullable<QrConfig["frame"]>,
  totalW: number,
  totalH: number,
): { defs: string; body: string } {
  const text = escapeXml(frame.text);
  const bandCenterY = totalH - FRAME_BAND / 2;
  const textColor = frame.textColor ?? getContrastColor(frame.color);
  let spacing = frame.style === "elegant" ? 0.9 : 0.45;
  // Auto-ajuste: reducir la fuente si el texto no cabe en el ancho disponible
  const maxTextWidth = totalW - 10;
  const estimateWidth = (size: number) =>
    frame.text.length * (size * 0.62 + spacing);
  let fontSize = 3;
  if (estimateWidth(fontSize) > maxTextWidth) {
    fontSize = Math.max(
      1.5,
      (maxTextWidth / Math.max(1, frame.text.length) - spacing) / 0.62,
    );
    if (estimateWidth(fontSize) > maxTextWidth) {
      spacing = 0.15;
      fontSize = Math.max(
        1.3,
        (maxTextWidth / Math.max(1, frame.text.length) - spacing) / 0.62,
      );
    }
  }
  const textAttrs = `x="${round(totalW / 2)}" y="${round(bandCenterY)}" text-anchor="middle" dominant-baseline="central" font-family="'Geist', 'Segoe UI', Arial, sans-serif" font-size="${fontSize}" font-weight="600" letter-spacing="${spacing}"`;

  switch (frame.style) {
    case "modern": {
      const bannerW = Math.min(totalW - 6, estimateWidth(fontSize) + 7);
      return {
        defs: "",
        body:
          `<rect x="0.75" y="0.75" width="${round(totalW - 1.5)}" height="${round(totalH - FRAME_BAND - 0.5)}" rx="3" fill="none" stroke="${frame.color}" stroke-width="1.2"/>` +
          `<rect x="${round((totalW - bannerW) / 2)}" y="${round(totalH - FRAME_BAND + 0.5)}" width="${round(bannerW)}" height="${FRAME_BAND - 1.5}" rx="2.4" fill="${frame.color}"/>` +
          `<text ${textAttrs} fill="${textColor}">${text}</text>`,
      };
    }
    case "classic":
      return {
        defs: "",
        body:
          `<rect x="0.9" y="0.9" width="${round(totalW - 1.8)}" height="${round(totalH - 1.8)}" fill="none" stroke="${frame.color}" stroke-width="1.8"/>` +
          `<rect x="0.9" y="${round(totalH - FRAME_BAND)}" width="${round(totalW - 1.8)}" height="${FRAME_BAND - 0.9}" fill="${frame.color}"/>` +
          `<text ${textAttrs} fill="${textColor}">${text}</text>`,
      };
    case "neon":
      return {
        defs: `<filter id="qrf-neon" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="0" stdDeviation="1.1" flood-color="${frame.color}" flood-opacity="0.9"/></filter>`,
        body:
          `<rect x="1" y="1" width="${round(totalW - 2)}" height="${round(totalH - FRAME_BAND - 1)}" rx="3" fill="none" stroke="${frame.color}" stroke-width="0.9" filter="url(#qrf-neon)"/>` +
          `<text ${textAttrs} fill="${frame.color}" filter="url(#qrf-neon)">${text}</text>`,
      };
    case "minimal":
      return {
        defs: "",
        body:
          `<line x1="${round(totalW / 2 - 10)}" y1="${round(totalH - FRAME_BAND + 1)}" x2="${round(totalW / 2 + 10)}" y2="${round(totalH - FRAME_BAND + 1)}" stroke="${frame.color}" stroke-width="0.35"/>` +
          `<text ${textAttrs} fill="${frame.color}">${text}</text>`,
      };
    case "elegant": {
      const lineY = round(bandCenterY);
      const halfText = estimateWidth(fontSize) / 2 + 2.5;
      const lineStart = round(Math.max(4, totalW / 2 - halfText));
      const lineEnd = round(Math.min(totalW - 4, totalW / 2 + halfText));
      return {
        defs: "",
        body:
          `<rect x="0.6" y="0.6" width="${round(totalW - 1.2)}" height="${round(totalH - FRAME_BAND - 0.2)}" rx="4" fill="none" stroke="${frame.color}" stroke-width="0.5"/>` +
          `<line x1="4" y1="${lineY}" x2="${lineStart}" y2="${lineY}" stroke="${frame.color}" stroke-width="0.35"/>` +
          `<line x1="${lineEnd}" y1="${lineY}" x2="${round(totalW - 4)}" y2="${lineY}" stroke="${frame.color}" stroke-width="0.35"/>` +
          `<text ${textAttrs} fill="${frame.color}">${text}</text>`,
      };
    }
  }
}

// ---------- Render principal ----------

export interface RenderOptions {
  /** Ancho en px del atributo width del SVG (height proporcional). */
  width?: number;
}

export function renderQrSvg(
  data: string,
  config: QrConfig,
  options: RenderOptions = {},
): string {
  const matrix = createMatrix(data, config.ecLevel);
  return renderMatrixSvg(matrix, config, options);
}

export function renderMatrixSvg(
  matrix: QrMatrix,
  config: QrConfig,
  options: RenderOptions = {},
): string {
  const { margin, style, logo, frame, effects } = config;
  const n = matrix.size;
  const qrUnits = n + 2 * margin;

  const hasFrame = Boolean(frame);
  const totalW = qrUnits + (hasFrame ? 2 * FRAME_PAD : 0);
  const totalH = qrUnits + (hasFrame ? 2 * FRAME_PAD + FRAME_BAND : 0);
  const qrX = hasFrame ? FRAME_PAD : 0;
  const qrY = hasFrame ? FRAME_PAD : 0;

  // Colores (con inversión opcional)
  const invert = effects?.invert ?? false;
  const rawDot = style.dots.color;
  const rawBg = style.background.color;
  const dotColor = invert ? rawBg : rawDot;
  const bgColor = invert ? rawDot : rawBg;
  const gradient = style.dots.gradient;

  const defs: string[] = [];
  let dotsFill = dotColor;
  if (gradient) {
    defs.push(
      gradientDef("qrf-dots", gradient, { x: qrX, y: qrY, size: qrUnits }),
    );
    dotsFill = "url(#qrf-dots)";
  }
  const cornerSquareFill = style.cornersSquare.color ?? dotsFill;
  const cornerDotFill = style.cornersDot.color ?? dotsFill;

  // Excavación para el logo
  let excavation: { min: number; max: number } | null = null;
  if (logo) {
    const logoModules = n * logo.sizeRatio;
    const half = logoModules / 2 + logo.margin;
    const center = n / 2;
    excavation = { min: center - half, max: center + half };
  }
  const isExcavated = (row: number, col: number): boolean => {
    if (!excavation) return false;
    const cx = col + 0.5;
    const cy = row + 0.5;
    return (
      cx > excavation.min &&
      cx < excavation.max &&
      cy > excavation.min &&
      cy < excavation.max
    );
  };

  // Path de módulos de datos
  const parts: string[] = [];
  for (let row = 0; row < n; row++) {
    for (let col = 0; col < n; col++) {
      if (!isDark(matrix, row, col)) continue;
      if (isFinderZone(n, row, col)) continue;
      if (isExcavated(row, col)) continue;
      const neighbors: Neighbors = {
        top: isDark(matrix, row - 1, col) && !isFinderZone(n, row - 1, col),
        right: isDark(matrix, row, col + 1) && !isFinderZone(n, row, col + 1),
        bottom: isDark(matrix, row + 1, col) && !isFinderZone(n, row + 1, col),
        left: isDark(matrix, row, col - 1) && !isFinderZone(n, row, col - 1),
      };
      parts.push(
        modulePath(
          style.dots.style,
          qrX + margin + col,
          qrY + margin + row,
          neighbors,
        ),
      );
    }
  }

  // Finder patterns
  const finders = [
    { x: 0, y: 0 },
    { x: n - 7, y: 0 },
    { x: 0, y: n - 7 },
  ];
  const cornerSquares = finders
    .map((f) =>
      cornerSquarePath(
        style.cornersSquare.style,
        qrX + margin + f.x,
        qrY + margin + f.y,
      ),
    )
    .join("");
  const cornerDots = finders
    .map((f) =>
      cornerDotPath(
        style.cornersDot.style,
        qrX + margin + f.x,
        qrY + margin + f.y,
      ),
    )
    .join("");

  // Efectos
  let dotsFilter = "";
  if (effects?.glow) {
    defs.push(
      `<filter id="qrf-glow" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="0" stdDeviation="0.7" flood-color="${gradient ? gradient.stops[0].color : dotColor}" flood-opacity="0.55"/></filter>`,
    );
    dotsFilter = ` filter="url(#qrf-glow)"`;
  }
  const groupOpacity =
    effects && effects.opacity < 1 ? ` opacity="${effects.opacity}"` : "";

  // Logo
  let logoSvg = "";
  if (logo && excavation) {
    const sizeUnits = excavation.max - excavation.min;
    const x = qrX + margin + excavation.min;
    const y = qrY + margin + excavation.min;
    const imgInset = logo.margin;
    if (logo.background) {
      logoSvg += `<rect x="${round(x)}" y="${round(y)}" width="${round(sizeUnits)}" height="${round(sizeUnits)}" rx="${round(sizeUnits * 0.18)}" fill="${bgColor}"/>`;
    }
    logoSvg += `<image x="${round(x + imgInset)}" y="${round(y + imgInset)}" width="${round(sizeUnits - 2 * imgInset)}" height="${round(sizeUnits - 2 * imgInset)}" href="${logo.dataUri}" preserveAspectRatio="xMidYMid meet"/>`;
  }

  // Marco
  let frameDefs = "";
  let frameBody = "";
  if (frame) {
    const rendered = renderFrame(frame, totalW, totalH);
    frameDefs = rendered.defs;
    frameBody = rendered.body;
  }

  const background = style.background.transparent
    ? ""
    : `<rect x="0" y="0" width="${round(totalW)}" height="${round(totalH)}" fill="${bgColor}"/>`;

  const width = options.width;
  const sizeAttrs = width
    ? ` width="${Math.round(width)}" height="${Math.round((width * totalH) / totalW)}"`
    : "";

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${round(totalW)} ${round(totalH)}"${sizeAttrs} role="img">` +
    (defs.length || frameDefs ? `<defs>${defs.join("")}${frameDefs}</defs>` : "") +
    background +
    `<g${groupOpacity}>` +
    `<path d="${parts.join("")}" fill="${dotsFill}"${dotsFilter}/>` +
    `<path d="${cornerSquares}" fill="${cornerSquareFill}" fill-rule="evenodd"/>` +
    `<path d="${cornerDots}" fill="${cornerDotFill}"/>` +
    logoSvg +
    `</g>` +
    frameBody +
    `</svg>`
  );
}
