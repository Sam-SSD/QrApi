"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { KeyRound } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LanguageTabs } from "@/components/docs/language-tabs";
import { CopyButton } from "@/components/docs/copy-button";
import {
  buildApiRequestBody,
  buildApiSnippets,
  truncateDataUris,
} from "@/lib/qr/api-snippets";
import { MAX_BODY_BYTES } from "@/lib/qr/api-schema";
import { SITE_URL } from "@/lib/constants";
import type { QrConfig, QrPayload } from "@/lib/qr/schema";

function SnippetPanel({ code }: { code: string }) {
  return (
    <div className="flex items-start gap-2 rounded-lg border border-line bg-canvas-subtle p-3">
      <pre className="max-h-80 min-w-0 flex-1 overflow-auto font-mono text-xs leading-relaxed text-muted-foreground">
        {truncateDataUris(code)}
      </pre>
      <CopyButton text={code} />
    </div>
  );
}

// Separate component so the (potentially large) snippet strings are only
// built while the dialog is mounted, not on every render of the parent.
function ApiRequestContent({
  payload,
  data,
  config,
}: {
  payload: QrPayload | null;
  data?: string | null;
  config: QrConfig;
}) {
  const t = useTranslations("apiRequest");
  const baseUrl =
    typeof window === "undefined" ? SITE_URL : window.location.origin;
  const token = t("token");

  const { snippets, tooLarge } = useMemo(() => {
    const body = buildApiRequestBody({ payload, data, config });
    return {
      snippets: buildApiSnippets({ payload, data, config, baseUrl, token }),
      tooLarge: JSON.stringify(body).length > MAX_BODY_BYTES,
    };
  }, [payload, data, config, baseUrl, token]);

  return (
    <>
      <DialogHeader>
        <DialogTitle>{t("title")}</DialogTitle>
        <DialogDescription>{t("tokenHint", { token })}</DialogDescription>
      </DialogHeader>
      {tooLarge && (
        <p className="rounded-lg border border-warning/30 bg-warning/5 px-4 py-3 text-xs text-warning">
          {t("tooLarge")}
        </p>
      )}
      <LanguageTabs
        tabs={snippets.map((snippet) => ({
          id: snippet.id,
          label: snippet.label,
          content: <SnippetPanel code={snippet.code} />,
        }))}
      />
      <DialogFooter>
        <Button type="button" variant="outline" asChild>
          <Link href="/dashboard/api-keys">
            <KeyRound className="size-4" strokeWidth={1.75} />
            {t("getKey")}
          </Link>
        </Button>
      </DialogFooter>
    </>
  );
}

export function ApiRequestDialog({
  open,
  onOpenChange,
  payload,
  data,
  config,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payload: QrPayload | null;
  data?: string | null;
  config: QrConfig;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <ApiRequestContent payload={payload} data={data} config={config} />
      </DialogContent>
    </Dialog>
  );
}
