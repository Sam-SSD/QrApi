/**
 * Bar chart of scans per day in pure SVG (zero dependencies).
 * Server Component: it receives pre-aggregated data and only draws.
 */
export interface ScanChartPoint {
  /** Short day label, e.g. "12/07". */
  label: string;
  count: number;
}

export function ScanChart({ points }: { points: ScanChartPoint[] }) {
  const W = 600;
  const H = 160;
  const PAD_BOTTOM = 18;
  const PAD_TOP = 8;
  const max = Math.max(1, ...points.map((p) => p.count));
  const barGap = 2;
  const barW = points.length > 0 ? W / points.length - barGap : 0;
  const chartH = H - PAD_BOTTOM - PAD_TOP;

  // X-axis labels: first, middle and last to avoid clutter.
  const labelIdx = new Set(
    [0, Math.floor(points.length / 2), points.length - 1].filter((i) => i >= 0),
  );

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="h-auto w-full"
      role="img"
      aria-label={points.map((p) => `${p.label}: ${p.count}`).join(", ")}
    >
      {/* baseline */}
      <line
        x1="0"
        y1={H - PAD_BOTTOM}
        x2={W}
        y2={H - PAD_BOTTOM}
        stroke="var(--line-strong)"
        strokeWidth="1"
      />
      {points.map((p, i) => {
        const h = Math.round((p.count / max) * chartH);
        const x = i * (barW + barGap);
        const y = H - PAD_BOTTOM - h;
        return (
          <g key={p.label}>
            <rect
              x={x}
              y={y}
              width={barW}
              height={Math.max(h, p.count > 0 ? 2 : 0)}
              rx={Math.min(3, barW / 3)}
              fill="var(--primary)"
              opacity={p.count > 0 ? 0.9 : 0}
            >
              <title>{`${p.label}: ${p.count}`}</title>
            </rect>
            {labelIdx.has(i) && (
              <text
                x={x + barW / 2}
                y={H - 5}
                textAnchor="middle"
                fontSize="10"
                fill="var(--muted-foreground)"
              >
                {p.label}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
