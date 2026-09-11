/**
 * MOSFET Transistor Simulation Engine
 * Models N-Channel & P-Channel Enhancement MOSFET DC characteristics
 * Regions: Cutoff, Triode (Linear), and Saturation (Active)
 * Equations incorporate channel-length modulation (lambda) and pinch-off locus.
 */

export type MosfetType = 'NMOS' | 'PMOS';

export type OperatingRegion = 'Cutoff' | 'Triode' | 'Saturation';

export interface MosfetParams {
  type: MosfetType;
  vgs: number;         // Gate-to-Source Voltage (V)
  vds: number;         // Drain-to-Source Voltage (V)
  vth: number;         // Threshold Voltage (V, positive for NMOS, negative for PMOS)
  kn: number;          // Conduction parameter k = 0.5 * mu * Cox * (W/L) in mA/V^2
  lambda: number;      // Channel-length modulation parameter (1/V)
}

export interface MosfetOperatingPoint {
  region: OperatingRegion;
  vgs: number;
  vds: number;
  vov: number;          // Overdrive voltage: Vgs - Vth
  vdsSat: number;       // Saturation drain voltage: Vgs - Vth
  id: number;           // Drain current in mA
  gm: number;           // Transconductance in mS (mA/V)
  ro: number;           // Small-signal output resistance in kOhm
  powerDissipation: number; // mW (Vds * Id)
}

export interface IVCurvePoint {
  vds: number;
  id: number;
  isPinchOff?: boolean;
}

export interface TraceCurve {
  vgs: number;
  data: IVCurvePoint[];
}

/**
 * Evaluates the MOSFET operating point for given DC voltages.
 */
export function calculateMosfetOperatingPoint(params: MosfetParams): MosfetOperatingPoint {
  const { type, vgs, vds, vth, kn, lambda } = params;

  // Normalized voltages for NMOS-equivalent calculation
  const vgsEff = type === 'NMOS' ? vgs : -vgs;
  const vdsEff = type === 'NMOS' ? vds : -vds;
  const vthEff = Math.abs(vth);

  const vov = vgsEff - vthEff;
  const vdsSat = Math.max(0, vov);

  let region: OperatingRegion = 'Cutoff';
  let id = 0; // mA
  let gm = 0; // mS
  let ro = Infinity; // kOhm

  if (vgsEff <= vthEff) {
    // Cutoff Region
    region = 'Cutoff';
    id = 0;
    gm = 0;
    ro = Infinity;
  } else if (vdsEff < vov) {
    // Triode (Linear / Ohmic) Region
    region = 'Triode';
    const baseId = kn * (2 * vov * vdsEff - vdsEff * vdsEff);
    id = baseId * (1 + lambda * vdsEff);
    gm = 2 * kn * vdsEff * (1 + lambda * vdsEff);
    ro = lambda > 0 ? (1 / (lambda * Math.max(0.001, id))) : 1e6;
  } else {
    // Saturation (Active / Pinch-off) Region
    region = 'Saturation';
    const baseId = kn * vov * vov;
    id = baseId * (1 + lambda * vdsEff);
    gm = 2 * kn * vov * (1 + lambda * vdsEff);
    ro = lambda > 0 ? (1 / (lambda * Math.max(0.001, id))) : 1e6;
  }

  const powerDissipation = Math.abs(vdsEff * id);

  return {
    region,
    vgs,
    vds,
    vov,
    vdsSat,
    id: Math.max(0, id),
    gm: Math.max(0, gm),
    ro: Number.isFinite(ro) ? ro : 999999,
    powerDissipation,
  };
}

/**
 * Generates a family of ID vs VDS output characteristic curves for multiple VGS levels.
 */
export function generateMosfetOutputCurves(
  params: Omit<MosfetParams, 'vgs' | 'vds'>,
  vgsValues: number[] = [2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0],
  maxVds: number = 10,
  steps: number = 50
): TraceCurve[] {
  const traces: TraceCurve[] = [];

  for (const vgs of vgsValues) {
    const points: IVCurvePoint[] = [];
    for (let i = 0; i <= steps; i++) {
      const vds = (i / steps) * maxVds;
      const op = calculateMosfetOperatingPoint({
        ...params,
        vgs,
        vds,
      });
      points.push({
        vds: Number(vds.toFixed(2)),
        id: Number(op.id.toFixed(3)),
      });
    }
    traces.push({ vgs, data: points });
  }

  return traces;
}

/**
 * Generates the locus of pinch-off points: Vds,sat = Vgs - Vth
 */
export function generatePinchOffLocus(
  params: Omit<MosfetParams, 'vgs' | 'vds'>,
  maxVds: number = 10,
  steps: number = 30
): IVCurvePoint[] {
  const points: IVCurvePoint[] = [];
  const vthEff = Math.abs(params.vth);

  for (let i = 0; i <= steps; i++) {
    const vds = (i / steps) * maxVds;
    const vgs = vds + vthEff;
    const op = calculateMosfetOperatingPoint({
      ...params,
      vgs,
      vds,
    });
    points.push({
      vds: Number(vds.toFixed(2)),
      id: Number(op.id.toFixed(3)),
      isPinchOff: true,
    });
  }

  return points;
}
