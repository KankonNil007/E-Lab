import React from 'react';
import { cn } from '../../lib/utils';

export interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (val: number) => void;
  formatValue?: (val: number) => string;
  className?: string;
  disabled?: boolean;
}

export const Slider: React.FC<SliderProps> = ({
  label,
  value,
  min,
  max,
  step = 1,
  unit = '',
  onChange,
  formatValue,
  className,
  disabled = false,
}) => {
  const displayVal = formatValue ? formatValue(value) : `${value} ${unit}`.trim();
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className={cn('space-y-2 select-none', className)}>
      <div className="flex items-center justify-between text-xs">
        <label className="font-medium text-text-secondary">{label}</label>
        <span className="font-mono font-semibold px-2 py-0.5 rounded bg-surface-elevated border border-border text-text-primary text-xs tracking-tight">
          {displayVal}
        </span>
      </div>
      <div className="relative flex items-center">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-accent-blue focus:outline-none focus:ring-1 focus:ring-accent-blue/50 disabled:opacity-50"
          style={{
            background: `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${percentage}%, #27272A ${percentage}%, #27272A 100%)`,
          }}
        />
      </div>
      <div className="flex justify-between text-[10px] font-mono text-text-muted">
        <span>{formatValue ? formatValue(min) : `${min} ${unit}`}</span>
        <span>{formatValue ? formatValue(max) : `${max} ${unit}`}</span>
      </div>
    </div>
  );
};
