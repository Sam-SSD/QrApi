"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Lock, LockOpen } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { setDynamicPassword } from "@/actions/dynamic-qr";

/** Protects/unprotects a dynamic QR with a scan password. */
export function DynamicPasswordForm({
  id,
  hasPassword,
}: {
  id: string;
  hasPassword: boolean;
}) {
  const t = useTranslations("dashboard.dynamic");
  const [password, setPassword] = useState("");
  const [pending, startTransition] = useTransition();

  function save(event: React.FormEvent) {
    event.preventDefault();
    if (password.trim().length < 4) {
      toast.error(t("passwordTooShort"));
      return;
    }
    startTransition(async () => {
      try {
        await setDynamicPassword(id, password.trim());
        setPassword("");
        toast.success(t("passwordSaved"));
      } catch {
        toast.error("Error");
      }
    });
  }

  function remove() {
    startTransition(async () => {
      try {
        await setDynamicPassword(id, null);
        toast.success(t("passwordRemoved"));
      } catch {
        toast.error("Error");
      }
    });
  }

  return (
    <div className="rounded-xl border border-line bg-surface p-4">
      <h3 className="mb-1 flex items-center gap-2 text-sm font-semibold">
        {hasPassword ? (
          <Lock className="size-4 text-primary" strokeWidth={1.75} />
        ) : (
          <LockOpen
            className="size-4 text-muted-foreground"
            strokeWidth={1.75}
          />
        )}
        {t("passwordTitle")}
      </h3>
      <p className="mb-3 text-xs text-muted-foreground">
        {hasPassword ? t("passwordActiveHint") : t("passwordHint")}
      </p>
      <form onSubmit={save} className="flex flex-wrap items-end gap-2">
        <div className="flex min-w-40 flex-1 flex-col gap-1.5">
          <Label htmlFor={`dyn-pass-${id}`} className="text-xs">
            {hasPassword ? t("passwordChangeLabel") : t("passwordLabel")}
          </Label>
          <Input
            id={`dyn-pass-${id}`}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={4}
            maxLength={72}
            className="h-8"
          />
        </div>
        <Button type="submit" size="sm" disabled={pending || !password.trim()}>
          {t("passwordSet")}
        </Button>
        {hasPassword && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={pending}
            onClick={remove}
          >
            {t("passwordRemove")}
          </Button>
        )}
      </form>
    </div>
  );
}
