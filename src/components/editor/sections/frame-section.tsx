"use client";

import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ColorControl } from "../controls/color-control";
import {
  FRAME_STYLES,
  FRAME_POSITIONS,
  FRAME_ICONS,
  type QrFrame,
} from "@/lib/qr/schema";
import { useQrStore } from "@/stores/qr-store";
import { cn } from "@/lib/utils";

export function FrameSection() {
  const t = useTranslations("editor.frame");
  const frame = useQrStore((s) => s.config.frame);
  const setFrame = useQrStore((s) => s.setFrame);
  const patchFrame = useQrStore((s) => s.patchFrame);

  // Selecciona un estilo (crea el marco si no existía) o lo quita ("none").
  function selectStyle(style: QrFrame["style"] | "none") {
    if (style === "none") {
      setFrame(undefined);
      return;
    }
    if (frame) {
      patchFrame({ style });
    } else {
      setFrame({
        style,
        text: t("textPlaceholder"),
        color: "#4f46e5",
        position: "bottom",
        icon: "none",
      });
    }
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Selector de estilo siempre visible, con "Ninguno" como primera opción:
          elegir un estilo crea el marco y muestra sus controles al instante. */}
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium">{t("style")}</span>
        <div
          role="radiogroup"
          aria-label={t("style")}
          className="flex flex-wrap gap-1.5"
        >
          <button
            type="button"
            role="radio"
            aria-checked={!frame}
            onClick={() => selectStyle("none")}
            className={cn(
              "rounded-md border px-3 py-1.5 text-xs font-medium transition-all duration-150",
              !frame
                ? "border-primary/50 bg-brand-soft text-primary"
                : "border-line text-muted-foreground hover:border-line-strong hover:text-foreground",
            )}
          >
            {t("styles.none")}
          </button>
          {FRAME_STYLES.map((style) => {
            const active = frame?.style === style;
            return (
              <button
                key={style}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => selectStyle(style)}
                className={cn(
                  "rounded-md border px-3 py-1.5 text-xs font-medium transition-all duration-150",
                  active
                    ? "border-primary/50 bg-brand-soft text-primary"
                    : "border-line text-muted-foreground hover:border-line-strong hover:text-foreground",
                )}
              >
                {t(`styles.${style}`)}
              </button>
            );
          })}
        </div>
      </div>

      {frame && (
        <>
          <div className="flex flex-col gap-2">
            <Label htmlFor="frame-text">{t("text")}</Label>
            <Input
              id="frame-text"
              value={frame.text}
              onChange={(e) => patchFrame({ text: e.target.value })}
              placeholder={t("textPlaceholder")}
              maxLength={30}
            />
          </div>

          {/* Posición de la banda de texto */}
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium">{t("position")}</span>
            <div
              role="radiogroup"
              aria-label={t("position")}
              className="flex gap-1.5"
            >
              {FRAME_POSITIONS.map((position) => {
                const active = frame.position === position;
                return (
                  <button
                    key={position}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => patchFrame({ position })}
                    className={cn(
                      "flex-1 rounded-md border px-3 py-1.5 text-xs font-medium transition-all duration-150",
                      active
                        ? "border-primary/50 bg-brand-soft text-primary"
                        : "border-line text-muted-foreground hover:border-line-strong hover:text-foreground",
                    )}
                  >
                    {t(`positions.${position}`)}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Icono opcional en la banda */}
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium">{t("icon")}</span>
            <div
              role="radiogroup"
              aria-label={t("icon")}
              className="flex flex-wrap gap-1.5"
            >
              {FRAME_ICONS.map((icon) => {
                const active = frame.icon === icon;
                return (
                  <button
                    key={icon}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => patchFrame({ icon })}
                    className={cn(
                      "rounded-md border px-3 py-1.5 text-xs font-medium transition-all duration-150",
                      active
                        ? "border-primary/50 bg-brand-soft text-primary"
                        : "border-line text-muted-foreground hover:border-line-strong hover:text-foreground",
                    )}
                  >
                    {t(`icons.${icon}`)}
                  </button>
                );
              })}
            </div>
          </div>

          <ColorControl
            id="frame-color"
            label={t("color")}
            value={frame.color}
            onChange={(color) => patchFrame({ color })}
          />

          {/* Color del texto: automático (contraste) o manual */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="frame-text-auto">{t("autoContrast")}</Label>
              <Switch
                id="frame-text-auto"
                checked={frame.textColor === undefined}
                onCheckedChange={(auto) =>
                  patchFrame({ textColor: auto ? undefined : "#ffffff" })
                }
              />
            </div>
            {frame.textColor !== undefined && (
              <ColorControl
                id="frame-text-color"
                label={t("textColor")}
                value={frame.textColor}
                onChange={(textColor) => patchFrame({ textColor })}
              />
            )}
          </div>
        </>
      )}
    </div>
  );
}
