import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { KeyRound } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CodeBlock } from "@/components/docs/code-block";
import { CopyButton } from "@/components/docs/copy-button";
import { DocsNav } from "@/components/docs/docs-nav";
import { ErrorsTable } from "@/components/docs/errors-table";
import { LanguageTabs } from "@/components/docs/language-tabs";
import { MethodBadge } from "@/components/docs/method-badge";
import { ParamsTable, type ParamRow } from "@/components/docs/params-table";
import { SectionHeading, SubHeading } from "@/components/docs/section-heading";
import { StyleSamples } from "@/components/docs/style-samples";
import { TryIt } from "@/components/docs/try-it";
import { SITE_URL } from "@/lib/constants";
import { env } from "@/env";
import {
  DOT_STYLES,
  CORNER_SQUARE_STYLES,
  CORNER_DOT_STYLES,
  EC_LEVELS,
  FRAME_STYLES,
  FRAME_POSITIONS,
  PAYLOAD_TYPES,
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
// Los textos localizables (comentarios, URLs de ejemplo, token) vienen de
// `docs.code.*`; el resto del código es idéntico en ambos idiomas.

function codeExamples(c: (key: string) => string) {
  const token = c("token");
  const url = c("exampleUrl");
  const campaign = c("campaign");
  const promo = c("promoUrl");
  const newTarget = c("newTargetUrl");

  const curlGet = `curl "${SITE_URL}/api/v1/qr?data=${url}&format=png&size=512&dotsStyle=rounded&dotsColor=%236366f1" \\
  -H "Authorization: Bearer ${token}" \\
  -o qr.png`;

  const jsGet = `const params = new URLSearchParams({
  data: "${url}",
  format: "png",
  size: "512",
  dotsStyle: "rounded",
  dotsColor: "#6366f1",
});

const response = await fetch(\`${SITE_URL}/api/v1/qr?\${params}\`, {
  headers: { Authorization: \`Bearer \${process.env.QRAPI_API_KEY}\` },
});

const png = Buffer.from(await response.arrayBuffer());`;

  const pythonGet = `import os
import requests

response = requests.get(
    "${SITE_URL}/api/v1/qr",
    params={"data": "${url}", "format": "png", "size": 512, "dotsStyle": "rounded"},
    headers={"Authorization": f"Bearer {os.environ['QRAPI_API_KEY']}"},
    timeout=10,
)
response.raise_for_status()

with open("qr.png", "wb") as f:
    f.write(response.content)`;

  const curlPost = `curl "${SITE_URL}/api/v1/qr" \\
  -H "Authorization: Bearer ${token}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "payload": { "type": "wifi", "ssid": "${c("wifiSsid")}", "password": "${c("wifiPassword")}", "security": "WPA" },
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
    "frame": { "style": "modern", "text": "${c("wifiText")}", "color": "#4f46e5" }
  }' -o qr.png`;

  const jsPost = `const response = await fetch("${SITE_URL}/api/v1/qr", {
  method: "POST",
  headers: {
    Authorization: \`Bearer \${process.env.QRAPI_API_KEY}\`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    payload: { type: "url", url: "${url}" },
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

  const pythonPost = `import os
import requests

response = requests.post(
    "${SITE_URL}/api/v1/qr",
    headers={"Authorization": f"Bearer {os.environ['QRAPI_API_KEY']}"},
    json={
        # ${c("postDataComment")}
        "data": "${url}",
        "format": "png",
        "size": 1024,
        "style": {"dots": {"style": "dots", "color": "#18181b"}},
    },
    timeout=10,
)
response.raise_for_status()

with open("qr.png", "wb") as f:
    f.write(response.content)`;

  const curlDynamic = `# ${c("dynStep1")}
curl "${SITE_URL}/api/v1/dynamic" \\
  -H "Authorization: Bearer ${token}" \\
  -H "Content-Type: application/json" \\
  -d '{"title": "${campaign}", "targetUrl": "${promo}"}'
# -> 201: "slug": "Ab3dE9xZ", "redirectUrl": "${SITE_URL}/r/Ab3dE9xZ"

# ${c("dynStep2")}
curl "${SITE_URL}/api/v1/qr?data=${SITE_URL}/r/Ab3dE9xZ&format=png" \\
  -H "Authorization: Bearer ${token}" -o qr.png

# ${c("dynStep3")}
curl -X PATCH "${SITE_URL}/api/v1/dynamic/ID" \\
  -H "Authorization: Bearer ${token}" \\
  -H "Content-Type: application/json" \\
  -d '{"targetUrl": "${newTarget}"}'`;

  const jsDynamic = `const headers = {
  Authorization: \`Bearer \${process.env.QRAPI_API_KEY}\`,
  "Content-Type": "application/json",
};

// ${c("dynStep1")}
const created = await fetch("${SITE_URL}/api/v1/dynamic", {
  method: "POST",
  headers,
  body: JSON.stringify({ title: "${campaign}", targetUrl: "${promo}" }),
}).then((r) => r.json());

// ${c("dynStep2Js")}
const qr = await fetch(
  \`${SITE_URL}/api/v1/qr?data=\${encodeURIComponent(created.redirectUrl)}\`,
  { headers },
);

// ${c("dynStep3")}
await fetch(\`${SITE_URL}/api/v1/dynamic/\${created.id}\`, {
  method: "PATCH",
  headers,
  body: JSON.stringify({ targetUrl: "${newTarget}" }),
});`;

  const pythonDynamic = `import os
import requests

base = "${SITE_URL}/api/v1"
headers = {"Authorization": f"Bearer {os.environ['QRAPI_API_KEY']}"}

# ${c("dynStep1")}
created = requests.post(
    f"{base}/dynamic",
    headers=headers,
    json={"title": "${campaign}", "targetUrl": "${promo}"},
    timeout=10,
).json()

# ${c("dynStep2Js")}
qr = requests.get(
    f"{base}/qr",
    params={"data": created["redirectUrl"], "format": "png"},
    headers=headers,
    timeout=10,
)

# ${c("dynStep3")}
requests.patch(
    f"{base}/dynamic/{created['id']}",
    headers=headers,
    json={"targetUrl": "${newTarget}"},
    timeout=10,
)`;

  const dynamicCreateResponse = `{
  "id": "cmd21k8f0001xyz",
  "slug": "Ab3dE9xZ",
  "redirectUrl": "${SITE_URL}/r/Ab3dE9xZ",
  "targetUrl": "${promo}",
  "active": true,
  "createdAt": "2026-07-17T12:00:00.000Z"
}`;

  const dynamicDetailResponse = `{
  "id": "cmd21k8f0001xyz",
  "slug": "Ab3dE9xZ",
  "title": "${campaign}",
  "redirectUrl": "${SITE_URL}/r/Ab3dE9xZ",
  "targetUrl": "${promo}",
  "active": true,
  "createdAt": "2026-07-17T12:00:00.000Z",
  "analytics": {
    "totalScans": 42,
    "byCountry": { "CO": 18, "MX": 11, "unknown": 13 },
    "byDevice": { "mobile": 31, "desktop": 9, "tablet": 2 }
  }
}`;

  return {
    curlGet,
    jsGet,
    pythonGet,
    curlPost,
    jsPost,
    pythonPost,
    curlDynamic,
    jsDynamic,
    pythonDynamic,
    dynamicCreateResponse,
    dynamicDetailResponse,
    authHeader: `Authorization: Bearer ${token}`,
  };
}

const RESPONSE_HEADERS = `HTTP/1.1 200 OK
Content-Type: image/png
Cache-Control: no-store
X-RateLimit-Limit: ${env.RATE_LIMIT_PER_MINUTE}
X-RateLimit-Remaining: ${env.RATE_LIMIT_PER_MINUTE - 1}
X-RateLimit-Reset: 1789305600`;

const ERROR_SHAPE = `{
  "error": {
    "code": "invalid_params",
    "message": "Invalid query parameters",
    "details": { "size": ["Number must be less than or equal to 2048"] }
  }
}`;

// ---------- Tablas ----------

const DYNAMIC_ENDPOINTS: Array<{ method: string; path: string; key: string }> =
  [
    { method: "POST", path: "/api/v1/dynamic", key: "create" },
    { method: "GET", path: "/api/v1/dynamic", key: "list" },
    { method: "GET", path: "/api/v1/dynamic/:id", key: "get" },
    { method: "PATCH", path: "/api/v1/dynamic/:id", key: "patch" },
    { method: "DELETE", path: "/api/v1/dynamic/:id", key: "delete" },
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

const DYNAMIC_ERRORS: Array<{ status: number; code: string }> = [
  { status: 403, code: "limit_reached" },
  { status: 404, code: "not_found" },
];

const RATE_LIMIT_HEADERS: Array<{ header: string; key: string }> = [
  { header: "X-RateLimit-Limit", key: "limit" },
  { header: "X-RateLimit-Remaining", key: "remaining" },
  { header: "X-RateLimit-Reset", key: "reset" },
  { header: "Retry-After", key: "retryAfter" },
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

  const anchorLabel = t("anchor");
  const numberFormat = new Intl.NumberFormat(locale);

  const navItems = [
    { id: "intro" },
    { id: "quickstart" },
    { id: "auth" },
    {
      id: "generate",
      children: ["generate-get", "generate-post", "generate-response"],
    },
    { id: "params", children: ["params-get", "params-post"] },
    { id: "styles" },
    {
      id: "dynamic",
      children: ["dynamic-endpoints", "dynamic-example", "dynamic-responses"],
    },
    { id: "errors" },
    { id: "rateLimits" },
    { id: "tryIt" },
  ].map((item) => ({
    id: item.id,
    label: t(`nav.${item.id}`),
    children: item.children?.map((child) => ({
      id: child,
      label: t(`nav.sub.${child}`),
    })),
  }));

  const paramLabels = {
    name: t("params.name"),
    type: t("params.type"),
    def: t("params.default"),
    description: t("params.description"),
    required: t("params.required"),
    toggle: t("params.toggle"),
  };

  const errorLabels = {
    status: t("errors.status"),
    code: t("errors.code"),
    meaning: t("errors.meaning"),
  };

  const d = (key: string) => t(`params.rows.${key}`);
  const ex = codeExamples((key) => t(`code.${key}`));

  const getParams: ParamRow[] = [
    { name: "data", type: "string", def: "—", required: true, description: d("data") },
    { name: "format", type: "enum", enumValues: ["png", "svg", "jpeg"], def: "png", description: d("format") },
    { name: "size", type: "number", def: "512", description: d("size") },
    { name: "ecLevel", type: "enum", enumValues: [...EC_LEVELS], def: "M", description: d("ecLevel") },
    { name: "margin", type: "number", def: "2", description: d("margin") },
    { name: "dotsStyle", type: "enum", enumValues: [...DOT_STYLES], def: "square", description: d("dotsStyle") },
    { name: "dotsColor", type: "hex", def: "#18181b", description: d("dotsColor") },
    { name: "bgColor", type: "hex", def: "#ffffff", description: d("bgColor") },
    { name: "cornersSquareStyle", type: "enum", enumValues: [...CORNER_SQUARE_STYLES], def: "square", description: d("cornersSquareStyle") },
    { name: "cornersDotStyle", type: "enum", enumValues: [...CORNER_DOT_STYLES], def: "square", description: d("cornersDotStyle") },
    { name: "transparent", type: "boolean", def: "false", description: d("transparent") },
    { name: "frameStyle", type: "enum", enumValues: [...FRAME_STYLES], def: "—", description: d("frameStyle") },
    { name: "frameText", type: "string", def: "ESCANÉAME", description: d("frameText") },
    { name: "frameColor", type: "hex", def: "#4f46e5", description: d("frameColor") },
    { name: "frameTextColor", type: "hex", def: "auto", description: d("frameTextColor") },
    { name: "framePosition", type: "enum", enumValues: [...FRAME_POSITIONS], def: "bottom", description: d("framePosition") },
  ];

  const postParams: ParamRow[] = [
    { name: "data", type: "string", def: "—", description: d("data") },
    {
      name: "payload",
      type: "object",
      def: "—",
      description: d("payload"),
      children: [
        { name: "type", type: "enum", enumValues: [...PAYLOAD_TYPES], def: "—", required: true, description: d("payloadType") },
      ],
    },
    { name: "format", type: "enum", enumValues: ["png", "svg", "jpeg"], def: "png", description: d("format") },
    { name: "size", type: "number", def: "512", description: d("size") },
    { name: "ecLevel", type: "enum", enumValues: [...EC_LEVELS], def: "M", description: d("ecLevel") },
    { name: "margin", type: "number", def: "2", description: d("margin") },
    {
      name: "style",
      type: "object",
      def: "—",
      description: d("style"),
      children: [
        { name: "dots", type: "object", def: "—", description: d("styleDots") },
        { name: "cornersSquare", type: "object", def: "—", description: d("styleCornersSquare") },
        { name: "cornersDot", type: "object", def: "—", description: d("styleCornersDot") },
        { name: "background", type: "object", def: "—", description: d("styleBackground") },
        { name: "background.image", type: "object", def: "—", description: d("backgroundImage") },
        { name: "*.gradient", type: "object", def: "—", description: d("gradientShape") },
      ],
    },
    {
      name: "logo",
      type: "object",
      def: "—",
      description: d("logo"),
      children: [
        { name: "dataUri", type: "string", def: "—", required: true, description: d("logoDataUri") },
        { name: "sizeRatio", type: "number", def: "0.22", description: d("logoSizeRatio") },
        { name: "margin", type: "number", def: "1", description: d("logoMargin") },
        { name: "background", type: "boolean", def: "true", description: d("logoBackground") },
      ],
    },
    {
      name: "frame",
      type: "object",
      def: "—",
      description: d("frame"),
      children: [
        { name: "style", type: "enum", enumValues: [...FRAME_STYLES], def: "modern", description: d("frameStyleSub") },
        { name: "text", type: "string", def: "ESCANÉAME", description: d("frameTextSub") },
        { name: "color", type: "hex", def: "#4f46e5", description: d("frameColorSub") },
        { name: "textColor", type: "hex", def: "auto", description: d("frameTextColorSub") },
        { name: "position", type: "enum", enumValues: [...FRAME_POSITIONS], def: "bottom", description: d("framePositionSub") },
      ],
    },
    {
      name: "effects",
      type: "object",
      def: "—",
      description: d("effects"),
      children: [
        { name: "invert", type: "boolean", def: "false", description: d("effectsInvert") },
        { name: "glow", type: "boolean", def: "false", description: d("effectsGlow") },
        { name: "opacity", type: "number", def: "1", description: d("effectsOpacity") },
      ],
    },
  ];

  const quickstartSteps = [
    { title: t("quickstart.step1Title"), body: t("quickstart.step1Body") },
    { title: t("quickstart.step2Title"), body: t("quickstart.step2Body") },
    { title: t("quickstart.step3Title"), body: t("quickstart.step3Body") },
  ];

  const overviewEndpoints = [
    { methods: ["GET", "POST"], path: "/api/v1/qr", label: t("intro.qrEndpoint") },
    {
      methods: ["POST", "GET", "PATCH", "DELETE"],
      path: "/api/v1/dynamic",
      label: t("intro.dynamicEndpoint"),
    },
  ];

  return (
    <div className="mx-auto grid max-w-7xl gap-x-10 gap-y-6 px-4 py-12 sm:px-6 lg:grid-cols-[220px_1fr]">
      <DocsNav items={navItems} ariaLabel={t("title")} />

      {/* Contenido */}
      <div className="flex min-w-0 flex-col gap-12">
        <header>
          <h1 className="text-3xl font-semibold tracking-[-0.02em]">
            {t("title")}
          </h1>
          <p className="mt-2 text-muted-foreground">{t("subtitle")}</p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Badge className="bg-brand-soft font-mono text-primary">v1</Badge>
            <div className="flex min-w-0 items-center gap-2 rounded-lg border border-line bg-canvas-subtle py-1 pr-1 pl-3">
              <span className="hidden text-xs text-muted-foreground sm:inline">
                {t("intro.baseUrl")}
              </span>
              <code className="truncate font-mono text-xs">
                {SITE_URL}/api/v1
              </code>
              <CopyButton text={`${SITE_URL}/api/v1`} />
            </div>
          </div>
        </header>

        {/* Introducción */}
        <section className="flex flex-col gap-4">
          <SectionHeading id="intro" anchorLabel={anchorLabel}>
            {t("nav.intro")}
          </SectionHeading>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {t("intro.body")}
          </p>
          <div className="flex flex-col gap-2">
            {overviewEndpoints.map((endpoint) => (
              <div
                key={endpoint.path}
                className="flex flex-wrap items-center gap-2 rounded-lg border border-line bg-surface px-3 py-2 transition-colors hover:border-primary/40"
              >
                <span className="flex gap-1">
                  {endpoint.methods.map((method) => (
                    <MethodBadge key={method} method={method} />
                  ))}
                </span>
                <code className="font-mono text-xs">{endpoint.path}</code>
                <span className="text-xs text-muted-foreground sm:ml-auto">
                  {endpoint.label}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Inicio rápido */}
        <section className="flex flex-col gap-4">
          <SectionHeading id="quickstart" anchorLabel={anchorLabel}>
            {t("nav.quickstart")}
          </SectionHeading>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {t("quickstart.body")}
          </p>
          <ol className="relative flex flex-col gap-6">
            <span
              aria-hidden="true"
              className="absolute top-2 bottom-2 left-3.5 w-px bg-line"
            />
            {quickstartSteps.map((step, index) => (
              <li key={step.title} className="relative flex items-start gap-4">
                <span className="bg-gradient-brand z-10 flex size-7 shrink-0 items-center justify-center rounded-full font-mono text-sm font-semibold text-white">
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
          <SectionHeading id="auth" anchorLabel={anchorLabel}>
            {t("nav.auth")}
          </SectionHeading>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {t("auth.body")}
          </p>
          <CodeBlock lang="http" label="HTTP" code={ex.authHeader} />
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
          <SectionHeading id="generate" anchorLabel={anchorLabel}>
            {t("nav.generate")}
          </SectionHeading>
          <div className="flex flex-col gap-3">
            <SubHeading id="generate-get" anchorLabel={anchorLabel}>
              <MethodBadge method="GET" className="mr-2 align-middle" />
              {t("generate.getTitle")}
            </SubHeading>
            <p className="text-sm text-muted-foreground">{t("generate.getBody")}</p>
            <LanguageTabs
              tabs={[
                {
                  id: "curl",
                  label: "curl",
                  content: <CodeBlock lang="bash" label="curl" code={ex.curlGet} />,
                },
                {
                  id: "js",
                  label: "JavaScript",
                  content: (
                    <CodeBlock lang="javascript" label="JavaScript" code={ex.jsGet} />
                  ),
                },
                {
                  id: "python",
                  label: "Python",
                  content: (
                    <CodeBlock lang="python" label="Python" code={ex.pythonGet} />
                  ),
                },
              ]}
            />
          </div>
          <div className="flex flex-col gap-3">
            <SubHeading id="generate-post" anchorLabel={anchorLabel}>
              <MethodBadge method="POST" className="mr-2 align-middle" />
              {t("generate.postTitle")}
            </SubHeading>
            <p className="text-sm text-muted-foreground">{t("generate.postBody")}</p>
            <LanguageTabs
              tabs={[
                {
                  id: "curl",
                  label: "curl",
                  content: <CodeBlock lang="bash" label="curl" code={ex.curlPost} />,
                },
                {
                  id: "js",
                  label: "JavaScript",
                  content: (
                    <CodeBlock lang="javascript" label="JavaScript" code={ex.jsPost} />
                  ),
                },
                {
                  id: "python",
                  label: "Python",
                  content: (
                    <CodeBlock lang="python" label="Python" code={ex.pythonPost} />
                  ),
                },
              ]}
            />
          </div>
          <div className="flex flex-col gap-3">
            <SubHeading id="generate-response" anchorLabel={anchorLabel}>
              {t("generate.responseTitle")}
            </SubHeading>
            <p className="text-sm text-muted-foreground">
              {t("generate.responseBody")}
            </p>
            <CodeBlock lang="http" label="HTTP" code={RESPONSE_HEADERS} />
          </div>
        </section>

        {/* Parámetros */}
        <section className="flex flex-col gap-6">
          <SectionHeading id="params" anchorLabel={anchorLabel}>
            {t("nav.params")}
          </SectionHeading>
          <div className="flex flex-col gap-3">
            <SubHeading id="params-get" anchorLabel={anchorLabel}>
              {t("params.getTitle")}
            </SubHeading>
            <ParamsTable rows={getParams} labels={paramLabels} />
          </div>
          <div className="flex flex-col gap-3">
            <SubHeading id="params-post" anchorLabel={anchorLabel}>
              {t("params.postTitle")}
            </SubHeading>
            <p className="text-xs text-muted-foreground">{t("params.postNote")}</p>
            <ParamsTable rows={postParams} labels={paramLabels} />
          </div>
        </section>

        {/* Estilos */}
        <section className="flex flex-col gap-4">
          <SectionHeading id="styles" anchorLabel={anchorLabel}>
            {t("nav.styles")}
          </SectionHeading>
          <p className="text-sm text-muted-foreground">{t("styles.body")}</p>
          <StyleSamples labels={(key) => t(`styles.${key}`)} />
        </section>

        {/* QR dinámicos */}
        <section className="flex flex-col gap-6">
          <SectionHeading id="dynamic" anchorLabel={anchorLabel}>
            {t("nav.dynamic")}
          </SectionHeading>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {t("dynamic.body")}
          </p>
          <div className="flex flex-col gap-3">
            <SubHeading id="dynamic-endpoints" anchorLabel={anchorLabel}>
              {t("dynamic.endpointsTitle")}
            </SubHeading>
            <div className="overflow-x-auto rounded-xl border border-line transition-colors hover:border-line-strong">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-line bg-canvas-subtle text-left text-xs text-muted-foreground">
                    <th className="px-4 py-2.5 font-medium">
                      {t("dynamic.colEndpoint")}
                    </th>
                    <th className="px-4 py-2.5 font-medium">
                      {t("dynamic.colDescription")}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {DYNAMIC_ENDPOINTS.map((row) => (
                    <tr
                      key={`${row.method} ${row.path}`}
                      className="transition-colors hover:bg-canvas-subtle/60"
                    >
                      <td className="px-4 py-2.5 whitespace-nowrap">
                        <MethodBadge method={row.method} className="mr-2" />
                        <code className="font-mono text-xs">{row.path}</code>
                      </td>
                      <td className="px-4 py-2.5 text-xs text-muted-foreground">
                        {t(`dynamic.rows.${row.key}`)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <SubHeading id="dynamic-example" anchorLabel={anchorLabel}>
              {t("dynamic.exampleTitle")}
            </SubHeading>
            <LanguageTabs
              tabs={[
                {
                  id: "curl",
                  label: "curl",
                  content: (
                    <CodeBlock lang="bash" label="curl" code={ex.curlDynamic} />
                  ),
                },
                {
                  id: "js",
                  label: "JavaScript",
                  content: (
                    <CodeBlock lang="javascript" label="JavaScript" code={ex.jsDynamic} />
                  ),
                },
                {
                  id: "python",
                  label: "Python",
                  content: (
                    <CodeBlock lang="python" label="Python" code={ex.pythonDynamic} />
                  ),
                },
              ]}
            />
            <p className="text-xs text-muted-foreground">{t("dynamic.note")}</p>
          </div>
          <div className="flex flex-col gap-3">
            <SubHeading id="dynamic-responses" anchorLabel={anchorLabel}>
              {t("dynamic.responsesTitle")}
            </SubHeading>
            <div className="grid gap-3 xl:grid-cols-2">
              <CodeBlock
                lang="json"
                label={t("dynamic.createResponseLabel")}
                code={ex.dynamicCreateResponse}
              />
              <CodeBlock
                lang="json"
                label={t("dynamic.detailResponseLabel")}
                code={ex.dynamicDetailResponse}
              />
            </div>
            <ErrorsTable
              errors={DYNAMIC_ERRORS}
              labels={errorLabels}
              meanings={(code) => t(`errors.rows.${code}`)}
            />
          </div>
        </section>

        {/* Errores */}
        <section className="flex flex-col gap-4">
          <SectionHeading id="errors" anchorLabel={anchorLabel}>
            {t("nav.errors")}
          </SectionHeading>
          <p className="text-sm text-muted-foreground">{t("errors.body")}</p>
          <CodeBlock lang="json" label="JSON" code={ERROR_SHAPE} />
          <ErrorsTable
            errors={ERRORS}
            labels={errorLabels}
            meanings={(code) => t(`errors.rows.${code}`)}
          />
        </section>

        {/* Rate limits */}
        <section className="flex flex-col gap-4">
          <SectionHeading id="rateLimits" anchorLabel={anchorLabel}>
            {t("nav.rateLimits")}
          </SectionHeading>
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
          <div className="overflow-x-auto rounded-xl border border-line transition-colors hover:border-line-strong">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line bg-canvas-subtle text-left text-xs text-muted-foreground">
                  <th className="px-4 py-2.5 font-medium">Header</th>
                  <th className="px-4 py-2.5 font-medium">
                    {t("rateLimits.headerMeaning")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {RATE_LIMIT_HEADERS.map((row) => (
                  <tr
                    key={row.header}
                    className="transition-colors hover:bg-canvas-subtle/60"
                  >
                    <td className="px-4 py-2.5 font-mono text-xs whitespace-nowrap text-primary">
                      {row.header}
                    </td>
                    <td className="px-4 py-2.5 text-xs text-muted-foreground">
                      {t(`rateLimits.headers.${row.key}`)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Try it */}
        <section className="flex flex-col gap-4">
          <SectionHeading id="tryIt" anchorLabel={anchorLabel}>
            {t("nav.tryIt")}
          </SectionHeading>
          <TryIt />
        </section>
      </div>
    </div>
  );
}
