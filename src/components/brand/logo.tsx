import { cn } from "@/lib/utils";

/**
 * Símbolo de QrAPI: un finder pattern estilizado con un módulo "desprendido"
 * en la esquina inferior derecha.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      className={cn("size-7", className)}
    >
      <rect
        x="3"
        y="3"
        width="22"
        height="22"
        rx="6"
        stroke="currentColor"
        strokeWidth="2.5"
      />
      <rect x="10" y="10" width="8" height="8" rx="2" fill="currentColor" />
      <rect
        x="23"
        y="23"
        width="6"
        height="6"
        rx="1.5"
        fill="url(#qrapi-brand)"
      />
      <defs>
        <linearGradient
          id="qrapi-brand"
          x1="23"
          y1="23"
          x2="29"
          y2="29"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="var(--primary)" />
          <stop offset="1" stopColor="var(--brand-cyan)" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("flex items-center gap-2", className)}>
      <LogoMark className="text-foreground" />
      <span className="text-lg font-semibold tracking-tight">
        <span className="text-gradient-brand">qr</span>api
      </span>
    </span>
  );
}
