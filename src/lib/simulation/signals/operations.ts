/**
 * Signal Operations Engine
 *
 * Implements standard continuous-time signal transformations:
 *   - Time shifting:    x(t − t₀)
 *   - Time scaling:     x(at)
 *   - Time reversal:    x(−t)
 *   - Amplitude scale:  A · x(t)
 *   - Addition:         x₁(t) + x₂(t)
 *   - Multiplication:   x₁(t) · x₂(t)
 */

import { SignalPoint, sampleWaveform, WaveformType } from './waveforms';

/**
 * Time shift: x(t − t₀)
 * Positive t0 → shift right (delay), negative → shift left (advance).
 */
export function timeShift(signal: SignalPoint[], t0: number): SignalPoint[] {
  return signal.map((p) => ({
    t: parseFloat((p.t + t0).toFixed(6)),
    y: p.y,
  }));
}

/**
 * Time scale: x(at)
 * |a| > 1 → compression, 0 < |a| < 1 → expansion
 */
export function timeScale(signal: SignalPoint[], a: number): SignalPoint[] {
  if (Math.abs(a) < 1e-12) return signal.map((p) => ({ t: 0, y: p.y }));
  return signal.map((p) => ({
    t: parseFloat((p.t / a).toFixed(6)),
    y: p.y,
  }));
}

/**
 * Time reversal: x(−t)
 */
export function timeReversal(signal: SignalPoint[]): SignalPoint[] {
  return signal.map((p) => ({
    t: parseFloat((-p.t).toFixed(6)),
    y: p.y,
  })).sort((a, b) => a.t - b.t);
}

/**
 * Amplitude scaling: A · x(t)
 */
export function amplitudeScale(signal: SignalPoint[], A: number): SignalPoint[] {
  return signal.map((p) => ({
    t: p.t,
    y: parseFloat((A * p.y).toFixed(6)),
  }));
}

/**
 * Point-wise addition of two signals: x₁(t) + x₂(t)
 * Signals must share the same time base.
 */
export function addSignals(s1: SignalPoint[], s2: SignalPoint[]): SignalPoint[] {
  const len = Math.min(s1.length, s2.length);
  const result: SignalPoint[] = [];
  for (let i = 0; i < len; i++) {
    result.push({
      t: s1[i].t,
      y: parseFloat((s1[i].y + s2[i].y).toFixed(6)),
    });
  }
  return result;
}

/**
 * Point-wise multiplication: x₁(t) · x₂(t)
 * Signals must share the same time base.
 */
export function multiplySignals(s1: SignalPoint[], s2: SignalPoint[]): SignalPoint[] {
  const len = Math.min(s1.length, s2.length);
  const result: SignalPoint[] = [];
  for (let i = 0; i < len; i++) {
    result.push({
      t: s1[i].t,
      y: parseFloat((s1[i].y * s2[i].y).toFixed(6)),
    });
  }
  return result;
}

/**
 * Generate transformed waveform directly from parameters (avoids needing a base signal).
 */
export function generateTransformedSignal(
  type: WaveformType,
  amplitude: number,
  frequency: number,
  phase: number,
  dcOffset: number,
  tMin: number,
  tMax: number,
  numSamples: number,
  transform: {
    timeShiftAmount?: number;
    timeScaleFactor?: number;
    reverseTime?: boolean;
    amplitudeScaleFactor?: number;
  } = {}
): SignalPoint[] {
  const dt = (tMax - tMin) / numSamples;
  const points: SignalPoint[] = [];

  for (let i = 0; i <= numSamples; i++) {
    let t = tMin + i * dt;

    // Apply inverse transforms to get the original time
    let tOrig = t;
    if (transform.reverseTime) tOrig = -tOrig;
    if (transform.timeScaleFactor && Math.abs(transform.timeScaleFactor) > 1e-12) {
      tOrig = tOrig * transform.timeScaleFactor;
    }
    if (transform.timeShiftAmount) {
      tOrig = tOrig - transform.timeShiftAmount;
    }

    let y = sampleWaveform(type, tOrig, amplitude, frequency, phase, dcOffset);

    if (transform.amplitudeScaleFactor !== undefined) {
      y *= transform.amplitudeScaleFactor;
    }

    points.push({
      t: parseFloat(t.toFixed(6)),
      y: parseFloat(y.toFixed(6)),
    });
  }
  return points;
}
