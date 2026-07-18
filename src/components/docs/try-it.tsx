"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Loader2, Play } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CopyButton } from "@/components/docs/copy-button";
import { DOT_STYLES, EC_LEVELS } from "@/lib/qr/schema";
import { SITE_URL } from "@/lib/constants";

const FORMATS = ["png", "svg", "jpeg"] as const;
const SIZES = ["256", "400", "512", "1024"] as const;

interface ResponseMeta {
  status: number;
  limit: string | null;
  remaining: string | null;
  ms: number;
}

export function TryIt() {
  const t = useTranslations("docs.tryIt");
  const [token, setToken] = useState("");
  const [data, setData] = useState(SITE_URL);
  const [format, setFormat] = useState<(typeof FORMATS)[number]>("png");
  const [size, setSize] = useState<(typeof SIZES)[number]>("400");
  const [dotsStyle, setDotsStyle] =
    useState<(typeof DOT_STYLES)[number]>("rounded");
  const [ecLevel, setEcLevel] = useState<(typeof EC_LEVELS)[number]>("M");
  const [origin, setOrigin] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [meta, setMeta] = useState<ResponseMeta | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const query = useMemo(
    () =>
      `data=${encodeURIComponent(data)}&format=${format}&size=${size}&dotsStyle=${dotsStyle}&ecLevel=${ecLevel}`,
    [data, format, size, dotsStyle, ecLevel],
  );

  const curl = useMemo(() => {
    const base = origin || SITE_URL;
    const bearer = token.trim() || t("tokenSample");
    return `curl "${base}/api/v1/qr?${query}" \\\n  -H "Authorization: Bearer ${bearer}" \\\n  -o qr.${format === "jpeg" ? "jpg" : format}`;
  }, [origin, query, token, format, t]);

  async function run(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setMeta(null);
    try {
      const started = performance.now();
      const response = await fetch(`/api/v1/qr?${query}`, {
        headers: { Authorization: `Bearer ${token.trim()}` },
      });
      setMeta({
        status: response.status,
        limit: response.headers.get("X-RateLimit-Limit"),
        remaining: response.headers.get("X-RateLimit-Remaining"),
        ms: Math.round(performance.now() - started),
      });
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
    <div className="flex flex-col gap-5 rounded-xl border border-line bg-surface p-5">
      <p className="text-sm text-muted-foreground">{t("body")}</p>
      <div className="grid gap-6 md:grid-cols-[1fr_auto]">
        <form onSubmit={run} className="flex min-w-0 flex-col gap-4">
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
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="tryit-format">{t("formatLabel")}</Label>
              <Select
                value={format}
                onValueChange={(v) => setFormat(v as typeof format)}
              >
                <SelectTrigger
                  id="tryit-format"
                  className="w-full font-mono text-xs"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FORMATS.map((value) => (
                    <SelectItem
                      key={value}
                      value={value}
                      className="font-mono text-xs"
                    >
                      {value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="tryit-size">{t("sizeLabel")}</Label>
              <Select
                value={size}
                onValueChange={(v) => setSize(v as typeof size)}
              >
                <SelectTrigger
                  id="tryit-size"
                  className="w-full font-mono text-xs"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SIZES.map((value) => (
                    <SelectItem
                      key={value}
                      value={value}
                      className="font-mono text-xs"
                    >
                      {value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="tryit-style">{t("styleLabel")}</Label>
              <Select
                value={dotsStyle}
                onValueChange={(v) => setDotsStyle(v as typeof dotsStyle)}
              >
                <SelectTrigger
                  id="tryit-style"
                  className="w-full font-mono text-xs"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DOT_STYLES.map((value) => (
                    <SelectItem
                      key={value}
                      value={value}
                      className="font-mono text-xs"
                    >
                      {value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="tryit-ec">{t("ecLabel")}</Label>
              <Select
                value={ecLevel}
                onValueChange={(v) => setEcLevel(v as typeof ecLevel)}
              >
                <SelectTrigger
                  id="tryit-ec"
                  className="w-full font-mono text-xs"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EC_LEVELS.map((value) => (
                    <SelectItem
                      key={value}
                      value={value}
                      className="font-mono text-xs"
                    >
                      {value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
        <div className="flex flex-col items-center gap-3 md:w-48">
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUrl}
              alt="QR"
              className="size-40 rounded-lg border border-line bg-white object-contain md:size-48"
            />
          ) : (
            <div className="flex size-40 items-center justify-center rounded-lg border border-dashed border-line text-xs text-ink-faint md:size-48">
              {t("placeholder")}
            </div>
          )}
          {meta && (
            <div className="flex flex-wrap items-center justify-center gap-1.5 font-mono text-[11px]">
              <Badge
                variant="outline"
                className={
                  meta.status < 400 ? "text-success" : "text-destructive"
                }
              >
                {meta.status}
              </Badge>
              <Badge variant="outline" className="text-muted-foreground">
                {meta.ms} ms
              </Badge>
              {meta.limit && meta.remaining && (
                <Badge variant="outline" className="text-muted-foreground">
                  {t("quota", { remaining: meta.remaining, limit: meta.limit })}
                </Badge>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <p className="text-xs text-muted-foreground">{t("request")}</p>
        <div className="flex items-start gap-2 rounded-lg border border-line bg-canvas-subtle p-3">
          <pre className="min-w-0 flex-1 overflow-x-auto font-mono text-xs leading-relaxed text-muted-foreground">
            {curl}
          </pre>
          <CopyButton text={curl} />
        </div>
      </div>
    </div>
  );
}
