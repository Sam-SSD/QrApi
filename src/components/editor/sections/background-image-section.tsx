"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { ImagePlus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LabeledSlider } from "../controls/labeled-slider";
import { useQrStore } from "@/stores/qr-store";
import { MAX_IMAGE_BYTES } from "@/lib/constants";
import { sampleTint } from "@/lib/qr/sample-tint";

export function BackgroundImageSection() {
  const t = useTranslations("editor.backgroundImage");
  const image = useQrStore((s) => s.config.style.background.image);
  const setBgImage = useQrStore((s) => s.setBgImage);
  const patchBgImage = useQrStore((s) => s.patchBgImage);
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  function onFile(file: File | undefined) {
    setError(null);
    if (!file) return;
    if (file.size > MAX_IMAGE_BYTES) {
      setError(t("tooBig"));
      return;
    }
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUri = String(reader.result);
      setBgImage({
        dataUri,
        opacity: image?.opacity ?? 0.35,
      });
      // Samples the image's hue (lightened) to tint the finder plates so
      // they match without losing contrast. Best-effort.
      const tint = await sampleTint(dataUri);
      if (tint) patchBgImage({ tint });
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="flex flex-col gap-5">
      {/* The schema rejects svg+xml (avoids <script>): bitmaps only. */}
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={(e) => onFile(e.target.files?.[0])}
      />

      {image ? (
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image.dataUri}
            alt=""
            className="size-14 rounded-md border border-line object-cover"
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
              onClick={() => setBgImage(undefined)}
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

      {image && (
        <>
          <LabeledSlider
            id="bg-image-opacity"
            label={t("opacity")}
            value={Math.round(image.opacity * 100)}
            min={5}
            max={100}
            format={(v) => `${v}%`}
            onChange={(v) => patchBgImage({ opacity: v / 100 })}
          />
          <p className="text-xs text-warning">{t("ecWarning")}</p>
        </>
      )}
    </div>
  );
}
