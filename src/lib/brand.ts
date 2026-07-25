/**
 * Single source for the QrAPI logo: hex colors (for surfaces without CSS
 * vars such as the OG image, favicons or emails) and monogram geometry.
 *
 * The symbol is a "Q" built from rounded QR modules: a ring of seven
 * modules missing its bottom-right corner, where the Q's tail breaks away
 * diagonally with the indigo→cyan brand gradient.
 */
export const BRAND_COLORS = {
  indigo: "#4f46e5",
  indigoLight: "#818cf8",
  cyan: "#0891b2",
  cyanLight: "#22d3ee",
  bgDark: "#09090b",
  fg: "#f4f4f5",
} as const;

export const LOGO_VIEWBOX = 32;

/** The "Q" ring: 3×3 grid without the center or the bottom-right corner. */
export const LOGO_RING_MODULES: ReadonlyArray<{ x: number; y: number }> = [
  { x: 3, y: 3 },
  { x: 12.5, y: 3 },
  { x: 22, y: 3 },
  { x: 3, y: 12.5 },
  { x: 22, y: 12.5 },
  { x: 3, y: 22 },
  { x: 12.5, y: 22 },
];

export const LOGO_MODULE = { size: 7, radius: 2.4 } as const;

/** The Q's tail: module breaking away diagonally, with the brand gradient. */
export const LOGO_TAIL = { x: 24.5, y: 24.5, size: 6.5, radius: 2.2 } as const;

/** Brand gradient as CSS (dark-background variant, the wordmark one). */
export const BRAND_GRADIENT_CSS = `linear-gradient(135deg, ${BRAND_COLORS.indigoLight} 0%, ${BRAND_COLORS.cyanLight} 100%)`;

/**
 * Monogram geometry scaled to `target` px, in absolute coordinates.
 * For favicons/ImageResponse: Satori rasterizes positioned divs with CSS
 * gradients reliably (nested SVG <linearGradient> is fragile).
 */
export function logoLayout(target: number) {
  const scale = target / LOGO_VIEWBOX;
  return {
    ring: LOGO_RING_MODULES.map(({ x, y }) => ({
      left: x * scale,
      top: y * scale,
      size: LOGO_MODULE.size * scale,
      radius: LOGO_MODULE.radius * scale,
    })),
    tail: {
      left: LOGO_TAIL.x * scale,
      top: LOGO_TAIL.y * scale,
      size: LOGO_TAIL.size * scale,
      radius: LOGO_TAIL.radius * scale,
    },
  };
}
