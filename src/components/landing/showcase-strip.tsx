import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { TEMPLATES } from "@/lib/qr/templates";
import { buildPayload } from "@/lib/qr/payloads";
import { renderQrSvg } from "@/lib/qr/render-svg";
import { Reveal } from "./reveal";

/**
 * Curated sample for the landing: one per family (brand, dark, background
 * photo, industry, business, marketing). The full gallery lives in the editor.
 */
const SHOWCASE_IDS = ["qrapi", "neon", "photo", "restaurant", "wifi", "sunset"];

export function ShowcaseStrip() {
  const t = useTranslations("landing.showcase");
  const tNames = useTranslations("editor.templates.names");

  const previews = SHOWCASE_IDS.map((id) => {
    const template = TEMPLATES.find((tpl) => tpl.id === id);
    if (!template) return null;
    try {
      return {
        id: template.id,
        svg: renderQrSvg(buildPayload(template.payload), template.config),
      };
    } catch {
      return null;
    }
  }).filter(Boolean) as Array<{ id: string; svg: string }>;

  return (
    <section className="border-y border-line bg-canvas-subtle py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal className="mx-auto mb-10 max-w-2xl text-center sm:mb-12">
          <h2 className="text-3xl font-semibold tracking-[-0.02em] text-balance md:text-4xl">
            {t("title")}
          </h2>
          <p className="mt-3 text-muted-foreground">{t("subtitle")}</p>
        </Reveal>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {previews.map(({ id, svg }, index) => (
            <Reveal
              key={id}
              delay={index * 50}
              className={cn("h-full", index % 2 === 0 ? "lg:pb-8" : "lg:pt-8")}
            >
              <Link
                href={`/generator?preset=${id}`}
                aria-label={t("useTemplate", { name: tNames(id) })}
                className="group flex h-full flex-col gap-3 rounded-xl border border-line bg-surface p-3 transition-all duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-raised"
              >
                <span
                  aria-hidden="true"
                  className="flex aspect-square w-full items-center justify-center overflow-hidden rounded-lg [&_svg]:block [&_svg]:h-full [&_svg]:w-full"
                  dangerouslySetInnerHTML={{ __html: svg }}
                />
                <span className="mt-auto text-center text-xs font-medium text-muted-foreground transition-colors group-hover:text-foreground">
                  {tNames(id)}
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
