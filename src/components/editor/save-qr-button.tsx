"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Save } from "lucide-react";
import { toast } from "sonner";
import { useSession } from "@/lib/auth-client";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { saveQrCode, updateSavedQr } from "@/actions/qr-codes";
import { createDynamicQr, updateDynamicDesign } from "@/actions/dynamic-qr";
import type { QrConfig, QrPayload } from "@/lib/qr/schema";
import type { EditingQr } from "./qr-editor";

export function SaveQrButton({
  payload,
  config,
  disabled,
  editing,
}: {
  payload: QrPayload | null;
  config: QrConfig;
  disabled: boolean;
  /** Si viene, el botón actualiza este QR guardado en vez de crear uno nuevo. */
  editing?: EditingQr;
}) {
  const t = useTranslations("dashboard.save");
  const tQr = useTranslations("dashboard.qr");
  const { data: session, isPending } = useSession();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(editing?.name ?? "");
  const [dynamic, setDynamic] = useState(false);
  const [targetUrl, setTargetUrl] = useState("");
  const [pending, startTransition] = useTransition();

  if (isPending) return null;

  if (!session) {
    return (
      <Button type="button" variant="outline" className="w-full" asChild>
        <Link href="/login">
          <Save className="size-4" strokeWidth={1.75} />
          {t("loginRequired")}
        </Link>
      </Button>
    );
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const title = name.trim() || t("namePlaceholder");
    startTransition(async () => {
      try {
        if (editing) {
          // Modo edición: actualizar el registro existente.
          if (editing.dynamic) {
            await updateDynamicDesign(editing.id, config);
          } else {
            if (!payload) return;
            await updateSavedQr(editing.id, { name: title, payload, config });
          }
        } else if (dynamic) {
          await createDynamicQr({ title, targetUrl: targetUrl.trim(), config });
        } else {
          if (!payload) return;
          await saveQrCode({ name: title, payload, config });
        }
        toast.success(editing ? t("updated") : tQr("saved"));
        setOpen(false);
        if (!editing) {
          setName("");
          setTargetUrl("");
          setDynamic(false);
        }
      } catch (error) {
        toast.error(
          error instanceof Error && error.message === "LIMIT_REACHED"
            ? tQr("limitReached")
            : "Error",
        );
      }
    });
  }

  // En modo dinámico basta un targetUrl válido; en estático hace falta payload.
  const canSubmit = editing
    ? editing.dynamic || Boolean(payload)
    : dynamic
      ? targetUrl.trim().length > 0
      : Boolean(payload);

  return (
    <>
      <Button
        type="button"
        variant="outline"
        className="w-full"
        disabled={disabled && !editing?.dynamic}
        onClick={() => setOpen(true)}
      >
        <Save className="size-4" strokeWidth={1.75} />
        {editing ? t("editButton") : t("button")}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{editing ? t("editTitle") : t("title")}</DialogTitle>
          </DialogHeader>
          <form onSubmit={submit} className="flex flex-col gap-4">
            {/* El nombre del dinámico se gestiona en el panel; aquí solo diseño. */}
            {!editing?.dynamic && (
              <div className="flex flex-col gap-2">
                <Label htmlFor="save-qr-name">{t("nameLabel")}</Label>
                <Input
                  id="save-qr-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t("namePlaceholder")}
                  maxLength={80}
                  autoFocus
                />
              </div>
            )}

            {/* Estático vs dinámico: solo al crear (el modo no se cambia editando) */}
            {!editing && (
              <div className="flex items-start justify-between gap-3 rounded-lg border border-line bg-canvas-subtle p-3">
                <div className="flex flex-col gap-0.5">
                  <Label htmlFor="save-qr-dynamic">{t("dynamicLabel")}</Label>
                  <span className="text-xs text-muted-foreground">
                    {t("dynamicHint")}
                  </span>
                </div>
                <Switch
                  id="save-qr-dynamic"
                  checked={dynamic}
                  onCheckedChange={setDynamic}
                />
              </div>
            )}

            {!editing && dynamic && (
              <div className="flex flex-col gap-2">
                <Label htmlFor="save-qr-target">{t("targetUrlLabel")}</Label>
                <Input
                  id="save-qr-target"
                  type="url"
                  inputMode="url"
                  value={targetUrl}
                  onChange={(e) => setTargetUrl(e.target.value)}
                  placeholder="https://ejemplo.com"
                />
              </div>
            )}

            {editing?.dynamic && (
              <p className="text-sm text-muted-foreground">{t("editDynamicHint")}</p>
            )}

            <Button type="submit" disabled={pending || !canSubmit}>
              {editing ? t("editSubmit") : t("submit")}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
