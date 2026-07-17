import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { KeyRound } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CodeBlock } from "@/components/docs/code-block";
import { DocsNav } from "@/components/docs/docs-nav";
import { ErrorsTable } from "@/components/docs/errors-table";
import { LanguageTabs } from "@/components/docs/language-tabs";
import { ParamsTable, type ParamRow } from "@/components/docs/params-table";
import { SectionHeading } from "@/components/docs/section-heading";
import { StyleSamples } from "@/components/docs/style-samples";
import { TryIt } from "@/components/docs/try-it";
import { SITE_URL } from "@/lib/constants";
import { env } from "@/env";
import {
  DOT_STYLES,
  CORNER_SQUARE_STYLES,
  CORNER_DOT_STYLES,
} from "@/lib/qr/schema";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "docs" });
  return { title: t("title"), description: t("subtitle") };
}

// ---------- Ejemplos de código ----------

const CURL_GET = `curl "${SITE_URL}/api/v1/qr?data=https://ejemplo.com&format=png&size=512&dotsStyle=rounded&dotsColor=%236366f1" \\
  -H "Authorization: Bearer qra_TU_TOKEN" \\
  -o qr.png`;

const CURL_POST = `curl "${SITE_URL}/api/v1/qr" \\
  -H "Authorization: Bearer qra_TU_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "payload": { "type": "wifi", "ssid": "MiRed", "password": "clave123", "security": "WPA" },
    "format": "png",
    "size": 600,
    "ecLevel": "Q",
    "style": {
      "dots": {
        "style": "extra-rounded",
        "gradient": {
          "type": "linear",
          "rotation": 45,
          "stops": [
            { "offset": 0, "color": "#6366f1" },
            { "offset": 1, "color": "#22d3ee" }
          ]
        }
      },
      "cornersSquare": { "style": "extra-rounded", "color": "#4f46e5" },
      "cornersDot": { "style": "dot", "color": "#4f46e5" }
    },
    "frame": { "style": "modern", "text": "WIFI GRATIS", "color": "#4f46e5" }
  }' -o qr.png`;

const JS_EXAMPLE = `const response = await fetch("${SITE_URL}/api/v1/qr", {
  method: "POST",
  headers: {
    Authorization: \`Bearer \${process.env.QRAPI_API_KEY}\`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    payload: { type: "url", url: "https://ejemplo.com" },
    format: "svg",
    style: {
      dots: { style: "rounded", color: "#6366f1" },
    },
  }),
});

if (!response.ok) {
  const { error } = await response.json();
  throw new Error(\`\${error.code}: \${error.message}\`);
}

const svg = await response.text();`;

const PYTHON_EXAMPLE = `import os
import requests

response = requests.post(
    "${SITE_URL}/api/v1/qr",
    headers={"Authorization": f"Bearer {os.environ['QRAPI_API_KEY']}"},
    json={
        # "data" acepta contenido crudo; usa "payload" para tipos estructurados (ver POST)
        "data": "https://ejemplo.com",
        "format": "png",
        "size": 1024,
        "style": {"dots": {"style": "dots", "color": "#18181b"}},
    },
    timeout=10,
)
response.raise_for_status()

with open("qr.png", "wb") as f:
    f.write(response.content)`;

const ERROR_SHAPE = `{
  "error": {
    "code": "invalid_params",
    "message": "Invalid query parameters",
    "details": { "size": ["Number must be less than or equal to 2048"] }
  }
}`;

// ---------- Tablas ----------

const GET_PARAMS: ParamRow[] = [
  { name: "data", type: "string", def: "—", key: "data" },
  { name: "format", type: "png | svg | jpeg", def: "png", key: "format" },
  { name: "size", type: "number", def: "512", key: "size" },
  { name: "ecLevel", type: "L | M | Q | H", def: "M", key: "ecLevel" },
  { name: "margin", type: "number", def: "2", key: "margin" },
  { name: "dotsStyle", type: DOT_STYLES.join(" | "), def: "square", key: "dotsStyle" },
  { name: "dotsColor", type: "hex", def: "#18181b", key: "dotsColor" },
  { name: "bgColor", type: "hex", def: "#ffffff", key: "bgColor" },
  { name: "cornersSquareStyle", type: CORNER_SQUARE_STYLES.join(" | "), def: "square", key: "cornersSquareStyle" },
  { name: "cornersDotStyle", type: CORNER_DOT_STYLES.join(" | "), def: "square", key: "cornersDotStyle" },
  { name: "transparent", type: "boolean", def: "false", key: "transparent" },
];

