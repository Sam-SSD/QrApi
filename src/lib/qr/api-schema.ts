import { z } from "zod";
import { MAX_QR_DATA_LENGTH, payloadSchema, qrConfigSchema } from "./schema";

// Body/format schemas of the public POST /api/v1/qr endpoint, extracted from
// the route file so the snippet builder and tests can validate against them
// (Next.js forbids extra exports from route files).

export const MAX_BODY_BYTES = 1_000_000;

export const formatSchema = z
  .enum(["png", "svg", "jpeg", "jpg"])
  .default("png")
  .transform((f) => (f === "jpg" ? "jpeg" : f));

export const sizeSchema = z.coerce
  .number()
  .int()
  .min(64)
  .max(2048)
  .default(512);

export const postBodySchema = z
  .object({
    data: z.string().min(1).max(MAX_QR_DATA_LENGTH).optional(),
    payload: payloadSchema.optional(),
    format: formatSchema,
    size: sizeSchema,
    ecLevel: qrConfigSchema.shape.ecLevel,
    margin: qrConfigSchema.shape.margin,
    style: qrConfigSchema.shape.style,
    logo: qrConfigSchema.shape.logo,
    frame: qrConfigSchema.shape.frame,
    effects: qrConfigSchema.shape.effects,
  })
  .refine((body) => Boolean(body.data) !== Boolean(body.payload), {
    message: "Provide exactly one of `data` or `payload`",
    path: ["data"],
  });
