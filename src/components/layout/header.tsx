"use client";

import { Menu } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Link, usePathname } from "@/i18n/navigation";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ThemeToggle } from "./theme-toggle";
import { LocaleSwitcher } from "./locale-switcher";
import { UserMenu } from "./user-menu";
import { cn } from "@/lib/utils";

function NavLink({
  href,
  children,
  onClick,
  className,
}: {
  href: string;
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(`${href}/`);
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "text-sm font-medium transition-colors duration-150",
        active
          ? "text-foreground"
          : "text-muted-foreground hover:text-foreground",
        className,
      )}
    >
      {children}
    </Link>
  );
}

export function Header() {
  const t = useTranslations("nav");
  const [open, setOpen] = useState(false);

  const links = [
    { href: "/generator", label: t("generator") },
    { href: "/docs/api", label: t("docs") },
  ];

  return (
    <header className="sticky top-0 z-50 border-x-0 border-t-0 glass">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-8">
          <Link href="/" aria-label="QrAPI">
            <Logo />
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            {links.map((link) => (
              <NavLink key={link.href} href={link.href}>
                {link.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="hidden items-center gap-1 md:flex">
          <ThemeToggle />
          <LocaleSwitcher />
          <div className="ml-2">
            <UserMenu />
          </div>
        </div>

        {/* Mobile */}
        <div className="flex items-center gap-1 md:hidden">
          <ThemeToggle />
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label={t("openMenu")}>
                <Menu strokeWidth={1.75} className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetHeader>
                <SheetTitle>
                  <Logo />
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-4 px-4">
                {links.map((link) => (
                  <NavLink
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="text-base"
                  >
                    {link.label}
                  </NavLink>
                ))}
              </nav>
              <div className="mt-auto flex flex-col gap-2 p-4">
                <div className="flex justify-start">
                  <LocaleSwitcher />
                </div>
                <Button variant="outline" asChild>
                  <Link href="/login" onClick={() => setOpen(false)}>
                    {t("login")}
                  </Link>
                </Button>
                <Button asChild>
                  <Link href="/register" onClick={() => setOpen(false)}>
                    {t("register")}
                  </Link>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
