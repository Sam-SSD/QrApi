import { Link } from "@/i18n/navigation";
import { LogoMark } from "@/components/brand/logo";

export function AuthCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[calc(100dvh-8rem)] items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-4 text-center">
          <Link href="/" aria-label="QrAPI">
            <LogoMark className="size-10 text-foreground" />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          </div>
        </div>
        <div className="rounded-xl border border-line bg-surface p-6 shadow-raised">
          {children}
        </div>
      </div>
    </div>
  );
}
