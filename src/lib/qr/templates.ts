import { z } from "zod";
import type { QrConfig, QrGradient, QrPayload } from "./schema";
import { DEFAULT_QR_CONFIG, qrConfigSchema } from "./schema";

/**
 * Gradient presets for the style picker.
 * Contrast rule: on a white background no stop lighter than #0891b2;
 * light tones (#818cf8, #22d3ee) are reserved for dark backgrounds.
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
  "brand" | "dark" | "business" | "marketing" | "industry";

export interface QrTemplate {
  id: string;
  category: QrTemplateCategory;
  payload: QrPayload;
  config: QrConfig;
}

/**
 * Shape of a template as declared: `config` accepts the schema INPUT, so
 * defaults (frame.position/icon, etc.) are optional when writing a template
 * and get applied on normalization. Adding a new default to the schema
 * therefore does not require touching every template.
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
 * Sample background image (96×96 sunset scene: gradient sky, sun and
 * mountains) for the template that shows a photo behind the QR. PNG (not
 * SVG: the schema rejects svg+xml), ~1.7 KB. Generated and verified by
 * script — NEVER transcribe the base64 by hand (a corrupt byte renders the
 * image half-broken in the browser). The pale tint matches the finder plates.
 */
const SAMPLE_BG_SUNSET =
  "data:image/png;base64,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";

const base = DEFAULT_QR_CONFIG;

/** Unnormalized declarations; parsed through the schema in TEMPLATES. */
const TEMPLATE_DEFS: QrTemplateInput[] = [
  // ─ brand: the site's indigo→cyan identity ─
  {
    id: "qrapi",
    category: "brand",
    payload: { type: "url", url: "https://qrapi.dev" },
    config: {
      ...base,
      ecLevel: "Q",
      style: {
        dots: {
          style: "rounded",
          color: "#4f46e5",
          gradient: GRADIENT_PRESETS.brand,
        },
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
        dots: {
          style: "extra-rounded",
          color: "#4f46e5",
          gradient: GRADIENT_PRESETS.aurora,
        },
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
  // ─ dark: for screens and dark environments ─
  {
    id: "neon",
    category: "dark",
    payload: { type: "url", url: "https://qrapi.dev/neon" },
    config: {
      ...base,
      ecLevel: "H",
      style: {
        dots: {
          style: "dots",
          color: "#22d3ee",
          gradient: GRADIENT_PRESETS.neon,
        },
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
        dots: {
          style: "rounded",
          color: "#0e7490",
          gradient: GRADIENT_PRESETS.ocean,
        },
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
        dots: {
          style: "extra-rounded",
          color: "#10b981",
          gradient: GRADIENT_PRESETS.mint,
        },
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
        dots: {
          style: "square",
          color: "#b45309",
          gradient: GRADIENT_PRESETS.fire,
        },
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
        dots: {
          style: "dots",
          color: "#7c3aed",
          gradient: GRADIENT_PRESETS.purple,
        },
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
        dots: {
          style: "rounded",
          color: "#ea580c",
          gradient: GRADIENT_PRESETS.sunset,
        },
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
        dots: {
          style: "rounded",
          color: "#6366f1",
          gradient: GRADIENT_PRESETS.cyber,
        },
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
  // ─ marketing: background image + corner gradient (newer features) ─
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
          image: { dataUri: SAMPLE_BG_SUNSET, opacity: 0.4, tint: "#f0dbea" },
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
        dots: {
          style: "extra-rounded",
          color: "#4f46e5",
          gradient: GRADIENT_PRESETS.aurora,
        },
        cornersSquare: {
          style: "extra-rounded",
          gradient: GRADIENT_PRESETS.brand,
        },
        cornersDot: { style: "dot", gradient: GRADIENT_PRESETS.brand },
        background: { color: "#f5f3ff", transparent: false },
      },
    },
  },
  // ─ industry: one-click presets per sector ─
  {
    id: "restaurant",
    category: "industry",
    payload: { type: "url", url: "https://qrapi.dev/menu" },
    config: {
      ...base,
      ecLevel: "Q",
      style: {
        dots: {
          style: "rounded",
          color: "#b45309",
          gradient: GRADIENT_PRESETS.fire,
        },
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
        dots: {
          style: "extra-rounded",
          color: "#7c3aed",
          gradient: GRADIENT_PRESETS.purple,
        },
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
        dots: {
          style: "classy",
          color: "#0f766e",
          gradient: GRADIENT_PRESETS.mint,
        },
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
        dots: {
          style: "rounded",
          color: "#db2777",
          gradient: GRADIENT_PRESETS.purple,
        },
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
    payload: {
      type: "wifi",
      ssid: "Hotel Guest",
      password: "bienvenido",
      security: "WPA",
      hidden: false,
    },
    config: {
      ...base,
      ecLevel: "Q",
      style: {
        dots: {
          style: "extra-rounded",
          color: "#1d4ed8",
          gradient: GRADIENT_PRESETS.ocean,
        },
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
        dots: {
          style: "diamond",
          color: "#22d3ee",
          gradient: GRADIENT_PRESETS.neon,
        },
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
 * Templates normalized by the schema: each `config` goes through
 * `qrConfigSchema.parse` so defaults are applied and the object that
 * `applyTemplate` clones into the store is complete.
 */
export const TEMPLATES: QrTemplate[] = TEMPLATE_DEFS.map((def) => ({
  ...def,
  config: qrConfigSchema.parse(def.config),
}));
