import React, { useState, useMemo } from 'react';
import { Card } from '../../components/ui/Card';
import { Slider } from '../../components/ui/Slider';
import { Badge } from '../../components/ui/Badge';
import { MathematicalFormula } from '../../components/common/MathematicalFormula';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Activity } from 'lucide-react';

export const TransformExplorer: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'laplace' | 'fourier'>('laplace');

  // Laplace state
  const [laplacePair, setLaplacePair] = useState<'step' | 'exp' | 'sine' | 'cosine' | 'damped_sine'>('exp');
  const [decayA, setDecayA] = useState(1.5);
  const [omega, setOmega] = useState(4.0);

  // Fourier state
  const [fourierPair, setFourierPair] = useState<'rect' | 'tri' | 'exp' | 'gaussian'>('rect');
  const [pulseWidth, setPulseWidth] = useState(1.0); // T
  const [fourierA, setFourierA] = useState(2.0);

  // Generate Laplace time-domain plot
  const laplaceTimeData = useMemo(() => {
    const points: { t: number; y: number }[] = [];
    const tMax = 4.0;
    const numPoints = 150;
    const dt = tMax / numPoints;

    for (let i = 0; i <= numPoints; i++) {
      const t = i * dt;
      let y = 0;
      switch (laplacePair) {
        case 'step':
          y = 1.0;
          break;
        case 'exp':
          y = Math.exp(-decayA * t);
          break;
        case 'sine':
          y = Math.sin(omega * t);
          break;
        case 'cosine':
          y = Math.cos(omega * t);
          break;
        case 'damped_sine':
          y = Math.exp(-decayA * t) * Math.sin(omega * t);
          break;
      }
      points.push({ t: parseFloat(t.toFixed(2)), y: parseFloat(y.toFixed(3)) });
    }
    return points;
  }, [laplacePair, decayA, omega]);

  // Laplace formulas
  const laplaceFormula = useMemo(() => {
    switch (laplacePair) {
      case 'step':
        return { time: 'f(t) = u(t)', s: 'F(s) = \\frac{1}{s}', roc: '\\text{Re}(s) > 0' };
      case 'exp':
        return {
          time: `f(t) = e^{-${decayA.toFixed(1)} t} u(t)`,
          s: `F(s) = \\frac{1}{s + ${decayA.toFixed(1)}}`,
          roc: `\\text{Re}(s) > -${decayA.toFixed(1)}`,
        };
      case 'sine':
        return {
          time: `f(t) = \\sin(${omega.toFixed(1)} t) u(t)`,
          s: `F(s) = \\frac{${omega.toFixed(1)}}{s^2 + ${(omega * omega).toFixed(1)}}`,
          roc: '\\text{Re}(s) > 0',
        };
      case 'cosine':
        return {
          time: `f(t) = \\cos(${omega.toFixed(1)} t) u(t)`,
          s: `F(s) = \\frac{s}{s^2 + ${(omega * omega).toFixed(1)}}`,
          roc: '\\text{Re}(s) > 0',
        };
      case 'damped_sine':
        return {
          time: `f(t) = e^{-${decayA.toFixed(1)} t}\\sin(${omega.toFixed(1)} t) u(t)`,
          s: `F(s) = \\frac{${omega.toFixed(1)}}{(s + ${decayA.toFixed(1)})^2 + ${(omega * omega).toFixed(1)}}`,
          roc: `\\text{Re}(s) > -${decayA.toFixed(1)}`,
        };
    }
  }, [laplacePair, decayA, omega]);

  // Fourier time and frequency data
  const fourierData = useMemo(() => {
    const timePoints: { t: number; xt: number }[] = [];
    const freqPoints: { f: number; xf: number }[] = [];

    // Time domain: -3 to 3
    for (let t = -3; t <= 3; t += 0.04) {
      let xt = 0;
      if (fourierPair === 'rect') {
        xt = Math.abs(t) <= pulseWidth / 2 ? 1.0 : 0.0;
      } else if (fourierPair === 'tri') {
        xt = Math.abs(t) <= pulseWidth ? 1.0 - Math.abs(t) / pulseWidth : 0.0;
      } else if (fourierPair === 'exp') {
        xt = t >= 0 ? Math.exp(-fourierA * t) : 0.0;
      } else if (fourierPair === 'gaussian') {
        xt = Math.exp(-Math.PI * (t / pulseWidth) * (t / pulseWidth));
      }
      timePoints.push({ t: parseFloat(t.toFixed(2)), xt: parseFloat(xt.toFixed(3)) });
    }

    // Frequency domain magnitude: -5 to 5 Hz
    for (let f = -5; f <= 5; f += 0.08) {
      let xf = 0;
      if (fourierPair === 'rect') {
        const arg = Math.PI * f * pulseWidth;
        xf = arg === 0 ? pulseWidth : Math.abs(pulseWidth * (Math.sin(arg) / arg));
      } else if (fourierPair === 'tri') {
        const arg = Math.PI * f * (pulseWidth / 2);
        const sinc = arg === 0 ? 1 : Math.sin(arg) / arg;
        xf = pulseWidth * sinc * sinc;
      } else if (fourierPair === 'exp') {
        const omegaF = 2 * Math.PI * f;
        xf = 1 / Math.sqrt(fourierA * fourierA + omegaF * omegaF);
      } else if (fourierPair === 'gaussian') {
        xf = pulseWidth * Math.exp(-Math.PI * (f * pulseWidth) * (f * pulseWidth));
      }
      freqPoints.push({ f: parseFloat(f.toFixed(2)), xf: parseFloat(xf.toFixed(3)) });
    }

    return { timePoints, freqPoints };
  }, [fourierPair, pulseWidth, fourierA]);

  return (
    <div className="space-y-6">
      {/* Sub-tab selection */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-lg bg-surface-elevated border border-border">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveSubTab('laplace')}
            className={`px-3 py-1.5 rounded-md text-xs font-mono transition-all whitespace-nowrap ${
              activeSubTab === 'laplace'
                ? 'bg-accent-blue text-white font-semibold'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Laplace Transform (s-Domain)
          </button>
          <button
            onClick={() => setActiveSubTab('fourier')}
            className={`px-3 py-1.5 rounded-md text-xs font-mono transition-all whitespace-nowrap ${
              activeSubTab === 'fourier'
                ? 'bg-accent-cyan text-white font-semibold'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Fourier Transform (ω-Domain)
          </button>
        </div>
        <Badge variant="info">CONTINUOUS TRANSFORMS</Badge>
      </div>

      {/* ── LAPLACE SECTION ── */}
      {activeSubTab === 'laplace' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 space-y-6">
            <Card className="p-4 sm:p-5">
              <h3 className="text-sm font-semibold font-mono text-text-primary uppercase tracking-wider mb-4">
                Select Transform Pair
              </h3>

              <div className="grid grid-cols-2 gap-2 mb-5">
                {[
                  { key: 'step' as const, label: 'Unit Step u(t)' },
                  { key: 'exp' as const, label: 'Exponential e^(-at)' },
                  { key: 'sine' as const, label: 'Sine sin(ωt)' },
                  { key: 'cosine' as const, label: 'Cosine cos(ωt)' },
                  { key: 'damped_sine' as const, label: 'Damped Sine' },
                ].map(pair => (
                  <button
                    key={pair.key}
                    onClick={() => setLaplacePair(pair.key)}
                    className={`py-2 px-2 text-center rounded-lg text-xs font-mono transition-all border ${
                      laplacePair === pair.key
                        ? 'bg-accent-blue/20 text-accent-blue border-accent-blue/50 font-bold'
                        : 'bg-surface-elevated text-text-secondary border-border'
                    }`}
                  >
                    {pair.label}
                  </button>
                ))}
              </div>

              {(laplacePair === 'exp' || laplacePair === 'damped_sine') && (
                <div className="mb-4">
                  <Slider
                    label="Decay Rate (a)"
                    value={decayA}
                    min={0.2}
                    max={4.0}
                    step={0.1}
                    onChange={setDecayA}
                    formatValue={v => v.toFixed(1)}
                  />
                </div>
              )}

              {(laplacePair === 'sine' || laplacePair === 'cosine' || laplacePair === 'damped_sine') && (
                <div className="mb-4">
                  <Slider
                    label="Angular Frequency (ω)"
                    value={omega}
                    min={1.0}
                    max={10.0}
                    step={0.5}
                    unit="rad/s"
                    onChange={setOmega}
                    formatValue={v => `${v.toFixed(1)} rad/s`}
                  />
                </div>
              )}

              <div className="p-3 rounded-lg bg-surface border border-border text-center space-y-2 mt-4">
                <div className="text-xs font-mono text-text-muted">Region of Convergence (ROC):</div>
                <MathematicalFormula formula={laplaceFormula.roc} />
              </div>
            </Card>
          </div>

          <div className="lg:col-span-7 space-y-6">
            <Card className="p-5">
              <div className="flex items-center justify-between mb-3 text-xs font-mono text-text-muted">
                <span>TIME-DOMAIN WAVEFORM f(t)</span>
                <span className="text-accent-blue">t ≥ 0</span>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={laplaceTimeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                    <XAxis dataKey="t" stroke="#71717a" fontSize={11} tickFormatter={v => `${v}s`} />
                    <YAxis stroke="#71717a" fontSize={11} domain={['auto', 'auto']} />
                    <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', fontSize: '11px', fontFamily: 'monospace' }} />
                    <Line type="monotone" dataKey="y" stroke="#3b82f6" strokeWidth={2.5} dot={false} name="f(t)" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card className="p-4 sm:p-5 bg-surface-elevated/40">
              <div className="flex items-center gap-2 mb-3 text-xs font-mono text-accent-blue">
                <Activity className="w-4 h-4" />
                <span>TRANSFORM DUALITY (TIME ↔ LAPLACE)</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-center">
                <div className="p-3 rounded-lg bg-surface border border-border overflow-x-auto scrollbar-none">
                  <span className="text-xs font-mono text-text-muted">Time Domain f(t)</span>
                  <div className="mt-1">
                    <MathematicalFormula formula={laplaceFormula.time} />
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-surface border border-border overflow-x-auto scrollbar-none">
                  <span className="text-xs font-mono text-text-muted">Laplace Domain F(s)</span>
                  <div className="mt-1">
                    <MathematicalFormula formula={laplaceFormula.s} />
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* ── FOURIER SECTION ── */}
      {activeSubTab === 'fourier' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 space-y-6">
            <Card className="p-5">
              <h3 className="text-sm font-semibold font-mono text-text-primary uppercase tracking-wider mb-4">
                Select Fourier Transform Signal
              </h3>

              <div className="grid grid-cols-2 gap-2 mb-5">
                {[
                  { key: 'rect' as const, label: 'Rect Pulse ↔ Sinc' },
                  { key: 'tri' as const, label: 'Tri Pulse ↔ Sinc²' },
                  { key: 'exp' as const, label: 'Exp Decay ↔ 1/(a+jω)' },
                  { key: 'gaussian' as const, label: 'Gaussian ↔ Gaussian' },
                ].map(pair => (
                  <button
                    key={pair.key}
                    onClick={() => setFourierPair(pair.key)}
                    className={`py-2 px-2 text-center rounded-lg text-xs font-mono transition-all border ${
                      fourierPair === pair.key
                        ? 'bg-accent-cyan/20 text-accent-cyan border-accent-cyan/50 font-bold'
                        : 'bg-surface-elevated text-text-secondary border-border'
                    }`}
                  >
                    {pair.label}
                  </button>
                ))}
              </div>

              {(fourierPair === 'rect' || fourierPair === 'tri' || fourierPair === 'gaussian') && (
                <div className="mb-4">
                  <Slider
                    label="Pulse Width / Spread (T)"
                    value={pulseWidth}
                    min={0.5}
                    max={2.5}
                    step={0.1}
                    unit="s"
                    onChange={setPulseWidth}
                    formatValue={v => `${v.toFixed(1)} s`}
                  />
                </div>
              )}

              {fourierPair === 'exp' && (
                <div className="mb-4">
                  <Slider
                    label="Decay Rate (a)"
                    value={fourierA}
                    min={0.5}
                    max={5.0}
                    step={0.2}
                    onChange={setFourierA}
                    formatValue={v => v.toFixed(1)}
                  />
                </div>
              )}

              <div className="p-3 rounded-lg bg-surface border border-border text-center space-y-1 mt-4">
                <div className="text-xs font-mono text-text-muted">Fourier Duality:</div>
                <div className="text-xs font-mono text-cyan-400">
                  Narrowing in time spreads out in frequency (Scaling Theorem)
                </div>
              </div>
            </Card>
          </div>

          <div className="lg:col-span-7 space-y-6">
            {/* Split view: Time vs Frequency */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-4">
                <span className="text-xs font-mono text-text-muted mb-2 block">TIME DOMAIN x(t)</span>
                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={fourierData.timePoints} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                      <XAxis dataKey="t" stroke="#71717a" fontSize={10} />
                      <YAxis stroke="#71717a" fontSize={10} domain={['auto', 'auto']} />
                      <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', fontSize: '10px' }} />
                      <Line type="monotone" dataKey="xt" stroke="#06b6d4" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              <Card className="p-4">
                <span className="text-xs font-mono text-text-muted mb-2 block">SPECTRUM |X(f)|</span>
                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={fourierData.freqPoints} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                      <XAxis dataKey="f" stroke="#71717a" fontSize={10} />
                      <YAxis stroke="#71717a" fontSize={10} domain={['auto', 'auto']} />
                      <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', fontSize: '10px' }} />
                      <Line type="monotone" dataKey="xf" stroke="#10b981" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
