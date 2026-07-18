"use client";

import { useEffect, useId, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "qrapi:docs-lang";
const SYNC_EVENT = "qrapi:docs-lang-change";

/**
 * Tabs de lenguaje sincronizadas: cambiar el lenguaje en un grupo lo cambia
 * en todos los grupos de la página (CustomEvent) y persiste (localStorage).
 */
export function LanguageTabs({
  tabs,
}: {
  /** [etiqueta, contenido server-rendered] */
  tabs: Array<{ id: string; label: string; content: React.ReactNode }>;
}) {
  const [active, setActive] = useState(tabs[0].id);
  const uid = useId();
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && stored !== tabs[0].id && tabs.some((tab) => tab.id === stored)) {
      setActive(stored);
      // aplicar la pestaña guardada cambia la altura de los paneles y puede
      // desplazar un deep-link (#ancla) ya resuelto: re-anclar tras el cambio
      const hash = window.location.hash.slice(1);
      if (hash) {
        requestAnimationFrame(() => {
          document.getElementById(hash)?.scrollIntoView();
        });
      }
    }

    function onSync(event: Event) {
      const id = (event as CustomEvent<string>).detail;
      if (tabs.some((tab) => tab.id === id)) setActive(id);
    }
    window.addEventListener(SYNC_EVENT, onSync);
    return () => window.removeEventListener(SYNC_EVENT, onSync);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function select(id: string) {
    setActive(id);
    localStorage.setItem(STORAGE_KEY, id);
    window.dispatchEvent(new CustomEvent(SYNC_EVENT, { detail: id }));
  }

  function onKeyDown(event: React.KeyboardEvent, index: number) {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    event.preventDefault();
    const delta = event.key === "ArrowRight" ? 1 : -1;
    const next = (index + delta + tabs.length) % tabs.length;
    select(tabs[next].id);
    tabRefs.current[next]?.focus();
  }

  return (
    <div>
      <div role="tablist" className="mb-3 flex gap-1.5">
        {tabs.map((tab, index) => (
          <button
            key={tab.id}
            ref={(el) => {
              tabRefs.current[index] = el;
            }}
            role="tab"
            id={`tab-${uid}-${tab.id}`}
            aria-selected={tab.id === active}
            aria-controls={`tabpanel-${uid}-${tab.id}`}
            tabIndex={tab.id === active ? 0 : -1}
            onClick={() => select(tab.id)}
            onKeyDown={(event) => onKeyDown(event, index)}
            className={cn(
              "rounded-md border px-3 py-1 text-xs font-medium transition-all duration-150",
              tab.id === active
                ? "border-primary/50 bg-brand-soft text-primary"
                : "border-line text-muted-foreground hover:border-line-strong hover:text-foreground",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {tabs.map((tab) => (
        <div
          key={tab.id}
          hidden={tab.id !== active}
          role="tabpanel"
          id={`tabpanel-${uid}-${tab.id}`}
          aria-labelledby={`tab-${uid}-${tab.id}`}
        >
          {tab.content}
        </div>
      ))}
    </div>
  );
}
