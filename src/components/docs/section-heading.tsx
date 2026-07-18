import { cn } from "@/lib/utils";

function AnchorLink({ id, label }: { id: string; label?: string }) {
  return (
    <a
      href={`#${id}`}
      aria-label={label ?? `#${id}`}
      className="ml-2 font-normal text-primary no-underline opacity-0 transition-opacity group-hover:opacity-60 hover:!opacity-100 focus-visible:opacity-100"
    >
      #
    </a>
  );
}

export function SectionHeading({
  id,
  anchorLabel,
  children,
}: {
  id: string;
  anchorLabel?: string;
  children: React.ReactNode;
}) {
  return (
    <h2
      id={id}
      className="group scroll-mt-24 text-xl font-semibold tracking-tight"
    >
      {children}
      <AnchorLink id={id} label={anchorLabel} />
    </h2>
  );
}

/** h3 con ancla propia para deep-links dentro de una sección. */
export function SubHeading({
  id,
  anchorLabel,
  className,
  children,
}: {
  id: string;
  anchorLabel?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <h3 id={id} className={cn("group scroll-mt-24 font-medium", className)}>
      {children}
      <AnchorLink id={id} label={anchorLabel} />
    </h3>
  );
}
