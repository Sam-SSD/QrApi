import { useTranslations } from "next-intl";
import { GithubIcon } from "@/components/brand/github-icon";
import { GITHUB_URL } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Reveal } from "./reveal";

export function OpenSourceCta() {
  const t = useTranslations("landing.openSource");

  return (
    <section className="mx-auto max-w-7xl px-4 pb-28 sm:px-6">
      <Reveal>
        <div className="glass flex flex-col items-center gap-6 rounded-2xl px-6 py-14 text-center">
          <h2 className="text-3xl font-semibold tracking-[-0.02em] text-balance md:text-4xl">
            {t("title")}
          </h2>
          <p className="max-w-xl text-muted-foreground">{t("subtitle")}</p>
          <code className="rounded-lg border border-line bg-canvas-subtle px-4 py-2 font-mono text-sm text-muted-foreground">
            {t("selfHost")}
          </code>
          <Button size="lg" asChild>
            <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
              <GithubIcon className="size-5" />
              {t("cta")}
            </a>
          </Button>
        </div>
      </Reveal>
    </section>
  );
}
