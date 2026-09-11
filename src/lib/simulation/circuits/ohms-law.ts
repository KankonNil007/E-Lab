/**
 * Ohm's Law Simulation Engine
 * Pure, deterministic, React-independent functions.
 *
 * Core relations:
 *   V = I × R
 *   P = V × I = V² / R = I² × R
 */

export interface OhmsLawResult {
  voltage: number;       // Volts
  current: number;       // Amperes
  resistance: number;    // Ohms
  power: number;         // Watts
  conductance: number;   // Siemens (1/R)
}

/** Compute all Ohm's law quantities given V and R. */
export function computeFromVR(voltage: number, resistance: number): OhmsLawResult {
  const safeR = Math.max(1e-9, resistance);
  const current = voltage / safeR;
  const power = voltage * current;
  const conductance = 1 / safeR;
  return { voltage, current, resistance: safeR, power, conductance };
}

/** Compute all quantities given V and I. */
export function computeFromVI(voltage: number, current: number): OhmsLawResult {
  const safeI = Math.abs(current) < 1e-12 ? 1e-12 : current;
  const resistance = voltage / safeI;
  const power = voltage * safeI;
  const conductance = 1 / resistance;
  return { voltage, current: safeI, resistance, power, conductance };
}

/** Compute all quantities given I and R. */
export function computeFromIR(current: number, resistance: number): OhmsLawResult {
  const safeR = Math.max(1e-9, resistance);
  const voltage = current * safeR;
  const power = voltage * current;
  const conductance = 1 / safeR;
  return { voltage, current, resistance: safeR, power, conductance };
}

export interface VICurvePoint {
  voltage: number;
  current_mA: number;
}

/**
 * Generate a V-I characteristic curve for a given resistance.
 * Returns data points suitable for Recharts.
 */
export function generateVICurve(
  resistance: number,
  maxVoltage: number = 30,
  steps: number = 60
): VICurvePoint[] {
  const safeR = Math.max(1e-9, resistance);
  const points: VICurvePoint[] = [];
  for (let i = 0; i <= steps; i++) {
    const v = (maxVoltage / steps) * i;
    points.push({
      voltage: parseFloat(v.toFixed(2)),
      current_mA: parseFloat(((v / safeR) * 1000).toFixed(3)),
    });
  }
  return points;
}
