/**
 * RL Transient Simulation Engine
 *
 * Simulates current growth and decay in a series RL circuit.
 * Formulas:
 *   tau = L / R
 *   Growth: i(t) = (V / R) * (1 - e^(-t / tau)), v_L(t) = V * e^(-t / tau)
 *   Decay:  i(t) = I_0 * e^(-t / tau), v_L(t) = -I_0 * R * e^(-t / tau)
 */

export interface RLParameters {
  resistance: number;   // Ohms (R > 0)
  inductance: number;   // Henrys (L > 0)
  voltage: number;      // Volts (Vin)
  initialCurrent?: number; // Amperes
}

export interface RLMetrics {
  tau: number;               // Time constant (seconds)
  steadyStateCurrent: number;// I_ss = V / R (Amps)
  initialVoltageDrop: number;// V_L(0) = Vin (Volts)
  storedEnergy: number;      // E = 0.5 * L * I_ss^2 (Joules)
  cutoffFrequency: number;   // fc = R / (2 * pi * L) (Hz)
}

export interface RLCurvePoint {
  time: number;              // seconds
  current: number;           // Amperes
  inductorVoltage: number;   // Volts
  resistorVoltage: number;   // Volts
  timeNormalized: number;    // t / tau
}

export function calculateRLMetrics(params: RLParameters): RLMetrics {
  const R = Math.max(0.001, params.resistance);
  const L = Math.max(1e-9, params.inductance);
  const V = params.voltage;

  const tau = L / R;
  const steadyStateCurrent = V / R;
  const initialVoltageDrop = V;
  const storedEnergy = 0.5 * L * steadyStateCurrent * steadyStateCurrent;
  const cutoffFrequency = R / (2 * Math.PI * L);

  return {
    tau,
    steadyStateCurrent,
    initialVoltageDrop,
    storedEnergy,
    cutoffFrequency,
  };
}

export function generateRLCurrentGrowth(
  params: RLParameters,
  numPoints = 200,
  maxTauMultiplier = 5
): RLCurvePoint[] {
  const R = Math.max(0.001, params.resistance);
  const L = Math.max(1e-9, params.inductance);
  const V = params.voltage;
  const tau = L / R;
  const tMax = tau * maxTauMultiplier;
  const dt = tMax / numPoints;

  const points: RLCurvePoint[] = [];
  const Iss = V / R;

  for (let i = 0; i <= numPoints; i++) {
    const t = i * dt;
    const expTerm = Math.exp(-t / tau);
    const iL = Iss * (1 - expTerm);
    const vL = V * expTerm;
    const vR = iL * R;

    points.push({
      time: parseFloat(t.toPrecision(5)),
      current: parseFloat(iL.toPrecision(5)),
      inductorVoltage: parseFloat(vL.toPrecision(5)),
      resistorVoltage: parseFloat(vR.toPrecision(5)),
      timeNormalized: parseFloat((t / tau).toFixed(2)),
    });
  }

  return points;
}

export function generateRLCurrentDecay(
  params: RLParameters,
  numPoints = 200,
  maxTauMultiplier = 5
): RLCurvePoint[] {
  const R = Math.max(0.001, params.resistance);
  const L = Math.max(1e-9, params.inductance);
  const tau = L / R;
  const I0 = params.initialCurrent ?? (params.voltage / R);
  const tMax = tau * maxTauMultiplier;
  const dt = tMax / numPoints;

  const points: RLCurvePoint[] = [];

  for (let i = 0; i <= numPoints; i++) {
    const t = i * dt;
    const expTerm = Math.exp(-t / tau);
    const iL = I0 * expTerm;
    const vL = -I0 * R * expTerm;
    const vR = iL * R;

    points.push({
      time: parseFloat(t.toPrecision(5)),
      current: parseFloat(iL.toPrecision(5)),
      inductorVoltage: parseFloat(vL.toPrecision(5)),
      resistorVoltage: parseFloat(vR.toPrecision(5)),
      timeNormalized: parseFloat((t / tau).toFixed(2)),
    });
  }

  return points;
}
