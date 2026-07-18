"use client";

import { useTranslations } from "next-intl";
import { Copy, Download } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  exportQr,
  copyQrToClipboard,
  type ExportFormat,
} from "@/lib/qr/export";

const FORMATS: ExportFormat[] = ["png", "svg", "jpg", "pdf"];

/**
 * Export menu of a saved QR: downloads in the chosen format
 * (PNG/SVG/JPG/PDF) or copies the image to the clipboard.
 */
export function QrExportMenu({
  getSvg,
  filename,
}: {
  getSvg: () => string | null;
  filename: string;
}) {
  const t = useTranslations("dashboard.export");

  async function run(action: () => Promise<void>, successMsg: string) {
    try {
      await action();
      toast.success(successMsg);
    } catch {
      toast.error(t("failed"));
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8"
          aria-label={t("download")}
        >
          <Download className="size-4" strokeWidth={1.75} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {FORMATS.map((format) => (
          <DropdownMenuItem
            key={format}
            onSelect={() => {
              const svg = getSvg();
              if (!svg) return;
              void run(
                () => exportQr(svg, format, { width: 1024, filename }),
                t("downloaded", { format: format.toUpperCase() }),
              );
            }}
          >
            <Download className="size-4" strokeWidth={1.75} />
            {format.toUpperCase()}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={() => {
            const svg = getSvg();
            if (!svg) return;
            void run(() => copyQrToClipboard(svg, 1024), t("copied"));
          }}
        >
          <Copy className="size-4" strokeWidth={1.75} />
          {t("copyImage")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
