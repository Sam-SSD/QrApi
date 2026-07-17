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
    case "vertical-line": {
      // Barra vertical: extremos redondeados salvo donde hay vecino contiguo,
      // para que módulos apilados se fundan en una sola línea continua.
      const w = 0.62;
      const rTop = n.top ? 0 : 0.31;
      const rBottom = n.bottom ? 0 : 0.31;
      return roundedRectPath(x + (1 - w) / 2, y, w, 1, [
        rTop,
        rTop,
        rBottom,
        rBottom,
      ]);
    }
    case "horizontal-line": {
      const h = 0.62;
      const rLeft = n.left ? 0 : 0.31;
      const rRight = n.right ? 0 : 0.31;
      return roundedRectPath(x, y + (1 - h) / 2, 1, h, [
        rLeft,
        rRight,
        rRight,
        rLeft,
      ]);
    }
    case "star":
      return starPath(x + 0.5, y + 0.5, 0.5, 0.22, 5);
    case "plus":
      return plusPath(x, y, 0.34);
    case "diamond":
      return diamondPath(x + 0.5, y + 0.5, 0.5);
  }
}

/** Estrella de `points` puntas centrada en (cx,cy). */
function starPath(
  cx: number,
  cy: number,
  outer: number,
  inner: number,
  points: number,
): string {
  const coords: string[] = [];
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const ang = (Math.PI / points) * i - Math.PI / 2;
    coords.push(
      `${round(cx + Math.cos(ang) * r)},${round(cy + Math.sin(ang) * r)}`,
    );
  }
  return `M${coords.join("L")}z`;
}

/** Cruz (signo +) inscrita en la celda (x,y) con grosor de brazo `t`. */
function plusPath(x: number, y: number, t: number): string {
  const arm = (1 - t) / 2;
  const x0 = round(x + arm);
  return (
    `M${x0},${round(y)}` +
    `h${round(t)}v${round(arm)}h${round(arm)}v${round(t)}h${round(-arm)}` +
    `v${round(arm)}h${round(-t)}v${round(-arm)}h${round(-arm)}v${round(-t)}` +
    `h${round(arm)}z`
  );
}

/** Rombo inscrito en la celda, centrado en (cx,cy) con radio `r`. */
function diamondPath(cx: number, cy: number, r: number): string {
  return (
    `M${round(cx)},${round(cy - r)}` +
    `L${round(cx + r)},${round(cy)}` +
    `L${round(cx)},${round(cy + r)}` +
    `L${round(cx - r)},${round(cy)}z`
  );
}

// ---------- Finder patterns ----------

type Radii = [number, number, number, number];

/** Radios [exterior, interior] del anillo del finder por estilo. */
function finderRadii(
  style: QrConfig["style"]["cornersSquare"]["style"],
): { out: Radii; inn: Radii } {
  switch (style) {
    case "square":
      return { out: [0, 0, 0, 0], inn: [0, 0, 0, 0] };
    case "rounded":
      return { out: [1.9, 1.9, 1.9, 1.9], inn: [1.2, 1.2, 1.2, 1.2] };
    case "extra-rounded":
      return { out: [3, 3, 3, 3], inn: [2.2, 2.2, 2.2, 2.2] };
    case "outpoint": // TL y BR en punta, TR y BL redondeadas (leaf/gota)
      return { out: [0, 2.6, 0, 2.6], inn: [0, 1.8, 0, 1.8] };
    case "inpoint": // espejo: TR y BL en punta
      return { out: [2.6, 0, 2.6, 0], inn: [1.8, 0, 1.8, 0] };
    case "classy": // una esquina en punta y la opuesta redondeada
      return { out: [0, 1.6, 0, 1.6], inn: [0, 1.1, 0, 1.1] };
  }
}

function cornerSquarePath(
  style: QrConfig["style"]["cornersSquare"]["style"],
  x: number,
  y: number,
): string {
  // anillo 7×7 con hueco 5×5 (fill-rule evenodd)
  const { out, inn } = finderRadii(style);
  return roundedRectPath(x, y, 7, 7, out) + roundedRectPath(x + 1, y + 1, 5, 5, inn);
}

