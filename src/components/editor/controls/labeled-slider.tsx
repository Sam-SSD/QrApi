"use client";

import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

export function LabeledSlider({
  id,
  label,
  value,
  min,
  max,
  step = 1,
  format = (v) => String(v),
  onChange,
}: {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  format?: (value: number) => string;
  onChange: (value: number) => void;
}) {
  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between">
        <Label htmlFor={id}>{label}</Label>
        <span className="font-mono text-xs text-muted-foreground">
          {format(value)}
        </span>
      </div>
      <Slider
        id={id}
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={([v]) => onChange(v)}
        aria-valuetext={`${label}: ${format(value)}`}
      />
    </div>
  );
}
