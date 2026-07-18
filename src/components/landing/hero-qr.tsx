import { createMatrix, isDark, isFinderZone } from "@/lib/qr/matrix";
import { SITE_URL } from "@/lib/constants";

/**
 * QR real del hero, renderizado en el servidor módulo a módulo para poder
 * animar la entrada con stagger radial vía CSS (sin JavaScript).
 */
export function HeroQr() {
  const matrix = createMatrix(SITE_URL, "M");
  const n = matrix.size;
  const center = n / 2;
  const maxDistance = Math.hypot(center, center);

  const modules: Array<{ x: number; y: number; delay: number }> = [];
  for (let row = 0; row < n; row++) {
    for (let col = 0; col < n; col++) {
      if (!isDark(matrix, row, col) || isFinderZone(n, row, col)) continue;
      const distance = Math.hypot(col + 0.5 - center, row + 0.5 - center);
      modules.push({
        x: col,
        y: row,
        delay: Math.round((distance / maxDistance) * 900),
      });
    }
  }

  const finders = [
    { x: 0, y: 0 },
    { x: n - 7, y: 0 },
    { x: 0, y: n - 7 },
  ];

  return (
    <svg
      viewBox={`-1 -1 ${n + 2} ${n + 2}`}
      className="hero-qr size-full"
      role="img"
      aria-label="QR code"
    >
      <defs>
        <linearGradient id="hero-brand" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--primary)" />
          <stop offset="1" stopColor="var(--brand-cyan)" />
        </linearGradient>
      </defs>
      {modules.map(({ x, y, delay }) => (
        <rect
          key={`${x}-${y}`}
          x={x + 0.08}
          y={y + 0.08}
          width={0.84}
          height={0.84}
          rx={0.28}
          fill="url(#hero-brand)"
          style={{ animationDelay: `${delay}ms` }}
        />
      ))}
      {finders.map(({ x, y }, i) => (
        <g key={i}>
          <rect
            x={x + 0.6}
            y={y + 0.6}
            width={5.8}
            height={5.8}
            rx={1.7}
            fill="none"
            stroke="url(#hero-brand)"
            strokeWidth={1.1}
            style={{ animationDelay: `${950 + i * 120}ms` }}
          />
          <rect
            x={x + 2.1}
            y={y + 2.1}
            width={2.8}
            height={2.8}
            rx={0.9}
            fill="url(#hero-brand)"
            style={{ animationDelay: `${1050 + i * 120}ms` }}
          />
        </g>
      ))}
    </svg>
  );
}
