/**
 * Step Response Simulation Engine
 *
 * Computes the unit step response for a second-order system:
 *   H(s) = ωn² / (s² + 2ζωn·s + ωn²)
 */

import { TransferFunctionParams, classifyDamping } from './transfer-function';

export interface StepResponsePoint {
  time: number;
  response: number;
}

export interface StepResponseMetrics {
  percentOvershoot: number;     // %
  settlingTime: number;         // seconds (2% criterion)
  riseTime: number;             // seconds (10%→90%)
  peakTime: number;             // seconds
  steadyStateValue: number;
  dampingCategory: string;
}

/**
 * Compute step response metrics analytically.
 */
export function computeStepMetrics(params: TransferFunctionParams): StepResponseMetrics {
  const { zeta, wn } = params;

  // Percent overshoot (only for underdamped)
  let percentOvershoot = 0;
  if (zeta < 1) {
    percentOvershoot = Math.exp((-Math.PI * zeta) / Math.sqrt(1 - zeta * zeta)) * 100;
  }

  // Settling time (2% criterion): ts ≈ 4 / (ζωn)
  const settlingTime = 4 / Math.max(0.01, zeta * wn);

  // Peak time: tp = π / ωd
  let peakTime = 0;
  if (zeta < 1) {
    const wd = wn * Math.sqrt(1 - zeta * zeta);
    peakTime = Math.PI / wd;
  }

  // Rise time approximation: tr ≈ (1.8) / ωn (for 0 < ζ < 1)
  const riseTime = 1.8 / wn;

  return {
    percentOvershoot: parseFloat(percentOvershoot.toFixed(2)),
    settlingTime: parseFloat(settlingTime.toFixed(3)),
    riseTime: parseFloat(riseTime.toFixed(3)),
    peakTime: parseFloat(peakTime.toFixed(3)),
    steadyStateValue: 1,
    dampingCategory: classifyDamping(zeta),
  };
}

/**
 * Generate step response data points.
 */
export function generateStepResponse(
  params: TransferFunctionParams,
  numPoints: number = 200,
  tMaxMultiplier: number = 1.5
): StepResponsePoint[] {
  const { zeta, wn } = params;
  const metrics = computeStepMetrics(params);
  const tMax = Math.min(10, Math.max(2, metrics.settlingTime * tMaxMultiplier));
  const dt = tMax / numPoints;
  const points: StepResponsePoint[] = [];

  for (let i = 0; i <= numPoints; i++) {
    const t = i * dt;
    let y = 1;

    if (zeta < 1) {
      // Underdamped
      const wd = wn * Math.sqrt(1 - zeta * zeta);
      const phi = Math.acos(zeta);
      y = 1 - (Math.exp(-zeta * wn * t) / Math.sqrt(1 - zeta * zeta)) * Math.sin(wd * t + phi);
    } else if (Math.abs(zeta - 1) < 0.02) {
      // Critically damped
      y = 1 - Math.exp(-wn * t) * (1 + wn * t);
    } else {
      // Overdamped
      const sqrtTerm = Math.sqrt(zeta * zeta - 1);
      const s1 = -wn * (zeta - sqrtTerm);
      const s2 = -wn * (zeta + sqrtTerm);
      y = 1 + (s2 * Math.exp(s1 * t) - s1 * Math.exp(s2 * t)) / (s1 - s2);
    }

    points.push({
      time: parseFloat(t.toFixed(4)),
      response: parseFloat(Math.max(0, y).toFixed(5)),
    });
  }

  return points;
}

/**
 * Generate impulse response data points.
 * For a second-order system: inverse Laplace of H(s).
 */
export function generateImpulseResponse(
  params: TransferFunctionParams,
  numPoints: number = 200,
  tMax: number = 5
): StepResponsePoint[] {
  const { zeta, wn } = params;
  const dt = tMax / numPoints;
  const points: StepResponsePoint[] = [];

  for (let i = 0; i <= numPoints; i++) {
    const t = i * dt;
    let y = 0;

    if (zeta < 1) {
      const wd = wn * Math.sqrt(1 - zeta * zeta);
      y = (wn / Math.sqrt(1 - zeta * zeta)) * Math.exp(-zeta * wn * t) * Math.sin(wd * t);
    } else if (Math.abs(zeta - 1) < 0.02) {
      y = wn * wn * t * Math.exp(-wn * t);
    } else {
      const sqrtTerm = Math.sqrt(zeta * zeta - 1);
      const s1 = -wn * (zeta - sqrtTerm);
      const s2 = -wn * (zeta + sqrtTerm);
      y = (wn * wn / (s1 - s2)) * (Math.exp(s1 * t) - Math.exp(s2 * t));
    }

    points.push({
      time: parseFloat(t.toFixed(4)),
      response: parseFloat(y.toFixed(5)),
    });
  }

  return points;
}
