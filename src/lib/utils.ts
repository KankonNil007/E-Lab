import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats numbers into standard engineering prefix notation (SI).
 * e.g., 1000 -> 1 k, 0.000001 -> 1 µ, etc.
 */
export function formatSI(value: number, unit: string = '', precision: number = 3): string {
  if (value === 0) return `0 ${unit}`.trim();
  if (!isFinite(value) || isNaN(value)) return 'N/A';

  const abs = Math.abs(value);
  const prefixes = [
    { factor: 1e12, symbol: 'T' },
    { factor: 1e9, symbol: 'G' },
    { factor: 1e6, symbol: 'M' },
    { factor: 1e3, symbol: 'k' },
    { factor: 1, symbol: '' },
    { factor: 1e-3, symbol: 'm' },
    { factor: 1e-6, symbol: 'µ' },
    { factor: 1e-9, symbol: 'n' },
    { factor: 1e-12, symbol: 'p' },
    { factor: 1e-15, symbol: 'f' },
  ];

  for (const p of prefixes) {
    if (abs >= p.factor * 0.999) {
      const scaled = value / p.factor;
      const rounded = scaled.toPrecision(precision);
      const cleanNum = parseFloat(rounded).toString();
      return `${cleanNum} ${p.symbol}${unit}`.trim();
    }
  }

  return `${value.toExponential(precision - 1)} ${unit}`.trim();
}

export function formatResistance(ohms: number): string {
  return formatSI(ohms, 'Ω');
}

export function formatCapacitance(farads: number): string {
  return formatSI(farads, 'F');
}

export function formatInductance(henries: number): string {
  return formatSI(henries, 'H');
}

export function formatFrequency(hertz: number): string {
  return formatSI(hertz, 'Hz');
}

export function formatVoltage(volts: number): string {
  return formatSI(volts, 'V');
}

export function formatCurrent(amps: number): string {
  return formatSI(amps, 'A');
}

export function formatPower(watts: number): string {
  return formatSI(watts, 'W');
}

export function formatTime(seconds: number): string {
  return formatSI(seconds, 's');
}
