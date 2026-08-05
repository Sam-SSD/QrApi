import { DEFAULT_QR_CONFIG, type QrConfig, type QrPayload } from "./schema";

/**
 * Builds the POST /api/v1/qr request body and ready-to-paste code snippets
 * (curl / JavaScript / Python) that reproduce a QR config through the public
 * API. Pure and isomorphic: used by the editor and the dashboard dialogs.
 */

export interface ApiRequestInput {
  /** Structured payload (preferred over `data` when present). */
  payload?: QrPayload | null;
  /** Raw encoded string; used only when `payload` is absent. */
  data?: string | null;
  config: QrConfig;
  /** Origin without trailing slash (window.location.origin or SITE_URL). */
  baseUrl: string;
  /** Token placeholder shown in the snippets, e.g. "qra_YOUR_TOKEN". */
  token: string;
}

export type SnippetLang = "curl" | "js" | "python";

export interface ApiSnippet {
  id: SnippetLang;
  label: string;
  code: string;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    Object.getPrototypeOf(value) === Object.prototype
  );
}

function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (Array.isArray(a) && Array.isArray(b)) {
    return a.length === b.length && a.every((v, i) => deepEqual(v, b[i]));
  }
  if (isPlainObject(a) && isPlainObject(b)) {
    const keysA = Object.keys(a).filter((k) => a[k] !== undefined);
    const keysB = Object.keys(b).filter((k) => b[k] !== undefined);
    return (
      keysA.length === keysB.length &&
      keysA.every((k) => deepEqual(a[k], b[k]))
    );
  }
  return false;
}

/**
 * Drops keys whose value deep-equals the schema default. Safe round-trip: the
 * API re-applies the same qrConfigSchema defaults on parse, so a pruned body
 * renders identically to the full config.
 */
function pruneDefaults(value: unknown, defaults: unknown): unknown {
  if (deepEqual(value, defaults)) return undefined;
  if (!isPlainObject(value) || !isPlainObject(defaults)) return value;
  const result: Record<string, unknown> = {};
  for (const [key, entry] of Object.entries(value)) {
    if (entry === undefined) continue;
    const pruned = pruneDefaults(entry, defaults[key]);
    if (pruned !== undefined) result[key] = pruned;
  }
  return Object.keys(result).length > 0 ? result : undefined;
}

/** JSON body that reproduces the QR via POST /api/v1/qr. */
export function buildApiRequestBody(
  input: Pick<ApiRequestInput, "payload" | "data" | "config">,
): Record<string, unknown> {
  const { payload, data, config } = input;
  const body: Record<string, unknown> = {};

  // Exactly one of payload/data (API contract); payload wins when present.
  if (payload) body.payload = payload;
  else if (data) body.data = data;

  // Explicit even though they match the API defaults: these are the knobs
  // consumers will most likely tweak after pasting.
  body.format = "png";
  body.size = 512;

  if (config.ecLevel !== DEFAULT_QR_CONFIG.ecLevel) body.ecLevel = config.ecLevel;
  if (config.margin !== DEFAULT_QR_CONFIG.margin) body.margin = config.margin;

  const style = pruneDefaults(config.style, DEFAULT_QR_CONFIG.style);
  if (style !== undefined) body.style = style;

  if (config.logo) body.logo = config.logo;
  if (config.frame) body.frame = config.frame;

  const effects = pruneDefaults(config.effects, DEFAULT_QR_CONFIG.effects);
  if (effects !== undefined) body.effects = effects;

  return body;
}

function indentLines(text: string, indent: string): string {
  return text.replace(/\n/g, `\n${indent}`);
}

/** Serializes a JSON-safe value as a Python literal (True/False/None). */
function toPythonLiteral(value: unknown, indent: string): string {
  if (value === null || value === undefined) return "None";
  if (value === true) return "True";
  if (value === false) return "False";
  if (typeof value === "number") return String(value);
  if (typeof value === "string") return JSON.stringify(value);
  const inner = `${indent}    `;
  if (Array.isArray(value)) {
    if (value.length === 0) return "[]";
    const items = value.map((v) => `${inner}${toPythonLiteral(v, inner)},`);
    return `[\n${items.join("\n")}\n${indent}]`;
  }
  const entries = Object.entries(value as Record<string, unknown>).filter(
    ([, v]) => v !== undefined,
  );
  if (entries.length === 0) return "{}";
  const items = entries.map(
    ([k, v]) => `${inner}${JSON.stringify(k)}: ${toPythonLiteral(v, inner)},`,
  );
  return `{\n${items.join("\n")}\n${indent}}`;
}

/** curl / JavaScript / Python snippets (ids match the docs LanguageTabs). */
export function buildApiSnippets(input: ApiRequestInput): ApiSnippet[] {
  const { baseUrl, token } = input;
  const body = buildApiRequestBody(input);
  const json = JSON.stringify(body, null, 2);
  const endpoint = `${baseUrl}/api/v1/qr`;

  const curl = `curl "${endpoint}" \\
  -H "Authorization: Bearer ${token}" \\
  -H "Content-Type: application/json" \\
  -d '${json.replace(/'/g, "'\\''")}' \\
  -o qr.png`;

  const js = `const response = await fetch("${endpoint}", {
  method: "POST",
  headers: {
    Authorization: "Bearer ${token}",
    "Content-Type": "application/json",
  },
  body: JSON.stringify(${indentLines(json, "  ")}),
});

if (!response.ok) {
  const { error } = await response.json();
  throw new Error(\`\${error.code}: \${error.message}\`);
}

const png = Buffer.from(await response.arrayBuffer());`;

  const python = `import requests

response = requests.post(
    "${endpoint}",
    headers={"Authorization": "Bearer ${token}"},
    json=${toPythonLiteral(body, "    ")},
    timeout=10,
)
response.raise_for_status()

with open("qr.png", "wb") as f:
    f.write(response.content)`;

  return [
    { id: "curl", label: "curl", code: curl },
    { id: "js", label: "JavaScript", code: js },
    { id: "python", label: "Python", code: python },
  ];
}

const DATA_URI_RE = /(data:image\/[a-z+.-]+;base64,)([A-Za-z0-9+/=]+)/g;

/** Display-only: shortens base64 data URIs; never use its output for copying. */
export function truncateDataUris(code: string, keep = 32): string {
  return code.replace(DATA_URI_RE, (match, prefix: string, b64: string) =>
    b64.length <= keep
      ? match
      : `${prefix}${b64.slice(0, keep)}…(+${b64.length - keep} chars)`,
  );
}
