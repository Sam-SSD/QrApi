import { cn } from "@/lib/utils";
import {
  LOGO_MODULE,
  LOGO_RING_MODULES,
  LOGO_TAIL,
  LOGO_VIEWBOX,
} from "@/lib/brand";

/**
 * Símbolo de QrAPI: una "Q" de módulos QR redondeados cuya cola se
 * desprende en diagonal con el gradiente de marca indigo→cyan.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox={`0 0 ${LOGO_VIEWBOX} ${LOGO_VIEWBOX}`}
      fill="none"
      aria-hidden="true"
      className={cn("size-7", className)}
    >
      {LOGO_RING_MODULES.map(({ x, y }) => (
        <rect
          key={`${x}-${y}`}
          x={x}
          y={y}
          width={LOGO_MODULE.size}
          height={LOGO_MODULE.size}
          rx={LOGO_MODULE.radius}
          fill="currentColor"
        />
      ))}
      <rect
        x={LOGO_TAIL.x}
        y={LOGO_TAIL.y}
        width={LOGO_TAIL.size}
        height={LOGO_TAIL.size}
        rx={LOGO_TAIL.radius}
        fill="url(#qrapi-brand)"
      />
      <defs>
        <linearGradient
          id="qrapi-brand"
          x1={LOGO_TAIL.x}
          y1={LOGO_TAIL.y}
          x2={LOGO_TAIL.x + LOGO_TAIL.size}
          y2={LOGO_TAIL.y + LOGO_TAIL.size}
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
        <span className="text-gradient-brand">Qr</span>Api
      </span>
    </span>
  );
}
