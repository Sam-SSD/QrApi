"use client";

import { useTranslations } from "next-intl";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ColorControl } from "../controls/color-control";
import { LabeledSlider } from "../controls/labeled-slider";
import { GRADIENT_PRESETS } from "@/lib/qr/templates";
import { useQrStore } from "@/stores/qr-store";
import { cn } from "@/lib/utils";

/** Distributes offsets evenly between 0 and 1 for a list of colors. */
function distributeStops(colors: string[]) {
  return colors.map((color, i) => ({
    offset: colors.length <= 1 ? 0 : i / (colors.length - 1),
    color,
  }));
}

export function StyleSection() {
  const t = useTranslations("editor.style");
  const dots = useQrStore((s) => s.config.style.dots);
  const background = useQrStore((s) => s.config.style.background);
  const setDotsColor = useQrStore((s) => s.setDotsColor);
  const setBgColor = useQrStore((s) => s.setBgColor);
  const setBgTransparent = useQrStore((s) => s.setBgTransparent);
  const setGradient = useQrStore((s) => s.setGradient);
  const setBgGradient = useQrStore((s) => s.setBgGradient);

  const gradient = dots.gradient;
  const bgGradient = background.gradient;

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 gap-3">
        <ColorControl
          id="style-dot-color"
          label={t("dotColor")}
          value={dots.color}
          onChange={setDotsColor}
        />
        <ColorControl
          id="style-bg-color"
          label={t("bgColor")}
          value={background.color}
          onChange={setBgColor}
        />
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="style-transparent">{t("transparentBg")}</Label>
        <Switch
          id="style-transparent"
          checked={background.transparent}
          onCheckedChange={setBgTransparent}
        />
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="style-gradient">{t("useGradient")}</Label>
        <Switch
          id="style-gradient"
          checked={Boolean(gradient)}
          onCheckedChange={(on) =>
            setGradient(
              on
                ? {
                    type: "linear",
                    rotation: 45,
                    stops: [
                      { offset: 0, color: dots.color },
                      { offset: 1, color: "#22d3ee" },
                    ],
                  }
                : undefined,
            )
          }
        />
      </div>

      {gradient && (
        <div className="flex flex-col gap-4 rounded-lg border border-line bg-canvas-subtle p-3">
          {/* Color stops (2-4), with evenly distributed offsets */}
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium">{t("stops")}</span>
            {gradient.stops.map((stop, i) => (
              <div key={i} className="flex items-end gap-2">
                <div className="flex-1">
                  <ColorControl
                    id={`style-grad-stop-${i}`}
                    label={t("stopLabel", { index: i + 1 })}
                    value={stop.color}
                    onChange={(color) =>
                      setGradient({
                        ...gradient,
                        stops: gradient.stops.map((s, idx) =>
                          idx === i ? { ...s, color } : s,
                        ),
                      })
                    }
                  />
                </div>
                {gradient.stops.length > 2 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-9 shrink-0 text-destructive hover:text-destructive"
                    aria-label={t("removeStop", { index: i + 1 })}
                    onClick={() =>
                      setGradient({
                        ...gradient,
                        stops: distributeStops(
                          gradient.stops
                            .filter((_, idx) => idx !== i)
                            .map((s) => s.color),
                        ),
                      })
                    }
                  >
                    <Trash2 className="size-4" strokeWidth={1.75} />
                  </Button>
                )}
              </div>
            ))}
            {gradient.stops.length < 4 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="self-start"
                onClick={() =>
                  setGradient({
                    ...gradient,
                    stops: distributeStops([
                      ...gradient.stops.map((s) => s.color),
                      gradient.stops[gradient.stops.length - 1].color,
                    ]),
                  })
                }
              >
                <Plus className="size-4" strokeWidth={1.75} />
                {t("addStop")}
              </Button>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="style-grad-type">{t("gradientType")}</Label>
            <Select
              value={gradient.type}
              onValueChange={(v) =>
                setGradient({ ...gradient, type: v as "linear" | "radial" })
              }
            >
              <SelectTrigger id="style-grad-type" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="linear">{t("gradientLinear")}</SelectItem>
                <SelectItem value="radial">{t("gradientRadial")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {gradient.type === "linear" && (
            <LabeledSlider
              id="style-grad-angle"
              label={t("gradientAngle")}
              value={gradient.rotation}
              min={0}
              max={360}
              step={5}
              format={(v) => `${v}°`}
              onChange={(rotation) => setGradient({ ...gradient, rotation })}
            />
          )}
        </div>
      )}

      {/* Background gradient (independent from the dots one) */}
      <div className="flex items-center justify-between">
        <Label htmlFor="style-bg-gradient">{t("useBgGradient")}</Label>
        <Switch
          id="style-bg-gradient"
          checked={Boolean(bgGradient)}
          onCheckedChange={(on) =>
            setBgGradient(
              on
                ? {
                    type: "linear",
                    rotation: 135,
                    stops: [
                      { offset: 0, color: background.color },
                      { offset: 1, color: "#e0e7ff" },
                    ],
                  }
                : undefined,
            )
          }
        />
      </div>

      {bgGradient && (
        <div className="flex flex-col gap-2 rounded-lg border border-line bg-canvas-subtle p-3">
          <span className="text-xs font-medium text-muted-foreground">
            {t("bgGradientPresets")}
          </span>
          <div className="flex flex-wrap gap-2">
            {Object.entries(GRADIENT_PRESETS).map(([name, preset]) => {
              const active =
                JSON.stringify(bgGradient) === JSON.stringify(preset);
              const angle =
                preset.type === "radial" ? "circle" : `${preset.rotation}deg`;
              const css = `${preset.type === "radial" ? "radial" : "linear"}-gradient(${angle}, ${preset.stops
                .map((s) => `${s.color} ${s.offset * 100}%`)
                .join(", ")})`;
              return (
                <button
                  key={name}
                  type="button"
                  title={name}
                  aria-label={`${t("bgGradientPresets")}: ${name}`}
                  aria-pressed={active}
                  onClick={() => setBgGradient(structuredClone(preset))}
                  className={cn(
                    "size-9 rounded-md border transition-all duration-150 hover:scale-105",
                    active
                      ? "border-primary ring-2 ring-primary/40"
                      : "border-line",
                  )}
                  style={{ background: css }}
                />
              );
            })}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium">{t("presets")}</span>
        <div className="flex flex-wrap gap-2">
          {Object.entries(GRADIENT_PRESETS).map(([name, preset]) => {
            const active = JSON.stringify(gradient) === JSON.stringify(preset);
            const angle =
              preset.type === "radial" ? "circle" : `${preset.rotation}deg`;
            const css = `${preset.type === "radial" ? "radial" : "linear"}-gradient(${angle}, ${preset.stops
              .map((s) => `${s.color} ${s.offset * 100}%`)
              .join(", ")})`;
            return (
              <button
                key={name}
                type="button"
                title={name}
                aria-label={`${t("presets")}: ${name}`}
                aria-pressed={active}
                onClick={() => setGradient(structuredClone(preset))}
                className={cn(
                  "size-9 rounded-md border transition-all duration-150 hover:scale-105",
                  active
                    ? "border-primary ring-2 ring-primary/40"
                    : "border-line",
                )}
                style={{ background: css }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
