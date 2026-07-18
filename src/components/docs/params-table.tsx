"use client";

import { Fragment, useState } from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ParamRow {
  name: string;
  /** Tipo mostrado en mono (string, number, hex, object…). */
  type: string;
  /** Valores de enum renderizados como chips (sustituyen a `type`). */
  enumValues?: string[];
  def: string;
  required?: boolean;
  /** Descripción ya resuelta (este componente es client: no acepta funciones). */
  description: string;
  /** Subcampos: la fila se vuelve expandible. */
  children?: ParamRow[];
}

function TypeCell({ row }: { row: ParamRow }) {
  if (!row.enumValues) {
    return (
      <span className="font-mono text-xs text-muted-foreground">{row.type}</span>
    );
  }
  return (
    <span className="flex max-w-64 flex-wrap gap-1">
      {row.enumValues.map((value) => (
        <code
          key={value}
          className="rounded border border-line bg-canvas-subtle px-1 py-px font-mono text-[10px] text-muted-foreground"
        >
          {value}
        </code>
      ))}
    </span>
  );
}

export function ParamsTable({
  rows,
  labels,
}: {
  rows: ParamRow[];
  labels: {
    name: string;
    type: string;
    def: string;
    description: string;
    required: string;
    toggle: string;
  };
}) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  function toggle(name: string) {
    setExpanded((old) => {
      const next = new Set(old);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-line transition-colors hover:border-line-strong">
      <table className="w-full min-w-130 text-left text-sm">
        <thead className="border-b border-line bg-canvas-subtle text-xs text-muted-foreground">
          <tr>
            <th className="px-4 py-2.5 font-medium">{labels.name}</th>
            <th className="px-4 py-2.5 font-medium">{labels.type}</th>
            <th className="px-4 py-2.5 font-medium">{labels.def}</th>
            <th className="px-4 py-2.5 font-medium">{labels.description}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {rows.map((row) => {
            const isOpen = expanded.has(row.name);
            return (
              <Fragment key={row.name}>
                <tr
                  className={cn(
                    "transition-colors hover:bg-canvas-subtle/60",
                    row.children && "cursor-pointer",
                    isOpen && "bg-canvas-subtle/40",
                  )}
                  onClick={row.children ? () => toggle(row.name) : undefined}
                >
                  <td className="px-4 py-2.5 align-top font-mono text-xs text-primary">
                    <span className="flex items-center gap-1.5 whitespace-nowrap">
                      {row.children && (
                        <button
                          type="button"
                          aria-expanded={isOpen}
                          aria-label={`${labels.toggle}: ${row.name}`}
                          onClick={(event) => {
                            event.stopPropagation();
                            toggle(row.name);
                          }}
                          className="-ml-1 rounded p-0.5 text-muted-foreground transition-transform hover:text-foreground"
                        >
                          <ChevronRight
                            className={cn(
                              "size-3.5 transition-transform duration-150",
                              isOpen && "rotate-90",
                            )}
                            strokeWidth={2}
                          />
                        </button>
                      )}
                      {row.name}
                      {row.required && (
                        <span className="rounded border border-destructive/30 bg-destructive/10 px-1 py-px font-sans text-[10px] font-medium text-destructive">
                          {labels.required}
                        </span>
                      )}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 align-top">
                    <TypeCell row={row} />
                  </td>
                  <td className="px-4 py-2.5 align-top font-mono text-xs text-ink-faint">
                    {row.def}
                  </td>
                  <td className="px-4 py-2.5 align-top text-xs text-muted-foreground">
                    {row.description}
                  </td>
                </tr>
                {isOpen &&
                  row.children?.map((child) => (
                    <tr
                      key={`${row.name}.${child.name}`}
                      className="bg-canvas-subtle/30 transition-colors hover:bg-canvas-subtle/60"
                    >
                      <td className="py-2 pr-4 pl-9 align-top font-mono text-[11px] whitespace-nowrap text-primary/80">
                        {child.name}
                        {child.required && (
                          <span className="ml-1.5 rounded border border-destructive/30 bg-destructive/10 px-1 py-px font-sans text-[10px] font-medium text-destructive">
                            {labels.required}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-2 align-top">
                        <TypeCell row={child} />
                      </td>
                      <td className="px-4 py-2 align-top font-mono text-[11px] text-ink-faint">
                        {child.def}
                      </td>
                      <td className="px-4 py-2 align-top text-xs text-muted-foreground">
                        {child.description}
                      </td>
                    </tr>
                  ))}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