/** Placa sólida con la silueta exterior del finder (para imagen de fondo). */
function finderPlatePath(
  style: QrConfig["style"]["cornersSquare"]["style"],
  x: number,
  y: number,
): string {
  return roundedRectPath(x, y, 7, 7, finderRadii(style).out);
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
    case "diamond":
      // Rombo ajustado al centro 3×3 del finder (convexo → escaneable).
      return diamondPath(x + 3.5, y + 3.5, 1.7);
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

/**
 * Descriptor de layout del marco. `bandY` es el borde superior de la banda de
 * texto; `qrBoxY`/`qrBoxH` delimitan la caja del QR (todo dentro de la región
 * `pad`). Con position="bottom" los valores son byte-idénticos al layout
 * histórico (banda abajo), preservando los 5 estilos y sus tests.
 */
interface FrameLayout {
  pad: number;
  band: number;
  position: "bottom" | "top";
  bandY: number;
  bandCenterY: number;
  /** Y del borde superior de la caja del QR (para dibujar el borde del marco). */
  qrBoxY: number;
  qrBoxH: number;
}

function frameLayout(
  frame: NonNullable<QrConfig["frame"]>,
  totalH: number,
): FrameLayout {
  // banner-top y scanner-brackets fuerzan su propia geometría.
  const band = frame.style === "scanner-brackets" ? 0 : FRAME_BAND;
  const position: "bottom" | "top" =
    frame.style === "banner-top" ? "top" : frame.position;
  const pad = FRAME_PAD;
  const bandY = position === "top" ? 0 : totalH - band;
  const bandCenterY = bandY + band / 2;
  const qrBoxY = position === "top" ? band : 0;
  const qrBoxH = totalH - band;
  return { pad, band, position, bandY, bandCenterY, qrBoxY, qrBoxH };
}

function renderFrame(
  frame: NonNullable<QrConfig["frame"]>,
  totalW: number,
  totalH: number,
): { defs: string; body: string } {
  const text = escapeXml(frame.text);
  const L = frameLayout(frame, totalH);
  const bandCenterY = L.bandCenterY;
  // Color del texto. Si el usuario lo define, se respeta SIEMPRE. Si no, el
  // default depende del estilo: los que tienen banda sólida usan contraste;
  // los "sin banda" (neon/minimal/elegant/scanner-brackets) usan el color del
  // marco, que es lo legible sobre el fondo del QR.
  const bandStyles = [
    "modern",
    "classic",
    "banner-top",
    "ticket",
    "badge",
    "speech-bubble",
  ];
  const textColor =
    frame.textColor ??
    (bandStyles.includes(frame.style)
      ? getContrastColor(frame.color)
      : frame.color);
  let spacing = frame.style === "elegant" ? 0.9 : 0.45;
  // Auto-ajuste: reducir la fuente si el texto no cabe en el ancho disponible.
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
  const textCx = totalW / 2;
  const textAttrs = `x="${round(textCx)}" y="${round(bandCenterY)}" text-anchor="middle" dominant-baseline="central" font-family="'Geist', 'Segoe UI', Arial, sans-serif" font-size="${fontSize}" font-weight="600" letter-spacing="${spacing}"`;

  switch (frame.style) {
    case "modern": {
      const bannerW = Math.min(totalW - 6, estimateWidth(fontSize) + 7);
      return {
        defs: "",
        body:
          `<rect x="0.75" y="${round(L.qrBoxY + 0.75)}" width="${round(totalW - 1.5)}" height="${round(L.qrBoxH - 0.5)}" rx="3" fill="none" stroke="${frame.color}" stroke-width="1.2"/>` +
          `<rect x="${round((totalW - bannerW) / 2)}" y="${round(L.bandY + 0.5)}" width="${round(bannerW)}" height="${L.band - 1.5}" rx="2.4" fill="${frame.color}"/>` +
          `<text ${textAttrs} fill="${textColor}">${text}</text>`,
      };
    }
    case "banner-top":
    case "classic":
      return {
        defs: "",
        body:
          `<rect x="0.9" y="0.9" width="${round(totalW - 1.8)}" height="${round(totalH - 1.8)}" fill="none" stroke="${frame.color}" stroke-width="1.8"/>` +
          `<rect x="0.9" y="${round(L.bandY + (L.position === "top" ? 0.9 : 0))}" width="${round(totalW - 1.8)}" height="${L.band - 0.9}" fill="${frame.color}"/>` +
          `<text ${textAttrs} fill="${textColor}">${text}</text>`,
      };
    case "neon":
      return {
        defs: `<filter id="qra-neon" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="0" stdDeviation="1.1" flood-color="${frame.color}" flood-opacity="0.9"/></filter>`,
        body:
          `<rect x="1" y="${round(L.qrBoxY + 1)}" width="${round(totalW - 2)}" height="${round(L.qrBoxH - 1)}" rx="3" fill="none" stroke="${frame.color}" stroke-width="0.9" filter="url(#qra-neon)"/>` +
          `<text ${textAttrs} fill="${textColor}" filter="url(#qra-neon)">${text}</text>`,
      };
    case "minimal":
      return {
        defs: "",
        body:
          `<line x1="${round(totalW / 2 - 10)}" y1="${round(L.bandY + (L.position === "top" ? L.band - 1 : 1))}" x2="${round(totalW / 2 + 10)}" y2="${round(L.bandY + (L.position === "top" ? L.band - 1 : 1))}" stroke="${frame.color}" stroke-width="0.35"/>` +
          `<text ${textAttrs} fill="${textColor}">${text}</text>`,
      };
    case "elegant": {
      const lineY = round(bandCenterY);
      const halfText = estimateWidth(fontSize) / 2 + 2.5;
      const lineStart = round(Math.max(4, totalW / 2 - halfText));
      const lineEnd = round(Math.min(totalW - 4, totalW / 2 + halfText));
      return {
        defs: "",
        body:
          `<rect x="0.6" y="${round(L.qrBoxY + 0.6)}" width="${round(totalW - 1.2)}" height="${round(L.qrBoxH - 0.2)}" rx="4" fill="none" stroke="${frame.color}" stroke-width="0.5"/>` +
          `<line x1="4" y1="${lineY}" x2="${lineStart}" y2="${lineY}" stroke="${frame.color}" stroke-width="0.35"/>` +
          `<line x1="${lineEnd}" y1="${lineY}" x2="${round(totalW - 4)}" y2="${lineY}" stroke="${frame.color}" stroke-width="0.35"/>` +
          `<text ${textAttrs} fill="${textColor}">${text}</text>`,
      };
    }
    case "speech-bubble": {
      // Bocadillo: rect redondeado que encierra el QR + banda inferior con cola.
      const bannerW = Math.min(totalW - 6, estimateWidth(fontSize) + 8);
      const bx = (totalW - bannerW) / 2;
      const by = L.bandY + 0.5;
      const bh = L.band - 1.5;
      // Cola triangular saliendo hacia abajo desde el centro de la banda.
      const tailCx = totalW / 2;
      const tail = `<polygon points="${round(tailCx - 1.6)},${round(by + bh)} ${round(tailCx + 1.6)},${round(by + bh)} ${round(tailCx)},${round(by + bh + 2)}" fill="${frame.color}"/>`;
      return {
        defs: "",
        body:
          `<rect x="0.75" y="${round(L.qrBoxY + 0.75)}" width="${round(totalW - 1.5)}" height="${round(L.qrBoxH - 0.5)}" rx="3.5" fill="none" stroke="${frame.color}" stroke-width="1.1"/>` +
          `<rect x="${round(bx)}" y="${round(by)}" width="${round(bannerW)}" height="${round(bh)}" rx="${round(bh / 2)}" fill="${frame.color}"/>` +
          tail +
          `<text ${textAttrs} fill="${textColor}">${text}</text>`,
      };
    }
    case "badge": {
      // Insignia: cinta tipo sello bajo el QR con borde festoneado (fila de
      // círculos) — firma estructural que librsvg rasteriza fiable, a
      // diferencia de textPath. Texto recto centrado.
      const ribY = L.bandY + (L.position === "top" ? 0.9 : 0);
      const ribH = L.band - 1.5;
      const ribX = 2.5;
      const ribW = totalW - 5;
      // Festón: círculos solapando el borde exterior de la cinta.
      const scallopEdge = L.position === "top" ? ribY + ribH : ribY;
      const scallopR = 0.9;
      const nScallops = Math.max(6, Math.round(ribW / (scallopR * 2)));
      const gap = ribW / nScallops;
      let scallops = "";
      for (let i = 0; i < nScallops; i++) {
        scallops += `<circle cx="${round(ribX + gap * (i + 0.5))}" cy="${round(scallopEdge)}" r="${scallopR}" fill="${frame.color}"/>`;
      }
      const badgeFont = Math.min(fontSize, 2.8);
      const badgeTextAttrs = `x="${round(textCx)}" y="${round(ribY + ribH / 2)}" text-anchor="middle" dominant-baseline="central" font-family="'Geist', 'Segoe UI', Arial, sans-serif" font-size="${round(badgeFont)}" font-weight="700" letter-spacing="0.4"`;
      return {
        defs: "",
        body:
          `<rect x="1" y="${round(L.qrBoxY + 1)}" width="${round(totalW - 2)}" height="${round(L.qrBoxH - 1)}" rx="3" fill="none" stroke="${frame.color}" stroke-width="1"/>` +
          `<rect x="${round(ribX)}" y="${round(ribY)}" width="${round(ribW)}" height="${round(ribH)}" rx="1" fill="${frame.color}"/>` +
          scallops +
          `<text ${badgeTextAttrs} fill="${textColor}">${text}</text>`,
      };
    }
    case "ticket": {
      // Cupón: borde dasheado + muescas semicirculares a los lados de la banda.
      const notchY = L.bandY;
      const notchR = 1.4;
      // Las muescas "recortan" el ticket; blanco funciona sobre el fondo claro
      // habitual de este estilo (contraste vía la línea dasheada).
      const bg = "#ffffff";
      return {
        defs: "",
        body:
          `<rect x="0.9" y="0.9" width="${round(totalW - 1.8)}" height="${round(totalH - 1.8)}" rx="2.5" fill="none" stroke="${frame.color}" stroke-width="1"/>` +
          `<rect x="0.9" y="${round(L.bandY + (L.position === "top" ? 0.9 : 0))}" width="${round(totalW - 1.8)}" height="${L.band - 0.9}" fill="${frame.color}"/>` +
          `<line x1="2.5" y1="${round(notchY)}" x2="${round(totalW - 2.5)}" y2="${round(notchY)}" stroke="${bg}" stroke-width="0.4" stroke-dasharray="1.2 1"/>` +
          `<circle cx="0.9" cy="${round(notchY)}" r="${notchR}" fill="${bg}"/>` +
          `<circle cx="${round(totalW - 0.9)}" cy="${round(notchY)}" r="${notchR}" fill="${bg}"/>` +
          `<text ${textAttrs} fill="${textColor}">${text}</text>`,
      };
    }
    case "scanner-brackets": {
      // Cuatro esquinas en "L" (visor de cámara), sin borde ni banda; texto
      // en un pie fuera de la caja del QR no aplica (band=0), así que el texto
      // va centrado bajo la última fila, dentro del pad inferior.
      const m = 1.2;
      const len = Math.max(4, totalW * 0.16);
      const sw = 1.2;
      const c = frame.color;
      const corner = (px: number, py: number, dx: number, dy: number) =>
        `<path d="M${round(px + dx * len)},${round(py)} H${round(px)} V${round(py + dy * len)}" fill="none" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>`;
      return {
        defs: "",
        body:
          corner(m, m, 1, 1) +
          corner(totalW - m, m, -1, 1) +
          corner(m, totalH - m, 1, -1) +
          corner(totalW - m, totalH - m, -1, -1) +
          (frame.text
            ? `<text x="${round(textCx)}" y="${round(totalH - m - 0.5)}" text-anchor="middle" dominant-baseline="central" font-family="'Geist', 'Segoe UI', Arial, sans-serif" font-size="${round(Math.min(fontSize, 2.4))}" font-weight="600" letter-spacing="${spacing}" fill="${textColor}">${text}</text>`
            : ""),
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
  // Con imagen de fondo se fuerza EC=H (recupera ~30%): red de seguridad de
  // escaneabilidad independientemente del ecLevel elegido en la config.
  const ecLevel = config.style.background.image ? "H" : config.ecLevel;
  const matrix = createMatrix(data, ecLevel);
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
  // scanner-brackets no lleva banda de texto separada (band=0).
  const frameBand =
    frame && frame.style !== "scanner-brackets" ? FRAME_BAND : 0;
  const totalW = qrUnits + (hasFrame ? 2 * FRAME_PAD : 0);
  const totalH = qrUnits + (hasFrame ? 2 * FRAME_PAD + frameBand : 0);
  // La banda va arriba si position="top" (o banner-top); entonces el QR baja.
  const bandOnTop =
    hasFrame &&
    frame !== undefined &&
    (frame.style === "banner-top" || frame.position === "top");
  const qrX = hasFrame ? FRAME_PAD : 0;
  const qrY = hasFrame ? FRAME_PAD + (bandOnTop ? frameBand : 0) : 0;

  // Colores (con inversión opcional)
  const invert = effects?.invert ?? false;
  const rawDot = style.dots.color;
  const rawBg = style.background.color;
  const dotColor = invert ? rawBg : rawDot;
  const bgColor = invert ? rawDot : rawBg;
  const gradient = style.dots.gradient;

  const defs: string[] = [];
  const qrBox = { x: qrX, y: qrY, size: qrUnits };
  let dotsFill = dotColor;
  if (gradient) {
    defs.push(gradientDef("qra-dots", gradient, qrBox));
    dotsFill = "url(#qra-dots)";
  }
  // Gradiente en las esquinas (finders); si no, color propio o herencia de dots.
  let cornerSquareFill = style.cornersSquare.color ?? dotsFill;
  if (style.cornersSquare.gradient) {
    defs.push(gradientDef("qra-corner-sq", style.cornersSquare.gradient, qrBox));
    cornerSquareFill = "url(#qra-corner-sq)";
  }
  let cornerDotFill = style.cornersDot.color ?? dotsFill;
  if (style.cornersDot.gradient) {
    defs.push(gradientDef("qra-corner-dot", style.cornersDot.gradient, qrBox));
    cornerDotFill = "url(#qra-corner-dot)";
  }

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
      `<filter id="qra-glow" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="0" stdDeviation="0.7" flood-color="${gradient ? gradient.stops[0].color : dotColor}" flood-opacity="0.55"/></filter>`,
    );
    dotsFilter = ` filter="url(#qra-glow)"`;
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

  // ----- Fondo (color / gradiente / imagen con salvaguardas) -----
  const bgImage = style.background.image;
  const bgGradient = style.background.gradient;
  let background = "";
  if (!style.background.transparent) {
    if (bgGradient) {
      defs.push(
        gradientDef("qra-bg", bgGradient, { x: 0, y: 0, size: totalW }),
      );
      background = `<rect x="0" y="0" width="${round(totalW)}" height="${round(totalH)}" fill="url(#qra-bg)"/>`;
    } else {
      background = `<rect x="0" y="0" width="${round(totalW)}" height="${round(totalH)}" fill="${bgColor}"/>`;
    }
  }

  // Capas de imagen de fondo: imagen (cover) → scrim tenue → placa opaca bajo
  // la caja del QR. Garantiza contraste sin aplicar opacidad a los módulos.
  let bgImageLayers = "";
  let finderPlates = "";
  if (bgImage) {
    // El scrim empuja el contraste hacia el color OPUESTO a los módulos:
    // puntos oscuros → scrim claro (aclara la foto), puntos claros → oscuro.
    const scrimColor = getContrastColor(dotColor);
    bgImageLayers =
      `<image x="0" y="0" width="${round(totalW)}" height="${round(totalH)}" href="${bgImage.dataUri}" preserveAspectRatio="xMidYMid slice"/>` +
      `<rect x="0" y="0" width="${round(totalW)}" height="${round(totalH)}" fill="${scrimColor}" opacity="${round(bgImage.opacity)}"/>`;
    if (bgImage.plate) {
      // Placa opaca bajo TODO el QR + su quiet zone, para que los módulos no
      // compitan con la foto (el sangrado en el margen es el fallo más común).
      bgImageLayers += `<rect x="${round(qrX)}" y="${round(qrY)}" width="${round(qrUnits)}" height="${round(qrUnits)}" rx="1.5" fill="${bgColor}"/>`;
    }
    // Placas "sagradas" bajo los 3 finder patterns, solo si NO hay ya placa
    // global. Toman la SILUETA del estilo de esquina (mismos radios) para no
    // sobresalir como cuadros blancos por los lados del anillo redondeado.
    // Color: tinte muestreado de la imagen (aclarado) si existe; si no, blanco.
    if (!bgImage.plate) {
      const plateColor = bgImage.tint ?? bgColor;
      finderPlates = finders
        .map(
          (f) =>
            `<path d="${finderPlatePath(style.cornersSquare.style, qrX + margin + f.x, qrY + margin + f.y)}" fill="${plateColor}"/>`,
        )
        .join("");
    }
  }

  const width = options.width;
  const sizeAttrs = width
    ? ` width="${Math.round(width)}" height="${Math.round((width * totalH) / totalW)}"`
    : "";

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${round(totalW)} ${round(totalH)}"${sizeAttrs} role="img">` +
    (defs.length || frameDefs ? `<defs>${defs.join("")}${frameDefs}</defs>` : "") +
    background +
    bgImageLayers +
    `<g${groupOpacity}>` +
    finderPlates +
    `<path d="${parts.join("")}" fill="${dotsFill}"${dotsFilter}/>` +
    `<path d="${cornerSquares}" fill="${cornerSquareFill}" fill-rule="evenodd"/>` +
    `<path d="${cornerDots}" fill="${cornerDotFill}"/>` +
    logoSvg +
    `</g>` +
    frameBody +
    `</svg>`
  );
}
