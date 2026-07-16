import { headers } from "next/headers";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { auth } from "@/lib/auth";
import { redirect } from "@/i18n/navigation";
import { DashboardTabs } from "@/components/dashboard/dashboard-tabs";

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    redirect({ href: "/login", locale });
    return null;
  }

  const t = await getTranslations("dashboard");

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-semibold tracking-tight">
        {t("greeting", { name: session.user.name })}
      </h1>
      <DashboardTabs className="mt-6 mb-8" />
      {children}
    </div>
  );
}
