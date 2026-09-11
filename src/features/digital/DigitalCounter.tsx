import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Slider } from '../../components/ui/Slider';
import { MathematicalFormula } from '../../components/common/MathematicalFormula';
import { Play, Pause, RotateCcw, Zap, Sparkles, BookOpen } from 'lucide-react';
import {
  getCounterState,
  nextCounterStep,
  generateCounterTiming,
  type CounterMode,
} from '../../lib/simulation/digital/counter';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

interface DigitalCounterProps {
  onSave?: () => void;
}

export const DigitalCounter: React.FC<DigitalCounterProps> = () => {
  const [mode, setMode] = useState<CounterMode>('binary-up');
  const [currentCount, setCurrentCount] = useState<number>(0);
  const [autoRun, setAutoRun] = useState<boolean>(false);
  const [frequency, setFrequency] = useState<number>(1.0); // Hz
  const timerRef = useRef<number | null>(null);

  const state = useMemo(() => getCounterState(currentCount, mode), [currentCount, mode]);

  // Handle manual clock step
  const handlePulse = () => {
    setCurrentCount((prev) => nextCounterStep(prev, mode));
  };

  const handleReset = () => {
    setCurrentCount(0);
  };

  // Auto-clock interval runner
  useEffect(() => {
    if (autoRun) {
      const intervalMs = Math.max(100, Math.round(1000 / frequency));
      timerRef.current = window.setInterval(() => {
        setCurrentCount((prev) => nextCounterStep(prev, mode));
      }, intervalMs);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [autoRun, frequency, mode]);

  // Timing diagram
  const timingData = useMemo(() => {
    const raw = generateCounterTiming(mode, 16);
    return raw.map((step) => ({
      cycle: step.cycle,
      clk: step.clk + 4.5,
      q0: step.q0 + 3.2,
      q1: step.q1 + 2.0,
      q2: step.q2 + 0.9,
      q3: step.q3 - 0.2,
      val: step.decimal,
    }));
  }, [mode]);

  const modes: { id: CounterMode; label: string; desc: string; mod: number }[] = [
    { id: 'binary-up', label: '4-Bit Up Counter', desc: 'Counts 0 to 15 incrementally (Modulo-16)', mod: 16 },
    { id: 'binary-down', label: '4-Bit Down Counter', desc: 'Counts 15 down to 0 decrementally (Modulo-16)', mod: 16 },
    { id: 'bcd-decade', label: 'BCD Decade (0–9)', desc: 'Synchronous Modulo-10 counter with asynchronous reset', mod: 10 },
    { id: 'ring', label: '4-Bit Ring Counter', desc: 'Circulates a single HIGH bit through 4 flip-flops', mod: 4 },
    { id: 'johnson', label: '4-Bit Johnson Counter', desc: 'Twisted ring counter generating 8 distinct states', mod: 8 },
  ];

  const seg = state.sevenSegment;

  return (
    <div className="space-y-6">
      {/* Mode Selector & Main Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-3 sm:p-4 rounded-xl bg-surface-elevated border border-border">
        <div className="flex max-w-full overflow-x-auto scrollbar-none gap-2 pb-1 sm:pb-0 sm:flex-wrap">
          {modes.map((m) => (
            <button
              key={m.id}
              onClick={() => {
                setMode(m.id);
                setCurrentCount(0);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all shrink-0 ${
                mode === m.id
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                  : 'bg-surface text-text-muted hover:text-text-primary border border-border'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            onClick={handlePulse}
            className="gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs"
          >
            <Zap className="w-3.5 h-3.5" />
            Clock Pulse
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => setAutoRun(!autoRun)}
            className={`gap-1.5 font-mono text-xs ${
              autoRun ? 'text-amber-400 border-amber-500/50 bg-amber-500/10' : ''
            }`}
          >
            {autoRun ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            {autoRun ? 'Stop Clock' : 'Auto Run'}
          </Button>

          <Button size="sm" variant="outline" onClick={handleReset} className="gap-1.5 font-mono text-xs">
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </Button>
        </div>
      </div>

      {/* Interactive Display Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Visual LED & 7-Segment Panel */}
        <Card className="p-4 sm:p-6 lg:col-span-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-mono text-text-muted uppercase tracking-wider">Output Visualization</span>
              <Badge variant="success">
                MOD-{modes.find((m) => m.id === mode)?.mod}
              </Badge>
            </div>

            {/* 7-Segment SVG Graphic */}
            <div className="flex justify-center items-center py-4">
              <div className="relative p-6 rounded-2xl bg-zinc-950 border border-zinc-800 shadow-inner flex flex-col items-center">
                <svg width="140" height="200" viewBox="0 0 140 200" className="drop-shadow-lg">
                  {/* Segment A */}
                  <polygon
                    points="25,12 35,2 105,2 115,12 105,22 35,22"
                    fill={seg.a ? '#ef4444' : '#27272a'}
                    filter={seg.a ? 'drop-shadow(0 0 6px #ef4444)' : undefined}
                    className="transition-colors duration-150"
                  />
                  {/* Segment B */}
                  <polygon
                    points="118,15 128,25 128,95 118,105 108,95 108,25"
                    fill={seg.b ? '#ef4444' : '#27272a'}
                    filter={seg.b ? 'drop-shadow(0 0 6px #ef4444)' : undefined}
                    className="transition-colors duration-150"
                  />
                  {/* Segment C */}
                  <polygon
                    points="118,107 128,117 128,187 118,197 108,187 108,117"
                    fill={seg.c ? '#ef4444' : '#27272a'}
                    filter={seg.c ? 'drop-shadow(0 0 6px #ef4444)' : undefined}
                    className="transition-colors duration-150"
                  />
                  {/* Segment D */}
                  <polygon
                    points="25,198 35,188 105,188 115,198 105,208 35,208"
                    fill={seg.d ? '#ef4444' : '#27272a'}
                    filter={seg.d ? 'drop-shadow(0 0 6px #ef4444)' : undefined}
                    className="transition-colors duration-150"
                  />
                  {/* Segment E */}
                  <polygon
                    points="22,107 32,117 32,187 22,197 12,187 12,117"
                    fill={seg.e ? '#ef4444' : '#27272a'}
                    filter={seg.e ? 'drop-shadow(0 0 6px #ef4444)' : undefined}
                    className="transition-colors duration-150"
                  />
                  {/* Segment F */}
                  <polygon
                    points="22,15 32,25 32,95 22,105 12,95 12,25"
                    fill={seg.f ? '#ef4444' : '#27272a'}
                    filter={seg.f ? 'drop-shadow(0 0 6px #ef4444)' : undefined}
                    className="transition-colors duration-150"
                  />
                  {/* Segment G */}
                  <polygon
                    points="25,105 35,95 105,95 115,105 105,115 35,115"
                    fill={seg.g ? '#ef4444' : '#27272a'}
                    filter={seg.g ? 'drop-shadow(0 0 6px #ef4444)' : undefined}
                    className="transition-colors duration-150"
                  />
                  {/* DP */}
                  <circle
                    cx="132"
                    cy="200"
                    r="5"
                    fill={seg.dp ? '#ef4444' : '#27272a'}
                    filter={seg.dp ? 'drop-shadow(0 0 6px #ef4444)' : undefined}
                  />
                </svg>
                <div className="mt-2 text-[10px] font-mono text-text-muted">7-SEGMENT COMMON CATHODE</div>
              </div>
            </div>

            {/* Binary Flip-Flop Bit LEDs */}
            <div className="mt-4 pt-4 border-t border-border">
              <div className="text-xs font-mono text-text-muted mb-3 flex items-center justify-between">
                <span>FLIP-FLOP STATES (Q3 → Q0)</span>
                <span className="text-emerald-400 font-bold">MSB → LSB</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                {[
                  { label: 'Q3 (MSB)', bit: state.bits[0], weight: 8 },
                  { label: 'Q2', bit: state.bits[1], weight: 4 },
                  { label: 'Q1', bit: state.bits[2], weight: 2 },
                  { label: 'Q0 (LSB)', bit: state.bits[3], weight: 1 },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className={`p-2 sm:p-3 rounded-xl border flex flex-col items-center justify-center transition-all ${
                      item.bit
                        ? 'bg-emerald-500/10 border-emerald-500/40 shadow-sm shadow-emerald-500/20'
                        : 'bg-surface border-border'
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full mb-1.5 flex items-center justify-center font-mono text-xs font-bold transition-all ${
                        item.bit
                          ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/50 scale-110'
                          : 'bg-zinc-800 text-zinc-500'
                      }`}
                    >
                      {item.bit ? '1' : '0'}
                    </div>
                    <span className="text-[10px] sm:text-[11px] font-mono font-bold text-text-primary text-center truncate w-full">{item.label}</span>
                    <span className="text-[9px] font-mono text-text-muted">Weight: {item.weight}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Value Readout Metrics */}
          <div className="mt-6 grid grid-cols-3 gap-2 pt-4 border-t border-border">
            <div className="p-2.5 rounded-lg bg-surface border border-border text-center">
              <div className="text-[10px] font-mono text-text-muted">DECIMAL</div>
              <div className="text-xl font-mono font-bold text-emerald-400">{state.count}</div>
            </div>
            <div className="p-2.5 rounded-lg bg-surface border border-border text-center">
              <div className="text-[10px] font-mono text-text-muted">HEXADECIMAL</div>
              <div className="text-xl font-mono font-bold text-cyan-400">0x{state.hex}</div>
            </div>
            <div className="p-2.5 rounded-lg bg-surface border border-border text-center">
              <div className="text-[10px] font-mono text-text-muted">BINARY</div>
              <div className="text-xl font-mono font-bold text-purple-400">
                {state.bits.map((b) => (b ? '1' : '0')).join('')}
              </div>
            </div>
          </div>
        </Card>

        {/* Multi-Channel Timing Waveform & State Table */}
        <div className="lg:col-span-7 space-y-6">
          {/* Timing Diagram */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <h2 className="text-sm font-semibold text-text-primary">Ripple Clock Timing Diagram</h2>
              </div>
              <div className="text-xs font-mono text-text-muted">Frequency Division: f / 2ⁿ</div>
            </div>

            <p className="text-xs text-text-muted mb-4">
              Observe how each subsequent flip-flop divides the incoming clock frequency by 2:
              <span className="text-emerald-400 font-mono ml-1 font-semibold">Q0 = f/2, Q1 = f/4, Q2 = f/8, Q3 = f/16</span>.
            </p>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timingData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" opacity={0.6} />
                  <XAxis dataKey="cycle" stroke="#71717a" fontSize={10} tickFormatter={(v) => `${v}`} />
                  <YAxis domain={[-0.5, 6.0]} ticks={[0.3, 1.4, 2.5, 3.7, 5.0]} stroke="#71717a" fontSize={9} tickFormatter={(v) => {
                    if (v > 4.5) return 'CLK';
                    if (v > 3.0) return 'Q0';
                    if (v > 2.0) return 'Q1';
                    if (v > 1.0) return 'Q2';
                    return 'Q3';
                  }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', fontSize: '11px', fontFamily: 'monospace' }}
                    labelFormatter={(label) => `Cycle: ${label}`}
                  />
                  <Line type="stepAfter" dataKey="clk" stroke="#a1a1aa" strokeWidth={1.5} dot={false} name="CLK" isAnimationActive={false} />
                  <Line type="stepAfter" dataKey="q0" stroke="#10b981" strokeWidth={2} dot={false} name="Q0 (LSB)" isAnimationActive={false} />
                  <Line type="stepAfter" dataKey="q1" stroke="#06b6d4" strokeWidth={2} dot={false} name="Q1" isAnimationActive={false} />
                  <Line type="stepAfter" dataKey="q2" stroke="#8b5cf6" strokeWidth={2} dot={false} name="Q2" isAnimationActive={false} />
                  <Line type="stepAfter" dataKey="q3" stroke="#f59e0b" strokeWidth={2} dot={false} name="Q3 (MSB)" isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Auto Clock Slider */}
            <div className="mt-4 pt-3 border-t border-border flex items-center gap-4">
              <div className="w-full">
                <Slider
                  label="Clock Generator Frequency"
                  unit=" Hz"
                  value={frequency}
                  min={0.2}
                  max={5.0}
                  step={0.1}
                  onChange={setFrequency}
                />
              </div>
            </div>
          </Card>

          {/* Theory & State Table Card */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-semibold text-text-primary">Counter Theory & Characteristic Equations</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-text-muted mb-4">
              <div className="p-3 rounded-lg bg-surface border border-border">
                <span className="font-semibold text-text-primary block mb-1">T-Flip-Flop Toggle Mode:</span>
                <MathematicalFormula formula="Q^+ = T \oplus Q, \quad \text{with } T=1 \implies Q^+ = \bar{Q}" />
                <p className="mt-1 text-[11px]">
                  Each stage in an asynchronous ripple counter has its T or J-K inputs tied HIGH (1), toggling on every active falling clock edge.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-surface border border-border">
                <span className="font-semibold text-text-primary block mb-1">Frequency Division Formula:</span>
                <MathematicalFormula formula="f_{out} = \frac{f_{in}}{2^N}, \quad T_{N} = 2^N \cdot T_{CLK}" />
                <p className="mt-1 text-[11px]">
                  For an N-bit ripple counter, the N-th stage produces a symmetric square wave whose period is multiplied by 2ⁿ.
                </p>
              </div>
            </div>

            {/* Quick State Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs font-mono border-collapse">
                <thead>
                  <tr className="border-b border-border text-text-muted bg-surface/50">
                    <th className="py-2 px-3 text-left">State</th>
                    <th className="py-2 px-3 text-center">Q3 (MSB)</th>
                    <th className="py-2 px-3 text-center">Q2</th>
                    <th className="py-2 px-3 text-center">Q1</th>
                    <th className="py-2 px-3 text-center">Q0 (LSB)</th>
                    <th className="py-2 px-3 text-center">Hex</th>
                    <th className="py-2 px-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: modes.find((m) => m.id === mode)?.mod || 16 }).map((_, idx) => {
                    const rowState = getCounterState(idx, mode);
                    const isActive = rowState.count === state.count;
                    return (
                      <tr
                        key={idx}
                        className={`border-b border-border/50 transition-colors ${
                          isActive
                            ? 'bg-emerald-500/15 font-bold text-emerald-400'
                            : 'hover:bg-surface text-text-muted'
                        }`}
                      >
                        <td className="py-1.5 px-3">{idx}</td>
                        <td className="py-1.5 px-3 text-center">{rowState.bits[0] ? '1' : '0'}</td>
                        <td className="py-1.5 px-3 text-center">{rowState.bits[1] ? '1' : '0'}</td>
                        <td className="py-1.5 px-3 text-center">{rowState.bits[2] ? '1' : '0'}</td>
                        <td className="py-1.5 px-3 text-center">{rowState.bits[3] ? '1' : '0'}</td>
                        <td className="py-1.5 px-3 text-center">0x{rowState.hex}</td>
                        <td className="py-1.5 px-3 text-right">
                          {isActive ? (
                            <Badge variant="success">
                              ACTIVE
                            </Badge>
                          ) : (
                            '—'
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
