import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { MailCheck, CheckCircle2 } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "auth.verifyEmail" });
  return { title: t("title") };
}

export default async function VerifyEmailPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ email?: string; verified?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { email, verified } = await searchParams;
  const t = await getTranslations("auth.verifyEmail");
  const isVerified = verified === "true";

  return (
    <div className="flex min-h-[calc(100dvh-8rem)] items-center justify-center px-4 py-16">
      <div className="flex w-full max-w-sm flex-col items-center gap-6 text-center">
        <div className="flex size-16 items-center justify-center rounded-2xl bg-brand-soft text-primary">
          {isVerified ? (
            <CheckCircle2 strokeWidth={1.75} className="size-8" />
          ) : (
            <MailCheck strokeWidth={1.75} className="size-8" />
          )}
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {isVerified ? t("verifiedTitle") : t("title")}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {isVerified
              ? t("verifiedDescription")
              : email
                ? t("description", { email })
                : t("descriptionGeneric")}
          </p>
        </div>
        {isVerified && (
          <Button asChild>
            <Link href="/dashboard">{t("goDashboard")}</Link>
          </Button>
        )}
      </div>
    </div>
  );
}
