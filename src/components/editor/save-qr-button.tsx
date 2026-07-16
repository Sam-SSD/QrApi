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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { saveQrCode } from "@/actions/qr-codes";
import type { QrConfig, QrPayload } from "@/lib/qr/schema";

export function SaveQrButton({
  payload,
  config,
  disabled,
}: {
  payload: QrPayload | null;
  config: QrConfig;
  disabled: boolean;
}) {
  const t = useTranslations("dashboard.save");
  const tQr = useTranslations("dashboard.qr");
  const { data: session, isPending } = useSession();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
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
    if (!payload) return;
    startTransition(async () => {
      try {
        await saveQrCode({ name: name.trim() || t("namePlaceholder"), payload, config });
        toast.success(tQr("saved"));
        setOpen(false);
        setName("");
      } catch (error) {
        toast.error(
          error instanceof Error && error.message === "LIMIT_REACHED"
            ? tQr("limitReached")
            : "Error",
        );
      }
    });
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        className="w-full"
        disabled={disabled}
        onClick={() => setOpen(true)}
      >
        <Save className="size-4" strokeWidth={1.75} />
        {t("button")}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{t("title")}</DialogTitle>
          </DialogHeader>
          <form onSubmit={submit} className="flex flex-col gap-4">
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
            <Button type="submit" disabled={pending}>
              {t("submit")}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
