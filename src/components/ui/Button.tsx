import React from 'react';
import { cn } from '../../lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'accent-cyan';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'secondary', size = 'md', isLoading, children, disabled, ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue/50 disabled:pointer-events-none disabled:opacity-40 select-none';

    const variants = {
      primary:
        'bg-accent-blue text-white hover:bg-accent-blue-hover active:scale-[0.98] shadow-sm hover:shadow-glow-blue',
      secondary:
        'bg-surface-elevated text-text-primary border border-border hover:bg-surface-subtle hover:border-zinc-700 active:scale-[0.98]',
      outline:
        'border border-border text-text-primary hover:bg-surface-elevated hover:border-text-secondary active:scale-[0.98]',
      ghost:
        'text-text-secondary hover:text-text-primary hover:bg-surface-elevated active:scale-[0.98]',
      danger:
        'bg-accent-red/10 text-accent-red border border-accent-red/20 hover:bg-accent-red/20 active:scale-[0.98]',
      'accent-cyan':
        'bg-accent-cyan text-zinc-950 font-semibold hover:bg-accent-cyan-hover shadow-sm hover:shadow-glow-cyan active:scale-[0.98]',
    };

    const sizes = {
      sm: 'text-xs px-2.5 py-1.5 gap-1.5',
      md: 'text-sm px-3.5 py-2 gap-2',
      lg: 'text-base px-5 py-2.5 gap-2.5',
      icon: 'h-9 w-9 p-0 justify-center',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading ? (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        ) : null}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
