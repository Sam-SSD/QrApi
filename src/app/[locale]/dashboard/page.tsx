import { headers } from "next/headers";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { auth } from "@/lib/auth";

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("dashboard");
  const session = await auth.api.getSession({ headers: await headers() });

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">
        {t("greeting", { name: session?.user.name ?? "" })}
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">{t("comingSoon")}</p>
    </div>
  );
}
