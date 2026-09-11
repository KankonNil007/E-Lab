import React, { useState, useMemo, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Slider } from '../../components/ui/Slider';
import { Button } from '../../components/ui/Button';
import { MathematicalFormula } from '../../components/common/MathematicalFormula';
import { Wrench, Plus, Trash2 } from 'lucide-react';
import { formatResistance, formatCapacitance, formatInductance, formatFrequency, formatVoltage, formatCurrent } from '../../lib/utils';
import { CapacitorCodeCalculator } from './CapacitorCodeCalculator';
import { BjtBiasCalculator } from './BjtBiasCalculator';
import { MatrixCalculator } from './MatrixCalculator';
import { TransformExplorer } from './TransformExplorer';
import { MosfetCalculator } from './MosfetCalculator';
import { ScientificCalculator } from './ScientificCalculator';

type ToolTab =
  | 'resistor'
  | 'capacitor'
  | 'bjt'
  | 'mosfet'
  | 'scientific'
  | 'decibel'
  | 'dividers'
  | 'passives'
  | 'filters'
  | 'opamp'
  | 'complex'
  | 'matrix'
  | 'transforms';

interface ColorBand {
  name: string; color: string; textColor?: string; digit?: number; multiplier?: number; tolerance?: number;
}

const DIGIT_COLORS: ColorBand[] = [
  { name: 'Black', color: '#18181b', textColor: '#ffffff', digit: 0, multiplier: 1 },
  { name: 'Brown', color: '#78350f', textColor: '#ffffff', digit: 1, multiplier: 10, tolerance: 1 },
  { name: 'Red', color: '#dc2626', textColor: '#ffffff', digit: 2, multiplier: 100, tolerance: 2 },
  { name: 'Orange', color: '#ea580c', textColor: '#ffffff', digit: 3, multiplier: 1000 },
  { name: 'Yellow', color: '#ca8a04', textColor: '#000000', digit: 4, multiplier: 10000 },
  { name: 'Green', color: '#16a34a', textColor: '#ffffff', digit: 5, multiplier: 100000, tolerance: 0.5 },
  { name: 'Blue', color: '#2563eb', textColor: '#ffffff', digit: 6, multiplier: 1000000, tolerance: 0.25 },
  { name: 'Violet', color: '#7c3aed', textColor: '#ffffff', digit: 7, multiplier: 10000000, tolerance: 0.1 },
  { name: 'Grey', color: '#4b5563', textColor: '#ffffff', digit: 8, multiplier: 100000000 },
  { name: 'White', color: '#f3f4f6', textColor: '#000000', digit: 9, multiplier: 1000000000 },
];

const TOLERANCE_COLORS: ColorBand[] = [
  { name: 'Gold', color: '#d97706', textColor: '#ffffff', tolerance: 5 },
  { name: 'Silver', color: '#9ca3af', textColor: '#000000', tolerance: 10 },
  { name: 'Brown', color: '#78350f', textColor: '#ffffff', tolerance: 1 },
  { name: 'Red', color: '#dc2626', textColor: '#ffffff', tolerance: 2 },
];

