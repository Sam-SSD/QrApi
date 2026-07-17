import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { renderQrSvg } from "@/lib/qr/render-svg";
import { qrConfigSchema } from "@/lib/qr/schema";
import { Reveal } from "./reveal";

const CURL_EXAMPLE = `curl "https://tu-dominio.com/api/v1/qr" \\
  -H "Authorization: Bearer qra_TU_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "data": "https://qrapi.dev",
    "format": "png",
    "size": 512,
    "style": {
      "dots": {
        "style": "rounded",
        "gradient": {
          "type": "linear",
          "rotation": 45,
          "stops": [
            { "offset": 0, "color": "#818cf8" },
            { "offset": 1, "color": "#22d3ee" }
          ]
        }
      }
    }
  }' -o qr.png`;

export function DeveloperSection() {
  const t = useTranslations("landing.developer");

  const resultSvg = renderQrSvg(
    "https://qrapi.dev",
    qrConfigSchema.parse({
      style: {
        dots: {
          style: "rounded",
          color: "#818cf8",
          gradient: {
            type: "linear",
            rotation: 45,
            stops: [
              { offset: 0, color: "#818cf8" },
              { offset: 1, color: "#22d3ee" },
            ],
          },
        },
        cornersSquare: { style: "extra-rounded", color: "#818cf8" },
        cornersDot: { style: "dot", color: "#22d3ee" },
      },
    }),
  );

  return (
    <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
      <div className="grid items-center gap-10 lg:grid-cols-[1.2fr_1fr]">
        <Reveal>
          <h2 className="text-3xl font-semibold tracking-[-0.02em] text-balance md:text-4xl">
            {t("title")}
          </h2>
          <p className="mt-3 max-w-lg text-muted-foreground">{t("subtitle")}</p>
          <Button className="mt-6" asChild>
            <Link href="/docs/api">
              {t("cta")}
              <ArrowRight strokeWidth={1.75} />
            </Link>
          </Button>
        </Reveal>
        <Reveal delay={100}>
          <div className="relative">
            <pre className="overflow-x-auto rounded-xl border border-line bg-canvas-subtle p-5 font-mono text-xs leading-relaxed text-muted-foreground shadow-raised">
              <code>{CURL_EXAMPLE}</code>
            </pre>
            <div
              aria-hidden="true"
              className="absolute -right-4 -bottom-6 w-28 rotate-6 overflow-hidden rounded-lg border border-line shadow-raised md:w-36 [&_svg]:block [&_svg]:h-auto [&_svg]:w-full"
              dangerouslySetInnerHTML={{ __html: resultSvg }}
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
