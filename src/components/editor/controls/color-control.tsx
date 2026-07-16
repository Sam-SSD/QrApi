"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const HEX_RE = /^#[0-9a-fA-F]{6}$/;

export function ColorControl({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (color: string) => void;
}) {
  const [text, setText] = useState(value);

  useEffect(() => setText(value), [value]);

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="flex items-center gap-2">
        <label
          className="relative size-9 shrink-0 cursor-pointer overflow-hidden rounded-md border border-line shadow-xs transition-shadow hover:shadow-raised"
          style={{ backgroundColor: value }}
        >
          <input
            id={id}
            type="color"
            value={HEX_RE.test(value) ? value : "#000000"}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 size-full cursor-pointer opacity-0"
            aria-label={label}
          />
        </label>
        <Input
          value={text}
          onChange={(e) => {
            const next = e.target.value;
            setText(next);
            if (HEX_RE.test(next)) onChange(next);
          }}
          spellCheck={false}
          className="h-9 font-mono text-sm uppercase"
          maxLength={7}
          aria-label={`${label} (hex)`}
        />
      </div>
    </div>
  );
}
