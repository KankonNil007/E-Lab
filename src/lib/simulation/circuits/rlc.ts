/**
 * RLC Circuit Simulation Engine
 *
 * Core relations (series RLC):
 *   f₀ = 1 / (2π√(LC))                  (resonant frequency)
 *   Q  = (1/R) × √(L/C)                 (quality factor)
 *   BW = f₀ / Q                          (bandwidth)
 *   ζ  = R / (2√(L/C)) = 1 / (2Q)       (damping ratio)
 *   |Z(f)| = √(R² + (XL − XC)²)         (impedance magnitude)
 */

export interface RLCParameters {
  resistance: number;     // Ohms
  inductance: number;     // Henries
  capacitance: number;    // Farads
}

export interface RLCMetrics {
  resonantFrequency: number;   // Hz
  resonantOmega: number;       // rad/s
  qualityFactor: number;
  bandwidth: number;           // Hz
  dampingRatio: number;
  lowerCutoff: number;         // Hz
  upperCutoff: number;         // Hz
  impedanceAtResonance: number; // Ohms (= R for series)
}

export function calculateRLCMetrics(params: RLCParameters): RLCMetrics {
  const { resistance: R, inductance: L, capacitance: C } = params;
  const omega0 = 1 / Math.sqrt(L * C);
  const f0 = omega0 / (2 * Math.PI);
  const Q = (1 / R) * Math.sqrt(L / C);
  const BW = f0 / Q;
  const zeta = R / (2 * Math.sqrt(L / C));

  return {
    resonantFrequency: f0,
    resonantOmega: omega0,
    qualityFactor: Q,
    bandwidth: BW,
    dampingRatio: zeta,
    lowerCutoff: f0 - BW / 2,
    upperCutoff: f0 + BW / 2,
    impedanceAtResonance: R,
  };
}

export interface ImpedanceCurvePoint {
  frequency: number;
  impedance: number;
  impedanceDB: number;
  phaseDeg: number;
  xL: number;
  xC: number;
}

/**
 * Generate impedance magnitude vs. frequency for a series RLC circuit.
 * |Z(f)| = √(R² + (2πfL − 1/(2πfC))²)
 */
export function generateImpedanceCurve(
  params: RLCParameters,
  fMin: number = 1,
  fMax: number = 100000,
  pointsPerDecade: number = 30
): ImpedanceCurvePoint[] {
  const { resistance: R, inductance: L, capacitance: C } = params;
  const decades = Math.log10(fMax / fMin);
  const totalPoints = Math.round(decades * pointsPerDecade);
  const points: ImpedanceCurvePoint[] = [];

  for (let i = 0; i <= totalPoints; i++) {
    const f = fMin * Math.pow(10, (i / totalPoints) * decades);
    const omega = 2 * Math.PI * f;
    const xL = omega * L;
    const xC = 1 / (omega * C);
    const xNet = xL - xC;
    const impedance = Math.sqrt(R * R + xNet * xNet);
    const impedanceDB = 20 * Math.log10(impedance);
    const phaseDeg = Math.atan2(xNet, R) * (180 / Math.PI);

    points.push({
      frequency: parseFloat(f.toFixed(2)),
      impedance: parseFloat(impedance.toFixed(4)),
      impedanceDB: parseFloat(impedanceDB.toFixed(2)),
      phaseDeg: parseFloat(phaseDeg.toFixed(2)),
      xL: parseFloat(xL.toFixed(4)),
      xC: parseFloat(xC.toFixed(4)),
    });
  }
  return points;
}

/**
 * Generate transient step response data for series RLC circuit.
 */
export interface RLCTransientPoint {
  time: number;
  voltage: number;
  current: number;
}

export function generateRLCStepResponse(
  params: RLCParameters,
  supplyVoltage: number = 1,
  numPoints: number = 300,
  timeMultiplier: number = 5
): RLCTransientPoint[] {
  const { resistance: R, inductance: L, capacitance: C } = params;
  const omega0 = 1 / Math.sqrt(L * C);
  const zeta = R / (2 * Math.sqrt(L / C));
  const tMax = timeMultiplier / (zeta * omega0 + 0.01);
  const dt = tMax / numPoints;
  const points: RLCTransientPoint[] = [];

  for (let i = 0; i <= numPoints; i++) {
    const t = i * dt;
    let v: number;

    if (zeta < 1) {
      // Underdamped
      const wd = omega0 * Math.sqrt(1 - zeta * zeta);
      const phi = Math.acos(zeta);
      v = supplyVoltage * (1 - (Math.exp(-zeta * omega0 * t) / Math.sqrt(1 - zeta * zeta)) * Math.sin(wd * t + phi));
    } else if (Math.abs(zeta - 1) < 0.02) {
      // Critically damped
      v = supplyVoltage * (1 - Math.exp(-omega0 * t) * (1 + omega0 * t));
    } else {
      // Overdamped
      const s1 = -omega0 * (zeta - Math.sqrt(zeta * zeta - 1));
      const s2 = -omega0 * (zeta + Math.sqrt(zeta * zeta - 1));
      v = supplyVoltage * (1 + (s2 * Math.exp(s1 * t) - s1 * Math.exp(s2 * t)) / (s1 - s2));
    }

    points.push({
      time: parseFloat(t.toFixed(5)),
      voltage: parseFloat(Math.max(0, v).toFixed(5)),
      current: 0, // placeholder for extended implementation
    });
  }
  return points;
}
