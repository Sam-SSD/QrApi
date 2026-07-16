"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Check, Copy, Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { exportQr, copyQrToClipboard, type ExportFormat } from "@/lib/qr/export";

const SIZES = [512, 1024, 2048, 4096] as const;

export function ExportBar({
  getSvg,
  filename,
  disabled,
  onExported,
}: {
  /** Devuelve el SVG actual (o null si no hay QR válido). */
  getSvg: () => string | null;
  filename: string;
  disabled: boolean;
  onExported?: () => void;
}) {
  const t = useTranslations("editor.export");
  const [format, setFormat] = useState<ExportFormat>("png");
  const [size, setSize] = useState<number>(1024);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleDownload() {
    const svg = getSvg();
    if (!svg) return;
    setBusy(true);
    try {
      await exportQr(svg, format, { width: size, filename });
      setDone(true);
      setTimeout(() => setDone(false), 1600);
      toast.success(t("success"));
      onExported?.();
    } catch {
      toast.error(t("error"));
    } finally {
      setBusy(false);
    }
  }

  async function handleCopy() {
    const svg = getSvg();
    if (!svg) return;
    try {
      await copyQrToClipboard(svg, 1024);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
      toast.success(t("copied"));
      onExported?.();
    } catch {
      toast.error(t("error"));
    }
  }

  return (
    <div className="flex flex-col gap-2.5">
      <div className="grid grid-cols-2 gap-2">
        <Select value={format} onValueChange={(v) => setFormat(v as ExportFormat)}>
          <SelectTrigger aria-label={t("format")} className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="png">PNG</SelectItem>
            <SelectItem value="jpg">JPG</SelectItem>
            <SelectItem value="svg">SVG</SelectItem>
            <SelectItem value="pdf">PDF</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={String(size)}
          onValueChange={(v) => setSize(Number(v))}
          disabled={format === "svg"}
        >
          <SelectTrigger aria-label={t("size")} className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SIZES.map((s) => (
              <SelectItem key={s} value={String(s)}>
                {s} px
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex gap-2">
        <Button
          id="qr-download-trigger"
          type="button"
          className="flex-1"
          disabled={disabled || busy}
          onClick={handleDownload}
        >
          {busy ? (
            <Loader2 className="size-4 animate-spin" />
          ) : done ? (
            <Check className="size-4" />
          ) : (
            <Download className="size-4" strokeWidth={1.75} />
          )}
          {busy ? t("downloading") : t("download")}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label={t("copy")}
          disabled={disabled}
          onClick={handleCopy}
        >
          {copied ? (
            <Check className="size-4 text-success" />
          ) : (
            <Copy className="size-4" strokeWidth={1.75} />
          )}
        </Button>
      </div>
    </div>
  );
}