export const ToolsPage: React.FC = () => {
  const { subId } = useParams<{ subId?: string }>();

  const getInitialTab = (): ToolTab => {
    if (subId === 'capacitor' || subId === 'capacitor-code') return 'capacitor';
    if (subId === 'bjt' || subId === 'bjt-bias') return 'bjt';
    if (subId === 'mosfet' || subId === 'mosfet-calc') return 'mosfet';
    if (subId === 'scientific' || subId === 'calculator' || subId === 'calc') return 'scientific';
    if (subId === 'matrix') return 'matrix';
    if (subId === 'transforms' || subId === 'laplace' || subId === 'fourier') return 'transforms';
    if (subId === 'decibel') return 'decibel';
    if (subId === 'dividers' || subId === 'voltage-divider' || subId === 'current-divider') return 'dividers';
    if (subId === 'passives' || subId === 'series-parallel') return 'passives';
    if (subId === 'filters' || subId === 'rc-filter' || subId === 'rl-filter') return 'filters';
    if (subId === 'opamp' || subId === 'op-amp') return 'opamp';
    if (subId === 'complex') return 'complex';
    return 'resistor';
  };

  const [activeTab, setActiveTab] = useState<ToolTab>(getInitialTab());

  useEffect(() => {
    if (subId) {
      if (subId === 'capacitor' || subId === 'capacitor-code') setActiveTab('capacitor');
      else if (subId === 'bjt' || subId === 'bjt-bias') setActiveTab('bjt');
      else if (subId === 'mosfet' || subId === 'mosfet-calc') setActiveTab('mosfet');
      else if (subId === 'scientific' || subId === 'calculator' || subId === 'calc') setActiveTab('scientific');
      else if (subId === 'matrix') setActiveTab('matrix');
      else if (subId === 'transforms' || subId === 'laplace' || subId === 'fourier') setActiveTab('transforms');
      else if (subId === 'decibel') setActiveTab('decibel');
      else if (subId === 'dividers' || subId === 'voltage-divider' || subId === 'current-divider') setActiveTab('dividers');
      else if (subId === 'passives' || subId === 'series-parallel') setActiveTab('passives');
      else if (subId === 'filters' || subId === 'rc-filter' || subId === 'rl-filter') setActiveTab('filters');
      else if (subId === 'opamp' || subId === 'op-amp') setActiveTab('opamp');
      else if (subId === 'complex') setActiveTab('complex');
      else if (subId === 'resistor' || subId === 'color-code') setActiveTab('resistor');
    }
  }, [subId]);

  // ── Resistor Color Code ──
  const [band1, setBand1] = useState(4);
  const [band2, setBand2] = useState(7);
  const [multIndex, setMultIndex] = useState(2);
  const [tolIndex, setTolIndex] = useState(0);
  const nominalOhms = (band1 * 10 + band2) * (DIGIT_COLORS[multIndex].multiplier || 1);
  const tolerancePct = TOLERANCE_COLORS[tolIndex].tolerance || 5;
  const minOhms = nominalOhms * (1 - tolerancePct / 100);
  const maxOhms = nominalOhms * (1 + tolerancePct / 100);

  // ── Decibel ──
  const [v1, setV1] = useState(1.0);
  const [v2, setV2] = useState(10.0);
  const vRatio = v2 / Math.max(0.0001, v1);
  const dbGain = (20 * Math.log10(vRatio)).toFixed(2);

  // ── Voltage Divider ──
  const [vdVin, setVdVin] = useState(12.0);
  const [vdR1, setVdR1] = useState(10000);
  const [vdR2, setVdR2] = useState(10000);
  const vdVout = vdVin * vdR2 / (vdR1 + vdR2);
  const vdCurrent = vdVin / (vdR1 + vdR2);

  // ── Current Divider ──
  const [cdItotal, setCdItotal] = useState(0.01);
  const [cdR1, setCdR1] = useState(1000);
  const [cdR2, setCdR2] = useState(2000);
  const cdI1 = cdItotal * cdR2 / (cdR1 + cdR2);
  const cdI2 = cdItotal * cdR1 / (cdR1 + cdR2);

  // ── Series/Parallel R ──
  const [passiveValues, setPassiveValues] = useState<number[]>([1000, 2200, 4700]);
  const [passiveType, setPassiveType] = useState<'resistor' | 'capacitor' | 'inductor'>('resistor');
  const [passiveMode, setPassiveMode] = useState<'series' | 'parallel'>('series');

  const passiveResult = useMemo(() => {
    if (passiveValues.length === 0) return 0;
    if (passiveMode === 'series') {
      if (passiveType === 'capacitor') {
        // Capacitors in series: 1/Ct = 1/C1 + 1/C2 + ...
        const invSum = passiveValues.reduce((acc, v) => acc + 1 / Math.max(1e-15, v), 0);
        return 1 / invSum;
      }
      // Resistors & Inductors in series: sum
      return passiveValues.reduce((acc, v) => acc + v, 0);
    } else {
      if (passiveType === 'capacitor') {
        // Capacitors in parallel: Ct = C1 + C2 + ...
        return passiveValues.reduce((acc, v) => acc + v, 0);
      }
      // Resistors & Inductors in parallel: 1/Rt = 1/R1 + 1/R2 + ...
      const invSum = passiveValues.reduce((acc, v) => acc + 1 / Math.max(1e-15, v), 0);
      return 1 / invSum;
    }
  }, [passiveValues, passiveType, passiveMode]);

  // ── RC / RL Filter ──
  const [filterType, setFilterType] = useState<'rc' | 'rl'>('rc');
  const [filterR, setFilterR] = useState(10000);
  const [filterC, setFilterC] = useState(100e-9);
  const [filterL, setFilterL] = useState(0.01);
  const filterFc = filterType === 'rc'
    ? 1 / (2 * Math.PI * filterR * filterC)
    : filterR / (2 * Math.PI * filterL);

  // ── Op-Amp ──
  const [opampMode, setOpampMode] = useState<'inverting' | 'noninverting'>('noninverting');
  const [opampRf, setOpampRf] = useState(10000);
  const [opampRin, setOpampRin] = useState(1000);
  const [opampVin, setOpampVin] = useState(1.0);
  const opampGain = opampMode === 'inverting' ? -(opampRf / opampRin) : 1 + (opampRf / opampRin);
  const opampVout = opampVin * opampGain;

  // ── Complex Numbers ──
  const [cplxAr, setCplxAr] = useState(3);
  const [cplxAi, setCplxAi] = useState(4);
  const [cplxBr, setCplxBr] = useState(1);
  const [cplxBi, setCplxBi] = useState(-2);
  const cplxOp = useState<'+' | '-' | '×' | '÷'>('+');
  const [cplxOperation, setCplxOperation] = cplxOp;

  const cplxResult = useMemo(() => {
    const a = { r: cplxAr, i: cplxAi };
    const b = { r: cplxBr, i: cplxBi };
    switch (cplxOperation) {
      case '+': return { r: a.r + b.r, i: a.i + b.i };
      case '-': return { r: a.r - b.r, i: a.i - b.i };
      case '×': return { r: a.r * b.r - a.i * b.i, i: a.r * b.i + a.i * b.r };
      case '÷': {
        const denom = b.r * b.r + b.i * b.i;
        if (denom === 0) return { r: NaN, i: NaN };
        return { r: (a.r * b.r + a.i * b.i) / denom, i: (a.i * b.r - a.r * b.i) / denom };
      }
    }
  }, [cplxAr, cplxAi, cplxBr, cplxBi, cplxOperation]);

  const cplxMag = Math.sqrt(cplxResult.r * cplxResult.r + cplxResult.i * cplxResult.i);
  const cplxAngle = Math.atan2(cplxResult.i, cplxResult.r) * 180 / Math.PI;

  const toolTabs = [
    { key: 'resistor' as const, label: 'Resistor Code' },
    { key: 'capacitor' as const, label: 'Capacitor Code' },
    { key: 'bjt' as const, label: 'BJT Bias' },
    { key: 'mosfet' as const, label: 'MOSFET' },
    { key: 'scientific' as const, label: 'Scientific Calc' },
    { key: 'dividers' as const, label: 'Dividers' },
    { key: 'passives' as const, label: 'R/C/L Combos' },
    { key: 'filters' as const, label: 'Filters' },
    { key: 'opamp' as const, label: 'Op-Amp' },
    { key: 'decibel' as const, label: 'Decibel' },
    { key: 'complex' as const, label: 'Complex' },
    { key: 'matrix' as const, label: 'Matrix Calc' },
    { key: 'transforms' as const, label: 'Laplace / Fourier' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-amber-400 mb-1">
            <Wrench className="w-3.5 h-3.5" /><span>ENGINEERING TOOLBOX • MODULE 05</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">Quick Calculators & Component Decoders</h1>
          <p className="text-xs sm:text-sm text-text-muted mt-1">Instant nominal value calculators, decibel ratios, filter cutoffs, and complex arithmetic.</p>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex items-center gap-1.5 p-1.5 rounded-xl bg-surface-elevated border border-border overflow-x-auto scrollbar-none sm:flex-wrap">
        {toolTabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all shrink-0 ${
              activeTab === tab.key
                ? 'bg-amber-500 text-white shadow-sm'
                : 'text-text-muted hover:text-text-primary hover:bg-surface'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ═══ RESISTOR COLOR CODE ═══ */}
      {activeTab === 'resistor' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7">
            <Card className="p-3 sm:p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold font-mono text-text-primary uppercase tracking-wider">4-Band Resistor Color Code Decoder</h3>
                <Badge variant="warning">IEC 60062</Badge>
              </div>
              <div className="my-4 sm:my-6 p-4 sm:p-6 rounded-xl bg-surface-elevated border border-border flex items-center justify-center overflow-x-auto scrollbar-none">
                <div className="relative flex items-center shrink-0">
                  <div className="w-6 sm:w-12 h-1.5 bg-zinc-400 rounded-l" />
                  <div className="w-36 sm:w-48 h-12 sm:h-16 bg-[#d1a073] rounded-2xl flex items-center justify-between px-3 sm:px-6 border border-zinc-700 shadow-inner relative overflow-hidden">
                    <div className="w-2.5 sm:w-3.5 h-full shadow-sm" style={{ backgroundColor: DIGIT_COLORS[band1].color }} />
                    <div className="w-2.5 sm:w-3.5 h-full shadow-sm" style={{ backgroundColor: DIGIT_COLORS[band2].color }} />
                    <div className="w-2.5 sm:w-3.5 h-full shadow-sm" style={{ backgroundColor: DIGIT_COLORS[multIndex].color }} />
                    <div className="w-2.5 sm:w-3.5 h-full shadow-sm ml-2 sm:ml-4" style={{ backgroundColor: TOLERANCE_COLORS[tolIndex].color }} />
                  </div>
                  <div className="w-6 sm:w-12 h-1.5 bg-zinc-400 rounded-r" />
                </div>
              </div>
              <div className="p-4 rounded-xl bg-surface-elevated border border-amber-500/30 text-center mb-6">
                <div className="text-xs font-mono text-text-muted">Nominal Resistance:</div>
                <div className="text-3xl font-bold font-mono text-amber-400 mt-1">{formatResistance(nominalOhms)} <span className="text-lg font-normal text-text-secondary">±{tolerancePct}%</span></div>
                <div className="text-xs font-mono text-text-muted mt-1">Range: {formatResistance(minOhms)} – {formatResistance(maxOhms)}</div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div><label className="block font-mono text-text-muted mb-1">Band 1</label><select value={band1} onChange={(e) => setBand1(parseInt(e.target.value))} className="w-full bg-surface border border-border rounded p-1.5 font-mono text-text-primary focus:outline-none focus:border-amber-400">{DIGIT_COLORS.map((c, i) => <option key={i} value={i}>{c.digit} - {c.name}</option>)}</select></div>
                <div><label className="block font-mono text-text-muted mb-1">Band 2</label><select value={band2} onChange={(e) => setBand2(parseInt(e.target.value))} className="w-full bg-surface border border-border rounded p-1.5 font-mono text-text-primary focus:outline-none focus:border-amber-400">{DIGIT_COLORS.map((c, i) => <option key={i} value={i}>{c.digit} - {c.name}</option>)}</select></div>
                <div><label className="block font-mono text-text-muted mb-1">Multiplier</label><select value={multIndex} onChange={(e) => setMultIndex(parseInt(e.target.value))} className="w-full bg-surface border border-border rounded p-1.5 font-mono text-text-primary focus:outline-none focus:border-amber-400">{DIGIT_COLORS.slice(0, 8).map((c, i) => <option key={i} value={i}>×10^{i} ({c.name})</option>)}</select></div>
                <div><label className="block font-mono text-text-muted mb-1">Tolerance</label><select value={tolIndex} onChange={(e) => setTolIndex(parseInt(e.target.value))} className="w-full bg-surface border border-border rounded p-1.5 font-mono text-text-primary focus:outline-none focus:border-amber-400">{TOLERANCE_COLORS.map((c, i) => <option key={i} value={i}>±{c.tolerance}% ({c.name})</option>)}</select></div>
              </div>
            </Card>
          </div>
          <div className="lg:col-span-5" />
        </div>
      )}

      {/* ═══ DECIBEL ═══ */}
      {activeTab === 'decibel' && (
        <Card className="p-5 max-w-xl">
          <h3 className="text-sm font-semibold font-mono text-text-primary uppercase tracking-wider mb-4">Decibel (dB) Gain Calculator</h3>
          <div className="space-y-4">
            <NumericInput label="Input Voltage V1 (V)" value={v1} onChange={setV1} min={0.01} step={0.1} />
            <NumericInput label="Output Voltage V2 (V)" value={v2} onChange={setV2} min={0.01} step={0.1} />
            <div className="p-4 rounded-xl bg-surface-elevated border border-border text-center mt-4">
              <div className="text-xs font-mono text-text-muted">Voltage Gain:</div>
              <div className="text-3xl font-bold font-mono text-accent-cyan mt-1">{dbGain} dB</div>
              <div className="text-xs font-mono text-text-muted mt-1">Linear Ratio: {vRatio.toFixed(2)}×</div>
            </div>
          </div>
          <div className="mt-4 p-3 rounded-lg bg-surface border border-border text-center">
            <MathematicalFormula formula="A_v = 20 \cdot \log_{10}\left(\frac{V_2}{V_1}\right) \text{ dB}" block />
          </div>
        </Card>
      )}

      {/* ═══ VOLTAGE & CURRENT DIVIDERS ═══ */}
      {activeTab === 'dividers' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-5">
            <h3 className="text-sm font-semibold font-mono text-text-primary uppercase tracking-wider mb-4">Voltage Divider</h3>
            <div className="space-y-4">
              <Slider label="Input Voltage (Vin)" value={vdVin} min={1} max={48} step={0.5} unit="V" onChange={setVdVin} formatValue={(v) => `${v.toFixed(1)} V`} />
              <Slider label="R1 (top)" value={vdR1} min={100} max={100000} step={100} unit="Ω" onChange={setVdR1} formatValue={(r) => formatResistance(r)} />
              <Slider label="R2 (bottom)" value={vdR2} min={100} max={100000} step={100} unit="Ω" onChange={setVdR2} formatValue={(r) => formatResistance(r)} />
            </div>
            <div className="mt-4 p-4 rounded-xl bg-surface-elevated border border-amber-500/30 text-center">
              <div className="text-xs font-mono text-text-muted">Output Voltage (Vout):</div>
              <div className="text-3xl font-bold font-mono text-amber-400 mt-1">{formatVoltage(vdVout)}</div>
              <div className="text-xs font-mono text-text-muted mt-1">Current: {formatCurrent(vdCurrent)}</div>
            </div>
            <div className="mt-3 p-3 rounded-lg bg-surface border border-border text-center">
              <MathematicalFormula formula="V_{out} = V_{in} \cdot \frac{R_2}{R_1 + R_2}" block />
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="text-sm font-semibold font-mono text-text-primary uppercase tracking-wider mb-4">Current Divider</h3>
            <div className="space-y-4">
              <Slider label="Total Current (Itotal)" value={cdItotal * 1000} min={0.1} max={100} step={0.1} unit="mA" onChange={(v) => setCdItotal(v / 1000)} formatValue={(i) => `${i.toFixed(1)} mA`} />
              <Slider label="R1" value={cdR1} min={100} max={50000} step={100} unit="Ω" onChange={setCdR1} formatValue={(r) => formatResistance(r)} />
              <Slider label="R2" value={cdR2} min={100} max={50000} step={100} unit="Ω" onChange={setCdR2} formatValue={(r) => formatResistance(r)} />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-surface-elevated border border-border text-center">
                <div className="text-xs font-mono text-text-muted">I₁ through R₁:</div>
                <div className="text-xl font-bold font-mono text-accent-cyan mt-1">{formatCurrent(cdI1)}</div>
              </div>
              <div className="p-3 rounded-xl bg-surface-elevated border border-border text-center">
                <div className="text-xs font-mono text-text-muted">I₂ through R₂:</div>
                <div className="text-xl font-bold font-mono text-accent-blue mt-1">{formatCurrent(cdI2)}</div>
              </div>
            </div>
            <div className="mt-3 p-3 rounded-lg bg-surface border border-border text-center">
              <MathematicalFormula formula="I_1 = I_T \cdot \frac{R_2}{R_1 + R_2}" block />
            </div>
          </Card>
        </div>
      )}

      {/* ═══ SERIES/PARALLEL R/C/L ═══ */}
      {activeTab === 'passives' && (
        <Card className="p-5 max-w-2xl">
          <h3 className="text-sm font-semibold font-mono text-text-primary uppercase tracking-wider mb-4">Series / Parallel R, C, L Calculator</h3>
          <div className="flex gap-2 mb-4">
            {(['resistor', 'capacitor', 'inductor'] as const).map((t) => (
              <button key={t} onClick={() => setPassiveType(t)} className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all capitalize ${passiveType === t ? 'bg-amber-500/20 text-amber-400 border border-amber-500/50' : 'bg-surface-elevated text-text-secondary border border-border'}`}>{t}</button>
            ))}
          </div>
          <div className="flex gap-2 mb-4">
            {(['series', 'parallel'] as const).map((m) => (
              <button key={m} onClick={() => setPassiveMode(m)} className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all capitalize ${passiveMode === m ? 'bg-accent-blue/20 text-accent-blue border border-accent-blue/50' : 'bg-surface-elevated text-text-secondary border border-border'}`}>{m}</button>
            ))}
          </div>

          <div className="space-y-2 mb-4">
            {passiveValues.map((val, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-xs font-mono text-text-muted w-6">{passiveType === 'resistor' ? 'R' : passiveType === 'capacitor' ? 'C' : 'L'}{i + 1}:</span>
                <input type="number" value={val} onChange={(e) => { const updated = [...passiveValues]; updated[i] = parseFloat(e.target.value) || 0; setPassiveValues(updated); }} className="flex-1 bg-surface-elevated border border-border rounded px-2 py-1.5 text-xs font-mono text-text-primary" />
                <span className="text-xs font-mono text-text-muted w-6">{passiveType === 'resistor' ? 'Ω' : passiveType === 'capacitor' ? 'F' : 'H'}</span>
                {passiveValues.length > 2 && <button onClick={() => setPassiveValues(passiveValues.filter((_, j) => j !== i))} className="text-zinc-500 hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>}
              </div>
            ))}
          </div>
          <Button variant="ghost" size="sm" onClick={() => setPassiveValues([...passiveValues, 1000])} className="text-xs font-mono gap-1"><Plus className="w-3 h-3" />Add Component</Button>

          <div className="mt-4 p-4 rounded-xl bg-surface-elevated border border-amber-500/30 text-center">
            <div className="text-xs font-mono text-text-muted">Equivalent {passiveMode === 'series' ? 'Series' : 'Parallel'} Value:</div>
            <div className="text-3xl font-bold font-mono text-amber-400 mt-1">
              {passiveType === 'resistor' ? formatResistance(passiveResult) : passiveType === 'capacitor' ? formatCapacitance(passiveResult) : formatInductance(passiveResult)}
            </div>
          </div>
        </Card>
      )}

      {/* ═══ RC/RL FILTER ═══ */}
      {activeTab === 'filters' && (
        <Card className="p-5 max-w-xl">
          <h3 className="text-sm font-semibold font-mono text-text-primary uppercase tracking-wider mb-4">Low-Pass Filter Cutoff Calculator</h3>
          <div className="flex gap-2 mb-4">
            {(['rc', 'rl'] as const).map((t) => (
              <button key={t} onClick={() => setFilterType(t)} className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold uppercase transition-all ${filterType === t ? 'bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/50' : 'bg-surface-elevated text-text-secondary border border-border'}`}>{t} Filter</button>
            ))}
          </div>
          <div className="space-y-5">
            <Slider label="Resistance (R)" value={filterR} min={100} max={100000} step={100} unit="Ω" onChange={setFilterR} formatValue={(r) => formatResistance(r)} />
            {filterType === 'rc' && <Slider label="Capacitance (C)" value={filterC * 1e9} min={1} max={10000} step={1} unit="nF" onChange={(v) => setFilterC(v * 1e-9)} formatValue={(c) => `${c.toFixed(0)} nF`} />}
            {filterType === 'rl' && <Slider label="Inductance (L)" value={filterL * 1000} min={0.1} max={100} step={0.1} unit="mH" onChange={(v) => setFilterL(v / 1000)} formatValue={(l) => `${l.toFixed(1)} mH`} />}
          </div>
          <div className="mt-4 p-4 rounded-xl bg-surface-elevated border border-accent-cyan/30 text-center">
            <div className="text-xs font-mono text-text-muted">Cutoff Frequency (−3 dB):</div>
            <div className="text-3xl font-bold font-mono text-accent-cyan mt-1">{formatFrequency(filterFc)}</div>
          </div>
          <div className="mt-3 p-3 rounded-lg bg-surface border border-border text-center">
            {filterType === 'rc' ? <MathematicalFormula formula="f_c = \frac{1}{2\pi RC}" block /> : <MathematicalFormula formula="f_c = \frac{R}{2\pi L}" block />}
          </div>
        </Card>
      )}

      {/* ═══ OP-AMP ═══ */}
      {activeTab === 'opamp' && (
        <Card className="p-5 max-w-xl">
          <h3 className="text-sm font-semibold font-mono text-text-primary uppercase tracking-wider mb-4">Op-Amp Gain Calculator</h3>
          <div className="flex gap-2 mb-4">
            {(['inverting', 'noninverting'] as const).map((m) => (
              <button key={m} onClick={() => setOpampMode(m)} className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold capitalize transition-all ${opampMode === m ? 'bg-purple-500/20 text-purple-400 border border-purple-500/50' : 'bg-surface-elevated text-text-secondary border border-border'}`}>{m.replace('non', 'Non-')}</button>
            ))}
          </div>
          <div className="space-y-5">
            <Slider label="Feedback Resistor (Rf)" value={opampRf} min={100} max={100000} step={100} unit="Ω" onChange={setOpampRf} formatValue={(r) => formatResistance(r)} />
            <Slider label="Input Resistor (Rin)" value={opampRin} min={100} max={100000} step={100} unit="Ω" onChange={setOpampRin} formatValue={(r) => formatResistance(r)} />
            <Slider label="Input Voltage (Vin)" value={opampVin} min={-5} max={5} step={0.1} unit="V" onChange={setOpampVin} formatValue={(v) => `${v.toFixed(1)} V`} />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-surface-elevated border border-border text-center">
              <div className="text-xs font-mono text-text-muted">Voltage Gain (Av):</div>
              <div className="text-2xl font-bold font-mono text-purple-400 mt-1">{opampGain.toFixed(2)}×</div>
            </div>
            <div className="p-3 rounded-xl bg-surface-elevated border border-border text-center">
              <div className="text-xs font-mono text-text-muted">Output Voltage:</div>
              <div className="text-2xl font-bold font-mono text-accent-cyan mt-1">{formatVoltage(opampVout)}</div>
            </div>
          </div>
          <div className="mt-3 p-3 rounded-lg bg-surface border border-border text-center">
            {opampMode === 'inverting'
              ? <MathematicalFormula formula="A_v = -\frac{R_f}{R_{in}}, \quad V_{out} = -\frac{R_f}{R_{in}} \cdot V_{in}" block />
              : <MathematicalFormula formula="A_v = 1 + \frac{R_f}{R_{in}}, \quad V_{out} = \left(1 + \frac{R_f}{R_{in}}\right) \cdot V_{in}" block />}
          </div>
        </Card>
      )}

      {/* ═══ COMPLEX NUMBER CALCULATOR ═══ */}
      {activeTab === 'complex' && (
        <Card className="p-5 max-w-2xl">
          <h3 className="text-sm font-semibold font-mono text-text-primary uppercase tracking-wider mb-4">Complex Number Calculator</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end mb-4">
            <div>
              <label className="text-xs font-mono text-text-muted block mb-1">Complex A</label>
              <div className="flex gap-2">
                <input type="number" value={cplxAr} onChange={(e) => setCplxAr(parseFloat(e.target.value) || 0)} className="w-full bg-surface-elevated border border-border rounded px-2 py-1.5 text-xs font-mono text-text-primary" placeholder="Real" />
                <span className="text-text-muted self-center font-mono text-xs">+</span>
                <input type="number" value={cplxAi} onChange={(e) => setCplxAi(parseFloat(e.target.value) || 0)} className="w-full bg-surface-elevated border border-border rounded px-2 py-1.5 text-xs font-mono text-text-primary" placeholder="Imag" />
                <span className="text-text-muted self-center font-mono text-xs">j</span>
              </div>
            </div>
            <div className="flex justify-center">
              <div className="grid grid-cols-4 gap-1">
                {(['+', '-', '×', '÷'] as const).map((op) => (
                  <button key={op} onClick={() => setCplxOperation(op)} className={`w-8 h-8 rounded text-sm font-mono font-bold transition-all ${cplxOperation === op ? 'bg-accent-blue text-white' : 'bg-surface-elevated text-text-secondary border border-border'}`}>{op}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-mono text-text-muted block mb-1">Complex B</label>
              <div className="flex gap-2">
                <input type="number" value={cplxBr} onChange={(e) => setCplxBr(parseFloat(e.target.value) || 0)} className="w-full bg-surface-elevated border border-border rounded px-2 py-1.5 text-xs font-mono text-text-primary" placeholder="Real" />
                <span className="text-text-muted self-center font-mono text-xs">+</span>
                <input type="number" value={cplxBi} onChange={(e) => setCplxBi(parseFloat(e.target.value) || 0)} className="w-full bg-surface-elevated border border-border rounded px-2 py-1.5 text-xs font-mono text-text-primary" placeholder="Imag" />
                <span className="text-text-muted self-center font-mono text-xs">j</span>
              </div>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-surface-elevated border border-accent-blue/30 text-center">
            <div className="text-xs font-mono text-text-muted">Result (Rectangular):</div>
            <div className="text-2xl font-bold font-mono text-accent-blue mt-1">
              {isNaN(cplxResult.r) ? 'Undefined (÷ 0)' : `${cplxResult.r.toFixed(3)} ${cplxResult.i >= 0 ? '+' : '−'} j${Math.abs(cplxResult.i).toFixed(3)}`}
            </div>
            <div className="text-xs font-mono text-text-muted mt-2">Polar: |Z| = {cplxMag.toFixed(3)}, ∠ = {cplxAngle.toFixed(2)}°</div>
          </div>
        </Card>
      )}

      {/* ═══ CAPACITOR CODE CALCULATOR ═══ */}
      {activeTab === 'capacitor' && <CapacitorCodeCalculator />}

      {/* ═══ BJT BIAS CALCULATOR ═══ */}
      {activeTab === 'bjt' && <BjtBiasCalculator />}

      {/* ═══ MOSFET CHARACTERISTICS CALCULATOR ═══ */}
      {activeTab === 'mosfet' && <MosfetCalculator />}

      {/* ═══ SCIENTIFIC CALCULATOR ═══ */}
      {activeTab === 'scientific' && <ScientificCalculator />}

      {/* ═══ MATRIX CALCULATOR ═══ */}
      {activeTab === 'matrix' && <MatrixCalculator />}

      {/* ═══ LAPLACE & FOURIER TRANSFORMS ═══ */}
      {activeTab === 'transforms' && <TransformExplorer />}
    </div>
  );
};

// ── Helper ──
const NumericInput: React.FC<{ label: string; value: number; onChange: (v: number) => void; min?: number; step?: number }> = ({ label, value, onChange, min = 0, step = 1 }) => (
  <div>
    <label className="block text-xs font-mono text-text-muted mb-1">{label}</label>
    <input type="number" step={step} min={min} value={value} onChange={(e) => onChange(parseFloat(e.target.value) || min)} className="w-full bg-surface-elevated border border-border rounded-lg px-3 py-2 text-sm font-mono text-text-primary" />
  </div>
);
