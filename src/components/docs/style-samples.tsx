import type { QrConfig } from "@/lib/qr/schema";
import {
  CORNER_DOT_STYLES,
  CORNER_SQUARE_STYLES,
  DEFAULT_QR_CONFIG,
  DOT_STYLES,
  FRAME_STYLES,
} from "@/lib/qr/schema";
import { renderQrSvg } from "@/lib/qr/render-svg";

const SAMPLE_DATA = "https://qrapi.dev";

type QrStyle = QrConfig["style"];

function sampleConfig(overrides: {
  dots?: QrStyle["dots"];
  cornersSquare?: QrStyle["cornersSquare"];
  cornersDot?: QrStyle["cornersDot"];
  frame?: QrConfig["frame"];
}): QrConfig {
  return {
    ...DEFAULT_QR_CONFIG,
    style: {
      ...DEFAULT_QR_CONFIG.style,
      dots: overrides.dots ?? { style: "rounded", color: "#18181b" },
      ...(overrides.cornersSquare ? { cornersSquare: overrides.cornersSquare } : {}),
      ...(overrides.cornersDot ? { cornersDot: overrides.cornersDot } : {}),
      background: { color: "#ffffff", transparent: false },
    },
    ...(overrides.frame ? { frame: overrides.frame } : {}),
  };
}

interface SampleGroup {
  key: "dots" | "cornersSquare" | "cornersDot" | "frames";
  samples: Array<{ value: string; config: QrConfig }>;
}

const GROUPS: SampleGroup[] = [
  {
    key: "dots",
    samples: DOT_STYLES.map((value) => ({
      value,
      config: sampleConfig({
        dots: { style: value, color: "#4f46e5" },
      }),
    })),
  },
  {
    key: "cornersSquare",
    samples: CORNER_SQUARE_STYLES.map((value) => ({
      value,
      config: sampleConfig({
        cornersSquare: { style: value, color: "#4f46e5" },
      }),
    })),
  },
  {
    key: "cornersDot",
    samples: CORNER_DOT_STYLES.map((value) => ({
      value,
      config: sampleConfig({
        cornersDot: { style: value, color: "#0891b2" },
      }),
    })),
  },
  {
    key: "frames",
    samples: FRAME_STYLES.map((value) => ({
      value,
      config: sampleConfig({
        frame: { style: value, text: "QRAPI", color: "#4f46e5" },
      }),
    })),
  },
];

/** Miniaturas reales de cada estilo, renderizadas con el mismo motor que la API. */
export function StyleSamples({ labels }: { labels: (key: string) => string }) {
  return (
    <div className="flex flex-col gap-3">
      {GROUPS.map(({ key, samples }) => (
        <div
          key={key}
          className="rounded-xl border border-line bg-surface p-4 transition-colors hover:border-primary/40"
        >
          <p className="mb-3 font-mono text-xs text-primary">{labels(key)}</p>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
            {samples.map(({ value, config }) => (
              <figure key={value} className="flex flex-col items-center gap-1.5">
                <div
                  aria-hidden="true"
                  className="w-full overflow-hidden rounded-md border border-line bg-white p-1 [&_svg]:block [&_svg]:h-auto [&_svg]:w-full"
                  dangerouslySetInnerHTML={{
                    __html: renderQrSvg(SAMPLE_DATA, config),
                  }}
                />
                <figcaption className="font-mono text-[10px] text-muted-foreground">
                  {value}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
