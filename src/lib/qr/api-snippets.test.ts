import { describe, expect, it } from "vitest";
import {
  buildApiRequestBody,
  buildApiSnippets,
  truncateDataUris,
} from "./api-snippets";
import { postBodySchema } from "./api-schema";
import {
  DEFAULT_QR_CONFIG,
  payloadSchema,
  qrConfigSchema,
  type QrPayload,
} from "./schema";

const TINY_PNG =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

const urlPayload: QrPayload = payloadSchema.parse({
  type: "url",
  url: "https://example.com",
});

const fullConfig = qrConfigSchema.parse({
  ecLevel: "H",
  margin: 4,
  style: {
    dots: {
      style: "extra-rounded",
      gradient: {
        type: "linear",
        rotation: 45,
        stops: [
          { offset: 0, color: "#6366f1" },
          { offset: 1, color: "#22d3ee" },
        ],
      },
    },
    cornersSquare: { style: "rounded", color: "#4f46e5" },
  },
  logo: { dataUri: TINY_PNG },
  frame: { style: "modern", text: "Scan O'Brien's QR", color: "#4f46e5" },
  effects: { glow: true, opacity: 0.8 },
});

const CONFIG_KEYS = [
  "ecLevel",
  "margin",
  "style",
  "logo",
  "frame",
  "effects",
] as const;

function pickConfig(body: Record<string, unknown>) {
  return Object.fromEntries(
    CONFIG_KEYS.filter((key) => key in body).map((key) => [key, body[key]]),
  );
}

describe("buildApiRequestBody", () => {
  it("produces a body that satisfies the real POST schema", () => {
    const cases = [
      { payload: urlPayload, config: DEFAULT_QR_CONFIG },
      { payload: urlPayload, config: fullConfig },
      { data: "hello world", config: fullConfig },
    ];
    for (const input of cases) {
      const result = postBodySchema.safeParse(buildApiRequestBody(input));
      expect(result.success).toBe(true);
    }
  });

  it("round-trips a pruned body back to the original config", () => {
    const body = buildApiRequestBody({
      payload: urlPayload,
      config: fullConfig,
    });
    expect(qrConfigSchema.parse(pickConfig(body))).toEqual(fullConfig);
  });

  it("omits all config keys for the default config", () => {
    const body = buildApiRequestBody({
      payload: urlPayload,
      config: DEFAULT_QR_CONFIG,
    });
    expect(Object.keys(body).sort()).toEqual(["format", "payload", "size"]);
    expect(body.format).toBe("png");
    expect(body.size).toBe(512);
    expect(qrConfigSchema.parse(pickConfig(body))).toEqual(DEFAULT_QR_CONFIG);
  });

  it("uses exactly one of payload or data, preferring payload", () => {
    const withPayload = buildApiRequestBody({
      payload: urlPayload,
      data: "ignored",
      config: DEFAULT_QR_CONFIG,
    });
    expect(withPayload.payload).toEqual(urlPayload);
    expect(withPayload).not.toHaveProperty("data");

    const withData = buildApiRequestBody({
      data: "hello world",
      config: DEFAULT_QR_CONFIG,
    });
    expect(withData.data).toBe("hello world");
    expect(withData).not.toHaveProperty("payload");
  });

  it("keeps the full logo data URI", () => {
    const body = buildApiRequestBody({
      payload: urlPayload,
      config: fullConfig,
    });
    expect((body.logo as { dataUri: string }).dataUri).toBe(TINY_PNG);
  });
});

describe("buildApiSnippets", () => {
  const snippets = buildApiSnippets({
    payload: urlPayload,
    config: fullConfig,
    baseUrl: "https://qrapi.test",
    token: "qra_YOUR_TOKEN",
  });

  it("returns curl, js and python snippets with the endpoint and auth header", () => {
    expect(snippets.map((s) => s.id)).toEqual(["curl", "js", "python"]);
    for (const snippet of snippets) {
      expect(snippet.code).toContain("https://qrapi.test/api/v1/qr");
      expect(snippet.code).toContain("Bearer qra_YOUR_TOKEN");
    }
  });

  it("embeds the full logo data URI in every snippet", () => {
    for (const snippet of snippets) {
      expect(snippet.code).toContain(TINY_PNG);
    }
  });

  it("escapes single quotes for curl", () => {
    const curl = snippets.find((s) => s.id === "curl")!;
    expect(curl.code).toContain("O'\\''Brien");
  });

  it("uses Python booleans in the python snippet", () => {
    const python = snippets.find((s) => s.id === "python")!;
    expect(python.code).toContain('"glow": True');
    expect(python.code).toContain('"background": True');
    expect(python.code).not.toMatch(/: (true|false|null)\b/);
  });

  it("embeds valid JSON in the js snippet body", () => {
    const js = snippets.find((s) => s.id === "js")!;
    const match = js.code.match(/JSON\.stringify\(([\s\S]*)\),\n\}\);/);
    expect(match).not.toBeNull();
    const parsed = JSON.parse(match![1]);
    expect(parsed.payload).toEqual(urlPayload);
    expect(parsed.logo.dataUri).toBe(TINY_PNG);
  });
});

describe("truncateDataUris", () => {
  it("shortens long base64 data URIs keeping the prefix", () => {
    const code = `{"logo": {"dataUri": "${TINY_PNG}"}}`;
    const truncated = truncateDataUris(code, 16);
    expect(truncated).toContain("data:image/png;base64,");
    expect(truncated).toContain("…(+");
    expect(truncated.length).toBeLessThan(code.length);
    // Original input is untouched (strings are immutable, but the full URI
    // must not survive in the output).
    expect(truncated).not.toContain(TINY_PNG);
  });

  it("leaves short data URIs untouched", () => {
    const code = '"data:image/png;base64,AAAA"';
    expect(truncateDataUris(code)).toBe(code);
  });
});
