import React, { useState, useMemo } from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { RotateCcw } from 'lucide-react';

export const MatrixCalculator: React.FC = () => {
  const [dim, setDim] = useState<2 | 3>(2);

  // 2x2 or 3x3 matrices A and B
  const [matrixA, setMatrixA] = useState<number[][]>([
    [2, 1, 0],
    [1, 3, 0],
    [0, 0, 1],
  ]);

  const [matrixB, setMatrixB] = useState<number[][]>([
    [1, 0, 0],
    [0, 2, 0],
    [0, 0, 3],
  ]);

  const updateCellA = (r: number, c: number, val: number) => {
    setMatrixA(prev => {
      const next = prev.map(row => [...row]);
      next[r][c] = val;
      return next;
    });
  };

  const updateCellB = (r: number, c: number, val: number) => {
    setMatrixB(prev => {
      const next = prev.map(row => [...row]);
      next[r][c] = val;
      return next;
    });
  };

  // Matrix math calculations
  const results = useMemo(() => {
    if (dim === 2) {
      const a = matrixA[0][0], b = matrixA[0][1];
      const c = matrixA[1][0], d = matrixA[1][1];

      const detA = a * d - b * c;
      const traceA = a + d;

      // Inverse
      let invA: number[][] | null = null;
      if (Math.abs(detA) > 1e-10) {
        invA = [
          [d / detA, -b / detA],
          [-c / detA, a / detA],
        ];
      }

      // Eigenvalues: lambda^2 - trace*lambda + det = 0
      const disc = traceA * traceA - 4 * detA;
      let eigenVals: string = '';
      if (disc >= 0) {
        const l1 = (traceA + Math.sqrt(disc)) / 2;
        const l2 = (traceA - Math.sqrt(disc)) / 2;
        eigenVals = `λ₁ = ${l1.toFixed(2)}, λ₂ = ${l2.toFixed(2)}`;
      } else {
        const real = traceA / 2;
        const imag = Math.sqrt(-disc) / 2;
        eigenVals = `λ = ${real.toFixed(2)} ± j${imag.toFixed(2)}`;
      }

      // A + B
      const sum = [
        [a + matrixB[0][0], b + matrixB[0][1]],
        [c + matrixB[1][0], d + matrixB[1][1]],
      ];

      // A * B
      const b00 = matrixB[0][0], b01 = matrixB[0][1];
      const b10 = matrixB[1][0], b11 = matrixB[1][1];
      const mult = [
        [a * b00 + b * b10, a * b01 + b * b11],
        [c * b00 + d * b10, c * b01 + d * b11],
      ];

      return {
        detA: parseFloat(detA.toFixed(4)),
        traceA: parseFloat(traceA.toFixed(4)),
        invA,
        eigenVals,
        sum,
        mult,
      };
    } else {
      // 3x3 Determinant
      const m = matrixA;
      const detA =
        m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1]) -
        m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0]) +
        m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0]);

      const traceA = m[0][0] + m[1][1] + m[2][2];

      // 3x3 A + B
      const sum = [
        [m[0][0] + matrixB[0][0], m[0][1] + matrixB[0][1], m[0][2] + matrixB[0][2]],
        [m[1][0] + matrixB[1][0], m[1][1] + matrixB[1][1], m[1][2] + matrixB[1][2]],
        [m[2][0] + matrixB[2][0], m[2][1] + matrixB[2][1], m[2][2] + matrixB[2][2]],
      ];

      // 3x3 A * B
      const mult: number[][] = [
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0],
      ];
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          let s = 0;
          for (let k = 0; k < 3; k++) {
            s += matrixA[i][k] * matrixB[k][j];
          }
          mult[i][j] = s;
        }
      }

      return {
        detA: parseFloat(detA.toFixed(4)),
        traceA: parseFloat(traceA.toFixed(4)),
        invA: null,
        eigenVals: '3x3 Polynomial Roots',
        sum,
        mult,
      };
    }
  }, [dim, matrixA, matrixB]);

  const handleReset = () => {
    setMatrixA([
      [2, 1, 0],
      [1, 3, 0],
      [0, 0, 1],
    ]);
    setMatrixB([
      [1, 0, 0],
      [0, 2, 0],
      [0, 0, 3],
    ]);
  };

  return (
    <div className="space-y-6">
      {/* Dimension toggle toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-lg bg-surface-elevated border border-border">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-semibold text-text-muted">MATRIX SIZE:</span>
          <Button
            size="sm"
            variant={dim === 2 ? 'primary' : 'ghost'}
            onClick={() => setDim(2)}
          >
            2 × 2
          </Button>
          <Button
            size="sm"
            variant={dim === 3 ? 'primary' : 'ghost'}
            onClick={() => setDim(3)}
          >
            3 × 3
          </Button>
        </div>
        <Button size="sm" variant="ghost" onClick={handleReset}>
          <RotateCcw className="w-3.5 h-3.5 mr-1" /> Reset Matrices
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Matrix A Input */}
        <Card className="p-3 sm:p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold font-mono text-text-primary uppercase tracking-wider">
              Matrix A
            </h3>
            <Badge variant="info">INPUT</Badge>
          </div>
          <div className="space-y-2">
            {Array.from({ length: dim }).map((_, r) => (
              <div key={r} className="flex gap-2">
                {Array.from({ length: dim }).map((_, c) => (
                  <input
                    key={c}
                    type="number"
                    value={matrixA[r][c]}
                    onChange={e => updateCellA(r, c, parseFloat(e.target.value) || 0)}
                    className="w-full min-w-0 bg-surface border border-border rounded-lg p-2 sm:p-2.5 text-center font-mono text-xs sm:text-sm text-text-primary focus:outline-none focus:border-accent-blue"
                  />
                ))}
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-border grid grid-cols-2 gap-2 text-xs font-mono">
            <div className="p-2 rounded bg-surface border border-border">
              <span className="text-text-muted">det(A):</span>
              <div className="text-base font-bold text-accent-blue">{results.detA}</div>
            </div>
            <div className="p-2 rounded bg-surface border border-border">
              <span className="text-text-muted">Trace(A):</span>
              <div className="text-base font-bold text-text-primary">{results.traceA}</div>
            </div>
            <div className="col-span-2 p-2 rounded bg-surface border border-border">
              <span className="text-text-muted">Eigenvalues of A:</span>
              <div className="text-xs font-bold text-emerald-400 mt-0.5 truncate">{results.eigenVals}</div>
            </div>
          </div>
        </Card>

        {/* Matrix B Input */}
        <Card className="p-3 sm:p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold font-mono text-text-primary uppercase tracking-wider">
              Matrix B
            </h3>
            <Badge variant="info">INPUT</Badge>
          </div>
          <div className="space-y-2">
            {Array.from({ length: dim }).map((_, r) => (
              <div key={r} className="flex gap-2">
                {Array.from({ length: dim }).map((_, c) => (
                  <input
                    key={c}
                    type="number"
                    value={matrixB[r][c]}
                    onChange={e => updateCellB(r, c, parseFloat(e.target.value) || 0)}
                    className="w-full min-w-0 bg-surface border border-border rounded-lg p-2 sm:p-2.5 text-center font-mono text-xs sm:text-sm text-text-primary focus:outline-none focus:border-accent-blue"
                  />
                ))}
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Calculated Results: A + B, A * B, Inverse A */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* A + B */}
        <Card className="p-3 sm:p-5">
          <h4 className="text-xs font-mono font-bold text-text-secondary uppercase mb-3">
            Matrix Sum (A + B)
          </h4>
          <div className="space-y-2">
            {results.sum.slice(0, dim).map((row, r) => (
              <div key={r} className="flex gap-2">
                {row.slice(0, dim).map((val, c) => (
                  <div
                    key={c}
                    className="w-full min-w-0 bg-surface border border-border rounded-lg p-1.5 sm:p-2 text-center font-mono text-xs font-bold text-text-primary"
                  >
                    {val.toFixed(2)}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </Card>

        {/* A * B */}
        <Card className="p-3 sm:p-5">
          <h4 className="text-xs font-mono font-bold text-text-secondary uppercase mb-3">
            Matrix Product (A × B)
          </h4>
          <div className="space-y-2">
            {results.mult.slice(0, dim).map((row, r) => (
              <div key={r} className="flex gap-2">
                {row.slice(0, dim).map((val, c) => (
                  <div
                    key={c}
                    className="w-full min-w-0 bg-surface border border-border rounded-lg p-1.5 sm:p-2 text-center font-mono text-xs font-bold text-emerald-400"
                  >
                    {val.toFixed(2)}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
