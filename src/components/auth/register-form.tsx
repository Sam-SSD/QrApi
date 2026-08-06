"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import { signUp } from "@/lib/auth-client";
import { Link, useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OAuthButtons } from "./oauth-buttons";

export function RegisterForm({
  providers,
  requireEmailVerification,
}: {
  providers: Array<"github" | "google">;
  requireEmailVerification: boolean;
}) {
  const t = useTranslations("auth.register");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const mismatch = confirm.length > 0 && password !== confirm;

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (password !== confirm) return;
    setError(null);
    setLoading(true);

    const form = new FormData(event.currentTarget);
    const name = String(form.get("name"));
    const email = String(form.get("email"));

    const { error: authError } = await signUp.email({
      name,
      email,
      password,
      // callbackURL only matters for the verification email link.
      ...(requireEmailVerification
        ? { callbackURL: `/${locale}/verify-email?verified=true` }
        : {}),
    });

    if (authError) {
      setLoading(false);
      setError(
        authError.code === "USER_ALREADY_EXISTS"
          ? t("emailTaken")
          : (authError.message ?? tCommon("error")),
      );
      return;
    }

    if (requireEmailVerification) {
      router.push(`/verify-email?email=${encodeURIComponent(email)}`);
    } else {
      // autoSignIn already set the session cookie on the sign-up response.
      router.push("/dashboard");
      router.refresh();
    }
  }

  return (
    <>
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="name">{t("name")}</Label>
          <Input id="name" name="name" autoComplete="name" required />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="email">{t("email")}</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="password">{t("password")}</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            aria-describedby="password-hint"
          />
          <p id="password-hint" className="text-xs text-ink-faint">
            {t("passwordHint")}
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="confirm-password">{t("confirmPassword")}</Label>
          <Input
            id="confirm-password"
            type="password"
            autoComplete="new-password"
            minLength={8}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            aria-invalid={mismatch}
            aria-describedby={mismatch ? "confirm-password-error" : undefined}
          />
          {mismatch && (
            <p
              id="confirm-password-error"
              role="alert"
              className="text-sm text-destructive"
            >
              {t("passwordMismatch")}
            </p>
          )}
        </div>
        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
        <Button type="submit" className="w-full" disabled={loading || mismatch}>
          {loading && <Loader2 className="size-4 animate-spin" />}
          {loading ? t("submitting") : t("submit")}
        </Button>
      </form>

      <OAuthButtons providers={providers} label={t("orContinueWith")} />

      <p className="mt-6 text-center text-sm text-muted-foreground">
        {t("haveAccount")}{" "}
        <Link
          href="/login"
          className="font-medium text-primary transition-colors hover:text-primary/80"
        >
          {t("loginLink")}
        </Link>
      </p>
    </>
  );
}
