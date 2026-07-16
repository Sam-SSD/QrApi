"use client";

import { useLocale } from "next-intl";
import { signIn } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { GithubIcon } from "@/components/brand/github-icon";

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path
        fill="currentColor"
        d="M21.35 11.1H12v2.9h5.35c-.5 2.5-2.6 4.3-5.35 4.3a5.8 5.8 0 1 1 0-11.6c1.45 0 2.75.55 3.75 1.45l2.15-2.15A8.9 8.9 0 0 0 12 3.5a8.5 8.5 0 1 0 0 17c4.9 0 8.5-3.45 8.5-8.3 0-.4-.05-.75-.15-1.1Z"
      />
    </svg>
  );
}

export function OAuthButtons({
  providers,
  label,
}: {
  providers: Array<"github" | "google">;
  label: string;
}) {
  const locale = useLocale();

  if (providers.length === 0) return null;

  const handle = (provider: "github" | "google") =>
    signIn.social({ provider, callbackURL: `/${locale}/dashboard` });

  return (
    <>
      <div className="my-5 flex items-center gap-3">
        <span className="h-px flex-1 bg-line" />
        <span className="text-xs text-ink-faint">{label}</span>
        <span className="h-px flex-1 bg-line" />
      </div>
      <div className="flex flex-col gap-2">
        {providers.includes("github") && (
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => handle("github")}
          >
            <GithubIcon className="size-4" />
            GitHub
          </Button>
        )}
        {providers.includes("google") && (
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => handle("google")}
          >
            <GoogleIcon className="size-4" />
            Google
          </Button>
        )}
      </div>
    </>
  );
}
