/**
 * Bode Plot Simulation Engine
 *
 * Generates Bode magnitude and phase plots for second-order systems.
 *   H(jω) = ωn² / (−ω² + j2ζωnω + ωn²)
 */

import { TransferFunctionParams, evaluateFrequencyResponse } from './transfer-function';

export interface BodePoint {
  frequency: number;     // Hz
  omega: number;         // rad/s
  magnitudeDB: number;
  phaseDeg: number;
}

/**
 * Generate Bode plot data (magnitude + phase vs log frequency).
 */
export function generateBodePlot(
  params: TransferFunctionParams,
  fMin: number = 0.01,
  fMax: number = 1000,
  pointsPerDecade: number = 30
): BodePoint[] {
  const decades = Math.log10(fMax / fMin);
  const totalPoints = Math.round(decades * pointsPerDecade);
  const points: BodePoint[] = [];

  for (let i = 0; i <= totalPoints; i++) {
    const f = fMin * Math.pow(10, (i / totalPoints) * decades);
    const omega = 2 * Math.PI * f;
    const { magnitudeDB, phaseDeg } = evaluateFrequencyResponse(params, omega);

    points.push({
      frequency: parseFloat(f.toFixed(4)),
      omega: parseFloat(omega.toFixed(4)),
      magnitudeDB: parseFloat(magnitudeDB.toFixed(2)),
      phaseDeg: parseFloat(phaseDeg.toFixed(2)),
    });
  }

  return points;
}

export interface BodeMargins {
  gainMargin: number;          // dB (Inf for stable 2nd order standard form)
  phaseMargin: number;         // degrees
  gainCrossoverFreq: number;   // Hz (where |H| crosses 0 dB)
  phaseCrossoverFreq: number;  // Hz (where phase crosses -180°)
}

/**
 * Compute gain and phase margins from Bode data.
 */
export function computeBodeMargins(bodeData: BodePoint[]): BodeMargins {
  let gainCrossoverFreq = 0;
  let phaseCrossoverFreq = 0;
  let phaseAtGainCrossover = 0;
  let magnitudeAtPhaseCrossover = 0;

  // Find gain crossover (|H| = 0 dB)
  for (let i = 1; i < bodeData.length; i++) {
    const prev = bodeData[i - 1];
    const curr = bodeData[i];

    // Gain crossover: magnitude crosses 0 dB from above
    if (prev.magnitudeDB >= 0 && curr.magnitudeDB < 0) {
      const frac = prev.magnitudeDB / (prev.magnitudeDB - curr.magnitudeDB);
      gainCrossoverFreq = prev.frequency + frac * (curr.frequency - prev.frequency);
      phaseAtGainCrossover = prev.phaseDeg + frac * (curr.phaseDeg - prev.phaseDeg);
    }

    // Phase crossover: phase crosses -180°
    if (prev.phaseDeg > -180 && curr.phaseDeg <= -180) {
      const frac = (prev.phaseDeg + 180) / (prev.phaseDeg - curr.phaseDeg);
      phaseCrossoverFreq = prev.frequency + frac * (curr.frequency - prev.frequency);
      magnitudeAtPhaseCrossover = prev.magnitudeDB + frac * (curr.magnitudeDB - prev.magnitudeDB);
    }
  }

  const phaseMargin = gainCrossoverFreq > 0 ? (180 + phaseAtGainCrossover) : Infinity;
  const gainMargin = phaseCrossoverFreq > 0 ? -magnitudeAtPhaseCrossover : Infinity;

  return {
    gainMargin: parseFloat(isFinite(gainMargin) ? gainMargin.toFixed(2) : 'Infinity' as any),
    phaseMargin: parseFloat(isFinite(phaseMargin) ? phaseMargin.toFixed(2) : 'Infinity' as any),
    gainCrossoverFreq: parseFloat(gainCrossoverFreq.toFixed(4)),
    phaseCrossoverFreq: parseFloat(phaseCrossoverFreq.toFixed(4)),
  };
}
