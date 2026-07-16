"use client";

import { useTranslations } from "next-intl";
import { CircleAlert, CircleCheck, TriangleAlert } from "lucide-react";
import type { QrConfig } from "@/lib/qr/schema";
import { cn } from "@/lib/utils";

function relativeLuminance(hex: string): number {
  const channel = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

function contrastRatio(a: string, b: string): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

export interface ScanAssessment {
  level: "good" | "warning" | "bad";
  reasons: string[];
}

export function assessScanability(config: QrConfig): ScanAssessment {
  const reasons: string[] = [];
  const { style, logo, effects, ecLevel } = config;
  const bg = style.background.color;
  const dotColors = style.dots.gradient
    ? style.dots.gradient.stops.map((s) => s.color)
    : [style.dots.color];

  const minContrast = Math.min(...dotColors.map((c) => contrastRatio(c, bg)));
  let level: ScanAssessment["level"] = "good";

  if (minContrast < 1.8) {
    level = "bad";
    reasons.push("lowContrast");
  } else if (minContrast < 3) {
    level = "warning";
    reasons.push("lowContrast");
  }

  if (logo && logo.sizeRatio > 0.25 && ecLevel !== "H") {
    if (level === "good") level = "warning";
    reasons.push("bigLogo");
  }

  const dotsLighter =
    relativeLuminance(dotColors[0]) > relativeLuminance(bg) ||
    (effects?.invert ?? false);
  if (dotsLighter) {
    if (level === "good") level = "warning";
    reasons.push("invertedNote");
  }

  return { level, reasons: [...new Set(reasons)] };
}

export function ScanCheck({ config }: { config: QrConfig }) {
  const t = useTranslations("editor.scan");
  const { level, reasons } = assessScanability(config);

  const Icon =
    level === "good"
      ? CircleCheck
      : level === "warning"
        ? TriangleAlert
        : CircleAlert;

  return (
    <div
      className={cn(
        "flex flex-col gap-1 rounded-md border px-3 py-2 text-xs",
        level === "good" && "border-success/30 bg-success/5 text-success",
        level === "warning" && "border-warning/30 bg-warning/5 text-warning",
        level === "bad" &&
          "border-destructive/30 bg-destructive/5 text-destructive",
      )}
    >
      <span className="flex items-center gap-1.5 font-medium">
        <Icon className="size-3.5" strokeWidth={2} />
        {t(level === "good" ? "good" : level === "warning" ? "warning" : "bad")}
      </span>
      {reasons.map((reason) => (
        <span key={reason} className="text-muted-foreground">
          {t(reason)}
        </span>
      ))}
    </div>
  );
}
