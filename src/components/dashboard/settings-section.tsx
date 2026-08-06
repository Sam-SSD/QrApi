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
import { UserAvatar } from "@/components/ui/user-avatar";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export interface SettingsUser {
  name: string;
  email: string;
  image: string | null;
}

function ProfileCard({ user }: { user: SettingsUser }) {
  const t = useTranslations("dashboard.settings");
  const router = useRouter();
  const [name, setName] = useState(user.name);
  const [busy, setBusy] = useState(false);

  const trimmed = name.trim();
  const dirty = trimmed !== user.name;

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!dirty || trimmed.length === 0) return;
    setBusy(true);
    const { error } = await authClient.updateUser({ name: trimmed });
    setBusy(false);
    if (error) {
      toast.error(t("profileError"));
      return;
    }
    toast.success(t("profileSaved"));
    setName(trimmed);
    router.refresh();
  }

  return (
    <form
      onSubmit={submit}
      className="flex flex-col gap-4 rounded-xl border border-line bg-surface p-5"
    >
      <h2 className="font-semibold">{t("profileTitle")}</h2>
      <div className="flex items-center gap-3">
        <UserAvatar
          name={trimmed.length > 0 ? trimmed : user.name}
          image={user.image}
          className="size-12 text-base"
        />
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{user.name}</p>
          <p className="truncate text-xs text-muted-foreground">
            {user.email}
          </p>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="set-name">{t("nameLabel")}</Label>
        <Input
          id="set-name"
          autoComplete="name"
          maxLength={60}
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="set-email">{t("emailLabel")}</Label>
        <Input
          id="set-email"
          type="email"
          value={user.email}
          disabled
          readOnly
          aria-describedby="set-email-hint"
        />
        <p id="set-email-hint" className="text-xs text-ink-faint">
          {t("emailHint")}
        </p>
      </div>
      <Button
        type="submit"
        disabled={busy || !dirty || trimmed.length === 0}
        className="self-start"
      >
        {busy && <Loader2 className="size-4 animate-spin" />}
        {t("saveProfile")}
      </Button>
    </form>
  );
}

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
      className="flex flex-col gap-4 rounded-xl border border-line bg-surface p-5"
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
  const tCommon = useTranslations("common");
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
    <div className="flex flex-col gap-4 rounded-xl border border-destructive/30 bg-surface p-5 sm:flex-row sm:items-center sm:justify-between lg:col-span-2">
      <h2 className="flex items-center gap-2 font-semibold text-destructive">
        <TriangleAlert className="size-4" strokeWidth={1.75} />
        {t("dangerTitle")}
      </h2>
      <Button
        type="button"
        variant="outline"
        className="self-start text-destructive hover:text-destructive sm:self-auto"
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
            <AlertDialogCancel>{tCommon("cancel")}</AlertDialogCancel>
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

export function SettingsSection({ user }: { user: SettingsUser }) {
  return (
    <div className="grid max-w-4xl gap-6 lg:grid-cols-2">
      <ProfileCard user={user} />
      <ChangePasswordCard />
      <DangerZoneCard />
    </div>
  );
}
