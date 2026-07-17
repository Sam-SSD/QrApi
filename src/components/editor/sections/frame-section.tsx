"use client";

import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ColorControl } from "../controls/color-control";
import { FRAME_STYLES, FRAME_POSITIONS, FRAME_ICONS } from "@/lib/qr/schema";
import { useQrStore } from "@/stores/qr-store";
import { cn } from "@/lib/utils";

export function FrameSection() {
  const t = useTranslations("editor.frame");
  const frame = useQrStore((s) => s.config.frame);
  const setFrame = useQrStore((s) => s.setFrame);
  const patchFrame = useQrStore((s) => s.patchFrame);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <Label htmlFor="frame-enable">{t("enable")}</Label>
        <Switch
          id="frame-enable"
          checked={Boolean(frame)}
          onCheckedChange={(on) =>
            setFrame(
              on
                ? {
                    style: "modern",
                    text: t("textPlaceholder"),
                    color: "#4f46e5",
                    position: "bottom",
                    icon: "none",
                  }
                : undefined,
            )
          }
        />
      </div>

      {frame && (
        <>
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium">{t("style")}</span>
            <div
              role="radiogroup"
              aria-label={t("style")}
              className="flex flex-wrap gap-1.5"
            >
              {FRAME_STYLES.map((style) => {
                const active = frame.style === style;
                return (
                  <button
                    key={style}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => patchFrame({ style })}
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
