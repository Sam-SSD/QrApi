"use client";

import { useTranslations } from "next-intl";
import {
  DOT_STYLES,
  CORNER_SQUARE_STYLES,
  CORNER_DOT_STYLES,
} from "@/lib/qr/schema";
import { useQrStore } from "@/stores/qr-store";
import { cn } from "@/lib/utils";

/** Path de estrella para las miniaturas. */
function starThumbPath(
  cx: number,
  cy: number,
  outer: number,
  inner: number,
  points: number,
): string {
  const coords: string[] = [];
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = (Math.PI / points) * i - Math.PI / 2;
    coords.push(`${cx + Math.cos(a) * r},${cy + Math.sin(a) * r}`);
  }
  return `M${coords.join("L")}z`;
}

/** Miniaturas SVG de cada estilo de puntos (patrón 3×3 ilustrativo). */
function DotStyleThumb({ style }: { style: (typeof DOT_STYLES)[number] }) {
  const cells: Array<[number, number]> = [
    [0, 0],
    [1, 0],
    [0, 1],
    [1, 2],
    [2, 1],
    [2, 2],
  ];
  const shape = (x: number, y: number) => {
    const px = x * 10 + 1;
    const py = y * 10 + 1;
    switch (style) {
      case "square":
        return <rect key={`${x}-${y}`} x={px} y={py} width={8} height={8} />;
      case "dots":
        return <circle key={`${x}-${y}`} cx={px + 4} cy={py + 4} r={3.6} />;
      case "rounded":
        return (
          <rect key={`${x}-${y}`} x={px} y={py} width={8} height={8} rx={2.6} />
        );
      case "classy":
        return (
          <path
            key={`${x}-${y}`}
            d={`M${px + 4},${py}h4v8h-8v-4a4,4 0 0 1 4,-4z`}
          />
        );
      case "extra-rounded":
        return (
          <rect key={`${x}-${y}`} x={px} y={py} width={8} height={8} rx={4} />
        );
      case "vertical-line":
        return (
          <rect key={`${x}-${y}`} x={px + 2} y={py} width={4} height={8} rx={2} />
        );
      case "horizontal-line":
        return (
          <rect key={`${x}-${y}`} x={px} y={py + 2} width={8} height={4} rx={2} />
        );
      case "star":
        return (
          <path
            key={`${x}-${y}`}
            d={starThumbPath(px + 4, py + 4, 4, 1.7, 5)}
          />
        );
      case "plus":
        return (
          <path
            key={`${x}-${y}`}
            d={`M${px + 2.8},${py}h2.4v2.8h2.8v2.4h-2.8v2.8h-2.4v-2.8h-2.8v-2.4h2.8z`}
          />
        );
      case "diamond":
        return (
          <path
            key={`${x}-${y}`}
            d={`M${px + 4},${py}l4,4l-4,4l-4,-4z`}
          />
        );
    }
  };
  return (
    <svg viewBox="0 0 30 30" className="size-7 fill-current" aria-hidden="true">
      {cells.map(([x, y]) => shape(x, y))}
    </svg>
  );
}

function CornerSquareThumb({
  style,
}: {
  style: (typeof CORNER_SQUARE_STYLES)[number];
}) {
  // outpoint/inpoint/classy: esquinas en punta (rx=0) en dos vértices y
  // redondeadas en los otros dos → se ilustran con un path de esquinas mixtas.
  const strokeProps = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 4,
  } as const;
  if (style === "square" || style === "rounded" || style === "extra-rounded") {
    const rx = style === "square" ? 0 : style === "rounded" ? 6 : 10;
    return (
      <svg viewBox="0 0 30 30" className="size-7" aria-hidden="true">
        <rect x={3} y={3} width={24} height={24} rx={rx} {...strokeProps} />
      </svg>
    );
  }
  // Path con esquinas alternas redondeadas/en punta.
  const r = style === "classy" ? 8 : 10;
  const path =
    style === "inpoint"
      ? `M3,3 h24 v${24 - r} a${r},${r} 0 0 1 -${r},${r} h-${24 - r} v-${24 - r} a${r},${r} 0 0 1 ${r},-${r} z`
      : `M${3 + r},3 h${24 - r} v24 h-${24 - r} a${r},${r} 0 0 1 -${r},-${r} v-${24 - r} a${r},${r} 0 0 1 ${r},-${r} z`;
  return (
    <svg viewBox="0 0 30 30" className="size-7" aria-hidden="true">
      <path d={path} {...strokeProps} />
    </svg>
  );
}

function CornerDotThumb({
  style,
}: {
  style: (typeof CORNER_DOT_STYLES)[number];
}) {
  return (
    <svg viewBox="0 0 30 30" className="size-7 fill-current" aria-hidden="true">
      {style === "dot" ? (
        <circle cx={15} cy={15} r={8} />
      ) : style === "diamond" ? (
        <path d="M15,6 L24,15 L15,24 L6,15 z" />
      ) : (
        <rect
          x={7}
          y={7}
          width={16}
          height={16}
          rx={style === "rounded" ? 5 : 0}
        />
      )}
    </svg>
  );
}

function StylePicker<T extends string>({
  label,
  options,
  value,
  onChange,
  renderThumb,
  getLabel,
}: {
  label: string;
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
  renderThumb: (option: T) => React.ReactNode;
  getLabel: (option: T) => string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium">{label}</span>
      <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-1.5">
        {options.map((option) => {
          const active = option === value;
          return (
            <button
              key={option}
              type="button"
              role="radio"
              aria-checked={active}
              title={getLabel(option)}
              aria-label={getLabel(option)}
              onClick={() => onChange(option)}
              className={cn(
                "flex size-11 items-center justify-center rounded-md border transition-all duration-150",
                active
                  ? "border-primary/50 bg-brand-soft text-primary"
                  : "border-line text-muted-foreground hover:border-line-strong hover:text-foreground",
              )}
            >
              {renderThumb(option)}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function ShapeSection() {
  const t = useTranslations("editor.shape");
  const dots = useQrStore((s) => s.config.style.dots);
  const cornersSquare = useQrStore((s) => s.config.style.cornersSquare);
  const cornersDot = useQrStore((s) => s.config.style.cornersDot);
  const setDotsStyle = useQrStore((s) => s.setDotsStyle);
  const setCornersSquare = useQrStore((s) => s.setCornersSquare);
  const setCornersDot = useQrStore((s) => s.setCornersDot);

  return (
    <div className="flex flex-col gap-5">
      <StylePicker
        label={t("dotStyle")}
        options={DOT_STYLES}
        value={dots.style}
        onChange={setDotsStyle}
        renderThumb={(s) => <DotStyleThumb style={s} />}
        getLabel={(s) => t(`dotStyles.${s}`)}
      />
      <StylePicker
        label={t("cornerSquareStyle")}
        options={CORNER_SQUARE_STYLES}
        value={cornersSquare.style}
        onChange={(style) => setCornersSquare({ style })}
        renderThumb={(s) => <CornerSquareThumb style={s} />}
        getLabel={(s) => t(`cornerStyles.${s}`)}
      />
      <StylePicker
        label={t("cornerDotStyle")}
        options={CORNER_DOT_STYLES}
        value={cornersDot.style}
        onChange={(style) => setCornersDot({ style })}
        renderThumb={(s) => <CornerDotThumb style={s} />}
        getLabel={(s) => t(`cornerStyles.${s}`)}
      />
    </div>
  );
}
