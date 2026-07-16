"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "qrforge:docs-lang";

export function LanguageTabs({
  tabs,
}: {
  /** [etiqueta, contenido server-rendered] */
  tabs: Array<{ id: string; label: string; content: React.ReactNode }>;
}) {
  const [active, setActive] = useState(tabs[0].id);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && tabs.some((tab) => tab.id === stored)) setActive(stored);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function select(id: string) {
    setActive(id);
    localStorage.setItem(STORAGE_KEY, id);
  }

  return (
    <div>
      <div role="tablist" className="mb-3 flex gap-1.5">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={tab.id === active}
            onClick={() => select(tab.id)}
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
        <div key={tab.id} hidden={tab.id !== active} role="tabpanel">
          {tab.content}
        </div>
      ))}
    </div>
  );
}
