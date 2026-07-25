import { Badge } from "@/components/ui/badge";

export function ErrorsTable({
  errors,
  labels,
  meanings,
}: {
  errors: Array<{ status: number; code: string }>;
  labels: { status: string; code: string; meaning: string };
  meanings: (code: string) => string;
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-line transition-colors hover:border-line-strong">
      <table className="w-full min-w-100 text-left text-sm">
        <thead className="border-b border-line bg-canvas-subtle text-xs text-muted-foreground">
          <tr>
            <th className="px-4 py-2.5 font-medium">{labels.status}</th>
            <th className="px-4 py-2.5 font-medium">{labels.code}</th>
            <th className="px-4 py-2.5 font-medium">{labels.meaning}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {errors.map(({ status, code }) => (
            <tr
              key={code}
              className="transition-colors hover:bg-canvas-subtle/60"
            >
              <td className="px-4 py-2.5 font-mono text-xs">
                <Badge
                  variant="outline"
                  className={
                    status >= 429
                      ? "text-warning"
                      : status >= 400
                        ? "text-destructive"
                        : ""
                  }
                >
                  {status}
                </Badge>
              </td>
              <td className="px-4 py-2.5 font-mono text-xs text-primary">
                {code}
              </td>
              <td className="px-4 py-2.5 text-xs text-muted-foreground">
                {meanings(code)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
