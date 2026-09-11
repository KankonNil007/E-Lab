import React from 'react';
import { cn } from '../../lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  unit?: string;
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', unit, label, error, ...props }, ref) => {
    return (
      <div className="space-y-1.5 w-full">
        {label && <label className="block text-xs font-medium text-text-secondary">{label}</label>}
        <div className="relative flex items-center">
          <input
            type={type}
            ref={ref}
            className={cn(
              'w-full bg-surface-elevated border border-border rounded-lg px-3 py-2 text-sm text-text-primary font-mono placeholder:text-text-muted focus:outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue/50 transition-colors disabled:opacity-50',
              unit && 'pr-12',
              error && 'border-accent-red focus:border-accent-red focus:ring-accent-red/50',
              className
            )}
            {...props}
          />
          {unit && (
            <span className="absolute right-3 text-xs font-mono text-text-muted select-none pointer-events-none">
              {unit}
            </span>
          )}
        </div>
        {error && <p className="text-xs text-accent-red font-mono">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
