/**
 * Digital Counter Simulation Engine
 * Models Asynchronous/Synchronous 4-Bit Binary, BCD Decade, Ring, and Johnson Counters
 * Includes 7-segment LED decoding and multi-channel timing waveform generation.
 */

export type CounterMode = 'binary-up' | 'binary-down' | 'bcd-decade' | 'ring' | 'johnson';

export interface CounterState {
  count: number;          // Decimal integer value (0 to 15)
  bits: [boolean, boolean, boolean, boolean]; // [Q3, Q2, Q1, Q0] where Q3 is MSB, Q0 is LSB
  hex: string;            // '0' through 'F'
  sevenSegment: SevenSegmentState;
}

export interface SevenSegmentState {
  a: boolean;
  b: boolean;
  c: boolean;
  d: boolean;
  e: boolean;
  f: boolean;
  g: boolean;
  dp: boolean;
}

export interface CounterTimingStep {
  cycle: number;
  clk: number; // 0 or 1
  q0: number;  // 0 or 1 (LSB)
  q1: number;
  q2: number;
  q3: number;  // (MSB)
  decimal: number;
}

// 7-segment active segment map for hexadecimal digits 0-F
// Segments layout:
//    -- a --
//   |       |
//   f       b
//   |       |
//    -- g --
//   |       |
//   e       c
//   |       |
//    -- d --  [dp]
const SEVEN_SEG_MAP: Record<number, [boolean, boolean, boolean, boolean, boolean, boolean, boolean]> = {
  0:  [true,  true,  true,  true,  true,  true,  false], // 0
  1:  [false, true,  true,  false, false, false, false], // 1
  2:  [true,  true,  false, true,  true,  false, true],  // 2
  3:  [true,  true,  true,  true,  false, false, true],  // 3
  4:  [false, true,  true,  false, false, true,  true],  // 4
  5:  [true,  false, true,  true,  false, true,  true],  // 5
  6:  [true,  false, true,  true,  true,  true,  true],  // 6
  7:  [true,  true,  true,  false, false, false, false], // 7
  8:  [true,  true,  true,  true,  true,  true,  true],  // 8
  9:  [true,  true,  true,  true,  false, true,  true],  // 9
  10: [true,  true,  true,  false, true,  true,  true],  // A
  11: [false, false, true,  true,  true,  true,  true],  // b
  12: [true,  false, false, true,  true,  true,  false], // C
  13: [false, true,  true,  true,  true,  false, true],  // d
  14: [true,  false, false, true,  true,  true,  true],  // E
  15: [true,  false, false, false, true,  true,  true],  // F
};

export function decodeSevenSegment(value: number): SevenSegmentState {
  const clamped = Math.max(0, Math.min(15, Math.floor(value)));
  const [a, b, c, d, e, f, g] = SEVEN_SEG_MAP[clamped] || SEVEN_SEG_MAP[0];
  return { a, b, c, d, e, f, g, dp: false };
}

export function getCounterState(count: number, mode: CounterMode): CounterState {
  let normalized = count;
  let bits: [boolean, boolean, boolean, boolean];

  switch (mode) {
    case 'binary-up':
    case 'binary-down':
      normalized = ((count % 16) + 16) % 16;
      bits = [
        Boolean((normalized >> 3) & 1),
        Boolean((normalized >> 2) & 1),
        Boolean((normalized >> 1) & 1),
        Boolean(normalized & 1),
      ];
      break;

    case 'bcd-decade':
      normalized = ((count % 10) + 10) % 10;
      bits = [
        Boolean((normalized >> 3) & 1),
        Boolean((normalized >> 2) & 1),
        Boolean((normalized >> 1) & 1),
        Boolean(normalized & 1),
      ];
      break;

    case 'ring': {
      // 4 states: 1000 (8), 0100 (4), 0010 (2), 0001 (1)
      const ringIndex = ((count % 4) + 4) % 4;
      const ringStates: [boolean, boolean, boolean, boolean][] = [
        [true, false, false, false],
        [false, true, false, false],
        [false, false, true, false],
        [false, false, false, true],
      ];
      bits = ringStates[ringIndex];
      normalized = (Number(bits[0]) << 3) | (Number(bits[1]) << 2) | (Number(bits[2]) << 1) | Number(bits[3]);
      break;
    }

    case 'johnson': {
      // 8 states: 0000, 1000, 1100, 1110, 1111, 0111, 0011, 0001
      const jIndex = ((count % 8) + 8) % 8;
      const jStates: [boolean, boolean, boolean, boolean][] = [
        [false, false, false, false],
        [true, false, false, false],
        [true, true, false, false],
        [true, true, true, false],
        [true, true, true, true],
        [false, true, true, true],
        [false, false, true, true],
        [false, false, false, true],
      ];
      bits = jStates[jIndex];
      normalized = (Number(bits[0]) << 3) | (Number(bits[1]) << 2) | (Number(bits[2]) << 1) | Number(bits[3]);
      break;
    }
  }

  return {
    count: normalized,
    bits,
    hex: normalized.toString(16).toUpperCase(),
    sevenSegment: decodeSevenSegment(normalized),
  };
}

export function nextCounterStep(currentCount: number, mode: CounterMode): number {
  switch (mode) {
    case 'binary-up':
      return (currentCount + 1) % 16;
    case 'binary-down':
      return (currentCount - 1 + 16) % 16;
    case 'bcd-decade':
      return (currentCount + 1) % 10;
    case 'ring':
      return (currentCount + 1) % 4;
    case 'johnson':
      return (currentCount + 1) % 8;
  }
}

/**
 * Generates an interleaved timing diagram for clock cycles and binary outputs.
 */
export function generateCounterTiming(mode: CounterMode, numCycles: number = 16): CounterTimingStep[] {
  const steps: CounterTimingStep[] = [];
  let countVal = 0;

  for (let c = 0; c < numCycles; c++) {
    const state = getCounterState(countVal, mode);

    // Clock Low phase
    steps.push({
      cycle: c,
      clk: 0,
      q0: Number(state.bits[3]),
      q1: Number(state.bits[2]),
      q2: Number(state.bits[1]),
      q3: Number(state.bits[0]),
      decimal: state.count,
    });

    // Clock High phase (rising edge trigger advances state)
    countVal = nextCounterStep(countVal, mode);
    const nextState = getCounterState(countVal, mode);

    steps.push({
      cycle: c + 0.5,
      clk: 1,
      q0: Number(nextState.bits[3]),
      q1: Number(nextState.bits[2]),
      q2: Number(nextState.bits[1]),
      q3: Number(nextState.bits[0]),
      decimal: nextState.count,
    });
  }

  return steps;
}
