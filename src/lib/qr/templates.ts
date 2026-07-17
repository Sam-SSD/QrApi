import { z } from "zod";
import type { QrConfig, QrGradient, QrPayload } from "./schema";
import { DEFAULT_QR_CONFIG, qrConfigSchema } from "./schema";

/**
 * Presets de gradiente del selector de estilo.
 * Regla de contraste: sobre fondo blanco ningún stop más claro que #0891b2;
 * los tonos claros (#818cf8, #22d3ee) se reservan para fondos oscuros.
 */
export const GRADIENT_PRESETS: Record<string, QrGradient> = {
  brand: {
    type: "linear",
    rotation: 135,
    stops: [
      { offset: 0, color: "#4f46e5" },
      { offset: 1, color: "#0891b2" },
    ],
  },
  aurora: {
    type: "linear",
    rotation: 135,
    stops: [
      { offset: 0, color: "#4f46e5" },
      { offset: 0.5, color: "#7c3aed" },
      { offset: 1, color: "#0891b2" },
    ],
  },
  neon: {
    type: "linear",
    rotation: 135,
    stops: [
      { offset: 0, color: "#818cf8" },
      { offset: 1, color: "#22d3ee" },
    ],
  },
  cyber: {
    type: "linear",
    rotation: 45,
    stops: [
      { offset: 0, color: "#6366f1" },
      { offset: 1, color: "#22d3ee" },
    ],
  },
  purple: {
    type: "linear",
    rotation: 135,
    stops: [
      { offset: 0, color: "#7c3aed" },
      { offset: 1, color: "#ec4899" },
    ],
  },
  sunset: {
    type: "linear",
    rotation: 90,
    stops: [
      { offset: 0, color: "#f97316" },
      { offset: 1, color: "#dc2626" },
    ],
  },
  ocean: {
    type: "linear",
    rotation: 60,
    stops: [
      { offset: 0, color: "#0ea5e9" },
      { offset: 1, color: "#1d4ed8" },
    ],
  },
  mint: {
    type: "linear",
    rotation: 45,
    stops: [
      { offset: 0, color: "#10b981" },
      { offset: 1, color: "#0d9488" },
    ],
  },
  fire: {
    type: "radial",
    rotation: 0,
    stops: [
      { offset: 0, color: "#fbbf24" },
      { offset: 1, color: "#dc2626" },
    ],
  },
};

export type QrTemplateCategory =
  | "brand"
  | "dark"
  | "business"
  | "marketing"
  | "industry";

export interface QrTemplate {
  id: string;
  category: QrTemplateCategory;
  payload: QrPayload;
  config: QrConfig;
}

/**
 * Forma de una plantilla al declararla: el `config` acepta la ENTRADA del
 * schema, de modo que los defaults (frame.position/icon, etc.) son opcionales
 * al escribir la plantilla y se aplican al normalizar. Así añadir un default
 * nuevo al schema no obliga a tocar cada plantilla.
 */
interface QrTemplateInput {
  id: string;
  category: QrTemplateCategory;
  payload: QrPayload;
  config: z.input<typeof qrConfigSchema>;
}

export const TEMPLATE_CATEGORIES: QrTemplateCategory[] = [
  "brand",
  "dark",
  "business",
  "marketing",
  "industry",
];

/**
 * Imagen de fondo de ejemplo (degradado naranja→rosa 48×48 en PNG) para las
 * plantillas que muestran la función de foto detrás del QR. PNG (no SVG: el
 * schema rechaza svg+xml) y pequeña para no inflar el bundle. Se fija un tinte
 * pálido acorde con la imagen para las placas de finder.
 */
const SAMPLE_BG_SUNSET =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAMAAABg3Am1AAABHVBMVEXrXVrqWFzsYVftYlbqWlvsYFjqWVvrW1rrXlnsX1jpV13pVl3tY1btZFXpVV7oVF7uZVXoUl/uZ1TuaFPoUWDnUGDvaVPnT2HvalLnTmHva1LmTWLwbFHmTGPwbVDmS2PwblDlSmTxb0/lSGXxcU7lR2Xxck7kRmbyc03ydE3kRWbkRGfydUzzdkvjQ2jzd0vjQmjzeErjQWn0eUriQGniPmr0e0niPWv0fEjhPGv1fUjhO2z1fkf1f0bhOm32gEbgOW32gUXgOG72gkXgN273hETfNW/3hUPfNHD3hkPfM3D4h0LeMnH4iELeMXH4iUHeMHL5ikDdL3P5i0DdLnP5jD/dLXT6jj7cK3X6jz7cKnX6kD3cKXb7kT3bKHY/fa09AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAyUlEQVRIx5XK1yICAABA0VsUIdkZUfZIkdWQEGWPSkPk/z/DN9zzfBj8fHfbrcbH28vTQ+3u9vqqXCpcnOaOMof7eztbG6m1xPLiwuzMVHRiKBiKjIL8I8g/jPxh5A8g/xjyjyP/JPLHkH8a+eeQfx7549i/hPwryL+K/EnkX0f+TeTfRv5d5D9A/jTyZ5H/GPlPkP8M+c+RP4/8ReS/RP4K8t8gfxX575G/jvyPyP+M/K/I/478n8jfRP4v5O8gfw/5+8j/i/x///YGG74JgK5kAAAAAElFTkSuQmCC";

