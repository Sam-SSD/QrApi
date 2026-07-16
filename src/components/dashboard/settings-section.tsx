"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Loader2, TriangleAlert } from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

function ChangePasswordCard() {
  const t = useTranslations("dashboard.settings");
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [revokeOthers, setRevokeOthers] = useState(true);
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    const { error } = await authClient.changePassword({
      currentPassword: current,
      newPassword: next,
      revokeOtherSessions: revokeOthers,
    });
    setBusy(false);
    if (error) {
      toast.error(t("passwordError"));
      return;
    }
    toast.success(t("passwordChanged"));
    setCurrent("");
    setNext("");
  }

  return (
    <form
      onSubmit={submit}
      className="flex max-w-md flex-col gap-4 rounded-xl border border-line bg-surface p-5"
    >
      <h2 className="font-semibold">{t("passwordTitle")}</h2>
      <div className="flex flex-col gap-2">
        <Label htmlFor="set-current">{t("currentPassword")}</Label>
        <Input
          id="set-current"
          type="password"
          autoComplete="current-password"
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
          required
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="set-new">{t("newPassword")}</Label>
        <Input
          id="set-new"
          type="password"
          autoComplete="new-password"
          minLength={8}
          value={next}
          onChange={(e) => setNext(e.target.value)}
          required
          aria-describedby="set-new-hint"
        />
        <p id="set-new-hint" className="text-xs text-ink-faint">
          {t("passwordHint")}
        </p>
      </div>
      <div className="flex items-center justify-between">
        <Label htmlFor="set-revoke">{t("revokeOthers")}</Label>
        <Switch
          id="set-revoke"
          checked={revokeOthers}
          onCheckedChange={setRevokeOthers}
        />
      </div>
      <Button type="submit" disabled={busy} className="self-start">
        {busy && <Loader2 className="size-4 animate-spin" />}
        {t("changePassword")}
      </Button>
    </form>
  );
}

function DangerZoneCard() {
  const t = useTranslations("dashboard.settings");
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function confirmDelete() {
    setBusy(true);
    const { error } = await authClient.deleteUser({ password });
    setBusy(false);
    if (error) {
      toast.error(t("deleteError"));
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <div className="flex max-w-md flex-col gap-4 rounded-xl border border-destructive/30 bg-surface p-5">
      <h2 className="flex items-center gap-2 font-semibold text-destructive">
        <TriangleAlert className="size-4" strokeWidth={1.75} />
        {t("dangerTitle")}
      </h2>
      <Button
        type="button"
        variant="outline"
        className="self-start text-destructive hover:text-destructive"
        onClick={() => setOpen(true)}
      >
        {t("deleteAccount")}
      </Button>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("deleteTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("deleteDescription")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex flex-col gap-2">
            <Label htmlFor="del-password">{t("deletePasswordLabel")}</Label>
            <Input
              id="del-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel />
            <Button
              type="button"
              variant="destructive"
              disabled={busy || password.length === 0}
              onClick={confirmDelete}
            >
              {busy && <Loader2 className="size-4 animate-spin" />}
              {t("deleteConfirm")}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export function SettingsSection() {
  return (
    <div className="flex flex-col gap-6">
      <ChangePasswordCard />
      <DangerZoneCard />
    </div>
  );
}
