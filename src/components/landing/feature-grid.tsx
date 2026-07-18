import { useTranslations } from "next-intl";
import {
  Braces,
  FileType2,
  History,
  Palette,
  ShieldCheck,
  Shapes,
} from "lucide-react";
import { Reveal } from "./reveal";

const FEATURES = [
  { key: "customization", icon: Palette },
  { key: "types", icon: Shapes },
  { key: "vector", icon: FileType2 },
  { key: "history", icon: History },
  { key: "api", icon: Braces },
  { key: "privacy", icon: ShieldCheck },
] as const;

export function FeatureGrid() {
  const t = useTranslations("landing.features");

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24">
      <Reveal className="mx-auto mb-10 max-w-2xl text-center sm:mb-14">
        <h2 className="text-3xl font-semibold tracking-[-0.02em] text-balance md:text-4xl">
          {t("title")}
        </h2>
        <p className="mt-3 text-muted-foreground">{t("subtitle")}</p>
      </Reveal>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map(({ key, icon: Icon }, index) => (
          <Reveal key={key} delay={index * 60}>
            <div className="group h-full rounded-xl border border-line bg-surface p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-line-strong hover:shadow-raised">
              <div className="mb-4 flex size-10 items-center justify-center rounded-lg bg-brand-soft text-primary">
                <Icon className="size-5" strokeWidth={1.75} />
              </div>
              <h3 className="mb-1.5 font-semibold">{t(`${key}.title`)}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {t(`${key}.description`)}
              </p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
