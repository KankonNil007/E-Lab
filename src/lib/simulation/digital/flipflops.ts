/**
 * Flip-Flop Simulation Engine
 *
 * Implements SR Latch, D, JK, and T flip-flops with timing diagram generation.
 */

export type FlipFlopType = 'SR' | 'D' | 'JK' | 'T';

export interface FlipFlopState {
  q: boolean;
  qBar: boolean;
  invalid?: boolean; // SR latch S=1,R=1
}

/**
 * SR Latch: Set-Reset
 * S=0, R=0 → no change
 * S=1, R=0 → Q=1
 * S=0, R=1 → Q=0
 * S=1, R=1 → invalid
 */
export function srLatch(s: boolean, r: boolean, prevQ: boolean): FlipFlopState {
  if (s && r) return { q: prevQ, qBar: !prevQ, invalid: true };
  if (s) return { q: true, qBar: false };
  if (r) return { q: false, qBar: true };
  return { q: prevQ, qBar: !prevQ };
}

/**
 * D Flip-Flop: Data (on rising edge)
 * Q follows D on clock edge.
 */
export function dFlipFlop(d: boolean, _prevQ: boolean): FlipFlopState {
  return { q: d, qBar: !d };
}

/**
 * JK Flip-Flop (on rising edge)
 * J=0, K=0 → no change
 * J=1, K=0 → Q=1
 * J=0, K=1 → Q=0
 * J=1, K=1 → toggle
 */
export function jkFlipFlop(j: boolean, k: boolean, prevQ: boolean): FlipFlopState {
  let q: boolean;
  if (!j && !k) q = prevQ;       // No change
  else if (j && !k) q = true;    // Set
  else if (!j && k) q = false;   // Reset
  else q = !prevQ;               // Toggle
  return { q, qBar: !q };
}

/**
 * T Flip-Flop: Toggle (on rising edge)
 * T=0 → no change
 * T=1 → toggle
 */
export function tFlipFlop(t: boolean, prevQ: boolean): FlipFlopState {
  const q = t ? !prevQ : prevQ;
  return { q, qBar: !q };
}

/**
 * General flip-flop evaluator.
 */
export function evaluateFlipFlop(
  type: FlipFlopType,
  inputs: { s?: boolean; r?: boolean; d?: boolean; j?: boolean; k?: boolean; t?: boolean },
  prevQ: boolean
): FlipFlopState {
  switch (type) {
    case 'SR': return srLatch(inputs.s ?? false, inputs.r ?? false, prevQ);
    case 'D':  return dFlipFlop(inputs.d ?? false, prevQ);
    case 'JK': return jkFlipFlop(inputs.j ?? false, inputs.k ?? false, prevQ);
    case 'T':  return tFlipFlop(inputs.t ?? false, prevQ);
  }
}

/**
 * Timing diagram data for a sequence of clock cycles.
 */
export interface TimingDiagramData {
  clock: boolean[];
  inputs: Record<string, boolean[]>;
  q: boolean[];
  qBar: boolean[];
}

/**
 * Generate a timing diagram by running a flip-flop through a sequence of input states.
 */
export function generateTimingDiagram(
  type: FlipFlopType,
  inputSequence: Record<string, boolean>[],
  initialQ: boolean = false
): TimingDiagramData {
  const numCycles = inputSequence.length;
  const clock: boolean[] = [];
  const q: boolean[] = [];
  const qBar: boolean[] = [];

  // Collect input channel names
  const inputNames = Object.keys(inputSequence[0] || {});
  const inputs: Record<string, boolean[]> = {};
  inputNames.forEach((name) => { inputs[name] = []; });

  let prevQ = initialQ;

  for (let i = 0; i < numCycles; i++) {
    // Low phase of clock (no change)
    clock.push(false);
    q.push(prevQ);
    qBar.push(!prevQ);
    inputNames.forEach((name) => inputs[name].push(inputSequence[i][name] ?? false));

    // High phase of clock (edge trigger)
    clock.push(true);
    const state = evaluateFlipFlop(type, inputSequence[i], prevQ);
    prevQ = state.q;
    q.push(state.q);
    qBar.push(state.qBar);
    inputNames.forEach((name) => inputs[name].push(inputSequence[i][name] ?? false));
  }

  return { clock, inputs, q, qBar };
}

/**
 * Generate a default input sequence for a flip-flop type.
 */
export function getDefaultInputSequence(type: FlipFlopType, numCycles: number = 8): Record<string, boolean>[] {
  const seq: Record<string, boolean>[] = [];
  for (let i = 0; i < numCycles; i++) {
    switch (type) {
      case 'SR':
        seq.push({
          s: [false, true, false, false, true, false, false, true][i % 8],
          r: [false, false, true, false, false, true, false, false][i % 8],
        });
        break;
      case 'D':
        seq.push({ d: [false, true, true, false, true, false, false, true][i % 8] });
        break;
      case 'JK':
        seq.push({
          j: [false, true, false, true, true, false, true, false][i % 8],
          k: [false, false, true, false, true, true, false, false][i % 8],
        });
        break;
      case 'T':
        seq.push({ t: [false, true, true, false, true, true, false, true][i % 8] });
        break;
    }
  }
  return seq;
}
