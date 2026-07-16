import { setRequestLocale, getTranslations } from "next-intl/server";
import { ArrowRight, Braces } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("landing");

  return (
    <section className="mx-auto flex max-w-7xl flex-col items-center gap-8 px-4 py-24 text-center sm:px-6 md:py-32">
      <Badge variant="outline" className="gap-1.5 text-muted-foreground">
        {t("badge")}
      </Badge>
      <h1 className="max-w-3xl text-4xl font-semibold tracking-[-0.03em] text-balance md:text-6xl">
        {t("heroTitle")}
      </h1>
      <p className="max-w-xl text-lg text-muted-foreground text-balance">
        {t("heroSubtitle")}
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button size="lg" asChild>
          <Link href="/generator">
            {t("ctaPrimary")}
            <ArrowRight strokeWidth={1.75} />
          </Link>
        </Button>
        <Button size="lg" variant="outline" asChild>
          <Link href="/docs/api">
            <Braces strokeWidth={1.75} />
            {t("ctaSecondary")}
          </Link>
        </Button>
      </div>
    </section>
  );
}
