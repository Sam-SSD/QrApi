"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { AnimatePresence, m } from "motion/react";
import { renderQrSvg } from "@/lib/qr/render-svg";
import type { QrConfig } from "@/lib/qr/schema";
import { cn } from "@/lib/utils";

/** QR fantasma para el estado vacío. */
function GhostQr() {
  const cells: Array<[number, number]> = [
    [9, 1], [11, 1], [14, 1], [9, 3], [10, 4], [12, 4], [14, 3],
    [1, 9], [3, 10], [4, 12], [2, 13], [5, 9], [6, 11], [1, 15],
    [9, 9], [11, 10], [13, 12], [10, 13], [14, 14], [12, 15], [9, 15],
    [15, 9], [16, 11], [15, 13], [11, 7], [13, 6], [7, 11], [7, 14],
  ];
  return (
    <svg viewBox="0 0 18 18" className="size-full" aria-hidden="true">
      {[
        [0, 0],
        [11, 0],
        [0, 11],
      ].map(([x, y]) => (
        <g key={`${x}-${y}`} className="fill-brand-soft stroke-primary/30">
          <rect
            x={x + 0.4}
            y={y + 0.4}
            width={6.2}
            height={6.2}
            rx={1.6}
            fill="none"
            strokeWidth={0.8}
          />
          <rect x={x + 2.2} y={y + 2.2} width={2.6} height={2.6} rx={0.7} />
        </g>
      ))}
      {cells.map(([x, y]) => (
        <rect
          key={`${x}.${y}`}
          x={x}
          y={y}
          width={1}
          height={1}
          rx={0.25}
          className="fill-line"
        />
      ))}
    </svg>
  );
}

export interface QrPreviewProps {
  data: string | null;
  config: QrConfig;
  empty: boolean;
  invalid: boolean;
  /** Callback con el último SVG renderizado correctamente. */
  onRender?: (svg: string | null) => void;
  className?: string;
}

export function QrPreview({
  data,
  config,
  empty,
  invalid,
  onRender,
  className,
}: QrPreviewProps) {
  const t = useTranslations("editor.preview");
  const [svg, setSvg] = useState<string | null>(null);
  const [renderId, setRenderId] = useState(0);
  const [renderError, setRenderError] = useState(false);
  const tokenRef = useRef(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const configKey = useMemo(() => JSON.stringify(config), [config]);

  useEffect(() => {
    if (!data) {
      onRender?.(null);
      return;
    }
    const token = ++tokenRef.current;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      // token anti-race: descarta renders obsoletos
      if (token !== tokenRef.current) return;
      try {
        const next = renderQrSvg(data, config);
        setSvg(next);
        setRenderError(false);
        setRenderId((id) => id + 1);
        onRender?.(next);
      } catch {
        setRenderError(true);
        onRender?.(null);
      }
    }, 120);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, configKey]);

  const showGhost = empty || (!svg && !renderError);
  const dimmed = invalid || renderError;

  return (
    <div className={cn("relative", className)}>
      {showGhost ? (
        <div className="flex aspect-square items-center justify-center p-6">
          <GhostQr />
        </div>
      ) : (
        <div
          role="img"
          aria-label={t("ariaLabel")}
          className={cn(
            "qr-preview relative transition-opacity duration-200 [&_svg]:block [&_svg]:h-auto [&_svg]:w-full",
            dimmed && "opacity-40",
          )}
        >
          <AnimatePresence initial={false} mode="popLayout">
            <m.div
              key={renderId}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              dangerouslySetInnerHTML={{ __html: svg ?? "" }}
            />
          </AnimatePresence>
        </div>
      )}
      <span className="sr-only" aria-live="polite">
        {svg && !dimmed ? t("updated") : ""}
      </span>
    </div>
  );
}
