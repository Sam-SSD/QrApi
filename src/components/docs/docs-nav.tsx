"use client";

import { useEffect, useRef, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export interface DocsNavItem {
  id: string;
  label: string;
}

/**
 * Navegación de secciones de la documentación:
 * sidebar sticky con scroll-spy en desktop y barra con select en móvil.
 */
export function DocsNav({
  items,
  ariaLabel,
}: {
  items: DocsNavItem[];
  ariaLabel: string;
}) {
  const [active, setActive] = useState(items[0]?.id ?? "");
  const visibleIds = useRef(new Set<string>());

  useEffect(() => {
    // se observa la <section> completa (no solo el heading) para que los
    // saltos de scroll largos no se salten ninguna zona de intersección
    const sections = new Map<Element, string>();
    for (const item of items) {
      const heading = document.getElementById(item.id);
      const section = heading?.closest("section") ?? heading;
      if (section) sections.set(section, item.id);
    }
    if (sections.size === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = sections.get(entry.target);
          if (!id) continue;
          if (entry.isIntersecting) visibleIds.current.add(id);
          else visibleIds.current.delete(id);
        }
        const first = items.find((item) => visibleIds.current.has(item.id));
        if (first) setActive(first.id);
      },
      // compensa el header sticky y prioriza la sección del tercio superior
      { rootMargin: "-96px 0px -55% 0px" },
    );
    sections.forEach((_, section) => observer.observe(section));
    return () => observer.disconnect();
  }, [items]);

  function jumpTo(id: string) {
    setActive(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <>
      {/* Desktop: sidebar sticky con scroll-spy */}
      <aside className="top-24 hidden self-start lg:sticky lg:block">
        <nav aria-label={ariaLabel} className="flex flex-col gap-1">
          {items.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              aria-current={item.id === active ? "true" : undefined}
              onClick={() => setActive(item.id)}
              className={cn(
                "rounded-md border-l-2 px-3 py-1.5 text-sm transition-colors",
                item.id === active
                  ? "border-primary bg-brand-soft text-primary"
                  : "border-transparent text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
            >
              {item.label}
            </a>
          ))}
        </nav>
      </aside>

      {/* Móvil: barra sticky con selector de sección */}
      <div className="glass sticky top-16 z-30 -mx-4 px-4 py-2 sm:-mx-6 sm:px-6 lg:hidden">
        <Select value={active} onValueChange={jumpTo}>
          <SelectTrigger aria-label={ariaLabel} className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {items.map((item) => (
              <SelectItem key={item.id} value={item.id}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </>
  );
}
