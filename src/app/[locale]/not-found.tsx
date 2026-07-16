import { useTranslations } from "next-intl";
import { SearchX } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

export default function NotFoundPage() {
  const t = useTranslations("notFound");

  return (
    <section className="mx-auto flex max-w-xl flex-col items-center gap-6 px-4 py-32 text-center">
      <div className="flex size-16 items-center justify-center rounded-2xl bg-brand-soft text-primary">
        <SearchX strokeWidth={1.75} className="size-8" />
      </div>
      <h1 className="text-3xl font-semibold tracking-tight">{t("title")}</h1>
      <p className="text-muted-foreground">{t("description")}</p>
      <Button asChild>
        <Link href="/">{t("cta")}</Link>
      </Button>
    </section>
  );
}
