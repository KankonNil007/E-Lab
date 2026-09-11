/**
 * Waveform Generation Engine
 *
 * Pure functions that generate signal samples for various waveform types.
 * All functions return arrays of { t, y } data points.
 */

export interface SignalPoint {
  t: number;
  y: number;
}

export type WaveformType = 'sine' | 'cosine' | 'square' | 'triangle' | 'sawtooth' | 'impulse' | 'step' | 'ramp';

export interface WaveformParams {
  type: WaveformType;
  amplitude: number;
  frequency: number;
  phase: number;       // radians
  dcOffset: number;
  tMin: number;
  tMax: number;
  numSamples: number;
}

const DEFAULT_PARAMS: WaveformParams = {
  type: 'sine',
  amplitude: 1,
  frequency: 1,
  phase: 0,
  dcOffset: 0,
  tMin: -2,
  tMax: 2,
  numSamples: 500,
};

/**
 * Generate a single sample at time t for the specified waveform.
 */
export function sampleWaveform(type: WaveformType, t: number, amplitude: number, frequency: number, phase: number, dcOffset: number): number {
  const omega = 2 * Math.PI * frequency;
  const theta = omega * t + phase;

  switch (type) {
    case 'sine':
      return amplitude * Math.sin(theta) + dcOffset;

    case 'cosine':
      return amplitude * Math.cos(theta) + dcOffset;

    case 'square':
      return amplitude * (Math.sin(theta) >= 0 ? 1 : -1) + dcOffset;

    case 'triangle':
      return amplitude * (2 / Math.PI) * Math.asin(Math.sin(theta)) + dcOffset;

    case 'sawtooth': {
      const period = 1 / frequency;
      const tMod = ((t + phase / omega) % period + period) % period;
      return amplitude * (2 * tMod / period - 1) + dcOffset;
    }

    case 'impulse':
      return (Math.abs(t) < 1e-6 ? amplitude : 0) + dcOffset;

    case 'step':
      return (t >= 0 ? amplitude : 0) + dcOffset;

    case 'ramp':
      return (t >= 0 ? amplitude * t * frequency : 0) + dcOffset;

    default:
      return dcOffset;
  }
}

/**
 * Generate an array of signal data points.
 */
export function generateWaveform(params: Partial<WaveformParams> = {}): SignalPoint[] {
  const p = { ...DEFAULT_PARAMS, ...params };
  const dt = (p.tMax - p.tMin) / p.numSamples;
  const points: SignalPoint[] = [];

  for (let i = 0; i <= p.numSamples; i++) {
    const t = p.tMin + i * dt;
    const y = sampleWaveform(p.type, t, p.amplitude, p.frequency, p.phase, p.dcOffset);
    points.push({ t: parseFloat(t.toFixed(6)), y: parseFloat(y.toFixed(6)) });
  }
  return points;
}

/**
 * Compute RMS value of discrete signal samples.
 */
export function computeRMS(samples: number[]): number {
  if (samples.length === 0) return 0;
  const sumSq = samples.reduce((acc, v) => acc + v * v, 0);
  return Math.sqrt(sumSq / samples.length);
}

/**
 * Compute average (DC) value.
 */
export function computeAverage(samples: number[]): number {
  if (samples.length === 0) return 0;
  return samples.reduce((acc, v) => acc + v, 0) / samples.length;
}

/**
 * Compute peak-to-peak.
 */
export function computePeakToPeak(samples: number[]): number {
  if (samples.length === 0) return 0;
  return Math.max(...samples) - Math.min(...samples);
}
