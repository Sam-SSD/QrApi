"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Loader2, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function TryIt() {
  const t = useTranslations("docs.tryIt");
  const [token, setToken] = useState("");
  const [data, setData] = useState("https://qrapi.dev");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function run(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/v1/qr?data=${encodeURIComponent(data)}&format=png&size=400&dotsStyle=rounded`,
        { headers: { Authorization: `Bearer ${token.trim()}` } },
      );
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error?.message ?? t("error"));
      }
      const blob = await response.blob();
      setImageUrl((old) => {
        if (old) URL.revokeObjectURL(old);
        return URL.createObjectURL(blob);
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : t("error"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-6 rounded-xl border border-line bg-surface p-5 md:grid-cols-[1fr_auto]">
      <form onSubmit={run} className="flex flex-col gap-4">
        <p className="text-sm text-muted-foreground">{t("body")}</p>
        <div className="flex flex-col gap-2">
          <Label htmlFor="tryit-token">{t("tokenLabel")}</Label>
          <Input
            id="tryit-token"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="qra_…"
            className="font-mono text-sm"
            spellCheck={false}
            required
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="tryit-data">{t("dataLabel")}</Label>
          <Input
            id="tryit-data"
            value={data}
            onChange={(e) => setData(e.target.value)}
            required
          />
        </div>
        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
        <Button type="submit" disabled={busy} className="self-start">
          {busy ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Play className="size-4" strokeWidth={1.75} />
          )}
          {busy ? t("running") : t("run")}
        </Button>
      </form>
      {imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl}
          alt="QR"
          className="size-40 self-center rounded-lg border border-line md:size-48"
        />
      )}
    </div>
  );
}
