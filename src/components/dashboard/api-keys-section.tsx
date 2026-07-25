"use client";

import { useState, useTransition } from "react";
import { useFormatter, useTranslations } from "next-intl";
import { Check, Copy, KeyRound, Plus, ShieldOff } from "lucide-react";
import { toast } from "sonner";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { createApiKey, revokeApiKey } from "@/actions/api-keys";

export interface ApiKeyRow {
  id: string;
  name: string;
  prefix: string;
  createdAt: number;
  lastUsedAt: number | null;
  revoked: boolean;
  requestCount: number;
}

function CreateKeyDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useTranslations("dashboard.keys");
  const [name, setName] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [pending, startTransition] = useTransition();

  function close() {
    onOpenChange(false);
    // clear the token from component memory on close
    setTimeout(() => {
      setToken(null);
      setName("");
      setCopied(false);
      setConfirmed(false);
    }, 300);
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    startTransition(async () => {
      try {
        const result = await createApiKey(name);
        setToken(result.token);
      } catch (error) {
        toast.error(
          error instanceof Error && error.message === "LIMIT_REACHED"
            ? t("limitReached")
            : "Error",
        );
      }
    });
  }

  async function copyToken() {
    if (!token) return;
    await navigator.clipboard.writeText(token);
    setCopied(true);
    toast.success(t("tokenCopied"));
  }

  return (
    <Dialog open={open} onOpenChange={(o) => (o ? onOpenChange(o) : close())}>
      <DialogContent className="max-w-md">
        {token === null ? (
          <>
            <DialogHeader>
              <DialogTitle>{t("createTitle")}</DialogTitle>
            </DialogHeader>
            <form onSubmit={submit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="key-name">{t("nameLabel")}</Label>
                <Input
                  id="key-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t("namePlaceholder")}
                  maxLength={60}
                  required
                  autoFocus
                />
              </div>
              <Button type="submit" disabled={pending || !name.trim()}>
                {t("createSubmit")}
              </Button>
            </form>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>{t("tokenTitle")}</DialogTitle>
              <DialogDescription className="text-warning">
                {t("tokenWarning")}
              </DialogDescription>
            </DialogHeader>
            <div className="flex items-center gap-2 rounded-lg border border-primary/30 bg-brand-soft p-3">
              <code className="flex-1 font-mono text-xs break-all select-all">
                {token}
              </code>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={copyToken}
                aria-label={t("tokenCopied")}
              >
                {copied ? (
                  <Check className="size-4 text-success" />
                ) : (
                  <Copy className="size-4" strokeWidth={1.75} />
                )}
              </Button>
            </div>
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
                className="accent-primary"
              />
              {t("confirmSaved")}
            </label>
            <Button
              type="button"
              disabled={!copied && !confirmed}
              onClick={close}
            >
              {t("done")}
            </Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function KeyRow({ row }: { row: ApiKeyRow }) {
  const t = useTranslations("dashboard.keys");
  const tCommon = useTranslations("common");
  const format = useFormatter();
  const [confirmRevoke, setConfirmRevoke] = useState(false);
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-line bg-surface px-4 py-3">
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="flex items-center gap-2 text-sm font-medium">
          {row.name}
          {row.revoked && (
            <Badge variant="outline" className="text-destructive">
              {t("revokedBadge")}
            </Badge>
          )}
        </span>
        <code className="font-mono text-xs text-muted-foreground">
          {row.prefix}…
        </code>
      </div>
      <div className="flex flex-col gap-0.5 text-right text-xs text-ink-faint">
        <span>
          {t("created")}:{" "}
          {format.dateTime(row.createdAt, { dateStyle: "medium" })}
        </span>
        <span>
          {t("lastUsed")}:{" "}
          {row.lastUsedAt ? format.relativeTime(row.lastUsedAt) : t("never")} ·{" "}
          {t("requests", { count: row.requestCount })}
        </span>
      </div>
      {!row.revoked && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="text-destructive hover:text-destructive"
          disabled={pending}
          onClick={() => setConfirmRevoke(true)}
        >
          <ShieldOff className="size-4" strokeWidth={1.75} />
          {t("revoke")}
        </Button>
      )}

      <AlertDialog open={confirmRevoke} onOpenChange={setConfirmRevoke}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("revokeTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("revokeDescription", { name: row.name })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tCommon("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() =>
                startTransition(async () => {
                  await revokeApiKey(row.id);
                  toast.success(t("revoked"));
                })
              }
            >
              {t("revoke")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export function ApiKeysSection({ keys }: { keys: ApiKeyRow[] }) {
  const t = useTranslations("dashboard.keys");
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">{t("title")}</h2>
          <p className="text-sm text-muted-foreground">
            {t("subtitle")} ·{" "}
            <Link href="/docs/api" className="text-primary hover:underline">
              {t("docsLink")}
            </Link>
          </p>
        </div>
        <Button type="button" onClick={() => setCreateOpen(true)}>
          <Plus className="size-4" strokeWidth={1.75} />
          {t("create")}
        </Button>
      </div>

      {keys.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed border-line-strong px-6 py-16 text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-brand-soft text-primary">
            <KeyRound className="size-7" strokeWidth={1.5} />
          </div>
          <p className="text-sm text-muted-foreground">{t("empty")}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {keys.map((row) => (
            <KeyRow key={row.id} row={row} />
          ))}
        </div>
      )}

      <CreateKeyDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}
