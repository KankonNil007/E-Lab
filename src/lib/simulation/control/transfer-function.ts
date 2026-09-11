/**
 * Transfer Function Simulation Engine
 *
 * Represents and evaluates standard-form transfer functions:
 *   H(s) = ωn² / (s² + 2ζωn·s + ωn²)
 *
 * Includes pole/zero computation.
 */

export interface TransferFunctionParams {
  zeta: number;      // Damping ratio
  wn: number;        // Natural frequency (rad/s)
}

export interface Complex {
  real: number;
  imag: number;
}

/**
 * Compute the poles of the second-order system.
 * s₁,₂ = −ζωn ± ωn√(ζ²−1)
 */
export function computePoles(params: TransferFunctionParams): Complex[] {
  const { zeta, wn } = params;
  const sigma = -zeta * wn;
  const discriminant = zeta * zeta - 1;

  if (discriminant >= 0) {
    // Real poles (overdamped or critically damped)
    const d = wn * Math.sqrt(discriminant);
    return [
      { real: sigma + d, imag: 0 },
      { real: sigma - d, imag: 0 },
    ];
  } else {
    // Complex conjugate poles (underdamped)
    const wd = wn * Math.sqrt(1 - zeta * zeta);
    return [
      { real: sigma, imag: wd },
      { real: sigma, imag: -wd },
    ];
  }
}

/**
 * For the standard second-order form, there are no finite zeros.
 * The origin is a double zero of the numerator only if we had s terms.
 * Return empty for standard form.
 */
export function computeZeros(_params: TransferFunctionParams): Complex[] {
  return []; // ωn² / (s² + 2ζωn·s + ωn²) has no finite zeros
}

/**
 * Evaluate |H(jω)| and ∠H(jω) at a given angular frequency ω.
 */
export function evaluateFrequencyResponse(
  params: TransferFunctionParams,
  omega: number
): { magnitude: number; magnitudeDB: number; phaseDeg: number } {
  const { zeta, wn } = params;
  const wn2 = wn * wn;

  // H(jω) = ωn² / ((jω)² + 2ζωn(jω) + ωn²)
  //        = ωn² / (ωn² − ω² + j·2ζωnω)
  const denomReal = wn2 - omega * omega;
  const denomImag = 2 * zeta * wn * omega;
  const denomMag = Math.sqrt(denomReal * denomReal + denomImag * denomImag);

  const magnitude = wn2 / denomMag;
  const magnitudeDB = 20 * Math.log10(Math.max(1e-10, magnitude));
  const phaseDeg = -Math.atan2(denomImag, denomReal) * (180 / Math.PI);

  return { magnitude, magnitudeDB, phaseDeg };
}

/**
 * Determine system stability from poles.
 */
export function isStable(params: TransferFunctionParams): boolean {
  const poles = computePoles(params);
  return poles.every((p) => p.real < 0);
}

/**
 * Classify damping type.
 */
export type DampingType = 'Underdamped' | 'Critically Damped' | 'Overdamped';

export function classifyDamping(zeta: number): DampingType {
  if (zeta < 0.98) return 'Underdamped';
  if (zeta <= 1.02) return 'Critically Damped';
  return 'Overdamped';
}
