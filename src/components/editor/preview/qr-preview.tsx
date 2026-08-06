"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { AnimatePresence, m } from "motion/react";
import { renderQrSvg } from "@/lib/qr/render-svg";
import { qrConfigSchema, type QrConfig } from "@/lib/qr/schema";
import { SITE_URL } from "@/lib/constants";
import { cn } from "@/lib/utils";

/**
 * Ghost QR for the empty state. Generated once from the real engine
 * (well-formed QR matrix) instead of drawing cells by hand, and dimmed via
 * container opacity. Fixed muted colors because `hexColor` does not accept
 * `currentColor` (tokens can't theme inside the SVG).
 */
const GHOST_SVG = renderQrSvg(
  SITE_URL,
  qrConfigSchema.parse({
    ecLevel: "M",
    margin: 1,
    style: {
      dots: { style: "rounded", color: "#c7c9d1" },
      cornersSquare: { style: "extra-rounded", color: "#c7c9d1" },
      cornersDot: { style: "dot", color: "#c7c9d1" },
      background: { transparent: true },
    },
  }),
);

function GhostQr() {
  return (
    <div
      aria-hidden="true"
      className="size-full opacity-40 [&_svg]:block [&_svg]:h-auto [&_svg]:w-full"
      dangerouslySetInnerHTML={{ __html: GHOST_SVG }}
    />
  );
}

export interface QrPreviewProps {
  data: string | null;
  config: QrConfig;
  empty: boolean;
  invalid: boolean;
  className?: string;
}

export function QrPreview({
  data,
  config,
  empty,
  invalid,
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
    if (!data) return;
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
      } catch {
        setRenderError(true);
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
