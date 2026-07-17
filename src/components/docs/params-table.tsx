export interface ParamRow {
  name: string;
  type: string;
  def: string;
  key: string;
}

export function ParamsTable({
  rows,
  labels,
  descriptions,
}: {
  rows: ParamRow[];
  labels: { name: string; type: string; def: string; description: string };
  descriptions: (key: string) => string;
}) {
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
          {rows.map((row) => (
            <tr key={row.name} className="transition-colors hover:bg-canvas-subtle/60">
              <td className="px-4 py-2.5 font-mono text-xs text-primary">
                {row.name}
              </td>
              <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">
                {row.type}
              </td>
              <td className="px-4 py-2.5 font-mono text-xs text-ink-faint">
                {row.def}
              </td>
              <td className="px-4 py-2.5 text-xs text-muted-foreground">
                {descriptions(row.key)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