const base = DEFAULT_QR_CONFIG;

/** Declaraciones sin normalizar; se parsean por el schema en TEMPLATES. */
const TEMPLATE_DEFS: QrTemplateInput[] = [
  // ─ brand: la identidad indigo→cyan de la página ─
  {
    id: "qrapi",
    category: "brand",
    payload: { type: "url", url: "https://qrapi.dev" },
    config: {
      ...base,
      ecLevel: "Q",
      style: {
        dots: { style: "rounded", color: "#4f46e5", gradient: GRADIENT_PRESETS.brand },
        cornersSquare: { style: "extra-rounded", color: "#4f46e5" },
        cornersDot: { style: "dot", color: "#0891b2" },
        background: { color: "#ffffff", transparent: false },
      },
    },
  },
  {
    id: "aurora",
    category: "brand",
    payload: { type: "url", url: "https://qrapi.dev/galeria" },
    config: {
      ...base,
      ecLevel: "Q",
      style: {
        dots: { style: "extra-rounded", color: "#4f46e5", gradient: GRADIENT_PRESETS.aurora },
        cornersSquare: { style: "extra-rounded", color: "#7c3aed" },
        cornersDot: { style: "dot", color: "#4f46e5" },
        background: { color: "#ffffff", transparent: false },
      },
    },
  },
  {
    id: "sticker",
    category: "brand",
    payload: { type: "url", url: "https://qrapi.dev" },
    config: {
      ...base,
      ecLevel: "H",
      style: {
        dots: { style: "square", color: "#18181b" },
        cornersSquare: { style: "square", color: "#18181b" },
        cornersDot: { style: "square", color: "#4f46e5" },
        background: { color: "#ffffff", transparent: true },
      },
    },
  },
  // ─ dark: para pantallas y ambientes oscuros ─
  {
    id: "neon",
    category: "dark",
    payload: { type: "url", url: "https://qrapi.dev/neon" },
    config: {
      ...base,
      ecLevel: "H",
      style: {
        dots: { style: "dots", color: "#22d3ee", gradient: GRADIENT_PRESETS.neon },
        cornersSquare: { style: "rounded", color: "#818cf8" },
        cornersDot: { style: "dot", color: "#22d3ee" },
        background: { color: "#09090b", transparent: false },
      },
      frame: {
        style: "neon",
        text: "QRAPI.DEV",
        color: "#22d3ee",
      },
      effects: { ...base.effects, glow: true },
    },
  },
  {
    id: "midnight",
    category: "dark",
    payload: { type: "url", url: "https://qrapi.dev/app" },
    config: {
      ...base,
      ecLevel: "H",
      style: {
        dots: { style: "extra-rounded", color: "#f4f4f5" },
        cornersSquare: { style: "rounded", color: "#818cf8" },
        cornersDot: { style: "dot", color: "#22d3ee" },
        background: { color: "#0e0e12", transparent: false },
      },
    },
  },
  // ─ business ─
  {
    id: "business",
    category: "business",
    payload: {
      type: "vcard",
      firstName: "Ada",
      lastName: "Lovelace",
      organization: "QrAPI",
      title: "Chief Analytical Engineer",
      phone: "+34600111222",
      email: "ada@qrapi.dev",
      website: "https://qrapi.dev",
    },
    config: {
      ...base,
      ecLevel: "Q",
      style: {
        dots: { style: "classy", color: "#18181b" },
        cornersSquare: { style: "rounded", color: "#4f46e5" },
        cornersDot: { style: "dot", color: "#0891b2" },
        background: { color: "#ffffff", transparent: false },
      },
      frame: {
        style: "elegant",
        text: "ADA LOVELACE",
        color: "#4f46e5",
      },
    },
  },
  {
    id: "wifi",
    category: "business",
    payload: {
      type: "wifi",
      ssid: "QrAPI Guest",
      password: "superclave123",
      security: "WPA",
      hidden: false,
    },
    config: {
      ...base,
      ecLevel: "Q",
      style: {
        dots: { style: "rounded", color: "#0e7490", gradient: GRADIENT_PRESETS.ocean },
        cornersSquare: { style: "extra-rounded", color: "#1d4ed8" },
        cornersDot: { style: "dot", color: "#0891b2" },
        background: { color: "#ffffff", transparent: false },
      },
      frame: {
        style: "classic",
        text: "WIFI GRATIS",
        color: "#1d4ed8",
      },
    },
  },
  {
    id: "event",
    category: "business",
    payload: { type: "url", url: "https://qrapi.dev/eventos/lanzamiento" },
    config: {
      ...base,
      style: {
        dots: { style: "extra-rounded", color: "#10b981", gradient: GRADIENT_PRESETS.mint },
        cornersSquare: { style: "rounded", color: "#0d9488" },
        cornersDot: { style: "rounded", color: "#0d9488" },
        background: { color: "#ffffff", transparent: false },
      },
      frame: {
        style: "elegant",
        text: "RESERVA TU PLAZA",
        color: "#0d9488",
      },
    },
  },
  {
    id: "payment",
    category: "business",
    payload: {
      type: "crypto",
      currency: "bitcoin",
      address: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
    },
    config: {
      ...base,
      ecLevel: "H",
      style: {
        dots: { style: "square", color: "#b45309", gradient: GRADIENT_PRESETS.fire },
        cornersSquare: { style: "square", color: "#b45309" },
        cornersDot: { style: "square", color: "#dc2626" },
        background: { color: "#fffbeb", transparent: false },
      },
    },
  },
  // ─ marketing ─
  {
    id: "social",
    category: "marketing",
    payload: { type: "url", url: "https://www.linkedin.com/in/tu-perfil" },
    config: {
      ...base,
      style: {
        dots: { style: "dots", color: "#7c3aed", gradient: GRADIENT_PRESETS.purple },
        cornersSquare: { style: "extra-rounded", color: "#7c3aed" },
        cornersDot: { style: "dot", color: "#db2777" },
        background: { color: "#ffffff", transparent: false },
      },
      frame: {
        style: "minimal",
        text: "SÍGUEME",
        color: "#7c3aed",
      },
    },
  },
  {
    id: "sunset",
    category: "marketing",
    payload: { type: "url", url: "https://qrapi.dev/promo" },
    config: {
      ...base,
      style: {
        dots: { style: "rounded", color: "#ea580c", gradient: GRADIENT_PRESETS.sunset },
        cornersSquare: { style: "rounded", color: "#dc2626" },
        cornersDot: { style: "dot", color: "#ea580c" },
        background: { color: "#ffffff", transparent: false },
      },
      frame: {
        style: "modern",
        text: "OFERTA LIMITADA",
        color: "#dc2626",
      },
    },
  },
  {
    id: "email",
    category: "marketing",
    payload: {
      type: "email",
      to: "hola@qrapi.dev",
      subject: "Hablemos",
    },
    config: {
      ...base,
      style: {
        dots: { style: "rounded", color: "#6366f1", gradient: GRADIENT_PRESETS.cyber },
        cornersSquare: { style: "extra-rounded", color: "#6366f1" },
        cornersDot: { style: "dot", color: "#0891b2" },
        background: { color: "#ffffff", transparent: false },
      },
      frame: {
        style: "minimal",
        text: "ESCRÍBEME",
        color: "#6366f1",
      },
    },
  },
  // ─ marketing: imagen de fondo + gradiente en esquinas (features nuevas) ─
  {
    id: "photo",
    category: "marketing",
    payload: { type: "url", url: "https://qrapi.dev/promo" },
    config: {
      ...base,
      ecLevel: "H",
      style: {
        dots: { style: "rounded", color: "#0b0b14" },
        cornersSquare: { style: "extra-rounded", color: "#0b0b14" },
        cornersDot: { style: "dot", color: "#0b0b14" },
        background: {
          color: "#ffffff",
          transparent: false,
          image: { dataUri: SAMPLE_BG_SUNSET, opacity: 0.4, tint: "#fde4d6" },
        },
      },
    },
  },
  {
    id: "prisma",
    category: "marketing",
    payload: { type: "url", url: "https://qrapi.dev" },
    config: {
      ...base,
      ecLevel: "Q",
      style: {
        dots: { style: "extra-rounded", color: "#4f46e5", gradient: GRADIENT_PRESETS.aurora },
        cornersSquare: { style: "extra-rounded", gradient: GRADIENT_PRESETS.brand },
        cornersDot: { style: "dot", gradient: GRADIENT_PRESETS.brand },
        background: { color: "#f5f3ff", transparent: false },
      },
    },
  },
  // ─ industry: presets de 1 clic por sector ─
  {
    id: "restaurant",
    category: "industry",
    payload: { type: "url", url: "https://qrapi.dev/menu" },
    config: {
      ...base,
      ecLevel: "Q",
      style: {
        dots: { style: "rounded", color: "#b45309", gradient: GRADIENT_PRESETS.fire },
        cornersSquare: { style: "rounded", color: "#b45309" },
        cornersDot: { style: "dot", color: "#dc2626" },
        background: { color: "#fffbeb", transparent: false },
      },
      frame: { style: "speech-bubble", text: "VER EL MENÚ", color: "#b45309" },
    },
  },
  {
    id: "eventpass",
    category: "industry",
    payload: { type: "url", url: "https://qrapi.dev/eventos" },
    config: {
      ...base,
      ecLevel: "Q",
      style: {
        dots: { style: "extra-rounded", color: "#7c3aed", gradient: GRADIENT_PRESETS.purple },
        cornersSquare: { style: "extra-rounded", color: "#7c3aed" },
        cornersDot: { style: "dot", color: "#db2777" },
        background: { color: "#ffffff", transparent: false },
      },
      frame: { style: "ticket", text: "ENTRADA", color: "#7c3aed" },
    },
  },
  {
    id: "realestate",
    category: "industry",
    payload: { type: "url", url: "https://qrapi.dev/inmueble" },
    config: {
      ...base,
      ecLevel: "Q",
      style: {
        dots: { style: "classy", color: "#0f766e", gradient: GRADIENT_PRESETS.mint },
        cornersSquare: { style: "rounded", color: "#0f766e" },
        cornersDot: { style: "dot", color: "#0d9488" },
        background: { color: "#ffffff", transparent: false },
      },
      frame: { style: "elegant", text: "VER PROPIEDAD", color: "#0f766e" },
    },
  },
  {
    id: "retail",
    category: "industry",
    payload: { type: "url", url: "https://qrapi.dev/tienda" },
    config: {
      ...base,
      ecLevel: "Q",
      style: {
        dots: { style: "rounded", color: "#db2777", gradient: GRADIENT_PRESETS.purple },
        cornersSquare: { style: "extra-rounded", color: "#db2777" },
        cornersDot: { style: "dot", color: "#7c3aed" },
        background: { color: "#ffffff", transparent: false },
      },
      frame: { style: "badge", text: "-20% DESCUENTO", color: "#db2777" },
    },
  },
  {
    id: "hotel",
    category: "industry",
    payload: { type: "wifi", ssid: "Hotel Guest", password: "bienvenido", security: "WPA", hidden: false },
    config: {
      ...base,
      ecLevel: "Q",
      style: {
        dots: { style: "extra-rounded", color: "#1d4ed8", gradient: GRADIENT_PRESETS.ocean },
        cornersSquare: { style: "extra-rounded", color: "#1d4ed8" },
        cornersDot: { style: "dot", color: "#0891b2" },
        background: { color: "#ffffff", transparent: false },
      },
      frame: { style: "classic", text: "WIFI HOTEL", color: "#1d4ed8" },
    },
  },
  {
    id: "gym",
    category: "industry",
    payload: { type: "url", url: "https://qrapi.dev/clases" },
    config: {
      ...base,
      ecLevel: "H",
      style: {
        dots: { style: "diamond", color: "#22d3ee", gradient: GRADIENT_PRESETS.neon },
        cornersSquare: { style: "rounded", color: "#818cf8" },
        cornersDot: { style: "dot", color: "#22d3ee" },
        background: { color: "#09090b", transparent: false },
      },
      frame: { style: "neon", text: "RESERVA CLASE", color: "#22d3ee" },
      effects: { ...base.effects, glow: true },
    },
  },
];

/**
 * Plantillas normalizadas por el schema: cada `config` pasa por
 * `qrConfigSchema.parse` para que los defaults se apliquen y el objeto que
 * `applyTemplate` clona al store esté completo.
 */
export const TEMPLATES: QrTemplate[] = TEMPLATE_DEFS.map((def) => ({
  ...def,
  config: qrConfigSchema.parse(def.config),
}));
