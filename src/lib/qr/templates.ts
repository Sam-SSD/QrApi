import type { QrConfig, QrGradient, QrPayload } from "./schema";
import { DEFAULT_QR_CONFIG } from "./schema";

/** Presets de gradiente (herederos de los del QrAPI original). */
export const GRADIENT_PRESETS: Record<string, QrGradient> = {
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

export interface QrTemplate {
  id: string;
  payload: QrPayload;
  config: QrConfig;
}

const base = DEFAULT_QR_CONFIG;

/** Plantillas aplicables con un clic desde la galería. */
export const TEMPLATES: QrTemplate[] = [
  {
    id: "business",
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
        cornersDot: { style: "dot", color: "#4f46e5" },
        background: { color: "#ffffff", transparent: false },
      },
    },
  },
  {
    id: "wifi",
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
        cornersDot: { style: "dot", color: "#1d4ed8" },
        background: { color: "#ffffff", transparent: false },
      },
      frame: {
        style: "modern",
        text: "WIFI GRATIS",
        color: "#1d4ed8",
      },
    },
  },
  {
    id: "social",
    payload: { type: "url", url: "https://www.linkedin.com/in/tu-perfil" },
    config: {
      ...base,
      style: {
        dots: { style: "dots", color: "#7c3aed", gradient: GRADIENT_PRESETS.purple },
        cornersSquare: { style: "extra-rounded", color: "#7c3aed" },
        cornersDot: { style: "dot", color: "#ec4899" },
        background: { color: "#ffffff", transparent: false },
      },
    },
  },
  {
    id: "payment",
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
  {
    id: "event",
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
    id: "email",
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
        cornersDot: { style: "dot", color: "#22d3ee" },
        background: { color: "#ffffff", transparent: false },
      },
    },
  },
];
