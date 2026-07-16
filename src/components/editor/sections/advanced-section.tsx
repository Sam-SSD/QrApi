"use client";

import { useTranslations } from "next-intl";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { LabeledSlider } from "../controls/labeled-slider";
import { useQrStore } from "@/stores/qr-store";
import { cn } from "@/lib/utils";

const EC_LEVELS = [
  { value: "L", recovery: "7%" },
  { value: "M", recovery: "15%" },
  { value: "Q", recovery: "25%" },
  { value: "H", recovery: "30%" },
] as const;

export function AdvancedSection() {
  const t = useTranslations("editor.advanced");
  const ecLevel = useQrStore((s) => s.config.ecLevel);
  const margin = useQrStore((s) => s.config.margin);
  const effects = useQrStore((s) => s.config.effects);
  const setEcLevel = useQrStore((s) => s.setEcLevel);
  const setMargin = useQrStore((s) => s.setMargin);
  const patchEffects = useQrStore((s) => s.patchEffects);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium">{t("ecLevel")}</span>
        <div
          role="radiogroup"
          aria-label={t("ecLevel")}
          className="grid grid-cols-4 gap-1.5"
        >
          {EC_LEVELS.map(({ value, recovery }) => {
            const active = ecLevel === value;
            return (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setEcLevel(value)}
                className={cn(
                  "flex flex-col items-center rounded-md border py-2 transition-all duration-150",
                  active
                    ? "border-primary/50 bg-brand-soft text-primary"
                    : "border-line text-muted-foreground hover:border-line-strong hover:text-foreground",
                )}
              >
                <span className="text-sm font-semibold">{value}</span>
                <span className="font-mono text-[10px]">{recovery}</span>
              </button>
            );
          })}
        </div>
        <p className="text-xs text-ink-faint">{t("ecHint")}</p>
      </div>

      <LabeledSlider
        id="adv-margin"
        label={t("margin")}
        value={margin}
        min={0}
        max={10}
        onChange={setMargin}
      />

      <div className="flex items-center justify-between">
        <Label htmlFor="adv-invert">{t("invert")}</Label>
        <Switch
          id="adv-invert"
          checked={effects?.invert ?? false}
          onCheckedChange={(v) => patchEffects({ invert: v })}
        />
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="adv-glow">{t("glow")}</Label>
        <Switch
          id="adv-glow"
          checked={effects?.glow ?? false}
          onCheckedChange={(v) => patchEffects({ glow: v })}
        />
      </div>

      <LabeledSlider
        id="adv-opacity"
        label={t("opacity")}
        value={Math.round((effects?.opacity ?? 1) * 100)}
        min={10}
        max={100}
        step={5}
        format={(v) => `${v}%`}
        onChange={(v) => patchEffects({ opacity: v / 100 })}
      />
    </div>
  );
}
