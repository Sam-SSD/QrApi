import type { Metadata } from "next";
import { headers } from "next/headers";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { qrConfigSchema, payloadSchema } from "@/lib/qr/schema";
import { payloadToFields, type QrSnapshot } from "@/stores/qr-store";
import { QrEditor, type EditingQr } from "@/components/editor/qr-editor";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "editor" });
  return {
    title: t("title"),
    description: t("subtitle"),
  };
}

/** Carga un QR guardado del usuario como snapshot editable (o null). */
async function loadEditable(
  id: string,
): Promise<{ snapshot: QrSnapshot; editing: EditingQr } | null> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;

  const row = await prisma.qrCode.findUnique({
    where: { id, userId: session.user.id }, // ownership
  });
  if (!row) return null;

  const saved = row.config as {
    dynamic?: boolean;
    payload?: unknown;
    config?: unknown;
  } | null;
  const config = qrConfigSchema.safeParse(saved?.config ?? {});
  if (!config.success) return null;

  const isDynamic = Boolean(row.dynamicQrId);
  if (isDynamic) {
    // El contenido de un dinámico es su URL de redirección (fija).
    return {
      snapshot: {
        type: "url",
        fields: { url: { url: row.data } },
        config: config.data,
      },
      editing: { id: row.id, name: row.name, dynamic: true },
    };
  }

  const payload = payloadSchema.safeParse(saved?.payload);
  if (!payload.success) return null;
  return {
    snapshot: {
      type: payload.data.type,
      fields: payloadToFields(payload.data),
      config: config.data,
    },
    editing: { id: row.id, name: row.name, dynamic: false },
  };
}

export default async function GeneratorPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ preset?: string; edit?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { preset, edit } = await searchParams;

  const editable = edit ? await loadEditable(edit) : null;

  return (
    <QrEditor
      initialTemplateId={editable ? undefined : preset}
      initialSnapshot={editable?.snapshot}
      editing={editable?.editing}
    />
  );
}
