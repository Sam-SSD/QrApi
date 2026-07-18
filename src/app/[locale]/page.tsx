import { setRequestLocale, getTranslations } from "next-intl/server";
import { ArrowRight, Braces } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { HeroQr } from "@/components/landing/hero-qr";
import { FeatureGrid } from "@/components/landing/feature-grid";
import { ShowcaseStrip } from "@/components/landing/showcase-strip";
import { DeveloperSection } from "@/components/landing/developer-section";
import { FinalCta } from "@/components/landing/final-cta";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("landing");
  const tCommon = await getTranslations("common");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "QrAPI",
    applicationCategory: "DesignApplication",
    operatingSystem: "Web",
    description: t("heroSubtitle"),
    offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
    featureList: [
      tCommon("tagline"),
      "SVG / PNG / JPG / PDF export",
      "REST API",
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero */}
      <section className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-20 sm:px-6 md:py-28 lg:grid-cols-[1.15fr_1fr]">
        <div className="flex flex-col items-start gap-6">
          <Badge variant="outline" className="gap-1.5 text-muted-foreground">
            {t("badge")}
          </Badge>
          <h1 className="max-w-2xl text-4xl font-semibold tracking-[-0.03em] text-balance md:text-6xl">
            {t("heroTitle")}
          </h1>
          <p className="max-w-xl text-lg text-balance text-muted-foreground">
            {t("heroSubtitle")}
          </p>
          <div className="flex flex-wrap items-center gap-3">
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
        </div>
        <div className="mx-auto w-full max-w-90 lg:max-w-100">
          <div className="rounded-2xl border border-line bg-surface p-6 shadow-raised">
            <HeroQr />
          </div>
        </div>
      </section>

      <FeatureGrid />
      <ShowcaseStrip />
      <DeveloperSection />
      <FinalCta />
    </>
  );
}
