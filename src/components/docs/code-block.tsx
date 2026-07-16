import { codeToHtml } from "shiki";
import { CopyButton } from "./copy-button";

export async function CodeBlock({
  code,
  lang,
  label,
}: {
  code: string;
  lang: string;
  label?: string;
}) {
  const html = await codeToHtml(code, {
    lang,
    themes: { light: "vitesse-light", dark: "vitesse-dark" },
    defaultColor: "light",
  });

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-canvas-subtle">
      <div className="flex items-center justify-between border-b border-line px-4 py-1.5">
        <span className="font-mono text-xs text-ink-faint">
          {label ?? lang}
        </span>
        <CopyButton text={code} />
      </div>
      <div
        className="overflow-x-auto p-4 font-mono text-xs leading-relaxed [&_pre]:!bg-transparent"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
