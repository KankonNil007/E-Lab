/**
 * Fourier Transform Simulation Engine
 *
 * Implements Discrete Fourier Transform (DFT) for educational visualization.
 * Uses direct DFT computation (O(N²)) — appropriate for the sample sizes
 * used in educational visualization (typically N ≤ 1024).
 */

export interface FrequencyBin {
  frequency: number;    // Hz
  magnitude: number;    // Linear
  magnitudeDB: number;  // dB (20*log10)
  phase: number;        // radians
  phaseDeg: number;     // degrees
  real: number;
  imag: number;
}

/**
 * Compute the Discrete Fourier Transform of a real-valued signal.
 *
 * @param samples - Array of real-valued signal samples
 * @param sampleRate - Sampling frequency in Hz
 * @returns Array of frequency bins up to Nyquist
 */
export function computeDFT(samples: number[], sampleRate: number): FrequencyBin[] {
  const N = samples.length;
  if (N === 0) return [];

  const halfN = Math.floor(N / 2);
  const bins: FrequencyBin[] = [];

  for (let k = 0; k <= halfN; k++) {
    let real = 0;
    let imag = 0;

    for (let n = 0; n < N; n++) {
      const angle = (2 * Math.PI * k * n) / N;
      real += samples[n] * Math.cos(angle);
      imag -= samples[n] * Math.sin(angle);
    }

    // Normalize
    real /= N;
    imag /= N;

    // Double magnitude for non-DC, non-Nyquist bins
    const scale = (k > 0 && k < halfN) ? 2 : 1;
    const magnitude = Math.sqrt(real * real + imag * imag) * scale;
    const magnitudeDB = magnitude > 1e-10 ? 20 * Math.log10(magnitude) : -100;
    const phase = Math.atan2(imag, real);
    const phaseDeg = phase * (180 / Math.PI);

    bins.push({
      frequency: (k * sampleRate) / N,
      magnitude,
      magnitudeDB: parseFloat(magnitudeDB.toFixed(2)),
      phase,
      phaseDeg: parseFloat(phaseDeg.toFixed(2)),
      real,
      imag,
    });
  }

  return bins;
}

/**
 * Extract magnitude spectrum suitable for chart display.
 */
export function computeMagnitudeSpectrum(samples: number[], sampleRate: number): { frequency: number; magnitude: number }[] {
  return computeDFT(samples, sampleRate).map((bin) => ({
    frequency: parseFloat(bin.frequency.toFixed(2)),
    magnitude: parseFloat(bin.magnitude.toFixed(6)),
  }));
}

/**
 * Extract phase spectrum suitable for chart display.
 */
export function computePhaseSpectrum(samples: number[], sampleRate: number): { frequency: number; phaseDeg: number }[] {
  return computeDFT(samples, sampleRate).map((bin) => ({
    frequency: parseFloat(bin.frequency.toFixed(2)),
    phaseDeg: bin.phaseDeg,
  }));
}

/**
 * Fourier series synthesis: reconstruct a signal from harmonics.
 *
 * Builds the signal as a sum of sines:
 *   x(t) = Σ Ak × sin(2π × k × f0 × t + φk)
 */
export interface HarmonicComponent {
  harmonic: number;       // k (harmonic number)
  amplitude: number;      // Ak
  phase: number;          // φk (radians)
}

export function fourierSynthesize(
  harmonics: HarmonicComponent[],
  f0: number,
  tMin: number,
  tMax: number,
  numSamples: number
): { t: number; y: number }[] {
  const dt = (tMax - tMin) / numSamples;
  const points: { t: number; y: number }[] = [];

  for (let i = 0; i <= numSamples; i++) {
    const t = tMin + i * dt;
    let y = 0;
    for (const h of harmonics) {
      y += h.amplitude * Math.sin(2 * Math.PI * h.harmonic * f0 * t + h.phase);
    }
    points.push({ t: parseFloat(t.toFixed(6)), y: parseFloat(y.toFixed(6)) });
  }
  return points;
}

/**
 * Generate Fourier series coefficients for standard waveforms.
 */
export function getSquareWaveHarmonics(amplitude: number, numHarmonics: number): HarmonicComponent[] {
  const harmonics: HarmonicComponent[] = [];
  for (let k = 1; k <= numHarmonics; k++) {
    const n = 2 * k - 1; // Odd harmonics only
    harmonics.push({
      harmonic: n,
      amplitude: (4 * amplitude) / (Math.PI * n),
      phase: 0,
    });
  }
  return harmonics;
}

export function getTriangleWaveHarmonics(amplitude: number, numHarmonics: number): HarmonicComponent[] {
  const harmonics: HarmonicComponent[] = [];
  for (let k = 1; k <= numHarmonics; k++) {
    const n = 2 * k - 1;
    const sign = k % 2 === 1 ? 1 : -1;
    harmonics.push({
      harmonic: n,
      amplitude: sign * (8 * amplitude) / (Math.PI * Math.PI * n * n),
      phase: 0,
    });
  }
  return harmonics;
}

export function getSawtoothWaveHarmonics(amplitude: number, numHarmonics: number): HarmonicComponent[] {
  const harmonics: HarmonicComponent[] = [];
  for (let k = 1; k <= numHarmonics; k++) {
    const sign = k % 2 === 0 ? 1 : -1;
    harmonics.push({
      harmonic: k,
      amplitude: sign * (2 * amplitude) / (Math.PI * k),
      phase: 0,
    });
  }
  return harmonics;
}
