import React, { useState, useMemo, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Slider } from '../../components/ui/Slider';
import { Button } from '../../components/ui/Button';
import { MathematicalFormula } from '../../components/common/MathematicalFormula';
import { WaveformVisualizer } from '../../components/common/WaveformVisualizer';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar,
} from 'recharts';
import { Activity, RotateCcw, Bookmark, Info } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { generateWaveform, type WaveformType } from '../../lib/simulation/signals/waveforms';
import { generateTransformedSignal } from '../../lib/simulation/signals/operations';
import { getSquareWaveHarmonics, getTriangleWaveHarmonics, getSawtoothWaveHarmonics, fourierSynthesize } from '../../lib/simulation/signals/fourier';
import { convolveSignals } from '../../lib/simulation/signals/convolution';

type SignalTab = 'generator' | 'operations' | 'fourier' | 'convolution';

export const SignalsLabPage: React.FC = () => {
  const { markExperimentCompleted, addRecentExperiment } = useAppStore();
  const { subId } = useParams<{ subId?: string }>();

  const getInitialTab = (): SignalTab => {
    if (subId === 'operations' || subId === 'signal-operations') return 'operations';
    if (subId === 'fourier' || subId === 'fourier-transform') return 'fourier';
    if (subId === 'convolution') return 'convolution';
    return 'generator';
  };

  const [activeTab, setActiveTab] = useState<SignalTab>(getInitialTab());

  useEffect(() => {
    if (subId) {
      if (subId === 'operations' || subId === 'signal-operations') setActiveTab('operations');
      else if (subId === 'fourier' || subId === 'fourier-transform') setActiveTab('fourier');
      else if (subId === 'convolution') setActiveTab('convolution');
      else if (subId === 'generator' || subId === 'signal-generator') setActiveTab('generator');
    }
  }, [subId]);

  // ── GENERATOR STATE ──
  const [waveformType, setWaveformType] = useState<WaveformType | 'noise'>('sine');
  const [frequency, setFrequency] = useState(2.0);
  const [amplitude, setAmplitude] = useState(3.0);
  const [offset, setOffset] = useState(0.0);

  const period = frequency > 0 ? (1000 / frequency).toFixed(1) : '0';
  const omega = (2 * Math.PI * frequency).toFixed(2);
  const vpp = (amplitude * 2).toFixed(2);
  const vrms = waveformType === 'sine' ? (amplitude / Math.SQRT2).toFixed(2) :
               waveformType === 'square' ? amplitude.toFixed(2) :
               waveformType === 'triangle' ? (amplitude / Math.sqrt(3)).toFixed(2) :
               (amplitude * 0.577).toFixed(2);

  // ── OPERATIONS STATE ──
  const [opType, setOpType] = useState<WaveformType>('sine');
  const [opTimeShift, setOpTimeShift] = useState(0);
  const [opTimeScale, setOpTimeScale] = useState(1.0);
  const [opReverse, setOpReverse] = useState(false);
  const [opAmpScale, setOpAmpScale] = useState(1.0);

  const originalSignal = useMemo(() => generateWaveform({
    type: opType, amplitude: 1, frequency: 1, phase: 0, dcOffset: 0, tMin: -3, tMax: 3, numSamples: 500,
  }), [opType]);

  const transformedSignal = useMemo(() => generateTransformedSignal(
    opType, 1, 1, 0, 0, -3, 3, 500,
    { timeShiftAmount: opTimeShift, timeScaleFactor: opTimeScale, reverseTime: opReverse, amplitudeScaleFactor: opAmpScale }
  ), [opType, opTimeShift, opTimeScale, opReverse, opAmpScale]);

  // ── FOURIER STATE ──
  const [fourierWave, setFourierWave] = useState<'square' | 'triangle' | 'sawtooth'>('square');
  const [numHarmonics, setNumHarmonics] = useState(10);

  const fourierData = useMemo(() => {
    const harmonics = fourierWave === 'square' ? getSquareWaveHarmonics(1, numHarmonics) :
                      fourierWave === 'triangle' ? getTriangleWaveHarmonics(1, numHarmonics) :
                      getSawtoothWaveHarmonics(1, numHarmonics);
    const synthesized = fourierSynthesize(harmonics, 1, -2, 2, 500);
    // Magnitude spectrum bars
    const spectrum = harmonics.map((h) => ({
      harmonic: `H${h.harmonic}`,
      amplitude: Math.abs(h.amplitude),
    }));
    return { synthesized, spectrum, harmonics };
  }, [fourierWave, numHarmonics]);

  // ── CONVOLUTION STATE ──
  const [convXType, setConvXType] = useState<WaveformType>('step');
  const [convHType, setConvHType] = useState<WaveformType>('sine');

  const convResult = useMemo(() => {
    const x = generateWaveform({ type: convXType, amplitude: 1, frequency: 1, phase: 0, dcOffset: 0, tMin: -2, tMax: 2, numSamples: 200 });
    const h = generateWaveform({ type: convHType, amplitude: 1, frequency: 2, phase: 0, dcOffset: 0, tMin: -2, tMax: 2, numSamples: 200 });
    const dt = 4 / 200;
    const y = convolveSignals(x, h, dt);
    return { x, h, y };
  }, [convXType, convHType]);

  // ── HANDLERS ──
  const handleSaveGenerator = () => {
    markExperimentCompleted('signal-generator');
    addRecentExperiment({ experimentId: 'signal-generator', title: 'Signal Synthesis & Parameter Modulation', labName: 'Signals & Systems', route: '/signals', summary: `${waveformType.toUpperCase()}: f=${frequency}Hz, A=${amplitude}V` });
  };

  const handleResetGenerator = () => { setWaveformType('sine'); setFrequency(2); setAmplitude(3); setOffset(0); };

  const signalTabs = [
    { key: 'generator' as const, label: 'Generator' },
    { key: 'operations' as const, label: 'Operations' },
    { key: 'fourier' as const, label: 'Fourier' },
    { key: 'convolution' as const, label: 'Convolution' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-accent-cyan mb-1">
            <Activity className="w-3.5 h-3.5" /><span>SIGNALS & SYSTEMS • MODULE 02</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">Signal Generator & Waveform Analytics</h1>
          <p className="text-xs sm:text-sm text-text-muted mt-1">Continuous synthesis, Fourier decomposition, signal transformations, and convolution.</p>
        </div>
        <div className="flex items-center gap-1.5 p-1 rounded-lg bg-surface-elevated border border-border w-full sm:w-auto max-w-full overflow-x-auto scrollbar-none shrink-0">
          {signalTabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`px-3 py-1.5 rounded-md text-xs font-mono font-medium transition-all shrink-0 ${
                activeTab === tab.key ? 'bg-accent-cyan text-white shadow-sm' : 'text-text-muted hover:text-text-primary'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ═══ GENERATOR TAB ═══ */}
      {activeTab === 'generator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 space-y-6">
            <Card className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold font-mono text-text-primary uppercase tracking-wider">Function Generator Controls</h3>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={handleResetGenerator}><RotateCcw className="w-3.5 h-3.5" /></Button>
                  <Button variant="secondary" size="sm" onClick={handleSaveGenerator}><Bookmark className="w-3.5 h-3.5 text-accent-cyan mr-1" />Save</Button>
                </div>
              </div>
              <div className="space-y-2 mb-6">
                <label className="text-xs font-medium text-text-secondary">Waveform Shape</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {(['sine', 'cosine', 'square', 'triangle', 'sawtooth', 'impulse', 'step', 'ramp'] as const).map((type) => (
                    <button key={type} onClick={() => setWaveformType(type)} className={`py-1.5 px-1 text-center rounded-lg text-xs font-mono capitalize transition-all ${waveformType === type ? 'bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/50 font-bold shadow-sm' : 'bg-surface-elevated text-text-secondary hover:text-text-primary border border-border'}`}>{type}</button>
                  ))}
                </div>
              </div>
              <div className="space-y-5">
                <Slider label="Frequency (f)" value={frequency} min={0.5} max={10} step={0.1} unit="Hz" onChange={setFrequency} formatValue={(f) => `${f.toFixed(1)} Hz`} />
                <Slider label="Peak Amplitude (A)" value={amplitude} min={0.5} max={5} step={0.1} unit="V" onChange={setAmplitude} formatValue={(a) => `${a.toFixed(1)} V`} />
                <Slider label="DC Offset (Voffset)" value={offset} min={-3} max={3} step={0.1} unit="V" onChange={setOffset} formatValue={(o) => `${o >= 0 ? '+' : ''}${o.toFixed(1)} V`} />
              </div>
              <div className="mt-6 pt-5 border-t border-border/80 grid grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-2.5 rounded bg-surface-elevated border border-border"><span className="text-text-muted">Period (T):</span><div className="text-base font-bold text-text-primary">{period} ms</div></div>
                <div className="p-2.5 rounded bg-surface-elevated border border-border"><span className="text-text-muted">Angular Freq (ω):</span><div className="text-base font-bold text-accent-cyan">{omega} rad/s</div></div>
                <div className="p-2.5 rounded bg-surface-elevated border border-border"><span className="text-text-muted">Peak-to-Peak (Vpp):</span><div className="text-base font-bold text-text-primary">{vpp} V</div></div>
                <div className="p-2.5 rounded bg-surface-elevated border border-border"><span className="text-text-muted">RMS Voltage (Vrms):</span><div className="text-base font-bold text-emerald-400">{vrms} V</div></div>
              </div>
            </Card>
          </div>
          <div className="lg:col-span-7 space-y-6">
            <Card className="p-5">
              <div className="flex items-center justify-between mb-3 text-xs font-mono text-text-muted">
                <span>DUAL-TRACE DIGITAL OSCILLOSCOPE (CALIBRATED)</span>
                <span className="text-cyan-400">SAMPLE RATE: 200 kS/s</span>
              </div>
              <WaveformVisualizer waveformType={waveformType} frequency={frequency} amplitude={amplitude} offset={offset} color="#06B6D4" className="h-72" />
            </Card>
            <Card className="p-5 bg-surface-elevated/40">
              <div className="flex items-center gap-2 mb-3 text-xs font-mono text-cyan-400"><Info className="w-4 h-4" /><span>MATHEMATICAL WAVEFORM DEFINITION</span></div>
              <div className="p-3 rounded-lg bg-surface border border-border text-center">
                {waveformType === 'sine' && <MathematicalFormula formula="x(t) = A \cdot \sin(2\pi f t + \phi) + V_{\text{offset}}" block />}
                {waveformType === 'square' && <MathematicalFormula formula="x(t) = A \cdot \operatorname{sgn}(\sin(2\pi f t)) + V_{\text{offset}}" block />}
                {waveformType === 'triangle' && <MathematicalFormula formula="x(t) = \frac{2A}{\pi}\arcsin(\sin(2\pi f t)) + V_{\text{offset}}" block />}
                {waveformType === 'sawtooth' && <MathematicalFormula formula="x(t) = 2A \left( \frac{t}{T} - \lfloor \frac{t}{T} + \frac{1}{2} \rfloor \right) + V_{\text{offset}}" block />}
                {waveformType === 'noise' && <MathematicalFormula formula="x(t) = A \cdot \sin(2\pi f t) + \mathcal{N}(0, \sigma^2)" block />}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* ═══ OPERATIONS TAB ═══ */}
      {activeTab === 'operations' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 space-y-6">
            <Card className="p-5">
              <h3 className="text-sm font-semibold font-mono text-text-primary uppercase tracking-wider mb-4">Signal Transformation Controls</h3>
              <div className="space-y-2 mb-5">
                <label className="text-xs font-medium text-text-secondary">Base Waveform</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {(['sine', 'square', 'triangle', 'step'] as WaveformType[]).map((type) => (
                    <button key={type} onClick={() => setOpType(type)} className={`py-2 text-center rounded-lg text-xs font-mono capitalize transition-all ${opType === type ? 'bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/50 font-bold' : 'bg-surface-elevated text-text-secondary border border-border'}`}>{type}</button>
                  ))}
                </div>
              </div>
              <div className="space-y-5">
                <Slider label="Time Shift (t₀)" value={opTimeShift} min={-2} max={2} step={0.1} onChange={setOpTimeShift} formatValue={(v) => `${v >= 0 ? '+' : ''}${v.toFixed(1)} s`} />
                <Slider label="Time Scale Factor (a)" value={opTimeScale} min={0.2} max={3} step={0.1} onChange={setOpTimeScale} formatValue={(v) => `${v.toFixed(1)}×`} />
                <Slider label="Amplitude Scale (A)" value={opAmpScale} min={-2} max={2} step={0.1} onChange={setOpAmpScale} formatValue={(v) => `${v.toFixed(1)}×`} />
              </div>
              <div className="mt-4 flex items-center gap-3">
                <button onClick={() => setOpReverse(!opReverse)} className={`flex-1 py-2 rounded-lg text-xs font-mono font-semibold transition-all ${opReverse ? 'bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/50' : 'bg-surface-elevated text-text-secondary border border-border'}`}>
                  {opReverse ? '✓ Time Reversed x(−t)' : 'Time Reversal x(−t)'}
                </button>
                <Button variant="ghost" size="sm" onClick={() => { setOpTimeShift(0); setOpTimeScale(1); setOpReverse(false); setOpAmpScale(1); }}>
                  <RotateCcw className="w-3.5 h-3.5" />
                </Button>
              </div>
            </Card>
            <Card className="p-5 bg-surface-elevated/40">
              <div className="text-xs font-mono text-accent-cyan mb-2 uppercase tracking-wider">Transformation Applied</div>
              <div className="p-3 rounded-lg bg-surface border border-border text-center">
                <MathematicalFormula formula={`y(t) = ${opAmpScale !== 1 ? `${opAmpScale.toFixed(1)} \\cdot ` : ''}x(${opReverse ? '-' : ''}${opTimeScale !== 1 ? `${opTimeScale.toFixed(1)}` : ''}t${opTimeShift !== 0 ? ` ${opTimeShift > 0 ? '-' : '+'} ${Math.abs(opTimeShift).toFixed(1)}` : ''})`} block />
              </div>
            </Card>
          </div>
          <div className="lg:col-span-7 space-y-6">
            <Card className="p-5">
              <div className="text-xs font-mono text-text-muted mb-3">ORIGINAL x(t) — BLUE vs TRANSFORMED y(t) — CYAN</div>
              <div className="w-full h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                    <XAxis dataKey="t" type="number" stroke="#71717a" fontSize={11} tickLine={false} domain={[-3, 3]} allowDuplicatedCategory={false} label={{ value: 'Time t (s)', position: 'insideBottom', offset: -10, fill: '#71717a', fontSize: 11 }} />
                    <YAxis stroke="#71717a" fontSize={11} tickLine={false} domain={[-2.5, 2.5]} label={{ value: 'Amplitude', angle: -90, position: 'insideLeft', fill: '#71717a', fontSize: 11 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', fontSize: '12px', fontFamily: 'monospace' }} />
                    <Line data={originalSignal} dataKey="y" stroke="#3b82f6" strokeWidth={1.5} dot={false} name="Original x(t)" />
                    <Line data={transformedSignal} dataKey="y" stroke="#06b6d4" strokeWidth={2.5} dot={false} name="Transformed y(t)" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* ═══ FOURIER TAB ═══ */}
      {activeTab === 'fourier' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 space-y-6">
            <Card className="p-5">
              <h3 className="text-sm font-semibold font-mono text-text-primary uppercase tracking-wider mb-4">Fourier Synthesis Controls</h3>
              <div className="space-y-2 mb-5">
                <label className="text-xs font-medium text-text-secondary">Target Waveform</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['square', 'triangle', 'sawtooth'] as const).map((type) => (
                    <button key={type} onClick={() => setFourierWave(type)} className={`py-2 text-center rounded-lg text-xs font-mono capitalize transition-all ${fourierWave === type ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 font-bold' : 'bg-surface-elevated text-text-secondary border border-border'}`}>{type}</button>
                  ))}
                </div>
              </div>
              <Slider label="Number of Harmonics (N)" value={numHarmonics} min={1} max={50} step={1} onChange={setNumHarmonics} formatValue={(n) => `${n} harmonics`} />

              <div className="mt-6 pt-5 border-t border-border/80">
                <div className="text-[11px] font-mono text-text-muted mb-2 uppercase tracking-wider">Frequency Spectrum</div>
                <div className="w-full h-36">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={fourierData.spectrum.slice(0, 20)} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                      <XAxis dataKey="harmonic" stroke="#71717a" fontSize={9} tickLine={false} />
                      <YAxis stroke="#71717a" fontSize={9} tickLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', fontSize: '11px', fontFamily: 'monospace' }} />
                      <Bar dataKey="amplitude" fill="#10b981" radius={[2, 2, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </Card>
          </div>
          <div className="lg:col-span-7 space-y-6">
            <Card className="p-5">
              <div className="flex items-center justify-between mb-3 text-xs font-mono text-text-muted">
                <span>FOURIER SYNTHESIS — TIME DOMAIN</span>
                <span className="text-emerald-400">{numHarmonics} HARMONICS</span>
              </div>
              <div className="w-full h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={fourierData.synthesized} margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                    <XAxis dataKey="t" stroke="#71717a" fontSize={11} tickLine={false} label={{ value: 'Time t (s)', position: 'insideBottom', offset: -10, fill: '#71717a', fontSize: 11 }} />
                    <YAxis stroke="#71717a" fontSize={11} tickLine={false} label={{ value: 'Amplitude', angle: -90, position: 'insideLeft', fill: '#71717a', fontSize: 11 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', fontSize: '12px', fontFamily: 'monospace' }} formatter={(val: number) => [val.toFixed(4), 'Amplitude']} labelFormatter={(t) => `t = ${Number(t).toFixed(3)} s`} />
                    <Line type="monotone" dataKey="y" stroke="#10b981" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
            <Card className="p-5 bg-surface-elevated/40">
              <div className="flex items-center gap-2 mb-3 text-xs font-mono text-emerald-400"><Info className="w-4 h-4" /><span>FOURIER SERIES FORMULA</span></div>
              <div className="p-3 rounded-lg bg-surface border border-border text-center">
                {fourierWave === 'square' && <MathematicalFormula formula="x(t) = \frac{4A}{\pi} \sum_{k=1}^{N} \frac{\sin((2k-1)\omega_0 t)}{2k-1}" block />}
                {fourierWave === 'triangle' && <MathematicalFormula formula="x(t) = \frac{8A}{\pi^2} \sum_{k=1}^{N} \frac{(-1)^{k+1}\sin((2k-1)\omega_0 t)}{(2k-1)^2}" block />}
                {fourierWave === 'sawtooth' && <MathematicalFormula formula="x(t) = \frac{2A}{\pi} \sum_{k=1}^{N} \frac{(-1)^{k+1}\sin(k\omega_0 t)}{k}" block />}
              </div>
              <p className="text-xs text-text-muted mt-3 leading-relaxed">
                Increasing the number of harmonics N improves the approximation. Note the Gibbs phenomenon — overshoot near step discontinuities persists at ~9% regardless of N.
              </p>
            </Card>
          </div>
        </div>
      )}

      {/* ═══ CONVOLUTION TAB ═══ */}
      {activeTab === 'convolution' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 space-y-6">
            <Card className="p-5">
              <h3 className="text-sm font-semibold font-mono text-text-primary uppercase tracking-wider mb-4">Convolution Input Signals</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-text-secondary mb-1.5 block">Input Signal x(t)</label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {(['step', 'impulse', 'sine', 'square'] as WaveformType[]).map((type) => (
                      <button key={type} onClick={() => setConvXType(type)} className={`py-2 text-center rounded-lg text-xs font-mono capitalize transition-all ${convXType === type ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50 font-bold' : 'bg-surface-elevated text-text-secondary border border-border'}`}>{type}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-text-secondary mb-1.5 block">Impulse Response h(t)</label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {(['sine', 'step', 'triangle', 'ramp'] as WaveformType[]).map((type) => (
                      <button key={type} onClick={() => setConvHType(type)} className={`py-2 text-center rounded-lg text-xs font-mono capitalize transition-all ${convHType === type ? 'bg-purple-500/20 text-purple-400 border border-purple-500/50 font-bold' : 'bg-surface-elevated text-text-secondary border border-border'}`}>{type}</button>
                    ))}
                  </div>
                </div>
              </div>
            </Card>

            {/* x(t) and h(t) mini-charts */}
            <Card className="p-5">
              <div className="text-xs font-mono text-blue-400 mb-2">INPUT x(t)</div>
              <div className="w-full h-28">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={convResult.x} margin={{ top: 5, right: 10, bottom: 5, left: 5 }}>
                    <CartesianGrid strokeDasharray="2 2" stroke="#27272a" />
                    <XAxis dataKey="t" stroke="#71717a" fontSize={9} tickLine={false} />
                    <YAxis stroke="#71717a" fontSize={9} tickLine={false} />
                    <Line type="monotone" dataKey="y" stroke="#3b82f6" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="text-xs font-mono text-purple-400 mt-4 mb-2">IMPULSE RESPONSE h(t)</div>
              <div className="w-full h-28">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={convResult.h} margin={{ top: 5, right: 10, bottom: 5, left: 5 }}>
                    <CartesianGrid strokeDasharray="2 2" stroke="#27272a" />
                    <XAxis dataKey="t" stroke="#71717a" fontSize={9} tickLine={false} />
                    <YAxis stroke="#71717a" fontSize={9} tickLine={false} />
                    <Line type="monotone" dataKey="y" stroke="#8b5cf6" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          <div className="lg:col-span-7 space-y-6">
            <Card className="p-5">
              <div className="flex items-center justify-between mb-3 text-xs font-mono text-text-muted">
                <span>CONVOLUTION OUTPUT y(t) = x(t) * h(t)</span>
                <span className="text-emerald-400">CONTINUOUS</span>
              </div>
              <div className="w-full h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={convResult.y} margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                    <XAxis dataKey="t" stroke="#71717a" fontSize={11} tickLine={false} label={{ value: 'Time t (s)', position: 'insideBottom', offset: -10, fill: '#71717a', fontSize: 11 }} />
                    <YAxis stroke="#71717a" fontSize={11} tickLine={false} label={{ value: 'y(t)', angle: -90, position: 'insideLeft', fill: '#71717a', fontSize: 11 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', fontSize: '12px', fontFamily: 'monospace' }} formatter={(val: number) => [val.toFixed(4), 'y(t)']} labelFormatter={(t) => `t = ${Number(t).toFixed(3)} s`} />
                    <Line type="monotone" dataKey="y" stroke="#10b981" strokeWidth={2.5} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
            <Card className="p-5 bg-surface-elevated/40">
              <div className="flex items-center gap-2 mb-3 text-xs font-mono text-emerald-400"><Info className="w-4 h-4" /><span>CONVOLUTION INTEGRAL</span></div>
              <div className="p-3 rounded-lg bg-surface border border-border text-center">
                <MathematicalFormula formula="y(t) = (x * h)(t) = \int_{-\infty}^{\infty} x(\tau) \, h(t - \tau) \, d\tau" block />
              </div>
              <p className="text-xs text-text-muted mt-3 leading-relaxed">
                The convolution integral computes the output of a Linear Time-Invariant (LTI) system by sliding the flipped impulse response h(t−τ) across the input x(τ) and integrating the product at each time shift t.
              </p>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};
