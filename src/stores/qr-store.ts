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

// ---------- Fields per type ----------

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

const DEFAULT_FIELDS: FieldsMap = {
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

/** Turns the form fields into a payload candidate (empty values dropped). */
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
 * Inverse of fieldsToPayloadInput: rebuilds the form fields from a saved
 * payload (to edit an account QR). Fields missing from the payload keep
 * their default.
 */
export function payloadToFields(payload: QrPayload): Partial<FieldsMap> {
  const { type, ...rest } = payload;
  const base = structuredClone(DEFAULT_FIELDS[type]) as Record<string, unknown>;
  for (const [key, value] of Object.entries(rest)) {
    if (!(key in base)) continue;
    // crypto.amount is a number in the payload but a string in the form
    base[key] = typeof value === "number" ? String(value) : value;
  }
  return { [type]: base } as Partial<FieldsMap>;
}

export interface PayloadResult {
  /** Final string to encode, or null when the form is empty/invalid. */
  data: string | null;
  payload: QrPayload | null;
  /** true while the user hasn't typed anything meaningful yet. */
  empty: boolean;
  /** Per-field errors (key = field name). */
  issues: Record<string, string>;
}

export function computePayload(
  type: QrPayloadType,
  fields: FieldsMap,
): PayloadResult {
  const input = fieldsToPayloadInput(type, fields);
  const empty = Object.keys(input).length <= 1; // only "type"
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

export const useQrStore = create<QrEditorState>((set) => {
  const patchConfig = (patch: Partial<QrConfig>) =>
    set((s) => ({ config: { ...s.config, ...patch } }));

  const patchStyle = <K extends keyof QrConfig["style"]>(
    key: K,
    patch: Partial<QrConfig["style"][K]>,
  ) =>
    set((s) => ({
      config: {
        ...s.config,
        style: {
          ...s.config.style,
          [key]: { ...s.config.style[key], ...patch },
        },
      },
    }));

  return {
    type: "url",
    fields: structuredClone(DEFAULT_FIELDS),
    config: structuredClone(DEFAULT_QR_CONFIG),

    setType: (type) => set({ type }),

    setField: (type, key, value) =>
      set((s) => ({
        fields: { ...s.fields, [type]: { ...s.fields[type], [key]: value } },
      })),

    setDotsStyle: (style) => patchStyle("dots", { style }),
    setDotsColor: (color) => patchStyle("dots", { color }),
    setGradient: (gradient) => patchStyle("dots", { gradient }),
    setBgColor: (color) => patchStyle("background", { color }),
    setBgTransparent: (transparent) =>
      patchStyle("background", { transparent }),
    setBgGradient: (gradient) => patchStyle("background", { gradient }),

    setBgImage: (image) =>
      set((s) => ({
        config: {
          ...s.config,
          // When a background image is set, bump to EC=H for maximum
          // scanability (mirrors the logo auto-bump); the render forces it too.
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

    setCornersSquare: (patch) => patchStyle("cornersSquare", patch),
    setCornersDot: (patch) => patchStyle("cornersDot", patch),

    setLogo: (logo) => patchConfig({ logo }),

    patchLogo: (patch) =>
      set((s) =>
        s.config.logo
          ? { config: { ...s.config, logo: { ...s.config.logo, ...patch } } }
          : s,
      ),

    setFrame: (frame) => patchConfig({ frame }),

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

    setEcLevel: (ecLevel) => patchConfig({ ecLevel }),
    setMargin: (margin) => patchConfig({ margin }),

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
  };
});
