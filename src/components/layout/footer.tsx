import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Logo } from "@/components/brand/logo";
import { GITHUB_URL } from "@/lib/constants";

export function Footer() {
  const t = useTranslations("footer");
  const tNav = useTranslations("nav");

  return (
    <footer className="border-t border-line bg-canvas-subtle">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.5fr_1fr_1fr]">
        <div className="flex flex-col gap-4">
          <Logo />
          <p className="max-w-xs text-sm text-muted-foreground">
            {t("description")}
          </p>
        </div>
        <div>
          <h3 className="mb-3 text-sm font-semibold">{t("product")}</h3>
          <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
            <li>
              <Link
                href="/generator"
                className="transition-colors hover:text-foreground"
              >
                {tNav("generator")}
              </Link>
            </li>
            <li>
              <Link
                href="/dashboard"
                className="transition-colors hover:text-foreground"
              >
                {tNav("dashboard")}
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="mb-3 text-sm font-semibold">{t("developers")}</h3>
          <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
            <li>
              <Link
                href="/docs/api"
                className="transition-colors hover:text-foreground"
              >
                {t("apiDocs")}
              </Link>
            </li>
            <li>
              <a
                href={GITHUB_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-foreground"
              >
                {tNav("github")}
              </a>
            </li>
            <li>
              <a
                href={`${GITHUB_URL}/blob/main/LICENSE`}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-foreground"
              >
                {t("license")}
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-line">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 text-xs text-ink-faint sm:px-6">
          <span>QrAPI · {t("license")}</span>
        </div>
      </div>
    </footer>
  );
}
