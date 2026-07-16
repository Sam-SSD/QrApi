"use client";

import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="rounded-sm border border-line bg-canvas-subtle px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground">
      {children}
    </kbd>
  );
}

export function ShortcutsDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useTranslations("editor.shortcuts");

  const rows: Array<[React.ReactNode, string]> = [
    [
      <span key="d" className="flex gap-1">
        <Kbd>Ctrl</Kbd>
        <Kbd>S</Kbd>
      </span>,
      t("download"),
    ],
    [
      <span key="c" className="flex gap-1">
        <Kbd>Ctrl</Kbd>
        <Kbd>Shift</Kbd>
        <Kbd>C</Kbd>
      </span>,
      t("copy"),
    ],
    [
      <span key="h" className="flex gap-1">
        <Kbd>Ctrl</Kbd>
        <Kbd>H</Kbd>
      </span>,
      t("history"),
    ],
    [<Kbd key="t">T</Kbd>, t("templates")],
    [<Kbd key="q">?</Kbd>, t("help")],
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-2.5">
          {rows.map(([keys, label], i) => (
            <div key={i} className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{label}</span>
              {keys}
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
