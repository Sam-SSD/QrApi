import { cn } from "@/lib/utils";

const METHOD_STYLES: Record<string, string> = {
  GET: "border-success/40 bg-success/10 text-success",
  POST: "border-primary/40 bg-primary/10 text-primary",
  PATCH: "border-warning/40 bg-warning/10 text-warning",
  DELETE: "border-destructive/40 bg-destructive/10 text-destructive",
};

/** Chip mono de método HTTP con color semántico (GET/POST/PATCH/DELETE). */
export function MethodBadge({
  method,
  className,
}: {
  method: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-1.5 py-0.5 font-mono text-[10px] font-semibold tracking-wide",
        METHOD_STYLES[method] ?? "border-line text-muted-foreground",
        className,
      )}
    >
      {method}
    </span>
  );
}
