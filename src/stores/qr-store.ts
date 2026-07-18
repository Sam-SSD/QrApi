import { create } from "zustand";
import {
  DEFAULT_QR_CONFIG,
  payloadSchema,
  type QrConfig,
  type QrFrame,
  type QrGradient,
  type QrLogo,
  type QrPayload,
  type QrPayloadType,
} from "@/lib/qr/schema";
import { buildPayload } from "@/lib/qr/payloads";
import type { QrTemplate } from "@/lib/qr/templates";

type QrBgImage = NonNullable<QrConfig["style"]["background"]["image"]>;

// ---------- Campos por tipo ----------

export interface FieldsMap {
  text: { text: string };
  url: { url: string };
  email: { to: string; subject: string; body: string };
  phone: { number: string };
  sms: { number: string; message: string };
  wifi: {
    ssid: string;
    password: string;
    security: "WPA" | "WEP" | "nopass";
    hidden: boolean;
  };
  vcard: {
    firstName: string;
    lastName: string;
    organization: string;
    title: string;
    phone: string;
    email: string;
    website: string;
    address: string;
  };
  crypto: { currency: "bitcoin" | "ethereum"; address: string; amount: string };
}

export const DEFAULT_FIELDS: FieldsMap = {
  text: { text: "" },
  url: { url: "" },
  email: { to: "", subject: "", body: "" },
  phone: { number: "" },
  sms: { number: "", message: "" },
  wifi: { ssid: "", password: "", security: "WPA", hidden: false },
  vcard: {
    firstName: "",
    lastName: "",
    organization: "",
    title: "",
    phone: "",
    email: "",
    website: "",
    address: "",
  },
  crypto: { currency: "bitcoin", address: "", amount: "" },
};

/** Convierte los campos del formulario en un candidato de payload (sin vacíos). */
function fieldsToPayloadInput(
  type: QrPayloadType,
  fields: FieldsMap,
): Record<string, unknown> {
  const raw = fields[type] as Record<string, unknown>;
  const cleaned: Record<string, unknown> = { type };
  for (const [key, value] of Object.entries(raw)) {
    if (typeof value === "string" && value.trim() === "") continue;
    cleaned[key] = value;
  }
  if (type === "crypto" && typeof cleaned.amount === "string") {
    const n = Number(cleaned.amount);
    if (Number.isFinite(n) && n > 0) cleaned.amount = n;
    else delete cleaned.amount;
  }
  return cleaned;
}

/**
 * Inverso de fieldsToPayloadInput: reconstruye los campos del formulario a
 * partir de un payload guardado (para editar un QR de la cuenta). Los campos
 * ausentes en el payload conservan su default.
 */
export function payloadToFields(payload: QrPayload): Partial<FieldsMap> {
  const { type, ...rest } = payload;
  const base = structuredClone(DEFAULT_FIELDS[type]) as Record<string, unknown>;
  for (const [key, value] of Object.entries(rest)) {
    if (!(key in base)) continue;
    // crypto.amount es number en el payload pero string en el formulario
    base[key] = typeof value === "number" ? String(value) : value;
  }
  return { [type]: base } as Partial<FieldsMap>;
}

export interface PayloadResult {
  /** Cadena final a codificar, o null si el formulario está vacío/inválido. */
  data: string | null;
  payload: QrPayload | null;
  /** true si el usuario aún no ha escrito nada significativo. */
  empty: boolean;
  /** Errores por campo (clave = nombre de campo). */
  issues: Record<string, string>;
}

export function computePayload(
  type: QrPayloadType,
  fields: FieldsMap,
): PayloadResult {
  const input = fieldsToPayloadInput(type, fields);
  const empty = Object.keys(input).length <= 1; // solo "type"
  if (empty) {
    return { data: null, payload: null, empty: true, issues: {} };
  }
  const parsed = payloadSchema.safeParse(input);
  if (!parsed.success) {
    const issues: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "");
      if (key && !issues[key]) issues[key] = issue.message;
    }
    return { data: null, payload: null, empty: false, issues };
  }
  return {
    data: buildPayload(parsed.data),
    payload: parsed.data,
    empty: false,
    issues: {},
  };
}

// ---------- Store ----------

export interface QrSnapshot {
  type: QrPayloadType;
  fields: Partial<FieldsMap>;
  config: QrConfig;
}

interface QrEditorState {
  type: QrPayloadType;
  fields: FieldsMap;
  config: QrConfig;

  setType: (type: QrPayloadType) => void;
  setField: <T extends QrPayloadType>(
    type: T,
    key: keyof FieldsMap[T],
    value: FieldsMap[T][keyof FieldsMap[T]],
  ) => void;
  setDotsStyle: (style: QrConfig["style"]["dots"]["style"]) => void;
  setDotsColor: (color: string) => void;
  setBgColor: (color: string) => void;
  setBgTransparent: (transparent: boolean) => void;
  setGradient: (gradient: QrGradient | undefined) => void;
  setBgGradient: (gradient: QrGradient | undefined) => void;
  setBgImage: (image: QrBgImage | undefined) => void;
  patchBgImage: (patch: Partial<QrBgImage>) => void;
  setCornersSquare: (
    patch: Partial<QrConfig["style"]["cornersSquare"]>,
  ) => void;
  setCornersDot: (patch: Partial<QrConfig["style"]["cornersDot"]>) => void;
  setLogo: (logo: QrLogo | undefined) => void;
  patchLogo: (patch: Partial<QrLogo>) => void;
  setFrame: (frame: QrFrame | undefined) => void;
  patchFrame: (patch: Partial<QrFrame>) => void;
  patchEffects: (patch: Partial<NonNullable<QrConfig["effects"]>>) => void;
  setEcLevel: (level: QrConfig["ecLevel"]) => void;
  setMargin: (margin: number) => void;
  applyTemplate: (template: QrTemplate) => void;
  loadSnapshot: (snapshot: QrSnapshot) => void;
  reset: () => void;
}

