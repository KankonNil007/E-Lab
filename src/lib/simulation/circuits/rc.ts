/**
 * RC Circuit Simulation Engine
 *
 * Core relations:
 *   τ  = R × C                          (time constant)
 *   fc = 1 / (2π × R × C)              (cutoff frequency)
 *   Vc(t) = V0 × (1 − e^(−t/τ))        (charging)
 *   Vc(t) = V0 × e^(−t/τ)              (discharging)
 */

export interface RCParameters {
  resistance: number;   // Ohms
  capacitance: number;  // Farads
  voltage: number;      // Supply voltage (V)
  initialVoltage?: number; // Initial capacitor voltage (V)
}

export interface RCMetrics {
  tau: number;          // Time constant (seconds)
  cutoffFrequency: number; // fc (Hz)
  fivePercent: number;  // Time to reach ~95% (3τ)
  onePercent: number;   // Time to reach ~99% (5τ)
}

export function calculateRCMetrics(params: RCParameters): RCMetrics {
  const tau = params.resistance * params.capacitance;
  const cutoffFrequency = 1 / (2 * Math.PI * tau);
  return {
    tau,
    cutoffFrequency,
    fivePercent: 3 * tau,
    onePercent: 5 * tau,
  };
}

export interface RCDataPoint {
  time: number;
  voltage: number;
  current_mA: number;
}

/**
 * Generate RC charging curve: Vc(t) = Vin × (1 − e^(−t/τ))
 */
export function generateChargingCurve(
  params: RCParameters,
  numPoints: number = 200,
  timeMultiplier: number = 5
): RCDataPoint[] {
  const tau = params.resistance * params.capacitance;
  const tMax = tau * timeMultiplier;
  const dt = tMax / numPoints;
  const V0 = params.initialVoltage ?? 0;
  const Vin = params.voltage;
  const points: RCDataPoint[] = [];

  for (let i = 0; i <= numPoints; i++) {
    const t = i * dt;
    const vCap = V0 + (Vin - V0) * (1 - Math.exp(-t / tau));
    const iCurrent = ((Vin - vCap) / params.resistance) * 1000; // mA
    points.push({
      time: parseFloat(t.toFixed(6)),
      voltage: parseFloat(vCap.toFixed(4)),
      current_mA: parseFloat(iCurrent.toFixed(4)),
    });
  }
  return points;
}

/**
 * Generate RC discharging curve: Vc(t) = V0 × e^(−t/τ)
 */
export function generateDischargingCurve(
  params: RCParameters,
  numPoints: number = 200,
  timeMultiplier: number = 5
): RCDataPoint[] {
  const tau = params.resistance * params.capacitance;
  const tMax = tau * timeMultiplier;
  const dt = tMax / numPoints;
  const V0 = params.initialVoltage ?? params.voltage;
  const points: RCDataPoint[] = [];

  for (let i = 0; i <= numPoints; i++) {
    const t = i * dt;
    const vCap = V0 * Math.exp(-t / tau);
    const iCurrent = (-vCap / params.resistance) * 1000; // mA (negative, discharging)
    points.push({
      time: parseFloat(t.toFixed(6)),
      voltage: parseFloat(vCap.toFixed(4)),
      current_mA: parseFloat(Math.abs(iCurrent).toFixed(4)),
    });
  }
  return points;
}

/**
 * Generate frequency response for RC low-pass filter.
 * |H(f)| = 1 / sqrt(1 + (f/fc)²)
 * φ(f) = -arctan(f/fc)
 */
export interface FrequencyResponsePoint {
  frequency: number;
  magnitude: number;     // linear
  magnitudeDB: number;   // dB
  phaseDeg: number;      // degrees
}

export function generateRCFrequencyResponse(
  params: RCParameters,
  fMin: number = 0.1,
  fMax: number = 100000,
  pointsPerDecade: number = 20
): FrequencyResponsePoint[] {
  const fc = 1 / (2 * Math.PI * params.resistance * params.capacitance);
  const decades = Math.log10(fMax / fMin);
  const totalPoints = Math.round(decades * pointsPerDecade);
  const points: FrequencyResponsePoint[] = [];

  for (let i = 0; i <= totalPoints; i++) {
    const f = fMin * Math.pow(10, (i / totalPoints) * decades);
    const ratio = f / fc;
    const magnitude = 1 / Math.sqrt(1 + ratio * ratio);
    const magnitudeDB = 20 * Math.log10(magnitude);
    const phaseDeg = -Math.atan(ratio) * (180 / Math.PI);

    points.push({
      frequency: parseFloat(f.toFixed(2)),
      magnitude: parseFloat(magnitude.toFixed(6)),
      magnitudeDB: parseFloat(magnitudeDB.toFixed(2)),
      phaseDeg: parseFloat(phaseDeg.toFixed(2)),
    });
  }
  return points;
}
