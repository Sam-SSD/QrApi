import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { QrEditor } from "@/components/editor/qr-editor";

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

export default async function GeneratorPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ preset?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { preset } = await searchParams;

  return <QrEditor initialTemplateId={preset} />;
}
