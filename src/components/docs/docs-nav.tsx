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
  /** Sub-anchors (h3) shown while the section is active. */
  children?: Array<{ id: string; label: string }>;
}

/**
 * Docs section navigation: sticky sidebar with scroll-spy on desktop (with
 * sub-sections of the active section) and a select bar on mobile.
 */
export function DocsNav({
  items,
  ariaLabel,
}: {
  items: DocsNavItem[];
  ariaLabel: string;
}) {
  const [active, setActive] = useState(items[0]?.id ?? "");
  const [activeSub, setActiveSub] = useState("");
  const visibleIds = useRef(new Set<string>());

  useEffect(() => {
    // the whole <section> is observed (not just the heading) so long scroll
    // jumps never skip past an intersection zone
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
      // compensates for the sticky header and favors the top-third section
      { rootMargin: "-96px 0px -55% 0px" },
    );
    sections.forEach((_, section) => observer.observe(section));
    return () => observer.disconnect();
  }, [items]);

  useEffect(() => {
    // h3s are too short for the intersection trick above: the active
    // sub-anchor is the last one left above the threshold
    const subIds = items.flatMap(
      (item) => item.children?.map((child) => child.id) ?? [],
    );
    if (subIds.length === 0) return;
    let raf = 0;
    function onScroll() {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        let current = "";
        for (const id of subIds) {
          const el = document.getElementById(id);
          if (el && el.getBoundingClientRect().top <= 140) current = id;
        }
        setActiveSub(current);
      });
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [items]);

  function jumpTo(id: string) {
    setActive(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <>
      {/* Desktop: sticky sidebar with scroll-spy */}
      <aside className="top-24 hidden self-start lg:sticky lg:block">
        <nav aria-label={ariaLabel} className="flex flex-col gap-1">
          {items.map((item) => (
            <div key={item.id} className="flex flex-col">
              <a
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
              {item.id === active && item.children && (
                <div className="my-0.5 ml-3 flex flex-col gap-0.5 border-l border-line pl-1">
                  {item.children.map((child) => (
                    <a
                      key={child.id}
                      href={`#${child.id}`}
                      className={cn(
                        "rounded-md px-2 py-1 text-xs transition-colors",
                        child.id === activeSub
                          ? "font-medium text-primary"
                          : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {child.label}
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </aside>

      {/* Mobile: sticky bar with a section selector */}
      <div className="sticky top-16 z-30 -mx-4 px-4 py-2 glass sm:-mx-6 sm:px-6 lg:hidden">
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
