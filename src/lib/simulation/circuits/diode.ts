/**
 * Diode and Rectifier Simulation Engine
 *
 * Implements Shockley diode model and Half-Wave / Full-Wave rectification with filtering.
 * Shockley Equation: I_D = I_s * (e^(V_D / (n * V_t)) - 1)
 */

export type DiodeMaterial = 'silicon' | 'germanium' | 'schottky' | 'led_red';

export interface DiodeProperties {
  material: DiodeMaterial;
  name: string;
  forwardDrop: number;   // Typical V_D at ~10mA (V)
  saturationCurrent: number; // I_s (Amps)
  idealityFactor: number;    // n (1 to 2)
}

export const DIODE_PRESETS: Record<DiodeMaterial, DiodeProperties> = {
  silicon: { material: 'silicon', name: 'Silicon 1N4148 / 1N4007', forwardDrop: 0.7, saturationCurrent: 1e-12, idealityFactor: 1.5 },
  germanium: { material: 'germanium', name: 'Germanium 1N34A', forwardDrop: 0.3, saturationCurrent: 1e-7, idealityFactor: 1.0 },
  schottky: { material: 'schottky', name: 'Schottky 1N5819', forwardDrop: 0.35, saturationCurrent: 1e-9, idealityFactor: 1.05 },
  led_red: { material: 'led_red', name: 'Red LED', forwardDrop: 1.8, saturationCurrent: 1e-18, idealityFactor: 2.0 },
};

export interface RectifierParameters {
  type: 'half_wave' | 'full_wave_bridge';
  material: DiodeMaterial;
  inputPeakVoltage: number; // V_m (Volts)
  frequency: number;        // Hz (e.g. 50 or 60 Hz)
  loadResistance: number;   // Ohms
  filterCapacitance: number;// Farads (0 = no filter)
}

export interface RectifierMetrics {
  peakOutputVoltage: number;
  dcAverageVoltage: number;
  rmsOutputVoltage: number;
  rippleVoltage: number;
  rippleFactor: number;
  rectificationEfficiency: number; // %
}

export interface RectifierWavePoint {
  time: number;       // ms
  inputVoltage: number;
  outputVoltage: number;
}

export function calculateRectifierMetrics(params: RectifierParameters): RectifierMetrics {
  const diode = DIODE_PRESETS[params.material];
  const drop = params.type === 'half_wave' ? diode.forwardDrop : 2 * diode.forwardDrop;
  const Vm = params.inputPeakVoltage;
  const Vpeak = Math.max(0, Vm - drop);
  const R = Math.max(1, params.loadResistance);
  const C = params.filterCapacitance;
  const f = Math.max(1, params.frequency);

  let Vdc = 0;
  let Vripple = 0;

  if (C > 1e-9) {
    // With capacitor filter: V_ripple ~ V_peak / (2 * f_rect * R * C)
    const fRect = params.type === 'half_wave' ? f : 2 * f;
    Vripple = Vpeak / (2 * fRect * R * C);
    // Vripple cannot exceed Vpeak
    Vripple = Math.min(Vpeak, Vripple);
    Vdc = Vpeak - Vripple / 2;
  } else {
    // Unfiltered
    Vdc = params.type === 'half_wave' ? Vpeak / Math.PI : (2 * Vpeak) / Math.PI;
    Vripple = params.type === 'half_wave' ? 0.385 * Vpeak : 0.22 * Vpeak;
  }

  const rippleFactor = Vdc > 0 ? (Vripple / Vdc) : 0;
  const efficiency = params.type === 'half_wave' ? 40.6 : 81.2;

  return {
    peakOutputVoltage: parseFloat(Vpeak.toFixed(2)),
    dcAverageVoltage: parseFloat(Vdc.toFixed(2)),
    rmsOutputVoltage: parseFloat((Vpeak / Math.SQRT2).toFixed(2)),
    rippleVoltage: parseFloat(Vripple.toFixed(2)),
    rippleFactor: parseFloat(rippleFactor.toFixed(3)),
    rectificationEfficiency: efficiency,
  };
}

export function generateRectifierWaveforms(
  params: RectifierParameters,
  cycles = 3,
  pointsPerCycle = 100
): RectifierWavePoint[] {
  const diode = DIODE_PRESETS[params.material];
  const drop = params.type === 'half_wave' ? diode.forwardDrop : 2 * diode.forwardDrop;
  const Vm = params.inputPeakVoltage;
  const f = Math.max(1, params.frequency);
  const T = 1 / f;
  const totalTime = cycles * T;
  const totalPoints = cycles * pointsPerCycle;
  const dt = totalTime / totalPoints;

  const R = Math.max(1, params.loadResistance);
  const C = params.filterCapacitance;
  const hasFilter = C > 1e-9;
  const tau = R * C;

  const points: RectifierWavePoint[] = [];
  let capVoltage = 0;

  for (let i = 0; i <= totalPoints; i++) {
    const t = i * dt;
    const vin = Vm * Math.sin(2 * Math.PI * f * t);

    // Raw rectified voltage before capacitor
    let vRaw = 0;
    if (params.type === 'half_wave') {
      vRaw = vin > drop ? vin - drop : 0;
    } else {
      vRaw = Math.abs(vin) > drop ? Math.abs(vin) - drop : 0;
    }

    let vout = vRaw;
    if (hasFilter) {
      if (vRaw > capVoltage) {
        // Charging capacitor
        capVoltage = vRaw;
      } else {
        // Discharging through load resistor
        capVoltage = capVoltage * Math.exp(-dt / tau);
      }
      vout = capVoltage;
    }

    points.push({
      time: parseFloat((t * 1000).toFixed(2)), // in ms
      inputVoltage: parseFloat(vin.toFixed(2)),
      outputVoltage: parseFloat(vout.toFixed(2)),
    });
  }

  return points;
}
