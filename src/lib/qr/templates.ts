import type { QrConfig, QrGradient, QrPayload } from "./schema";
import { DEFAULT_QR_CONFIG } from "./schema";

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

export type QrTemplateCategory = "brand" | "dark" | "business" | "marketing";

export interface QrTemplate {
  id: string;
  category: QrTemplateCategory;
  payload: QrPayload;
  config: QrConfig;
}

export const TEMPLATE_CATEGORIES: QrTemplateCategory[] = [
  "brand",
  "dark",
  "business",
  "marketing",
];

const base = DEFAULT_QR_CONFIG;

/** Plantillas aplicables con un clic desde la galería, agrupadas por categoría. */
export const TEMPLATES: QrTemplate[] = [
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
];
