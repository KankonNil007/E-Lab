/**
 * Convolution Simulation Engine
 *
 * Discrete convolution with educational animation support.
 * y[n] = Σ x[k] · h[n − k]
 */

import { SignalPoint } from './waveforms';

/**
 * Compute discrete linear convolution of two signals.
 * Output length = len(x) + len(h) − 1
 */
export function convolve(x: number[], h: number[]): number[] {
  const N = x.length;
  const M = h.length;
  const outLen = N + M - 1;
  const result: number[] = new Array(outLen).fill(0);

  for (let n = 0; n < outLen; n++) {
    for (let k = 0; k < N; k++) {
      const hIdx = n - k;
      if (hIdx >= 0 && hIdx < M) {
        result[n] += x[k] * h[hIdx];
      }
    }
  }

  return result;
}

/**
 * Compute convolution of two SignalPoint arrays and produce a result with proper time axis.
 */
export function convolveSignals(
  x: SignalPoint[],
  h: SignalPoint[],
  dt: number
): SignalPoint[] {
  const xVals = x.map((p) => p.y);
  const hVals = h.map((p) => p.y);
  const result = convolve(xVals, hVals);
  const tStart = x[0].t + h[0].t;

  return result.map((y, i) => ({
    t: parseFloat((tStart + i * dt).toFixed(6)),
    y: parseFloat((y * dt).toFixed(6)), // Scale by dt for continuous approximation
  }));
}

/**
 * Animation data: provides intermediate frames showing the flip-and-shift process.
 *
 * At each shift position τ, returns:
 *   - The flipped h(τ − t) for that τ
 *   - The product x(t)·h(τ − t)
 *   - The integral value y(τ) up to that point
 */
export interface ConvolutionFrame {
  tau: number;              // Current shift position
  hFlipped: SignalPoint[];  // h(τ − t)
  product: SignalPoint[];   // x(t) · h(τ − t)
  outputValue: number;      // y(τ) = integral of product
}

export function generateConvolutionFrames(
  x: SignalPoint[],
  h: SignalPoint[],
  tauMin: number,
  tauMax: number,
  numFrames: number = 60
): ConvolutionFrame[] {
  const frames: ConvolutionFrame[] = [];
  const dt = (x.length > 1) ? (x[x.length - 1].t - x[0].t) / (x.length - 1) : 0.01;

  for (let i = 0; i <= numFrames; i++) {
    const tau = tauMin + (i / numFrames) * (tauMax - tauMin);

    // Create flipped and shifted h: h(τ − t)
    const hFlipped: SignalPoint[] = x.map((px) => {
      // Find h value at (τ − t)
      const tLookup = tau - px.t;
      // Linear interpolation in h
      const hVal = interpolateSignal(h, tLookup);
      return { t: px.t, y: hVal };
    });

    // Product: x(t) · h(τ − t)
    const product: SignalPoint[] = x.map((px, idx) => ({
      t: px.t,
      y: parseFloat((px.y * hFlipped[idx].y).toFixed(6)),
    }));

    // Integrate product (trapezoidal rule)
    let integral = 0;
    for (let j = 1; j < product.length; j++) {
      integral += 0.5 * (product[j - 1].y + product[j].y) * dt;
    }

    frames.push({
      tau: parseFloat(tau.toFixed(4)),
      hFlipped,
      product,
      outputValue: parseFloat(integral.toFixed(6)),
    });
  }

  return frames;
}

/**
 * Linear interpolation within a SignalPoint array.
 */
function interpolateSignal(signal: SignalPoint[], t: number): number {
  if (signal.length === 0) return 0;
  if (t <= signal[0].t) return signal[0].y;
  if (t >= signal[signal.length - 1].t) return signal[signal.length - 1].y;

  for (let i = 1; i < signal.length; i++) {
    if (signal[i].t >= t) {
      const t0 = signal[i - 1].t;
      const t1 = signal[i].t;
      const y0 = signal[i - 1].y;
      const y1 = signal[i].y;
      const frac = (t - t0) / (t1 - t0);
      return y0 + frac * (y1 - y0);
    }
  }
  return 0;
}
