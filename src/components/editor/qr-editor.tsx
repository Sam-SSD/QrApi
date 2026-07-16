"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { History, LayoutTemplate, RotateCcw } from "lucide-react";
import { LazyMotion, domAnimation, MotionConfig } from "motion/react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { useQrStore, computePayload } from "@/stores/qr-store";
import { renderQrSvg } from "@/lib/qr/render-svg";
import { useQrHistory } from "@/hooks/use-qr-history";
import { useMediaQuery } from "@/hooks/use-media-query";
import { TEMPLATES } from "@/lib/qr/templates";
import { ContentSection } from "./panel/content-section";
import { StyleSection } from "./sections/style-section";
import { ShapeSection } from "./sections/shape-section";
import { LogoSection } from "./sections/logo-section";
import { FrameSection } from "./sections/frame-section";
import { AdvancedSection } from "./sections/advanced-section";
import { QrPreview } from "./preview/qr-preview";
import { ScanCheck } from "./preview/scan-check";
import { ExportBar } from "./preview/export-bar";
import { TemplatesGallery } from "./templates-gallery";
import { HistoryDrawer } from "./history-drawer";
import { ShortcutsDialog } from "./shortcuts-dialog";

export function QrEditor({ initialTemplateId }: { initialTemplateId?: string }) {
  const t = useTranslations("editor");
  const type = useQrStore((s) => s.type);
  const fields = useQrStore((s) => s.fields);
  const config = useQrStore((s) => s.config);
  const reset = useQrStore((s) => s.reset);
  const applyTemplate = useQrStore((s) => s.applyTemplate);

  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const history = useQrHistory();
  const isMobile = useMediaQuery("(max-width: 1023px)");
  const lastSvgRef = useRef<string | null>(null);

  // Preset inicial vía ?preset= (enlaces desde la landing)
  const appliedInitial = useRef(false);
  useEffect(() => {
    if (appliedInitial.current || !initialTemplateId) return;
    const template = TEMPLATES.find((tpl) => tpl.id === initialTemplateId);
    if (template) applyTemplate(template);
    appliedInitial.current = true;
  }, [initialTemplateId, applyTemplate]);

  const payload = useMemo(() => computePayload(type, fields), [type, fields]);
  const charCount = payload.data?.length ?? 0;

  const getSvg = useCallback(() => {
    if (!payload.data) return null;
    try {
      const svg = renderQrSvg(payload.data, config);
      lastSvgRef.current = svg;
      return svg;
    } catch {
      return null;
    }
  }, [payload.data, config]);

  const saveToHistory = useCallback(() => {
    if (!payload.data) return;
    history.add({
      type,
      data: payload.data,
      fields: { [type]: fields[type] },
      config,
    });
  }, [payload.data, type, fields, config, history]);

  // Atajos de teclado
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement;
      const typing =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;

      if (event.key === "?" && !typing) {
        event.preventDefault();
        setShortcutsOpen((v) => !v);
      } else if (event.key.toLowerCase() === "t" && !typing && !event.ctrlKey) {
        event.preventDefault();
        setTemplatesOpen((v) => !v);
      } else if (event.ctrlKey && event.key.toLowerCase() === "h") {
        event.preventDefault();
        setHistoryOpen((v) => !v);
      } else if (event.ctrlKey && !event.shiftKey && event.key.toLowerCase() === "s") {
        event.preventDefault();
        document.getElementById("qr-download-trigger")?.click();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const sheetSide = isMobile ? "bottom" : "right";

  const previewPanel = (
    <div className="flex flex-col gap-3 rounded-xl border border-line bg-surface p-4 shadow-raised">
      <QrPreview
        data={payload.data}
        config={config}
        empty={payload.empty}
        invalid={Object.keys(payload.issues).length > 0}
        className="mx-auto w-full max-w-105"
      />
      {payload.data && <ScanCheck config={config} />}
      {!payload.empty && Object.keys(payload.issues).length > 0 && (
        <p className="text-center text-xs text-warning">{t("preview.invalid")}</p>
      )}
      <div id="qr-export-bar">
        <ExportBar
          getSvg={getSvg}
          filename={`qrforge-${type}`}
          disabled={!payload.data}
          onExported={saveToHistory}
        />
      </div>
    </div>
  );

  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user">
        <div className="mx-auto max-w-7xl px-4 pt-6 pb-10 sm:px-6">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">
                {t("title")}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {t("subtitle")}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setTemplatesOpen(true)}
              >
                <LayoutTemplate className="size-4" strokeWidth={1.75} />
                {t("templates.title")}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setHistoryOpen(true)}
              >
                <History className="size-4" strokeWidth={1.75} />
                {t("history.title")}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={reset}
                aria-label={t("reset")}
              >
                <RotateCcw className="size-4" strokeWidth={1.75} />
              </Button>
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-[1fr_minmax(420px,480px)]">
            {/* En móvil la preview va primero y es sticky */}
            {isMobile && (
              <div className="glass sticky top-16 z-30 -mx-4 rounded-none border-x-0 px-4 py-3 sm:-mx-6 sm:px-6">
                <div className="mx-auto max-w-60">
                  <QrPreview
                    data={payload.data}
                    config={config}
                    empty={payload.empty}
                    invalid={Object.keys(payload.issues).length > 0}
                  />
                </div>
              </div>
            )}

            <div className="flex flex-col gap-6">
              <div className="rounded-xl border border-line bg-surface p-5">
                <ContentSection issues={payload.issues} charCount={charCount} />
              </div>

              <Accordion
                type="multiple"
                defaultValue={["style"]}
                className="rounded-xl border border-line bg-surface px-5"
              >
                <AccordionItem value="style">
                  <AccordionTrigger>{t("style.title")}</AccordionTrigger>
                  <AccordionContent>
                    <StyleSection />
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="shape">
                  <AccordionTrigger>{t("shape.title")}</AccordionTrigger>
                  <AccordionContent>
                    <ShapeSection />
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="logo">
                  <AccordionTrigger>{t("logo.title")}</AccordionTrigger>
                  <AccordionContent>
                    <LogoSection />
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="frame">
                  <AccordionTrigger>{t("frame.title")}</AccordionTrigger>
                  <AccordionContent>
                    <FrameSection />
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="advanced" className="border-b-0">
                  <AccordionTrigger>{t("advanced.title")}</AccordionTrigger>
                  <AccordionContent>
                    <AdvancedSection />
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              {/* Barra de export en móvil (abajo, siempre visible) */}
              {isMobile && previewPanel}
            </div>

            {!isMobile && (
              <div className="sticky top-20 self-start">{previewPanel}</div>
            )}
          </div>
        </div>

        <TemplatesGallery
          open={templatesOpen}
          onOpenChange={setTemplatesOpen}
          side={sheetSide}
        />
        <HistoryDrawer
          open={historyOpen}
          onOpenChange={setHistoryOpen}
          side={sheetSide}
          items={history.items}
          onRemove={history.remove}
          onClear={history.clear}
        />
        <ShortcutsDialog open={shortcutsOpen} onOpenChange={setShortcutsOpen} />
      </MotionConfig>
    </LazyMotion>
  );
}
