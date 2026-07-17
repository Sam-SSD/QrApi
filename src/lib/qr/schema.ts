import { z } from "zod";

/**
 * Contrato único del motor QR: estos schemas validan el estado del editor,
 * el JSON guardado en QrCode.config y el body de la API pública.
 */

export const hexColor = z
  .string()
  .regex(/^#[0-9a-fA-F]{6}([0-9a-fA-F]{2})?$/, "Color hex inválido");

// ---------- Payloads ----------

export const MAX_QR_DATA_LENGTH = 2953; // capacidad QR v40-L en bytes

export const payloadSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("text"),
    text: z.string().min(1).max(MAX_QR_DATA_LENGTH),
  }),
  z.object({
    type: z.literal("url"),
    url: z.string().url().max(MAX_QR_DATA_LENGTH),
  }),
  z.object({
    type: z.literal("email"),
    to: z.string().email(),
    subject: z.string().max(200).optional(),
    body: z.string().max(1000).optional(),
  }),
  z.object({
    type: z.literal("phone"),
    number: z.string().regex(/^\+?[0-9\s\-().]{3,20}$/, "Teléfono inválido"),
  }),
  z.object({
    type: z.literal("sms"),
    number: z.string().regex(/^\+?[0-9\s\-().]{3,20}$/, "Teléfono inválido"),
    message: z.string().max(500).optional(),
  }),
  z.object({
    type: z.literal("wifi"),
    ssid: z.string().min(1).max(32),
    password: z.string().max(63).optional(),
    security: z.enum(["WPA", "WEP", "nopass"]).default("WPA"),
    hidden: z.boolean().default(false),
  }),
  z.object({
    type: z.literal("vcard"),
    firstName: z.string().min(1).max(80),
    lastName: z.string().max(80).optional(),
    organization: z.string().max(120).optional(),
    title: z.string().max(120).optional(),
    phone: z.string().max(30).optional(),
    email: z.string().email().optional(),
    website: z.string().url().optional(),
    address: z.string().max(200).optional(),
  }),
  z.object({
    type: z.literal("crypto"),
    currency: z.enum(["bitcoin", "ethereum"]).default("bitcoin"),
    address: z.string().min(20).max(120),
    amount: z.number().positive().optional(),
  }),
]);

export type QrPayload = z.infer<typeof payloadSchema>;
export type QrPayloadType = QrPayload["type"];

export const PAYLOAD_TYPES = [
  "text",
  "url",
  "email",
  "phone",
  "sms",
  "wifi",
  "vcard",
  "crypto",
] as const satisfies readonly QrPayloadType[];

// ---------- Estilo ----------

export const gradientSchema = z.object({
  type: z.enum(["linear", "radial"]).default("linear"),
  rotation: z.number().min(0).max(360).default(45),
  stops: z
    .array(
      z.object({
        offset: z.number().min(0).max(1),
        color: hexColor,
      }),
    )
    .min(2)
    .max(4),
});

export type QrGradient = z.infer<typeof gradientSchema>;

export const DOT_STYLES = [
  "square",
  "dots",
  "rounded",
  "classy",
  "extra-rounded",
  "vertical-line",
  "horizontal-line",
  "star",
  "plus",
  "diamond",
] as const;
export const CORNER_SQUARE_STYLES = [
  "square",
  "rounded",
  "extra-rounded",
  "outpoint",
  "inpoint",
  "classy",
] as const;
export const CORNER_DOT_STYLES = [
  "square",
  "dot",
  "rounded",
  "diamond",
] as const;
export const FRAME_STYLES = [
  "modern",
  "classic",
  "neon",
  "minimal",
  "elegant",
  "speech-bubble",
  "badge",
  "ticket",
  "scanner-brackets",
  "banner-top",
] as const;
export const FRAME_POSITIONS = ["bottom", "top"] as const;
export const EC_LEVELS = ["L", "M", "Q", "H"] as const;

export const qrStyleSchema = z.object({
  dots: z
    .object({
      style: z.enum(DOT_STYLES).default("square"),
      color: hexColor.default("#18181b"),
      gradient: gradientSchema.optional(),
    })
    .default({ style: "square", color: "#18181b" }),
  cornersSquare: z
    .object({
      style: z.enum(CORNER_SQUARE_STYLES).default("square"),
      color: hexColor.optional(), // por defecto hereda dots.color
      gradient: gradientSchema.optional(),
    })
    .default({ style: "square" }),
  cornersDot: z
    .object({
      style: z.enum(CORNER_DOT_STYLES).default("square"),
      color: hexColor.optional(),
      gradient: gradientSchema.optional(),
    })
    .default({ style: "square" }),
  background: z
    .object({
      color: hexColor.default("#ffffff"),
      transparent: z.boolean().default(false),
      gradient: gradientSchema.optional(),
      // Imagen de fondo detrás del QR. Segura por defecto: scrim tenue +
      // placa opaca bajo el QR; el motor fuerza ecLevel=H cuando existe.
      // Excluye svg+xml a propósito (un SVG de fondo podría llevar <script>).
      image: z
        .object({
          dataUri: z
            .string()
            .regex(
              /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/,
              "La imagen de fondo debe ser un data URI base64 (png, jpeg o webp)",
            )
            .max(700_000),
          opacity: z.number().min(0.05).max(1).default(0.35),
          // Tinte de las placas de finder: tono muestreado de la imagen al
          // subirla (cliente) pero aclarado para conservar contraste con los
          // módulos. Si falta (plantillas/API), la placa cae a blanco.
          tint: hexColor.optional(),
        })
        .optional(),
    })
    .prefault({ color: "#ffffff", transparent: false }),
});

export type QrStyle = z.infer<typeof qrStyleSchema>;

export const logoSchema = z.object({
  dataUri: z
    .string()
    .regex(
      /^data:image\/(png|jpeg|svg\+xml|webp);base64,[A-Za-z0-9+/=]+$/,
      "El logo debe ser un data URI base64 (png, jpeg, svg o webp)",
    )
    .max(700_000), // ~500KB binario en base64
  sizeRatio: z.number().min(0.1).max(0.35).default(0.22),
  margin: z.number().min(0).max(4).default(1), // módulos excavados alrededor
  background: z.boolean().default(true),
});

export type QrLogo = z.infer<typeof logoSchema>;

export const frameSchema = z.object({
  style: z.enum(FRAME_STYLES).default("modern"),
  text: z.string().max(30).default("ESCANÉAME"),
  color: hexColor.default("#4f46e5"),
  textColor: hexColor.optional(), // por defecto contraste automático
  position: z.enum(FRAME_POSITIONS).default("bottom"),
});

export type QrFrame = z.infer<typeof frameSchema>;

export const effectsSchema = z.object({
  invert: z.boolean().default(false),
  glow: z.boolean().default(false),
  opacity: z.number().min(0.1).max(1).default(1),
});

export type QrEffects = z.infer<typeof effectsSchema>;

// ---------- Config completa ----------

export const qrConfigSchema = z.object({
  ecLevel: z.enum(EC_LEVELS).default("M"),
  margin: z.number().int().min(0).max(10).default(2), // quiet zone en módulos
  style: qrStyleSchema.prefault({}),
  logo: logoSchema.optional(),
  frame: frameSchema.optional(),
  effects: effectsSchema.default({ invert: false, glow: false, opacity: 1 }),
});

export type QrConfig = z.infer<typeof qrConfigSchema>;

export const DEFAULT_QR_CONFIG: QrConfig = qrConfigSchema.parse({});
