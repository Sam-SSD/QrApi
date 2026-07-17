/**
 * Fuente única del logo de QrAPI: colores en hex (para superficies sin CSS
 * vars como la imagen OG, favicons o emails) y geometría del monograma.
 *
 * El símbolo es una "Q" construida con módulos QR redondeados: un anillo de
 * siete módulos al que le falta la esquina inferior derecha, donde la cola
 * de la Q se desprende en diagonal con el gradiente de marca indigo→cyan.
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

/** Anillo de la "Q": rejilla 3×3 sin el centro ni la esquina inferior derecha. */
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

/** Cola de la Q: módulo desprendido en diagonal, con gradiente de marca. */
export const LOGO_TAIL = { x: 24.5, y: 24.5, size: 6.5, radius: 2.2 } as const;
