import React, { useState, useMemo, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Slider } from '../../components/ui/Slider';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { MathematicalFormula } from '../../components/common/MathematicalFormula';
import {
  formatCurrent, formatPower, formatResistance, formatCapacitance, formatInductance,
  formatFrequency, formatTime,
} from '../../lib/utils';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceDot, ReferenceLine,
} from 'recharts';
import { Zap, RotateCcw, HelpCircle, Bookmark } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

// Simulation engines
import { computeFromVR, generateVICurve } from '../../lib/simulation/circuits/ohms-law';
import { calculateRCMetrics, generateChargingCurve, generateDischargingCurve, type RCParameters } from '../../lib/simulation/circuits/rc';
import { calculateRLCMetrics, generateImpedanceCurve, type RLCParameters } from '../../lib/simulation/circuits/rlc';
import { calculateRLMetrics, generateRLCurrentGrowth, generateRLCurrentDecay, type RLParameters } from '../../lib/simulation/circuits/rl';
import { calculateRectifierMetrics, generateRectifierWaveforms, DIODE_PRESETS, type RectifierParameters, type DiodeMaterial } from '../../lib/simulation/circuits/diode';

type CircuitTab = 'ohms' | 'rc' | 'rl' | 'rlc' | 'diode';

export const CircuitLabPage: React.FC = () => {
  const { markExperimentCompleted, addRecentExperiment } = useAppStore();
  const { subId } = useParams<{ subId?: string }>();

  const getInitialTab = (): CircuitTab => {
    if (subId === 'rc' || subId === 'rc-transient') return 'rc';
    if (subId === 'rl' || subId === 'rl-transient') return 'rl';
    if (subId === 'rlc' || subId === 'rlc-resonance') return 'rlc';
    if (subId === 'diode' || subId === 'rectifier') return 'diode';
    return 'ohms';
  };

  const [activeTab, setActiveTab] = useState<CircuitTab>(getInitialTab());

  useEffect(() => {
    if (subId) {
      if (subId === 'rc' || subId === 'rc-transient') setActiveTab('rc');
      else if (subId === 'rl' || subId === 'rl-transient') setActiveTab('rl');
      else if (subId === 'rlc' || subId === 'rlc-resonance') setActiveTab('rlc');
      else if (subId === 'diode' || subId === 'rectifier') setActiveTab('diode');
      else if (subId === 'ohms' || subId === 'ohms-law') setActiveTab('ohms');
    }
  }, [subId]);

  // ── Ohm's Law State ──
  const [voltage, setVoltage] = useState(12.0);
  const [resistance, setResistance] = useState(1000);

  const ohmsResult = useMemo(() => computeFromVR(voltage, resistance), [voltage, resistance]);
  const viCurve = useMemo(() => generateVICurve(resistance, 30, 60), [resistance]);

  // ── RC State ──
  const [rcR, setRcR] = useState(10000);       // 10 kΩ
  const [rcC, setRcC] = useState(0.0000001);    // 100 nF
  const [rcVin, setRcVin] = useState(5.0);
  const [rcMode, setRcMode] = useState<'charge' | 'discharge'>('charge');

  const rcParams: RCParameters = useMemo(() => ({
    resistance: rcR, capacitance: rcC, voltage: rcVin,
  }), [rcR, rcC, rcVin]);

  const rcMetrics = useMemo(() => calculateRCMetrics(rcParams), [rcParams]);
  const rcCurve = useMemo(() => {
    return rcMode === 'charge'
      ? generateChargingCurve(rcParams, 200, 5)
      : generateDischargingCurve({ ...rcParams, initialVoltage: rcVin }, 200, 5);
  }, [rcParams, rcMode, rcVin]);

  // ── RL State ──
  const [rlR, setRlR] = useState(1000);        // 1 kΩ
  const [rlL, setRlL] = useState(0.1);         // 100 mH
  const [rlVin, setRlVin] = useState(10.0);
  const [rlMode, setRlMode] = useState<'growth' | 'decay'>('growth');

  const rlParams: RLParameters = useMemo(() => ({
    resistance: rlR, inductance: rlL, voltage: rlVin,
  }), [rlR, rlL, rlVin]);

  const rlMetrics = useMemo(() => calculateRLMetrics(rlParams), [rlParams]);
  const rlCurve = useMemo(() => {
    return rlMode === 'growth'
      ? generateRLCurrentGrowth(rlParams, 200, 5)
      : generateRLCurrentDecay(rlParams, 200, 5);
  }, [rlParams, rlMode]);

  // ── RLC State ──
  const [rlcR, setRlcR] = useState(100);        // 100 Ω
  const [rlcL, setRlcL] = useState(0.01);       // 10 mH
  const [rlcC, setRlcC] = useState(0.0000001);  // 100 nF

  const rlcParams: RLCParameters = useMemo(() => ({
    resistance: rlcR, inductance: rlcL, capacitance: rlcC,
  }), [rlcR, rlcL, rlcC]);

  const rlcMetrics = useMemo(() => calculateRLCMetrics(rlcParams), [rlcParams]);
  const rlcImpedance = useMemo(() => {
    const f0 = rlcMetrics.resonantFrequency;
    const fMin = Math.max(1, f0 / 100);
    const fMax = f0 * 100;
    return generateImpedanceCurve(rlcParams, fMin, fMax, 30);
  }, [rlcParams, rlcMetrics]);

  // ── Diode & Rectifier State ──
  const [rectType, setRectType] = useState<'half_wave' | 'full_wave_bridge'>('full_wave_bridge');
  const [rectMaterial, setRectMaterial] = useState<DiodeMaterial>('silicon');
  const [rectVm, setRectVm] = useState(12.0);
  const [rectFreq, setRectFreq] = useState(60);
  const [rectRLoad, setRectRLoad] = useState(1000);
  const [rectCap, setRectCap] = useState(0.0001); // 100 µF

  const rectParams: RectifierParameters = useMemo(() => ({
    type: rectType, material: rectMaterial, inputPeakVoltage: rectVm,
    frequency: rectFreq, loadResistance: rectRLoad, filterCapacitance: rectCap,
  }), [rectType, rectMaterial, rectVm, rectFreq, rectRLoad, rectCap]);

  const rectMetrics = useMemo(() => calculateRectifierMetrics(rectParams), [rectParams]);
  const rectWaveforms = useMemo(() => generateRectifierWaveforms(rectParams, 3, 80), [rectParams]);

  // ── Handlers ──
  const handleSaveOhms = () => {
    markExperimentCompleted('ohms-law');
    addRecentExperiment({
      experimentId: 'ohms-law', title: "Ohm's Law & Power Dissipation",
      labName: 'Circuit Lab', route: '/circuits/ohms-law',
      summary: `V = ${voltage.toFixed(1)} V, R = ${formatResistance(resistance)}, I = ${formatCurrent(ohmsResult.current)}`,
    });
  };

  const handleSaveRC = () => {
    markExperimentCompleted('rc-transient');
    addRecentExperiment({
      experimentId: 'rc-transient', title: 'RC Transient Response',
      labName: 'Circuit Lab', route: '/circuits/rc',
      summary: `R = ${formatResistance(rcR)}, C = ${formatCapacitance(rcC)}, τ = ${formatTime(rcMetrics.tau)}`,
    });
  };

  const handleSaveRL = () => {
    markExperimentCompleted('rl-transient');
    addRecentExperiment({
      experimentId: 'rl-transient', title: 'RL Transient Response',
      labName: 'Circuit Lab', route: '/circuits/rl',
      summary: `R = ${formatResistance(rlR)}, L = ${formatInductance(rlL)}, τ = ${formatTime(rlMetrics.tau)}`,
    });
  };

  const handleSaveRLC = () => {
    markExperimentCompleted('rlc-resonance');
    addRecentExperiment({
      experimentId: 'rlc-resonance', title: 'RLC Series Resonance',
      labName: 'Circuit Lab', route: '/circuits/rlc',
      summary: `f₀ = ${formatFrequency(rlcMetrics.resonantFrequency)}, Q = ${rlcMetrics.qualityFactor.toFixed(2)}`,
    });
  };

  const handleSaveRectifier = () => {
    markExperimentCompleted('rectifier');
    addRecentExperiment({
      experimentId: 'rectifier', title: 'Diode Rectification & Filter',
      labName: 'Circuit Lab', route: '/circuits/diode',
      summary: `${rectType === 'half_wave' ? 'Half-Wave' : 'Full-Wave Bridge'}, Vdc = ${rectMetrics.dcAverageVoltage}V, Ripple = ${rectMetrics.rippleFactor}`,
    });
  };

  const tabs = [
    { key: 'ohms' as const, label: "Ohm's Law" },
    { key: 'rc' as const, label: 'RC Transient' },
    { key: 'rl' as const, label: 'RL Transient' },
    { key: 'rlc' as const, label: 'RLC Resonance' },
    { key: 'diode' as const, label: 'Diode & Rectifier' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-accent-blue mb-1">
            <Zap className="w-3.5 h-3.5" />
            <span>CIRCUIT LABORATORY • MODULE 01</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">
            Electric Circuits & Passive Components
          </h1>
          <p className="text-xs sm:text-sm text-text-muted mt-1">
            Simulate DC voltage distribution, current flows, transient time constants, and resonance phenomena.
          </p>
        </div>

        <div className="flex items-center gap-1.5 p-1 rounded-lg bg-surface-elevated border border-border w-full sm:w-auto max-w-full overflow-x-auto scrollbar-none shrink-0">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`px-3 py-1.5 rounded-md text-xs font-mono font-medium transition-all shrink-0 ${
                activeTab === tab.key
                  ? 'bg-accent-blue text-white shadow-sm'
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ═══════════ OHM'S LAW ═══════════ */}
      {activeTab === 'ohms' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 space-y-6">
            <Card className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-accent-blue animate-pulse" />
                  <h3 className="text-sm font-semibold font-mono text-text-primary uppercase tracking-wider">Source Parameters</h3>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => { setVoltage(12); setResistance(1000); }} title="Reset">
                    <RotateCcw className="w-3.5 h-3.5" />
                  </Button>
                  <Button variant="secondary" size="sm" onClick={handleSaveOhms} title="Save">
                    <Bookmark className="w-3.5 h-3.5 text-accent-blue mr-1" />Save
                  </Button>
                </div>
              </div>

              <div className="space-y-5">
                <Slider label="DC Supply Voltage (V)" value={voltage} min={0.1} max={30} step={0.1} unit="V" onChange={setVoltage} formatValue={(v) => `${v.toFixed(1)} V`} />
                <Slider label="Load Resistance (R)" value={resistance} min={10} max={5000} step={10} unit="Ω" onChange={setResistance} formatValue={(r) => formatResistance(r)} />
              </div>

              <div className="mt-6 pt-5 border-t border-border/80">
                <div className="text-[11px] font-mono text-text-muted mb-2 uppercase tracking-wider">Digital Multimeter Readouts</div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-surface-elevated border border-border">
                    <div className="text-[11px] font-mono text-text-muted">Calculated Current (I)</div>
                    <div className="text-xl font-bold font-mono text-accent-cyan mt-0.5">{formatCurrent(ohmsResult.current)}</div>
                    <div className="text-[10px] font-mono text-text-muted mt-0.5">{(ohmsResult.current * 1000).toFixed(2)} mA</div>
                  </div>
                  <div className="p-3 rounded-lg bg-surface-elevated border border-border">
                    <div className="text-[11px] font-mono text-text-muted">Power Dissipation (P)</div>
                    <div className="text-xl font-bold font-mono text-amber-400 mt-0.5">{formatPower(ohmsResult.power)}</div>
                    <div className="text-[10px] font-mono text-text-muted mt-0.5">Joulean heating</div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Schematic */}
            <Card className="p-5">
              <div className="flex items-center justify-between mb-3 text-xs font-mono text-text-muted">
                <span>CIRCUIT SCHEMATIC</span>
                <span className="text-emerald-400 font-semibold">CLOSED LOOP</span>
              </div>
              <div className="relative w-full h-48 bg-surface-elevated rounded-lg border border-border flex items-center justify-center overflow-hidden">
                <svg viewBox="0 0 320 160" className="w-full h-full max-w-[280px]">
                  <rect x="40" y="30" width="240" height="100" fill="none" stroke="#3f3f46" strokeWidth="2.5" rx="4" />
                  <rect x="40" y="30" width="240" height="100" fill="none" stroke="#06b6d4" strokeWidth="2" strokeDasharray="6 14" className="animate-[dash_1s_linear_infinite]" rx="4" />
                  <g transform="translate(40, 80)">
                    <circle cx="0" cy="0" r="16" fill="#18181b" stroke="#3b82f6" strokeWidth="2" />
                    <line x1="-8" y1="-5" x2="8" y2="-5" stroke="#3b82f6" strokeWidth="2" />
                    <line x1="-5" y1="5" x2="5" y2="5" stroke="#3b82f6" strokeWidth="2" />
                    <text x="-25" y="4" fill="#a1a1aa" fontSize="10" fontFamily="monospace" textAnchor="end">{voltage.toFixed(1)}V</text>
                  </g>
                  <g transform="translate(280, 80)">
                    <rect x="-10" y="-20" width="20" height="40" fill="#18181b" stroke="#f59e0b" strokeWidth="2" rx="2" />
                    <line x1="-5" y1="-10" x2="5" y2="-10" stroke="#f59e0b" strokeWidth="1.5" />
                    <line x1="-5" y1="0" x2="5" y2="0" stroke="#f59e0b" strokeWidth="1.5" />
                    <line x1="-5" y1="10" x2="5" y2="10" stroke="#f59e0b" strokeWidth="1.5" />
                    <text x="18" y="4" fill="#a1a1aa" fontSize="10" fontFamily="monospace">{formatResistance(resistance)}</text>
                  </g>
                  <g transform="translate(160, 30)">
                    <polygon points="-5,-4 5,0 -5,4" fill="#06b6d4" />
                    <text x="0" y="-8" fill="#06b6d4" fontSize="10" fontFamily="monospace" textAnchor="middle">I = {formatCurrent(ohmsResult.current)} →</text>
                  </g>
                </svg>
              </div>
            </Card>
          </div>

          <div className="lg:col-span-7 space-y-6">
            <Card className="p-5">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="text-sm font-semibold font-mono text-text-primary">V-I Characteristic Curve (Linear Ohm's Law)</h3>
                  <p className="text-xs text-text-muted">Operating Point: ({voltage.toFixed(1)} V, {(ohmsResult.current * 1000).toFixed(2)} mA) • Slope = 1/R</p>
                </div>
                <Badge variant="info">G = {(ohmsResult.conductance * 1000).toFixed(2)} mS</Badge>
              </div>
              <div className="w-full h-64 mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={viCurve} margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                    <XAxis dataKey="voltage" stroke="#71717a" fontSize={11} tickLine={false} label={{ value: 'Voltage V (Volts)', position: 'insideBottom', offset: -10, fill: '#71717a', fontSize: 11 }} />
                    <YAxis stroke="#71717a" fontSize={11} tickLine={false} label={{ value: 'Current I (mA)', angle: -90, position: 'insideLeft', fill: '#71717a', fontSize: 11 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', fontSize: '12px', fontFamily: 'monospace' }} formatter={(val: number) => [`${val} mA`, 'Current']} labelFormatter={(label) => `Voltage: ${label} V`} />
                    <Line type="monotone" dataKey="current_mA" stroke="#3b82f6" strokeWidth={2} dot={false} />
                    <ReferenceDot x={voltage} y={ohmsResult.current * 1000} r={6} fill="#06b6d4" stroke="#ffffff" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card className="p-5 border-border bg-surface-elevated/40">
              <div className="flex items-center gap-2 mb-3 text-xs font-mono text-emerald-400">
                <HelpCircle className="w-4 h-4" /><span>EDUCATIONAL ANALYSIS & MATHEMATICAL MODEL</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-3 rounded-lg bg-surface border border-border">
                  <div className="font-semibold text-text-primary mb-1">What am I changing?</div>
                  <p className="text-text-muted leading-relaxed">Adjusting DC supply voltage <strong className="text-text-primary">V</strong> or load resistor <strong className="text-text-primary">R</strong>.</p>
                </div>
                <div className="p-3 rounded-lg bg-surface border border-border">
                  <div className="font-semibold text-text-primary mb-1">What is happening?</div>
                  <p className="text-text-muted leading-relaxed">Higher voltage accelerates charge drift. Higher resistance impedes charge collisions, scaling current inversely.</p>
                </div>
                <div className="p-3 rounded-lg bg-surface border border-border">
                  <div className="font-semibold text-text-primary mb-1">Why is it happening?</div>
                  <p className="text-text-muted leading-relaxed">Direct result of Georg Ohm's empirical law and Joulean thermodynamic dissipation.</p>
                </div>
              </div>
              <div className="mt-4 p-3 rounded-lg bg-surface border border-border text-center">
                <MathematicalFormula formula="I = \frac{V}{R} \quad \implies \quad P = V \cdot I = \frac{V^2}{R} = I^2 R" block />
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* ═══════════ RC TRANSIENT ═══════════ */}
      {activeTab === 'rc' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 space-y-6">
            <Card className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-accent-cyan animate-pulse" />
                  <h3 className="text-sm font-semibold font-mono text-text-primary uppercase tracking-wider">RC Parameters</h3>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => { setRcR(10000); setRcC(0.0000001); setRcVin(5); }} title="Reset">
                    <RotateCcw className="w-3.5 h-3.5" />
                  </Button>
                  <Button variant="secondary" size="sm" onClick={handleSaveRC}>
                    <Bookmark className="w-3.5 h-3.5 text-accent-cyan mr-1" />Save
                  </Button>
                </div>
              </div>

              <div className="space-y-5">
                <Slider label="Resistance (R)" value={rcR} min={100} max={100000} step={100} unit="Ω" onChange={setRcR} formatValue={(r) => formatResistance(r)} />
                <Slider label="Capacitance (C)" value={rcC * 1e9} min={1} max={10000} step={1} unit="nF" onChange={(v) => setRcC(v * 1e-9)} formatValue={(c) => `${c.toFixed(0)} nF`} />
                <Slider label="Supply Voltage (Vin)" value={rcVin} min={1} max={24} step={0.5} unit="V" onChange={setRcVin} formatValue={(v) => `${v.toFixed(1)} V`} />
              </div>

              {/* Mode Selector */}
              <div className="mt-4 flex gap-2">
                <button onClick={() => setRcMode('charge')} className={`flex-1 py-2 rounded-lg text-xs font-mono font-semibold transition-all ${rcMode === 'charge' ? 'bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/50' : 'bg-surface-elevated text-text-secondary border border-border'}`}>
                  Charging
                </button>
                <button onClick={() => setRcMode('discharge')} className={`flex-1 py-2 rounded-lg text-xs font-mono font-semibold transition-all ${rcMode === 'discharge' ? 'bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/50' : 'bg-surface-elevated text-text-secondary border border-border'}`}>
                  Discharging
                </button>
              </div>

              {/* Metrics Readouts */}
              <div className="mt-6 pt-5 border-t border-border/80">
                <div className="text-[11px] font-mono text-text-muted mb-2 uppercase tracking-wider">Computed Metrics</div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-surface-elevated border border-border">
                    <div className="text-[11px] font-mono text-text-muted">Time Constant (τ)</div>
                    <div className="text-lg font-bold font-mono text-accent-cyan mt-0.5">{formatTime(rcMetrics.tau)}</div>
                  </div>
                  <div className="p-3 rounded-lg bg-surface-elevated border border-border">
                    <div className="text-[11px] font-mono text-text-muted">Cutoff Frequency (fc)</div>
                    <div className="text-lg font-bold font-mono text-accent-blue mt-0.5">{formatFrequency(rcMetrics.cutoffFrequency)}</div>
                  </div>
                  <div className="p-3 rounded-lg bg-surface-elevated border border-border">
                    <div className="text-[11px] font-mono text-text-muted">95% Settled (3τ)</div>
                    <div className="text-lg font-bold font-mono text-text-primary mt-0.5">{formatTime(rcMetrics.fivePercent)}</div>
                  </div>
                  <div className="p-3 rounded-lg bg-surface-elevated border border-border">
                    <div className="text-[11px] font-mono text-text-muted">99% Settled (5τ)</div>
                    <div className="text-lg font-bold font-mono text-text-primary mt-0.5">{formatTime(rcMetrics.onePercent)}</div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <div className="lg:col-span-7 space-y-6">
            <Card className="p-5">
              <div className="flex items-center justify-between mb-3 text-xs font-mono text-text-muted">
                <span>CAPACITOR {rcMode === 'charge' ? 'CHARGING' : 'DISCHARGING'} CURVE</span>
                <span className="text-cyan-400">τ = {formatTime(rcMetrics.tau)}</span>
              </div>
              <div className="w-full h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={rcCurve} margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                    <XAxis dataKey="time" stroke="#71717a" fontSize={11} tickLine={false} tickFormatter={(t: number) => `${(t * 1000).toFixed(0)}`} label={{ value: 'Time (ms)', position: 'insideBottom', offset: -10, fill: '#71717a', fontSize: 11 }} />
                    <YAxis stroke="#71717a" fontSize={11} tickLine={false} domain={[0, rcVin * 1.05]} label={{ value: 'Voltage Vc (V)', angle: -90, position: 'insideLeft', fill: '#71717a', fontSize: 11 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', fontSize: '12px', fontFamily: 'monospace' }} formatter={(val: number) => [`${val.toFixed(3)} V`, 'Vc']} labelFormatter={(t) => `t = ${(Number(t) * 1000).toFixed(2)} ms`} />
                    <ReferenceLine y={rcVin} stroke="#10b981" strokeDasharray="4 4" />
                    <ReferenceLine y={rcVin * 0.632} stroke="#f59e0b" strokeDasharray="4 4" />
                    <Line type="monotone" dataKey="voltage" stroke="#06b6d4" strokeWidth={2.5} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card className="p-5 bg-surface-elevated/40">
              <div className="flex items-center gap-2 mb-3 text-xs font-mono text-cyan-400">
                <HelpCircle className="w-4 h-4" /><span>MATHEMATICAL MODEL</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-3 rounded-lg bg-surface border border-border">
                  <div className="font-semibold text-text-primary mb-1">What am I changing?</div>
                  <p className="text-text-muted leading-relaxed">Adjusting <strong className="text-text-primary">R</strong> and <strong className="text-text-primary">C</strong> alters the time constant τ = RC.</p>
                </div>
                <div className="p-3 rounded-lg bg-surface border border-border">
                  <div className="font-semibold text-text-primary mb-1">What is happening?</div>
                  <p className="text-text-muted leading-relaxed">Larger RC slows capacitor charging. The voltage follows an exponential asymptote toward Vin.</p>
                </div>
                <div className="p-3 rounded-lg bg-surface border border-border">
                  <div className="font-semibold text-text-primary mb-1">Why is it happening?</div>
                  <p className="text-text-muted leading-relaxed">The capacitor accumulates charge Q = CV; current decreases as voltage across R decreases.</p>
                </div>
              </div>
              <div className="mt-4 p-3 rounded-lg bg-surface border border-border text-center">
                <MathematicalFormula formula="V_C(t) = V_0\left(1 - e^{-t/\tau}\right), \quad \tau = RC, \quad f_c = \frac{1}{2\pi RC}" block />
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* ═══════════ RLC RESONANCE ═══════════ */}
      {activeTab === 'rlc' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 space-y-6">
            <Card className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                  <h3 className="text-sm font-semibold font-mono text-text-primary uppercase tracking-wider">RLC Parameters</h3>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => { setRlcR(100); setRlcL(0.01); setRlcC(0.0000001); }} title="Reset">
                    <RotateCcw className="w-3.5 h-3.5" />
                  </Button>
                  <Button variant="secondary" size="sm" onClick={handleSaveRLC}>
                    <Bookmark className="w-3.5 h-3.5 text-purple-400 mr-1" />Save
                  </Button>
                </div>
              </div>

              <div className="space-y-5">
                <Slider label="Resistance (R)" value={rlcR} min={10} max={1000} step={10} unit="Ω" onChange={setRlcR} formatValue={(r) => formatResistance(r)} />
                <Slider label="Inductance (L)" value={rlcL * 1000} min={0.1} max={100} step={0.1} unit="mH" onChange={(v) => setRlcL(v / 1000)} formatValue={(l) => `${l.toFixed(1)} mH`} />
                <Slider label="Capacitance (C)" value={rlcC * 1e9} min={1} max={10000} step={1} unit="nF" onChange={(v) => setRlcC(v * 1e-9)} formatValue={(c) => `${c.toFixed(0)} nF`} />
              </div>

              {/* Resonance Metrics */}
              <div className="mt-6 pt-5 border-t border-border/80">
                <div className="text-[11px] font-mono text-text-muted mb-2 uppercase tracking-wider">Resonance Metrics</div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-surface-elevated border border-border">
                    <div className="text-[11px] font-mono text-text-muted">Resonant Freq (f₀)</div>
                    <div className="text-lg font-bold font-mono text-purple-400 mt-0.5">{formatFrequency(rlcMetrics.resonantFrequency)}</div>
                  </div>
                  <div className="p-3 rounded-lg bg-surface-elevated border border-border">
                    <div className="text-[11px] font-mono text-text-muted">Quality Factor (Q)</div>
                    <div className="text-lg font-bold font-mono text-amber-400 mt-0.5">{rlcMetrics.qualityFactor.toFixed(2)}</div>
                  </div>
                  <div className="p-3 rounded-lg bg-surface-elevated border border-border">
                    <div className="text-[11px] font-mono text-text-muted">Bandwidth (BW)</div>
                    <div className="text-lg font-bold font-mono text-text-primary mt-0.5">{formatFrequency(rlcMetrics.bandwidth)}</div>
                  </div>
                  <div className="p-3 rounded-lg bg-surface-elevated border border-border">
                    <div className="text-[11px] font-mono text-text-muted">Damping Ratio (ζ)</div>
                    <div className="text-lg font-bold font-mono text-text-primary mt-0.5">{rlcMetrics.dampingRatio.toFixed(3)}</div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <div className="lg:col-span-7 space-y-6">
            <Card className="p-5">
              <div className="flex items-center justify-between mb-3 text-xs font-mono text-text-muted">
                <span>IMPEDANCE vs FREQUENCY (log scale)</span>
                <span className="text-purple-400">f₀ = {formatFrequency(rlcMetrics.resonantFrequency)}</span>
              </div>
              <div className="w-full h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={rlcImpedance} margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                    <XAxis dataKey="frequency" stroke="#71717a" fontSize={11} tickLine={false} scale="log" domain={['dataMin', 'dataMax']} tickFormatter={(f: number) => f >= 1000 ? `${(f / 1000).toFixed(0)}k` : `${f.toFixed(0)}`} label={{ value: 'Frequency (Hz)', position: 'insideBottom', offset: -10, fill: '#71717a', fontSize: 11 }} />
                    <YAxis stroke="#71717a" fontSize={11} tickLine={false} scale="log" domain={['auto', 'auto']} tickFormatter={(z: number) => z >= 1000 ? `${(z / 1000).toFixed(0)}k` : `${z.toFixed(0)}`} label={{ value: '|Z| (Ω)', angle: -90, position: 'insideLeft', fill: '#71717a', fontSize: 11 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', fontSize: '12px', fontFamily: 'monospace' }} formatter={(val: number) => [`${val.toFixed(2)} Ω`, '|Z|']} labelFormatter={(f) => `f = ${Number(f).toFixed(1)} Hz`} />
                    <Line type="monotone" dataKey="impedance" stroke="#8b5cf6" strokeWidth={2.5} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card className="p-5 bg-surface-elevated/40">
              <div className="flex items-center gap-2 mb-3 text-xs font-mono text-purple-400">
                <HelpCircle className="w-4 h-4" /><span>RESONANCE THEORY</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-3 rounded-lg bg-surface border border-border">
                  <div className="font-semibold text-text-primary mb-1">What am I changing?</div>
                  <p className="text-text-muted leading-relaxed">Varying <strong className="text-text-primary">R</strong>, <strong className="text-text-primary">L</strong>, <strong className="text-text-primary">C</strong> shifts the resonance frequency and Q-factor.</p>
                </div>
                <div className="p-3 rounded-lg bg-surface border border-border">
                  <div className="font-semibold text-text-primary mb-1">What is happening?</div>
                  <p className="text-text-muted leading-relaxed">At f₀, inductive reactance XL equals capacitive reactance XC, leaving only resistive impedance R.</p>
                </div>
                <div className="p-3 rounded-lg bg-surface border border-border">
                  <div className="font-semibold text-text-primary mb-1">Why is it happening?</div>
                  <p className="text-text-muted leading-relaxed">Energy oscillates between the inductor's magnetic field and the capacitor's electric field at the natural frequency.</p>
                </div>
              </div>
              <div className="mt-4 p-3 rounded-lg bg-surface border border-border text-center">
                <MathematicalFormula formula="f_0 = \frac{1}{2\pi\sqrt{LC}}, \quad Q = \frac{1}{R}\sqrt{\frac{L}{C}}, \quad \text{BW} = \frac{f_0}{Q}" block />
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* ═══ RL TRANSIENT TAB ═══ */}
      {activeTab === 'rl' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 space-y-6">
            <Card className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold font-mono text-text-primary uppercase tracking-wider">
                  RL Circuit Controls
                </h3>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => { setRlR(1000); setRlL(0.1); setRlVin(10); }}><RotateCcw className="w-3.5 h-3.5" /></Button>
                  <Button variant="secondary" size="sm" onClick={handleSaveRL}><Bookmark className="w-3.5 h-3.5 text-amber-400 mr-1" />Save</Button>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <label className="text-xs font-medium text-text-secondary">Transient Mode</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setRlMode('growth')}
                    className={`py-2 px-3 text-center rounded-lg text-xs font-mono capitalize transition-all border ${
                      rlMode === 'growth'
                        ? 'bg-amber-500/20 text-amber-400 border-amber-500/50 font-bold'
                        : 'bg-surface-elevated text-text-secondary border-border'
                    }`}
                  >
                    Current Growth
                  </button>
                  <button
                    onClick={() => setRlMode('decay')}
                    className={`py-2 px-3 text-center rounded-lg text-xs font-mono capitalize transition-all border ${
                      rlMode === 'decay'
                        ? 'bg-amber-500/20 text-amber-400 border-amber-500/50 font-bold'
                        : 'bg-surface-elevated text-text-secondary border-border'
                    }`}
                  >
                    Current Decay
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <Slider
                  label="Resistance (R)"
                  value={rlR}
                  min={100}
                  max={10000}
                  step={100}
                  unit="Ω"
                  onChange={setRlR}
                  formatValue={formatResistance}
                />
                <Slider
                  label="Inductance (L)"
                  value={rlL}
                  min={0.01}
                  max={1.0}
                  step={0.01}
                  unit="H"
                  onChange={setRlL}
                  formatValue={formatInductance}
                />
                <Slider
                  label="Input Voltage (Vin)"
                  value={rlVin}
                  min={1}
                  max={24}
                  step={0.5}
                  unit="V"
                  onChange={setRlVin}
                  formatValue={v => `${v.toFixed(1)} V`}
                />
              </div>

              <div className="mt-5 pt-4 border-t border-border grid grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-2.5 rounded bg-surface-elevated border border-border">
                  <span className="text-text-muted">Time Constant (τ):</span>
                  <div className="text-base font-bold text-amber-400">{formatTime(rlMetrics.tau)}</div>
                </div>
                <div className="p-2.5 rounded bg-surface-elevated border border-border">
                  <span className="text-text-muted">Steady-State Current:</span>
                  <div className="text-base font-bold text-text-primary">{formatCurrent(rlMetrics.steadyStateCurrent)}</div>
                </div>
                <div className="p-2.5 rounded bg-surface-elevated border border-border">
                  <span className="text-text-muted">Stored Energy (E_L):</span>
                  <div className="text-base font-bold text-text-primary">{(rlMetrics.storedEnergy * 1000).toFixed(2)} mJ</div>
                </div>
                <div className="p-2.5 rounded bg-surface-elevated border border-border">
                  <span className="text-text-muted">Cutoff Freq (fc):</span>
                  <div className="text-base font-bold text-text-primary">{formatFrequency(rlMetrics.cutoffFrequency)}</div>
                </div>
              </div>
            </Card>
          </div>

          <div className="lg:col-span-7 space-y-6">
            <Card className="p-5">
              <div className="flex items-center justify-between mb-3 text-xs font-mono text-text-muted">
                <span>INDUCTOR TRANSIENT RESPONSE (i_L & v_L vs t)</span>
                <span className="text-amber-400">τ = {formatTime(rlMetrics.tau)}</span>
              </div>
              <div className="w-full h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={rlCurve} margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                    <XAxis dataKey="time" stroke="#71717a" fontSize={11} tickFormatter={v => `${(v * 1000).toFixed(1)}ms`} label={{ value: 'Time (ms)', position: 'insideBottom', offset: -10, fill: '#71717a', fontSize: 11 }} />
                    <YAxis stroke="#71717a" fontSize={11} yAxisId="left" label={{ value: 'Current (A)', angle: -90, position: 'insideLeft', fill: '#f59e0b', fontSize: 11 }} />
                    <YAxis stroke="#71717a" fontSize={11} yAxisId="right" orientation="right" label={{ value: 'Voltage (V)', angle: 90, position: 'insideRight', fill: '#06b6d4', fontSize: 11 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', fontSize: '12px', fontFamily: 'monospace' }} />
                    <Line yAxisId="left" type="monotone" dataKey="current" stroke="#f59e0b" strokeWidth={2.5} dot={false} name="i_L (A)" />
                    <Line yAxisId="right" type="monotone" dataKey="inductorVoltage" stroke="#06b6d4" strokeWidth={1.5} strokeDasharray="4 4" dot={false} name="v_L (V)" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card className="p-5 bg-surface-elevated/40">
              <div className="flex items-center gap-2 mb-3 text-xs font-mono text-amber-400">
                <HelpCircle className="w-4 h-4" /><span>RL CIRCUIT PRINCIPLES</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-3 rounded-lg bg-surface border border-border">
                  <div className="font-semibold text-text-primary mb-1">Current Continuity</div>
                  <p className="text-text-muted leading-relaxed">Inductors oppose instantaneous changes in current: i_L(0+) = i_L(0-).</p>
                </div>
                <div className="p-3 rounded-lg bg-surface border border-border">
                  <div className="font-semibold text-text-primary mb-1">Time Constant (τ)</div>
                  <p className="text-text-muted leading-relaxed">At t = τ = L/R, current reaches 63.2% of its maximum value in growth mode.</p>
                </div>
                <div className="p-3 rounded-lg bg-surface border border-border">
                  <div className="font-semibold text-text-primary mb-1">Inductor Voltage</div>
                  <p className="text-text-muted leading-relaxed">v_L = L (di/dt). Voltage spikes to Vin initially, then decays to 0V as current stabilizes.</p>
                </div>
              </div>
              <div className="mt-4 p-3 rounded-lg bg-surface border border-border text-center">
                <MathematicalFormula formula="i_L(t) = \frac{V}{R}\left(1 - e^{-t / \tau}\right), \quad v_L(t) = V e^{-t / \tau}, \quad \tau = \frac{L}{R}" block />
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* ═══ DIODE & RECTIFIER TAB ═══ */}
      {activeTab === 'diode' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 space-y-6">
            <Card className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold font-mono text-text-primary uppercase tracking-wider">
                  Diode & Rectifier Controls
                </h3>
                <div className="flex items-center gap-2">
                  <Badge variant="info">SEMICONDUCTOR</Badge>
                  <Button variant="secondary" size="sm" onClick={handleSaveRectifier}><Bookmark className="w-3.5 h-3.5 text-cyan-400 mr-1" />Save</Button>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-text-secondary mb-1.5 block">Rectifier Topology</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setRectType('half_wave')}
                      className={`py-2 px-2 text-center rounded-lg text-xs font-mono transition-all border ${
                        rectType === 'half_wave'
                          ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50 font-bold'
                          : 'bg-surface-elevated text-text-secondary border-border'
                      }`}
                    >
                      Half-Wave (1 Diode)
                    </button>
                    <button
                      onClick={() => setRectType('full_wave_bridge')}
                      className={`py-2 px-2 text-center rounded-lg text-xs font-mono transition-all border ${
                        rectType === 'full_wave_bridge'
                          ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50 font-bold'
                          : 'bg-surface-elevated text-text-secondary border-border'
                      }`}
                    >
                      Full-Wave Bridge (4 Diodes)
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-text-secondary mb-1.5 block">Diode Model</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(Object.keys(DIODE_PRESETS) as DiodeMaterial[]).map(mat => (
                      <button
                        key={mat}
                        onClick={() => setRectMaterial(mat)}
                        className={`py-1.5 px-2 text-center rounded text-xs font-mono transition-all border ${
                          rectMaterial === mat
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50 font-bold'
                            : 'bg-surface-elevated text-text-secondary border-border'
                        }`}
                      >
                        {DIODE_PRESETS[mat].name.split(' ')[0]} ({DIODE_PRESETS[mat].forwardDrop}V)
                      </button>
                    ))}
                  </div>
                </div>

                <Slider
                  label="AC Peak Voltage (Vm)"
                  value={rectVm}
                  min={2}
                  max={30}
                  step={0.5}
                  unit="V"
                  onChange={setRectVm}
                  formatValue={v => `${v.toFixed(1)} V`}
                />
                <Slider
                  label="Frequency (f)"
                  value={rectFreq}
                  min={10}
                  max={120}
                  step={5}
                  unit="Hz"
                  onChange={setRectFreq}
                  formatValue={f => `${f} Hz`}
                />
                <Slider
                  label="Load Resistor (RL)"
                  value={rectRLoad}
                  min={100}
                  max={5000}
                  step={100}
                  unit="Ω"
                  onChange={setRectRLoad}
                  formatValue={formatResistance}
                />
                <Slider
                  label="Filter Capacitor (C)"
                  value={rectCap}
                  min={0}
                  max={0.0005}
                  step={0.00001}
                  unit="F"
                  onChange={setRectCap}
                  formatValue={c => c === 0 ? 'No Filter' : formatCapacitance(c)}
                />
              </div>

              <div className="mt-5 pt-4 border-t border-border grid grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-2.5 rounded bg-surface-elevated border border-border">
                  <span className="text-text-muted">Peak Output (Vpeak):</span>
                  <div className="text-base font-bold text-cyan-400">{rectMetrics.peakOutputVoltage} V</div>
                </div>
                <div className="p-2.5 rounded bg-surface-elevated border border-border">
                  <span className="text-text-muted">DC Output (Vdc):</span>
                  <div className="text-base font-bold text-emerald-400">{rectMetrics.dcAverageVoltage} V</div>
                </div>
                <div className="p-2.5 rounded bg-surface-elevated border border-border">
                  <span className="text-text-muted">Ripple Voltage (Vpp):</span>
                  <div className="text-base font-bold text-text-primary">{rectMetrics.rippleVoltage} V</div>
                </div>
                <div className="p-2.5 rounded bg-surface-elevated border border-border">
                  <span className="text-text-muted">Ripple Factor (γ):</span>
                  <div className="text-base font-bold text-text-primary">{(rectMetrics.rippleFactor * 100).toFixed(1)}%</div>
                </div>
              </div>
            </Card>
          </div>

          <div className="lg:col-span-7 space-y-6">
            <Card className="p-5">
              <div className="flex items-center justify-between mb-3 text-xs font-mono text-text-muted">
                <span>INPUT AC WAVEFORM vs RECTIFIED & FILTERED DC OUTPUT</span>
                <span className="text-emerald-400">EFFICIENCY: {rectMetrics.rectificationEfficiency}%</span>
              </div>
              <div className="w-full h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={rectWaveforms} margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                    <XAxis dataKey="time" stroke="#71717a" fontSize={11} label={{ value: 'Time (ms)', position: 'insideBottom', offset: -10, fill: '#71717a', fontSize: 11 }} />
                    <YAxis stroke="#71717a" fontSize={11} domain={['auto', 'auto']} label={{ value: 'Voltage (V)', angle: -90, position: 'insideLeft', fill: '#71717a', fontSize: 11 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', fontSize: '12px', fontFamily: 'monospace' }} />
                    <ReferenceLine y={0} stroke="#3f3f46" />
                    <Line type="monotone" dataKey="inputVoltage" stroke="#71717a" strokeDasharray="3 3" strokeWidth={1.5} dot={false} name="Input AC Vin" />
                    <Line type="monotone" dataKey="outputVoltage" stroke="#10b981" strokeWidth={2.5} dot={false} name="Output Vout" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card className="p-5 bg-surface-elevated/40">
              <div className="flex items-center gap-2 mb-3 text-xs font-mono text-cyan-400">
                <HelpCircle className="w-4 h-4" /><span>RECTIFICATION MATHEMATICS</span>
              </div>
              <div className="p-3 rounded-lg bg-surface border border-border text-center space-y-2">
                <MathematicalFormula
                  formula="V_{\text{dc}} \approx V_m - V_D - \frac{V_r}{2}, \quad V_{\text{ripple}} = \frac{V_m - V_D}{2 f R_L C}, \quad \gamma = \frac{V_{\text{ripple}}}{V_{\text{dc}}}"
                  block
                />
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};
