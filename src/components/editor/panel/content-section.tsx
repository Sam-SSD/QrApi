"use client";

import { useTranslations } from "next-intl";
import {
  Bitcoin,
  Contact,
  Globe,
  Mail,
  MessageSquare,
  Phone,
  Type,
  Wifi,
} from "lucide-react";
import { AnimatePresence, m } from "motion/react";
import { PAYLOAD_TYPES, type QrPayloadType } from "@/lib/qr/schema";
import { MAX_QR_DATA_LENGTH } from "@/lib/qr/schema";
import { useQrStore } from "@/stores/qr-store";
import { PayloadForm } from "./payload-forms";
import { cn } from "@/lib/utils";

const TYPE_ICONS: Record<QrPayloadType, React.ComponentType<{ className?: string; strokeWidth?: number }>> = {
  text: Type,
  url: Globe,
  email: Mail,
  phone: Phone,
  sms: MessageSquare,
  wifi: Wifi,
  vcard: Contact,
  crypto: Bitcoin,
};

export function ContentSection({
  issues,
  charCount,
}: {
  issues: Record<string, string>;
  charCount: number;
}) {
  const t = useTranslations("editor.content");
  const type = useQrStore((s) => s.type);
  const setType = useQrStore((s) => s.setType);

  return (
    <section aria-label={t("title")} className="flex flex-col gap-4">
      <div
        role="radiogroup"
        aria-label={t("title")}
        className="grid grid-cols-4 gap-1.5"
      >
        {PAYLOAD_TYPES.map((pt) => {
          const Icon = TYPE_ICONS[pt];
          const active = pt === type;
          return (
            <button
              key={pt}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => setType(pt)}
              className={cn(
                "flex flex-col items-center gap-1 rounded-md border px-1 py-2.5 text-xs font-medium transition-all duration-150",
                active
                  ? "border-primary/50 bg-brand-soft text-primary"
                  : "border-line text-muted-foreground hover:border-line-strong hover:text-foreground",
              )}
            >
              <Icon className="size-4.5" strokeWidth={1.75} />
              {t(`types.${pt}`)}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <m.div
          key={type}
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -12 }}
          transition={{ duration: 0.18 }}
        >
          <PayloadForm type={type} issues={issues} />
        </m.div>
      </AnimatePresence>

      <p
        className={cn(
          "text-right font-mono text-xs",
          charCount > MAX_QR_DATA_LENGTH
            ? "text-destructive"
            : charCount > MAX_QR_DATA_LENGTH * 0.85
              ? "text-warning"
              : "text-ink-faint",
        )}
        aria-live="polite"
      >
        {t("charCount", { count: charCount, max: MAX_QR_DATA_LENGTH })}
      </p>
    </section>
  );
}
