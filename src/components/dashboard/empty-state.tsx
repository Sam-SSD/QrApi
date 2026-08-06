import { QrCode } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

/** Empty-state block for dashboard lists; expects `empty`, `emptyHint` and `emptyCta` keys in the namespace. */
export function EmptyState({ namespace }: { namespace: string }) {
  const t = useTranslations(namespace);

  return (
    <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed border-line-strong px-6 py-16 text-center">
      <div className="flex size-14 items-center justify-center rounded-2xl bg-brand-soft text-primary">
        <QrCode className="size-7" strokeWidth={1.5} />
      </div>
      <div>
        <p className="font-medium">{t("empty")}</p>
        <p className="mt-1 text-sm text-muted-foreground">{t("emptyHint")}</p>
      </div>
      <Button asChild>
        <Link href="/generator">{t("emptyCta")}</Link>
      </Button>
    </div>
  );
}
