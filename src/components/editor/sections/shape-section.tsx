"use client";

import { useTranslations } from "next-intl";
import {
  DOT_STYLES,
  CORNER_SQUARE_STYLES,
  CORNER_DOT_STYLES,
} from "@/lib/qr/schema";
import { useQrStore } from "@/stores/qr-store";
import { cn } from "@/lib/utils";

/** Rect with per-corner radius [tl, tr, br, bl] — same path as the engine. */
function roundedRectThumb(
  x: number,
  y: number,
  w: number,
  h: number,
  [tl, tr, br, bl]: [number, number, number, number],
): string {
  return [
    `M${x + tl},${y}`,
    `h${w - tl - tr}`,
    tr ? `a${tr},${tr} 0 0 1 ${tr},${tr}` : "",
    `v${h - tr - br}`,
    br ? `a${br},${br} 0 0 1 ${-br},${br}` : "",
    `h${-(w - br - bl)}`,
    bl ? `a${bl},${bl} 0 0 1 ${-bl},${-bl}` : "",
    `v${-(h - bl - tl)}`,
    tl ? `a${tl},${tl} 0 0 1 ${tl},${-tl}` : "",
    "z",
  ]
    .filter(Boolean)
    .join("");
}

/** Star path for the thumbnails. */
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

/** SVG thumbnails for each dot style (illustrative 3×3 pattern). */
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
          <rect
            key={`${x}-${y}`}
            x={px + 2}
            y={py}
            width={4}
            height={8}
            rx={2}
          />
        );
      case "horizontal-line":
        return (
          <rect
            key={`${x}-${y}`}
            x={px}
            y={py + 2}
            width={8}
            height={4}
            rx={2}
          />
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
          <path key={`${x}-${y}`} d={`M${px + 4},${py}l4,4l-4,4l-4,-4z`} />
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
  // Per-corner radii [tl, tr, br, bl] mirroring each engine style.
  const radii: Record<
    (typeof CORNER_SQUARE_STYLES)[number],
    [number, number, number, number]
  > = {
    square: [0, 0, 0, 0],
    rounded: [6, 6, 6, 6],
    "extra-rounded": [10, 10, 10, 10],
    outpoint: [0, 9, 0, 9], // TL y BR en punta
    inpoint: [9, 0, 9, 0], // TR y BL en punta
    classy: [0, 7, 0, 7], // one pointed corner, the opposite one rounded
  };
  return (
    <svg viewBox="0 0 30 30" className="size-7" aria-hidden="true">
      <path
        d={roundedRectThumb(3, 3, 24, 24, radii[style])}
        fill="none"
        stroke="currentColor"
        strokeWidth={4}
      />
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
      <div
        role="radiogroup"
        aria-label={label}
        className="flex flex-wrap gap-1.5"
      >
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
