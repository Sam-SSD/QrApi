"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { ImagePlus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { LabeledSlider } from "../controls/labeled-slider";
import { useQrStore } from "@/stores/qr-store";

const MAX_LOGO_BYTES = 500_000;

export function LogoSection() {
  const t = useTranslations("editor.logo");
  const logo = useQrStore((s) => s.config.logo);
  const ecLevel = useQrStore((s) => s.config.ecLevel);
  const setLogo = useQrStore((s) => s.setLogo);
  const patchLogo = useQrStore((s) => s.patchLogo);
  const setEcLevel = useQrStore((s) => s.setEcLevel);
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  function onFile(file: File | undefined) {
    setError(null);
    if (!file) return;
    if (file.size > MAX_LOGO_BYTES) {
      setError(t("tooBig"));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setLogo({
        dataUri: String(reader.result),
        sizeRatio: logo?.sizeRatio ?? 0.22,
        margin: logo?.margin ?? 1,
        background: logo?.background ?? true,
      });
      // Con logo conviene subir la corrección de errores
      if (ecLevel === "L" || ecLevel === "M") setEcLevel("H");
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="flex flex-col gap-5">
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/svg+xml,image/webp"
        className="hidden"
        onChange={(e) => onFile(e.target.files?.[0])}
      />

      {logo ? (
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={logo.dataUri}
            alt=""
            className="size-14 rounded-md border border-line bg-white object-contain p-1"
          />
          <div className="flex flex-col gap-1.5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => inputRef.current?.click()}
            >
              <ImagePlus className="size-4" strokeWidth={1.75} />
              {t("change")}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive"
              onClick={() => setLogo(undefined)}
            >
              <Trash2 className="size-4" strokeWidth={1.75} />
              {t("remove")}
            </Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-line-strong px-4 py-8 text-sm text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
        >
          <ImagePlus className="size-6" strokeWidth={1.5} />
          <span className="font-medium">{t("upload")}</span>
          <span className="text-xs text-ink-faint">{t("dropHint")}</span>
        </button>
      )}

      {error && (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      )}

      {logo && (
        <>
          <LabeledSlider
            id="logo-size"
            label={t("size")}
            value={Math.round(logo.sizeRatio * 100)}
            min={10}
            max={35}
            format={(v) => `${v}%`}
            onChange={(v) => patchLogo({ sizeRatio: v / 100 })}
          />
          <LabeledSlider
            id="logo-margin"
            label={t("margin")}
            value={logo.margin}
            min={0}
            max={4}
            step={0.5}
            onChange={(v) => patchLogo({ margin: v })}
          />
          <div className="flex items-center justify-between">
            <Label htmlFor="logo-bg">{t("background")}</Label>
            <Switch
              id="logo-bg"
              checked={logo.background}
              onCheckedChange={(v) => patchLogo({ background: v })}
            />
          </div>
          {ecLevel !== "H" && (
            <p className="text-xs text-warning">{t("eccHint")}</p>
          )}
        </>
      )}
    </div>
  );
}
