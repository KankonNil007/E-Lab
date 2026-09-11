import React, { useMemo } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { cn } from '../../lib/utils';

export interface MathematicalFormulaProps {
  formula: string;
  block?: boolean;
  className?: string;
}

export const MathematicalFormula: React.FC<MathematicalFormulaProps> = ({
  formula,
  block = false,
  className,
}) => {
  const html = useMemo(() => {
    try {
      return katex.renderToString(formula, {
        displayMode: block,
        throwOnError: false,
        strict: false,
        trust: true,
      });
    } catch {
      return null;
    }
  }, [formula, block]);

  if (!html) {
    return (
      <code className={cn('font-mono text-sm px-1.5 py-0.5 rounded bg-surface-elevated text-accent-cyan', className)}>
        {formula}
      </code>
    );
  }

  return (
    <span
      className={cn(
        block ? 'block my-3 overflow-x-auto py-1 text-center' : 'inline-block px-1',
        'text-text-primary select-all',
        className
      )}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};