export const useQrStore = create<QrEditorState>((set) => ({
  type: "url",
  fields: structuredClone(DEFAULT_FIELDS),
  config: structuredClone(DEFAULT_QR_CONFIG),

  setType: (type) => set({ type }),

  setField: (type, key, value) =>
    set((s) => ({
      fields: { ...s.fields, [type]: { ...s.fields[type], [key]: value } },
    })),

  setDotsStyle: (style) =>
    set((s) => ({
      config: {
        ...s.config,
        style: { ...s.config.style, dots: { ...s.config.style.dots, style } },
      },
    })),

  setDotsColor: (color) =>
    set((s) => ({
      config: {
        ...s.config,
        style: { ...s.config.style, dots: { ...s.config.style.dots, color } },
      },
    })),

  setBgColor: (color) =>
    set((s) => ({
      config: {
        ...s.config,
        style: {
          ...s.config.style,
          background: { ...s.config.style.background, color },
        },
      },
    })),

  setBgTransparent: (transparent) =>
    set((s) => ({
      config: {
        ...s.config,
        style: {
          ...s.config.style,
          background: { ...s.config.style.background, transparent },
        },
      },
    })),

  setGradient: (gradient) =>
    set((s) => ({
      config: {
        ...s.config,
        style: {
          ...s.config.style,
          dots: { ...s.config.style.dots, gradient },
        },
      },
    })),

  setBgGradient: (gradient) =>
    set((s) => ({
      config: {
        ...s.config,
        style: {
          ...s.config.style,
          background: { ...s.config.style.background, gradient },
        },
      },
    })),

  setBgImage: (image) =>
    set((s) => ({
      config: {
        ...s.config,
        // Al poner imagen de fondo, subir a EC=H para máxima escaneabilidad
        // (espejo del auto-bump del logo); el render también lo fuerza.
        ecLevel: image && s.config.ecLevel !== "H" ? "H" : s.config.ecLevel,
        style: {
          ...s.config.style,
          background: { ...s.config.style.background, image },
        },
      },
    })),

  patchBgImage: (patch) =>
    set((s) =>
      s.config.style.background.image
        ? {
            config: {
              ...s.config,
              style: {
                ...s.config.style,
                background: {
                  ...s.config.style.background,
                  image: { ...s.config.style.background.image, ...patch },
                },
              },
            },
          }
        : s,
    ),

  setCornersSquare: (patch) =>
    set((s) => ({
      config: {
        ...s.config,
        style: {
          ...s.config.style,
          cornersSquare: { ...s.config.style.cornersSquare, ...patch },
        },
      },
    })),

  setCornersDot: (patch) =>
    set((s) => ({
      config: {
        ...s.config,
        style: {
          ...s.config.style,
          cornersDot: { ...s.config.style.cornersDot, ...patch },
        },
      },
    })),

  setLogo: (logo) => set((s) => ({ config: { ...s.config, logo } })),

  patchLogo: (patch) =>
    set((s) =>
      s.config.logo
        ? { config: { ...s.config, logo: { ...s.config.logo, ...patch } } }
        : s,
    ),

  setFrame: (frame) => set((s) => ({ config: { ...s.config, frame } })),

  patchFrame: (patch) =>
    set((s) =>
      s.config.frame
        ? { config: { ...s.config, frame: { ...s.config.frame, ...patch } } }
        : s,
    ),

  patchEffects: (patch) =>
    set((s) => ({
      config: {
        ...s.config,
        effects: {
          ...(s.config.effects ?? { invert: false, glow: false, opacity: 1 }),
          ...patch,
        },
      },
    })),

  setEcLevel: (ecLevel) => set((s) => ({ config: { ...s.config, ecLevel } })),

  setMargin: (margin) => set((s) => ({ config: { ...s.config, margin } })),

  applyTemplate: (template) =>
    set((s) => {
      const { type, ...payloadFields } = template.payload;
      return {
        type,
        fields: {
          ...s.fields,
          [type]: { ...DEFAULT_FIELDS[type], ...payloadFields },
        },
        config: structuredClone(template.config),
      };
    }),

  loadSnapshot: (snapshot) =>
    set(() => ({
      type: snapshot.type,
      fields: {
        ...structuredClone(DEFAULT_FIELDS),
        ...structuredClone(snapshot.fields),
      },
      config: structuredClone(snapshot.config),
    })),

  reset: () =>
    set({
      type: "url",
      fields: structuredClone(DEFAULT_FIELDS),
      config: structuredClone(DEFAULT_QR_CONFIG),
    }),
}));
