"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

export function DashboardTabs({ className }: { className?: string }) {
  const t = useTranslations("dashboard.tabs");
  const pathname = usePathname();

  const tabs = [
    { href: "/dashboard", label: t("qrCodes"), exact: true },
    { href: "/dashboard/dynamic", label: t("dynamic"), exact: false },
    { href: "/dashboard/api-keys", label: t("apiKeys"), exact: false },
    { href: "/dashboard/settings", label: t("settings"), exact: false },
  ];

  return (
    <nav
      className={cn("flex gap-6 border-b border-line", className)}
      aria-label="Dashboard"
    >
      {tabs.map((tab) => {
        const active = tab.exact
          ? pathname === tab.href
          : pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "-mb-px border-b-2 pb-2.5 text-sm font-medium transition-colors duration-150",
              active
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