const POST_PARAMS: ParamRow[] = [
  { name: "data", type: "string", def: "—", key: "data" },
  { name: "payload", type: "object", def: "—", key: "payload" },
  { name: "format", type: "png | svg | jpeg", def: "png", key: "format" },
  { name: "size", type: "number", def: "512", key: "size" },
  { name: "ecLevel", type: "L | M | Q | H", def: "M", key: "ecLevel" },
  { name: "margin", type: "number", def: "2", key: "margin" },
  { name: "style", type: "object", def: "—", key: "style" },
  { name: "logo", type: "object", def: "—", key: "logo" },
  { name: "frame", type: "object", def: "—", key: "frame" },
  { name: "effects", type: "object", def: "—", key: "effects" },
];

const ERRORS: Array<{ status: number; code: string }> = [
  { status: 400, code: "invalid_params" },
  { status: 400, code: "invalid_body" },
  { status: 401, code: "missing_token" },
  { status: 401, code: "invalid_token" },
  { status: 403, code: "revoked_token" },
  { status: 403, code: "expired_token" },
  { status: 413, code: "body_too_large" },
  { status: 415, code: "invalid_json" },
  { status: 422, code: "data_too_long" },
  { status: 429, code: "rate_limited" },
];

// ---------- Página ----------

export default async function ApiDocsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("docs");

  const navItems = [
    "intro",
    "quickstart",
    "auth",
    "generate",
    "params",
    "styles",
    "errors",
    "rateLimits",
    "tryIt",
  ] as const;

  const numberFormat = new Intl.NumberFormat(locale);

  const paramLabels = {
    name: t("params.name"),
    type: t("params.type"),
    def: t("params.default"),
    description: t("params.description"),
  };

  const quickstartSteps = [
    { title: t("quickstart.step1Title"), body: t("quickstart.step1Body") },
    { title: t("quickstart.step2Title"), body: t("quickstart.step2Body") },
    { title: t("quickstart.step3Title"), body: t("quickstart.step3Body") },
  ];

  return (
    <div className="mx-auto grid max-w-7xl gap-x-10 gap-y-6 px-4 py-12 sm:px-6 lg:grid-cols-[220px_1fr]">
      <DocsNav
        items={navItems.map((item) => ({ id: item, label: t(`nav.${item}`) }))}
        ariaLabel={t("title")}
      />

      {/* Contenido */}
      <div className="flex min-w-0 flex-col gap-12">
        <header>
          <h1 className="text-3xl font-semibold tracking-[-0.02em]">
            {t("title")}
          </h1>
          <p className="mt-2 text-muted-foreground">{t("subtitle")}</p>
        </header>

        {/* Introducción */}
        <section className="flex flex-col gap-4">
          <SectionHeading id="intro">{t("nav.intro")}</SectionHeading>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {t("intro.body")}
          </p>
          <div className="flex items-center gap-3">
            <Badge className="bg-success/15 font-mono text-success">GET · POST</Badge>
            <code className="font-mono text-sm">/api/v1/qr</code>
          </div>
        </section>

        {/* Inicio rápido */}
        <section className="flex flex-col gap-4">
          <SectionHeading id="quickstart">{t("nav.quickstart")}</SectionHeading>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {t("quickstart.body")}
          </p>
          <ol className="flex flex-col gap-4">
            {quickstartSteps.map((step, index) => (
              <li key={step.title} className="flex items-start gap-4">
                <span className="bg-gradient-brand flex size-7 shrink-0 items-center justify-center rounded-full font-mono text-sm font-semibold text-white">
                  {index + 1}
                </span>
                <div className="flex min-w-0 flex-col gap-1">
                  <p className="text-sm font-medium">{step.title}</p>
                  <p className="text-sm text-muted-foreground">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* Autenticación */}
        <section className="flex flex-col gap-4">
          <SectionHeading id="auth">{t("nav.auth")}</SectionHeading>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {t("auth.body")}
          </p>
          <CodeBlock
            lang="http"
            label="HTTP"
            code={`Authorization: Bearer qra_TU_TOKEN`}
          />
          <p className="rounded-lg border border-warning/30 bg-warning/5 px-4 py-3 text-xs text-warning">
            {t("auth.warning")}
          </p>
          <Button variant="outline" size="sm" className="self-start" asChild>
            <Link href="/dashboard/api-keys">
              <KeyRound className="size-4" strokeWidth={1.75} />
              {t("auth.getKey")}
            </Link>
          </Button>
        </section>

        {/* Generar */}
        <section className="flex flex-col gap-6">
          <SectionHeading id="generate">{t("nav.generate")}</SectionHeading>
          <div className="flex flex-col gap-3">
            <h3 className="font-medium">{t("generate.getTitle")}</h3>
            <p className="text-sm text-muted-foreground">{t("generate.getBody")}</p>
            <CodeBlock lang="bash" label="curl" code={CURL_GET} />
          </div>
          <div className="flex flex-col gap-3">
            <h3 className="font-medium">{t("generate.postTitle")}</h3>
            <p className="text-sm text-muted-foreground">{t("generate.postBody")}</p>
            <LanguageTabs
              tabs={[
                {
                  id: "curl",
                  label: "curl",
                  content: <CodeBlock lang="bash" label="curl" code={CURL_POST} />,
                },
                {
                  id: "js",
                  label: "JavaScript",
                  content: (
                    <CodeBlock lang="javascript" label="JavaScript" code={JS_EXAMPLE} />
                  ),
                },
                {
                  id: "python",
                  label: "Python",
                  content: (
                    <CodeBlock lang="python" label="Python" code={PYTHON_EXAMPLE} />
                  ),
                },
              ]}
            />
          </div>
        </section>

        {/* Parámetros */}
        <section className="flex flex-col gap-6">
          <SectionHeading id="params">{t("nav.params")}</SectionHeading>
          <div className="flex flex-col gap-3">
            <h3 className="font-medium">{t("params.getTitle")}</h3>
            <ParamsTable
              rows={GET_PARAMS}
              labels={paramLabels}
              descriptions={(key) => t(`params.rows.${key}`)}
            />
          </div>
          <div className="flex flex-col gap-3">
            <h3 className="font-medium">{t("params.postTitle")}</h3>
            <ParamsTable
              rows={POST_PARAMS}
              labels={paramLabels}
              descriptions={(key) => t(`params.rows.${key}`)}
            />
          </div>
        </section>

        {/* Estilos */}
        <section className="flex flex-col gap-4">
          <SectionHeading id="styles">{t("nav.styles")}</SectionHeading>
          <p className="text-sm text-muted-foreground">{t("styles.body")}</p>
          <StyleSamples labels={(key) => t(`styles.${key}`)} />
        </section>

        {/* Errores */}
        <section className="flex flex-col gap-4">
          <SectionHeading id="errors">{t("nav.errors")}</SectionHeading>
          <p className="text-sm text-muted-foreground">{t("errors.body")}</p>
          <CodeBlock lang="json" label="JSON" code={ERROR_SHAPE} />
          <ErrorsTable
            errors={ERRORS}
            labels={{
              status: t("errors.status"),
              code: t("errors.code"),
              meaning: t("errors.meaning"),
            }}
            meanings={(code) => t(`errors.rows.${code}`)}
          />
        </section>

        {/* Rate limits */}
        <section className="flex flex-col gap-4">
          <SectionHeading id="rateLimits">{t("nav.rateLimits")}</SectionHeading>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {t("rateLimits.body")}
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-line bg-surface p-5 text-center transition-colors hover:border-primary/40">
              <p className="text-3xl font-semibold text-primary">
                {numberFormat.format(env.RATE_LIMIT_PER_MINUTE)}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {t("rateLimits.perMinute")}
              </p>
            </div>
            <div className="rounded-xl border border-line bg-surface p-5 text-center transition-colors hover:border-primary/40">
              <p className="text-3xl font-semibold text-primary">
                {numberFormat.format(env.RATE_LIMIT_PER_DAY)}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {t("rateLimits.perDay")}
              </p>
            </div>
          </div>
        </section>

        {/* Try it */}
        <section className="flex flex-col gap-4">
          <SectionHeading id="tryIt">{t("nav.tryIt")}</SectionHeading>
          <TryIt />
        </section>
      </div>
    </div>
  );
}
