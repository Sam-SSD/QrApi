"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const t = useTranslations("nav");

  // CSS picks the icon from the html.dark class, so SSR needs no mounted flag.
  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={t("toggleTheme")}
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
    >
      <Sun strokeWidth={1.75} className="hidden size-5 dark:block" />
      <Moon strokeWidth={1.75} className="size-5 dark:hidden" />
    </Button>
  );
}
