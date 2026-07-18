import { useTranslations } from "next-intl";
import { ArrowRight, Braces } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Reveal } from "./reveal";

export function FinalCta() {
  const t = useTranslations("landing.finalCta");

  return (
    <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 sm:pb-28">
      <Reveal>
        <div className="flex flex-col items-center gap-6 rounded-2xl px-6 py-14 text-center glass">
          <h2 className="text-3xl font-semibold tracking-[-0.02em] text-balance md:text-4xl">
            {t("title")}
          </h2>
          <p className="max-w-xl text-muted-foreground">{t("subtitle")}</p>
          <div className="flex w-full flex-col justify-center gap-3 sm:w-auto sm:flex-row sm:items-center">
            <Button size="lg" className="w-full sm:w-auto" asChild>
              <Link href="/generator">
                {t("ctaPrimary")}
                <ArrowRight strokeWidth={1.75} />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto"
              asChild
            >
              <Link href="/docs/api">
                <Braces strokeWidth={1.75} />
                {t("ctaSecondary")}
              </Link>
            </Button>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
