import React, { useState, useMemo, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Slider } from '../../components/ui/Slider';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { MathematicalFormula } from '../../components/common/MathematicalFormula';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { Sliders, RotateCcw, Bookmark } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { computePoles, classifyDamping, isStable, type TransferFunctionParams } from '../../lib/simulation/control/transfer-function';
import { generateStepResponse, computeStepMetrics, generateImpulseResponse } from '../../lib/simulation/control/step-response';
import { generateBodePlot, computeBodeMargins } from '../../lib/simulation/control/bode';
import { BlockDiagramBuilder } from './BlockDiagramBuilder';

type ControlTab = 'step' | 'bode' | 'polezero' | 'blockdiagram';

export const ControlLabPage: React.FC = () => {
  const { markExperimentCompleted, addRecentExperiment } = useAppStore();
  const { subId } = useParams<{ subId?: string }>();

  const getInitialTab = (): ControlTab => {
    if (subId === 'bode' || subId === 'bode-plot') return 'bode';
    if (subId === 'polezero' || subId === 'pole-zero') return 'polezero';
    if (subId === 'blockdiagram' || subId === 'block-diagram') return 'blockdiagram';
    return 'step';
  };

  const [activeTab, setActiveTab] = useState<ControlTab>(getInitialTab());

  useEffect(() => {
    if (subId) {
      if (subId === 'bode' || subId === 'bode-plot') setActiveTab('bode');
      else if (subId === 'polezero' || subId === 'pole-zero') setActiveTab('polezero');
      else if (subId === 'blockdiagram' || subId === 'block-diagram') setActiveTab('blockdiagram');
      else if (subId === 'step' || subId === 'step-response' || subId === 'response') setActiveTab('step');
    }
  }, [subId]);

  const [zeta, setZeta] = useState(0.5);
  const [wn, setWn] = useState(5.0);

  const tfParams: TransferFunctionParams = useMemo(() => ({ zeta, wn }), [zeta, wn]);
  const dampingCategory = useMemo(() => classifyDamping(zeta), [zeta]);
  const metrics = useMemo(() => computeStepMetrics(tfParams), [tfParams]);
  const stepData = useMemo(() => generateStepResponse(tfParams, 200, 1.5), [tfParams]);
  const impulseData = useMemo(() => generateImpulseResponse(tfParams, 200, 5), [tfParams]);
  const poles = useMemo(() => computePoles(tfParams), [tfParams]);
  const stable = useMemo(() => isStable(tfParams), [tfParams]);

  // Bode
  const bodeData = useMemo(() => {
    const fnHz = wn / (2 * Math.PI);
    return generateBodePlot(tfParams, Math.max(0.001, fnHz / 100), fnHz * 100, 30);
  }, [tfParams, wn]);
  const bodeMargins = useMemo(() => computeBodeMargins(bodeData), [bodeData]);


  const handleSave = () => {
    markExperimentCompleted('step-response');
    addRecentExperiment({ experimentId: 'step-response', title: 'Control System Analysis', labName: 'Control Systems', route: '/control', summary: `ζ=${zeta.toFixed(2)}, ωn=${wn.toFixed(1)}, Mp=${metrics.percentOvershoot}%` });
  };

  const tabs = [
    { key: 'step' as const, label: 'Step Response' },
    { key: 'bode' as const, label: 'Bode Plot' },
    { key: 'polezero' as const, label: 'Pole-Zero' },
    { key: 'blockdiagram' as const, label: 'Block Diagram' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-accent-purple mb-1">
            <Sliders className="w-3.5 h-3.5" /><span>CONTROL SYSTEMS • MODULE 04</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">Transfer Functions & System Analysis</h1>
          <p className="text-xs sm:text-sm text-text-muted mt-1">Analyze step/impulse response, Bode magnitude/phase, s-plane pole locations, and block diagrams.</p>
        </div>
        <div className="flex items-center gap-1.5 p-1 rounded-lg bg-surface-elevated border border-border w-full sm:w-auto max-w-full overflow-x-auto scrollbar-none shrink-0">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`px-3 py-1.5 rounded-md text-xs font-mono font-medium transition-all shrink-0 ${
                activeTab === tab.key
                  ? 'bg-purple-500 text-white shadow-sm'
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ═══ BLOCK DIAGRAM BUILDER TAB ═══ */}
      {activeTab === 'blockdiagram' && (
        <BlockDiagramBuilder />
      )}

      {/* ── SHARED PARAMETER PANEL + TAB CONTENT ── */}
      {activeTab !== 'blockdiagram' && (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Parameters (shared) */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold font-mono text-text-primary uppercase tracking-wider">System Parameters</h3>
              <div className="flex items-center gap-2">
                <Badge variant="purple">{dampingCategory}</Badge>
                <Button variant="ghost" size="sm" onClick={() => { setZeta(0.5); setWn(5); }}><RotateCcw className="w-3.5 h-3.5" /></Button>
                <Button variant="secondary" size="sm" onClick={handleSave}><Bookmark className="w-3.5 h-3.5 text-accent-purple mr-1" />Save</Button>
              </div>
            </div>
            <div className="space-y-5">
              <Slider label="Damping Ratio (ζ)" value={zeta} min={0.1} max={2.0} step={0.05} onChange={setZeta} formatValue={(z) => z.toFixed(2)} />
              <Slider label="Natural Frequency (ωn)" value={wn} min={1} max={15} step={0.5} unit="rad/s" onChange={setWn} formatValue={(w) => `${w.toFixed(1)} rad/s`} />
            </div>

            {/* Metrics */}
            <div className="mt-6 pt-5 border-t border-border/80 grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-2.5 rounded bg-surface-elevated border border-border">
                <span className="text-text-muted">Overshoot (Mp):</span>
                <div className="text-base font-bold text-accent-purple mt-0.5">{metrics.percentOvershoot}%</div>
              </div>
              <div className="p-2.5 rounded bg-surface-elevated border border-border">
                <span className="text-text-muted">Settling Time (ts):</span>
                <div className="text-base font-bold text-text-primary mt-0.5">{metrics.settlingTime} s</div>
              </div>
              <div className="p-2.5 rounded bg-surface-elevated border border-border">
                <span className="text-text-muted">Rise Time (tr):</span>
                <div className="text-base font-bold text-text-primary mt-0.5">{metrics.riseTime} s</div>
              </div>
              <div className="p-2.5 rounded bg-surface-elevated border border-border">
                <span className="text-text-muted">Stability:</span>
                <div className={`text-base font-bold mt-0.5 ${stable ? 'text-emerald-400' : 'text-red-400'}`}>{stable ? 'STABLE' : 'UNSTABLE'}</div>
              </div>
            </div>
          </Card>

          <Card className="p-5 bg-surface-elevated/40">
            <div className="text-xs font-mono text-accent-purple mb-2 uppercase tracking-wider">Standard Closed-Loop Transfer Function</div>
            <div className="p-3 rounded-lg bg-surface border border-border text-center">
              <MathematicalFormula formula="H(s) = \frac{\omega_n^2}{s^2 + 2\zeta\omega_n s + \omega_n^2}" block />
            </div>
          </Card>
        </div>

        {/* Right: Tab content */}
        <div className="lg:col-span-7 space-y-6">
          {/* ═══ STEP RESPONSE ═══ */}
          {activeTab === 'step' && (
            <>
              <Card className="p-5">
                <div className="flex items-center justify-between mb-3 text-xs font-mono text-text-muted">
                  <span>UNIT STEP RESPONSE: y(t) for u(t) = 1</span>
                  <span className="text-purple-400">SETPOINT = 1.00</span>
                </div>
                <div className="w-full h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={stepData} margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                      <XAxis dataKey="time" stroke="#71717a" fontSize={11} tickLine={false} label={{ value: 'Time t (s)', position: 'insideBottom', offset: -10, fill: '#71717a', fontSize: 11 }} />
                      <YAxis stroke="#71717a" fontSize={11} tickLine={false} domain={[0, Math.max(1.6, 1 + metrics.percentOvershoot / 80)]} label={{ value: 'Output y(t)', angle: -90, position: 'insideLeft', fill: '#71717a', fontSize: 11 }} />
                      <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', fontSize: '12px', fontFamily: 'monospace' }} formatter={(val: number) => [val.toFixed(4), 'Response']} labelFormatter={(t) => `t = ${t} s`} />
                      <ReferenceLine y={1.0} stroke="#10b981" strokeDasharray="3 3" />
                      <Line type="monotone" dataKey="response" stroke="#8b5cf6" strokeWidth={2.5} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              <Card className="p-5">
                <div className="flex items-center justify-between mb-3 text-xs font-mono text-text-muted">
                  <span>UNIT IMPULSE RESPONSE: h(t)</span>
                  <span className="text-purple-400">δ(t) INPUT</span>
                </div>
                <div className="w-full h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={impulseData} margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                      <XAxis dataKey="time" stroke="#71717a" fontSize={11} tickLine={false} label={{ value: 'Time t (s)', position: 'insideBottom', offset: -10, fill: '#71717a', fontSize: 11 }} />
                      <YAxis stroke="#71717a" fontSize={11} tickLine={false} label={{ value: 'h(t)', angle: -90, position: 'insideLeft', fill: '#71717a', fontSize: 11 }} />
                      <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', fontSize: '12px', fontFamily: 'monospace' }} />
                      <ReferenceLine y={0} stroke="#3f3f46" />
                      <Line type="monotone" dataKey="response" stroke="#c084fc" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </>
          )}

          {/* ═══ BODE PLOT ═══ */}
          {activeTab === 'bode' && (
            <>
              <Card className="p-5">
                <div className="flex items-center justify-between mb-3 text-xs font-mono text-text-muted">
                  <span>BODE MAGNITUDE PLOT — |H(jω)| in dB</span>
                  <span className="text-purple-400">PM = {isFinite(bodeMargins.phaseMargin) ? `${bodeMargins.phaseMargin}°` : '∞'}</span>
                </div>
                <div className="w-full h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={bodeData} margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                      <XAxis dataKey="frequency" stroke="#71717a" fontSize={10} tickLine={false} scale="log" domain={['dataMin', 'dataMax']} tickFormatter={(f: number) => f >= 1000 ? `${(f/1000).toFixed(0)}k` : f >= 1 ? `${f.toFixed(0)}` : `${f.toFixed(2)}`} label={{ value: 'Frequency (Hz)', position: 'insideBottom', offset: -10, fill: '#71717a', fontSize: 11 }} />
                      <YAxis stroke="#71717a" fontSize={11} tickLine={false} label={{ value: '|H| (dB)', angle: -90, position: 'insideLeft', fill: '#71717a', fontSize: 11 }} />
                      <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', fontSize: '12px', fontFamily: 'monospace' }} formatter={(val: number) => [`${val.toFixed(2)} dB`, 'Magnitude']} labelFormatter={(f) => `f = ${Number(f).toFixed(3)} Hz`} />
                      <ReferenceLine y={0} stroke="#f59e0b" strokeDasharray="4 4" />
                      <Line type="monotone" dataKey="magnitudeDB" stroke="#8b5cf6" strokeWidth={2.5} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              <Card className="p-5">
                <div className="flex items-center justify-between mb-3 text-xs font-mono text-text-muted">
                  <span>BODE PHASE PLOT — ∠H(jω) in degrees</span>
                  <span className="text-purple-400">PHASE LAG</span>
                </div>
                <div className="w-full h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={bodeData} margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                      <XAxis dataKey="frequency" stroke="#71717a" fontSize={10} tickLine={false} scale="log" domain={['dataMin', 'dataMax']} tickFormatter={(f: number) => f >= 1000 ? `${(f/1000).toFixed(0)}k` : f >= 1 ? `${f.toFixed(0)}` : `${f.toFixed(2)}`} label={{ value: 'Frequency (Hz)', position: 'insideBottom', offset: -10, fill: '#71717a', fontSize: 11 }} />
                      <YAxis stroke="#71717a" fontSize={11} tickLine={false} domain={[-200, 10]} label={{ value: 'Phase (°)', angle: -90, position: 'insideLeft', fill: '#71717a', fontSize: 11 }} />
                      <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', fontSize: '12px', fontFamily: 'monospace' }} formatter={(val: number) => [`${val.toFixed(2)}°`, 'Phase']} labelFormatter={(f) => `f = ${Number(f).toFixed(3)} Hz`} />
                      <ReferenceLine y={-180} stroke="#ef4444" strokeDasharray="4 4" />
                      <ReferenceLine y={-90} stroke="#f59e0b" strokeDasharray="4 4" />
                      <Line type="monotone" dataKey="phaseDeg" stroke="#c084fc" strokeWidth={2.5} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </>
          )}

          {/* ═══ POLE-ZERO ═══ */}
          {activeTab === 'polezero' && (
            <Card className="p-5">
              <div className="flex items-center justify-between mb-3 text-xs font-mono text-text-muted">
                <span>S-PLANE POLE-ZERO MAP</span>
                <Badge variant={stable ? 'success' : 'error'}>{stable ? 'STABLE — All poles in LHP' : 'UNSTABLE'}</Badge>
              </div>

              {/* Custom S-Plane SVG */}
              <div className="w-full h-80 bg-surface-elevated rounded-lg border border-border overflow-hidden relative">
                <svg viewBox="-10 -8 20 16" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
                  {/* Grid */}
                  {Array.from({ length: 21 }, (_, i) => i - 10).map((x) => (
                    <line key={`vg${x}`} x1={x} y1={-8} x2={x} y2={8} stroke="#27272a" strokeWidth={0.05} />
                  ))}
                  {Array.from({ length: 17 }, (_, i) => i - 8).map((y) => (
                    <line key={`hg${y}`} x1={-10} y1={y} x2={10} y2={y} stroke="#27272a" strokeWidth={0.05} />
                  ))}

                  {/* Axes */}
                  <line x1={-10} y1={0} x2={10} y2={0} stroke="#52525b" strokeWidth={0.08} />
                  <line x1={0} y1={-8} x2={0} y2={8} stroke="#52525b" strokeWidth={0.08} />

                  {/* LHP shading */}
                  <rect x={-10} y={-8} width={10} height={16} fill="rgba(16,185,129,0.04)" />

                  {/* Axis labels */}
                  <text x={9} y={-0.3} fill="#71717a" fontSize={0.5} fontFamily="monospace">σ (Re)</text>
                  <text x={0.3} y={-7.2} fill="#71717a" fontSize={0.5} fontFamily="monospace">jω (Im)</text>

                  {/* Stability boundary label */}
                  <text x={0.2} y={7.5} fill="#10b981" fontSize={0.35} fontFamily="monospace" opacity={0.5}>LHP (Stable)</text>
                  <text x={0.2} y={-7.5} fill="#10b981" fontSize={0.35} fontFamily="monospace" opacity={0.5}>LHP (Stable)</text>

                  {/* Unit circle (optional reference) */}
                  <circle cx={0} cy={0} r={1} fill="none" stroke="#3f3f46" strokeWidth={0.04} strokeDasharray="0.2 0.1" />

                  {/* Poles */}
                  {poles.map((pole, i) => (
                    <g key={i}>
                      {/* Cross marker for pole */}
                      <line x1={pole.real - 0.3} y1={-pole.imag - 0.3} x2={pole.real + 0.3} y2={-pole.imag + 0.3} stroke="#ef4444" strokeWidth={0.12} />
                      <line x1={pole.real - 0.3} y1={-pole.imag + 0.3} x2={pole.real + 0.3} y2={-pole.imag - 0.3} stroke="#ef4444" strokeWidth={0.12} />
                      {/* Label */}
                      <text x={pole.real + 0.4} y={-pole.imag + 0.15} fill="#ef4444" fontSize={0.4} fontFamily="monospace">
                        {pole.imag !== 0 ? `${pole.real.toFixed(1)}${pole.imag >= 0 ? '+' : ''}${pole.imag.toFixed(1)}j` : `${pole.real.toFixed(2)}`}
                      </text>
                    </g>
                  ))}
                </svg>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 text-xs font-mono">
                {poles.map((pole, i) => (
                  <div key={i} className="p-2.5 rounded bg-surface border border-border">
                    <span className="text-text-muted">Pole {i + 1}:</span>
                    <div className="text-sm font-bold text-text-primary mt-0.5">
                      {pole.imag === 0 ? `s = ${pole.real.toFixed(3)}` : `s = ${pole.real.toFixed(3)} ${pole.imag >= 0 ? '+' : '−'} j${Math.abs(pole.imag).toFixed(3)}`}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 p-3 rounded-lg bg-surface border border-border text-center">
                <MathematicalFormula formula={`s_{1,2} = -\\zeta\\omega_n \\pm \\omega_n\\sqrt{\\zeta^2 - 1} = ${poles[0].real.toFixed(2)} ${poles[0].imag !== 0 ? `\\pm j${Math.abs(poles[0].imag).toFixed(2)}` : ''}`} block />
              </div>
            </Card>
          )}
        </div>
      </div>
      )}
    </div>
  );
};
