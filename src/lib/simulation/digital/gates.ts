/**
 * Digital Logic Gates Simulation Engine
 *
 * Pure Boolean functions and truth table generators.
 */

export type GateType = 'AND' | 'OR' | 'NOT' | 'NAND' | 'NOR' | 'XOR' | 'XNOR';

/**
 * Evaluate a single gate with the given inputs.
 */
export function evaluateGate(gate: GateType, a: boolean, b: boolean = false): boolean {
  switch (gate) {
    case 'AND':  return a && b;
    case 'OR':   return a || b;
    case 'NOT':  return !a;
    case 'NAND': return !(a && b);
    case 'NOR':  return !(a || b);
    case 'XOR':  return a !== b;
    case 'XNOR': return a === b;
  }
}

export interface TruthTableRow {
  a: boolean;
  b: boolean | null;
  y: boolean;
}

/**
 * Generate the complete truth table for a gate.
 */
export function generateTruthTable(gate: GateType): TruthTableRow[] {
  if (gate === 'NOT') {
    return [
      { a: false, b: null, y: evaluateGate(gate, false) },
      { a: true,  b: null, y: evaluateGate(gate, true)  },
    ];
  }

  return [
    { a: false, b: false, y: evaluateGate(gate, false, false) },
    { a: false, b: true,  y: evaluateGate(gate, false, true)  },
    { a: true,  b: false, y: evaluateGate(gate, true,  false) },
    { a: true,  b: true,  y: evaluateGate(gate, true,  true)  },
  ];
}

/**
 * Get the KaTeX Boolean algebra expression for each gate.
 */
export function getGateFormula(gate: GateType): string {
  switch (gate) {
    case 'AND':  return 'Y = A \\cdot B';
    case 'OR':   return 'Y = A + B';
    case 'NOT':  return 'Y = \\bar{A}';
    case 'NAND': return 'Y = \\overline{A \\cdot B}';
    case 'NOR':  return 'Y = \\overline{A + B}';
    case 'XOR':  return 'Y = A \\oplus B = A\\bar{B} + \\bar{A}B';
    case 'XNOR': return 'Y = \\overline{A \\oplus B} = AB + \\bar{A}\\bar{B}';
  }
}

/**
 * Evaluate a multi-gate combinational circuit (Half Adder / Full Adder).
 */
export interface HalfAdderResult {
  sum: boolean;
  carry: boolean;
}

export function halfAdder(a: boolean, b: boolean): HalfAdderResult {
  return {
    sum: a !== b,   // XOR
    carry: a && b,  // AND
  };
}

export interface FullAdderResult {
  sum: boolean;
  carryOut: boolean;
}

export function fullAdder(a: boolean, b: boolean, carryIn: boolean): FullAdderResult {
  const ha1 = halfAdder(a, b);
  const ha2 = halfAdder(ha1.sum, carryIn);
  return {
    sum: ha2.sum,
    carryOut: ha1.carry || ha2.carry,
  };
}
