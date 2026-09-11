import React, { useState, useMemo, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { MathematicalFormula } from '../../components/common/MathematicalFormula';
import { Cpu, Bookmark, Lightbulb, RotateCcw } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { evaluateGate, generateTruthTable, getGateFormula, type GateType } from '../../lib/simulation/digital/gates';
import { evaluateFlipFlop, generateTimingDiagram, getDefaultInputSequence, type FlipFlopType } from '../../lib/simulation/digital/flipflops';
import { DigitalCircuitBuilder } from './DigitalCircuitBuilder';
import { DigitalCounter } from './DigitalCounter';

type DigitalTab = 'gates' | 'builder' | 'flipflops' | 'timing' | 'counter';

export const DigitalLabPage: React.FC = () => {
  const { markExperimentCompleted, addRecentExperiment } = useAppStore();
  const { subId } = useParams<{ subId?: string }>();

  const getInitialTab = (): DigitalTab => {
    if (subId === 'builder' || subId === 'circuit-builder') return 'builder';
    if (subId === 'flipflops' || subId === 'flip-flops') return 'flipflops';
    if (subId === 'timing' || subId === 'timing-diagrams') return 'timing';
    if (subId === 'counter' || subId === 'binary-counter') return 'counter';
    return 'gates';
  };

  const [activeTab, setActiveTab] = useState<DigitalTab>(getInitialTab());

  useEffect(() => {
    if (subId) {
      if (subId === 'builder' || subId === 'circuit-builder') setActiveTab('builder');
      else if (subId === 'flipflops' || subId === 'flip-flops') setActiveTab('flipflops');
      else if (subId === 'timing' || subId === 'timing-diagrams') setActiveTab('timing');
      else if (subId === 'counter' || subId === 'binary-counter') setActiveTab('counter');
      else if (subId === 'gates' || subId === 'logic-gates') setActiveTab('gates');
    }
  }, [subId]);

  // ── GATES STATE ──
  const [gate, setGate] = useState<GateType>('AND');
  const [inputA, setInputA] = useState(false);
  const [inputB, setInputB] = useState(false);

  const gateOutput = useMemo(() => evaluateGate(gate, inputA, inputB), [gate, inputA, inputB]);
  const truthTableRows = useMemo(() => generateTruthTable(gate), [gate]);
  const booleanFormula = useMemo(() => getGateFormula(gate), [gate]);

  // ── FLIP-FLOP STATE ──
  const [ffType, setFfType] = useState<FlipFlopType>('JK');
  const [ffS, setFfS] = useState(false);
  const [ffR, setFfR] = useState(false);
  const [ffD, setFfD] = useState(false);
  const [ffJ, setFfJ] = useState(false);
  const [ffK, setFfK] = useState(false);
  const [ffT, setFfT] = useState(false);
  const [ffQ, setFfQ] = useState(false);

  const ffState = useMemo(() => {
    return evaluateFlipFlop(ffType, { s: ffS, r: ffR, d: ffD, j: ffJ, k: ffK, t: ffT }, ffQ);
  }, [ffType, ffS, ffR, ffD, ffJ, ffK, ffT, ffQ]);

  const handleClockPulse = () => {
    const newState = evaluateFlipFlop(ffType, { s: ffS, r: ffR, d: ffD, j: ffJ, k: ffK, t: ffT }, ffQ);
    setFfQ(newState.q);
  };

  // ── TIMING DIAGRAM STATE ──
  const [timingFfType, setTimingFfType] = useState<FlipFlopType>('JK');
  const timingData = useMemo(() => {
    const seq = getDefaultInputSequence(timingFfType, 8);
    return generateTimingDiagram(timingFfType, seq);
  }, [timingFfType]);

  // ── HANDLERS ──
  const handleSaveGates = () => {
    markExperimentCompleted('logic-gates');
    addRecentExperiment({ experimentId: 'logic-gates', title: `${gate} Logic Gate Simulator`, labName: 'Digital Electronics', route: '/digital', summary: `A=${inputA ? 1 : 0}, B=${inputB ? 1 : 0} -> Y=${gateOutput ? 1 : 0}` });
  };

  const tabs = [
    { key: 'gates' as const, label: 'Logic Gates' },
    { key: 'builder' as const, label: 'Circuit Builder' },
    { key: 'flipflops' as const, label: 'Flip-Flops' },
    { key: 'timing' as const, label: 'Timing Diagram' },
    { key: 'counter' as const, label: 'Binary Counter' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 mb-1">
            <Cpu className="w-3.5 h-3.5" /><span>DIGITAL ELECTRONICS • MODULE 03</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">Digital Logic & Sequential Circuits</h1>
          <p className="text-xs sm:text-sm text-text-muted mt-1">Test Boolean operators, gate primitives, flip-flops, and timing verification.</p>
        </div>
        <div className="flex items-center gap-1.5 p-1 rounded-lg bg-surface-elevated border border-border w-full sm:w-auto max-w-full overflow-x-auto scrollbar-none shrink-0">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`px-3 py-1.5 rounded-md text-xs font-mono font-medium transition-all shrink-0 ${
                activeTab === tab.key
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ═══ CIRCUIT BUILDER TAB ═══ */}
      {activeTab === 'builder' && (
        <DigitalCircuitBuilder />
      )}

      {/* ═══ LOGIC GATES TAB ═══ */}
      {activeTab === 'gates' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 space-y-6">
            <Card className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold font-mono text-text-primary uppercase tracking-wider">Select Logic Gate</h3>
                <div className="flex items-center gap-2">
                  <Badge variant="success">TTL 74LS SERIES</Badge>
                  <Button variant="secondary" size="sm" onClick={handleSaveGates}><Bookmark className="w-3.5 h-3.5 text-emerald-400 mr-1" />Save</Button>
                </div>
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5 mb-6">
                {(['AND', 'OR', 'NOT', 'NAND', 'NOR', 'XOR', 'XNOR'] as GateType[]).map((g) => (
                  <button key={g} onClick={() => setGate(g)} className={`py-2 px-1 text-center rounded-lg text-xs font-mono font-semibold transition-all ${gate === g ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-sm' : 'bg-surface-elevated text-text-secondary hover:text-text-primary border border-border'}`}>{g}</button>
                ))}
              </div>

              <div className="p-4 rounded-xl bg-surface-elevated border border-border space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-bold text-text-primary">Input A:</span>
                    <span className={`px-2 py-0.5 rounded font-mono text-xs font-bold ${inputA ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-800 text-zinc-500'}`}>{inputA ? 'HIGH (1)' : 'LOW (0)'}</span>
                  </div>
                  <button type="button" onClick={() => setInputA(!inputA)} className="px-3 py-1 rounded bg-surface border border-border text-xs font-mono hover:bg-zinc-800 transition-colors">Toggle A</button>
                </div>
                {gate !== 'NOT' && (
                  <div className="flex items-center justify-between pt-3 border-t border-border/60">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm font-bold text-text-primary">Input B:</span>
                      <span className={`px-2 py-0.5 rounded font-mono text-xs font-bold ${inputB ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-800 text-zinc-500'}`}>{inputB ? 'HIGH (1)' : 'LOW (0)'}</span>
                    </div>
                    <button type="button" onClick={() => setInputB(!inputB)} className="px-3 py-1 rounded bg-surface border border-border text-xs font-mono hover:bg-zinc-800 transition-colors">Toggle B</button>
                  </div>
                )}
              </div>

              <div className="mt-6 p-4 rounded-xl bg-surface-elevated border border-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full transition-all duration-300 flex items-center justify-center ${gateOutput ? 'bg-emerald-400 shadow-[0_0_20px_#10B981]' : 'bg-zinc-800 border border-zinc-700'}`}>
                    <Lightbulb className={`w-3.5 h-3.5 ${gateOutput ? 'text-zinc-950' : 'text-zinc-600'}`} />
                  </div>
                  <div>
                    <div className="text-xs font-mono text-text-muted">Logic Output Y:</div>
                    <div className="text-lg font-bold font-mono text-text-primary">{gateOutput ? 'HIGH (1)' : 'LOW (0)'}</div>
                  </div>
                </div>
                <Badge variant={gateOutput ? 'success' : 'default'} dot={gateOutput}>{gateOutput ? 'LOGIC 1 / +5V' : 'LOGIC 0 / 0V'}</Badge>
              </div>
            </Card>
          </div>

          <div className="lg:col-span-6 space-y-6">
            <Card className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold font-mono text-text-primary">Active Truth Table for {gate} Gate</h3>
                <span className="text-xs font-mono text-emerald-400">● LIVE STATE ROW HIGHLIGHTED</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-xs border border-border rounded-lg overflow-hidden">
                  <thead className="bg-surface-elevated border-b border-border text-text-muted uppercase text-[10px]">
                    <tr>
                      <th className="p-3">Input A</th>
                      {gate !== 'NOT' && <th className="p-3">Input B</th>}
                      <th className="p-3">Output Y</th>
                      <th className="p-3 text-right">State</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {truthTableRows.map((row, idx) => {
                      const isCurrentState = row.a === inputA && (gate === 'NOT' || row.b === inputB);
                      return (
                        <tr key={idx} className={`transition-colors ${isCurrentState ? 'bg-emerald-500/15 text-emerald-300 font-bold' : 'text-text-secondary hover:bg-surface-elevated/40'}`}>
                          <td className="p-3">{row.a ? '1' : '0'}</td>
                          {gate !== 'NOT' && <td className="p-3">{row.b ? '1' : '0'}</td>}
                          <td className="p-3"><span className={`px-2 py-0.5 rounded ${row.y ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-800 text-zinc-400'}`}>{row.y ? '1' : '0'}</span></td>
                          <td className="p-3 text-right">{isCurrentState && <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 uppercase">Active</span>}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
            <Card className="p-5 bg-surface-elevated/40">
              <div className="text-xs font-mono text-text-muted mb-2 uppercase tracking-wider">Boolean Algebra Expression</div>
              <div className="p-3 rounded-lg bg-surface border border-border text-center">
                <MathematicalFormula formula={booleanFormula} block />
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* ═══ FLIP-FLOPS TAB ═══ */}
      {activeTab === 'flipflops' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 space-y-6">
            <Card className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold font-mono text-text-primary uppercase tracking-wider">Flip-Flop Type</h3>
                <Badge variant="info">Edge-Triggered</Badge>
              </div>
              <div className="grid grid-cols-4 gap-1.5 mb-6">
                {(['SR', 'D', 'JK', 'T'] as FlipFlopType[]).map((type) => (
                  <button key={type} onClick={() => { setFfType(type); setFfQ(false); }} className={`py-2 text-center rounded-lg text-xs font-mono font-semibold transition-all ${ffType === type ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-surface-elevated text-text-secondary border border-border'}`}>{type} Flip-Flop</button>
                ))}
              </div>

              {/* Dynamic Inputs */}
              <div className="p-4 rounded-xl bg-surface-elevated border border-border space-y-3">
                {ffType === 'SR' && (
                  <>
                    <InputToggle label="Set (S)" value={ffS} onToggle={() => setFfS(!ffS)} />
                    <InputToggle label="Reset (R)" value={ffR} onToggle={() => setFfR(!ffR)} />
                  </>
                )}
                {ffType === 'D' && <InputToggle label="Data (D)" value={ffD} onToggle={() => setFfD(!ffD)} />}
                {ffType === 'JK' && (
                  <>
                    <InputToggle label="J" value={ffJ} onToggle={() => setFfJ(!ffJ)} />
                    <InputToggle label="K" value={ffK} onToggle={() => setFfK(!ffK)} />
                  </>
                )}
                {ffType === 'T' && <InputToggle label="Toggle (T)" value={ffT} onToggle={() => setFfT(!ffT)} />}
              </div>

              <div className="mt-4 flex items-center gap-3">
                <Button variant="primary" size="md" onClick={handleClockPulse} className="flex-1 gap-2 font-mono">
                  ↑ Apply Clock Edge (CLK)
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setFfQ(false)}><RotateCcw className="w-3.5 h-3.5" /></Button>
              </div>
            </Card>
          </div>

          <div className="lg:col-span-6 space-y-6">
            <Card className="p-5">
              <h3 className="text-sm font-semibold font-mono text-text-primary mb-4">Output State</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-surface-elevated border border-border text-center">
                  <div className="text-xs font-mono text-text-muted mb-2">Q Output</div>
                  <div className={`w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center transition-all duration-300 ${ffQ ? 'bg-emerald-400 shadow-[0_0_25px_#10B981]' : 'bg-zinc-800 border-2 border-zinc-700'}`}>
                    <span className={`text-lg font-bold font-mono ${ffQ ? 'text-zinc-950' : 'text-zinc-500'}`}>{ffQ ? '1' : '0'}</span>
                  </div>
                  <div className="text-sm font-bold font-mono text-text-primary">{ffQ ? 'HIGH' : 'LOW'}</div>
                </div>
                <div className="p-4 rounded-xl bg-surface-elevated border border-border text-center">
                  <div className="text-xs font-mono text-text-muted mb-2">Q̄ Output</div>
                  <div className={`w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center transition-all duration-300 ${!ffQ ? 'bg-red-400 shadow-[0_0_25px_#EF4444]' : 'bg-zinc-800 border-2 border-zinc-700'}`}>
                    <span className={`text-lg font-bold font-mono ${!ffQ ? 'text-zinc-950' : 'text-zinc-500'}`}>{!ffQ ? '1' : '0'}</span>
                  </div>
                  <div className="text-sm font-bold font-mono text-text-primary">{!ffQ ? 'HIGH' : 'LOW'}</div>
                </div>
              </div>
              {ffState.invalid && (
                <div className="mt-3 p-2 rounded-lg bg-red-500/10 border border-red-500/30 text-xs font-mono text-red-400 text-center">
                  ⚠ INVALID STATE: S=1, R=1 produces indeterminate output
                </div>
              )}
            </Card>

            <Card className="p-5 bg-surface-elevated/40">
              <div className="text-xs font-mono text-text-muted mb-2 uppercase tracking-wider">{ffType} Flip-Flop Characteristic</div>
              <div className="p-3 rounded-lg bg-surface border border-border text-center">
                {ffType === 'SR' && <MathematicalFormula formula="Q^+ = S + \bar{R} \cdot Q, \quad S \cdot R = 0" block />}
                {ffType === 'D' && <MathematicalFormula formula="Q^+ = D" block />}
                {ffType === 'JK' && <MathematicalFormula formula="Q^+ = J\bar{Q} + \bar{K}Q" block />}
                {ffType === 'T' && <MathematicalFormula formula="Q^+ = T \oplus Q = T\bar{Q} + \bar{T}Q" block />}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* ═══ TIMING DIAGRAM TAB ═══ */}
      {activeTab === 'timing' && (
        <div className="space-y-6">
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold font-mono text-text-primary uppercase tracking-wider">Timing Diagram Viewer</h3>
              <div className="flex items-center gap-1.5">
                {(['SR', 'D', 'JK', 'T'] as FlipFlopType[]).map((type) => (
                  <button key={type} onClick={() => setTimingFfType(type)} className={`px-3 py-1.5 rounded-md text-xs font-mono font-medium transition-all ${timingFfType === type ? 'bg-emerald-500 text-white shadow-sm' : 'text-text-muted hover:text-text-primary bg-surface-elevated border border-border'}`}>{type}</button>
                ))}
              </div>
            </div>

            {/* Canvas-style timing diagram */}
            <div className="space-y-1 p-4 rounded-xl bg-surface-elevated border border-border overflow-x-auto">
              {/* CLK */}
              <TimingRow label="CLK" data={timingData.clock} color="#71717a" />
              {/* Input channels */}
              {Object.entries(timingData.inputs).map(([name, values]) => (
                <TimingRow key={name} label={name.toUpperCase()} data={values} color="#3b82f6" />
              ))}
              {/* Q output */}
              <TimingRow label="Q" data={timingData.q} color="#10b981" />
              <TimingRow label="Q̄" data={timingData.qBar} color="#ef4444" />
            </div>

            <p className="text-xs text-text-muted mt-3 font-mono">
              Each column represents one half-clock cycle. Rising edges (LOW→HIGH) trigger state evaluation.
            </p>
          </Card>
        </div>
      )}

      {/* ═══ BINARY COUNTER TAB ═══ */}
      {activeTab === 'counter' && (
        <DigitalCounter
          onSave={() => {
            markExperimentCompleted('digital-counter');
            addRecentExperiment({
              experimentId: 'digital-counter',
              title: '4-Bit Binary & BCD Counter',
              labName: 'Digital Electronics',
              route: '/digital/counter',
              summary: 'Ripple clock frequency division & 7-segment display decoding.',
            });
          }}
        />
      )}
    </div>
  );
};

// ── Helper Components ──

const InputToggle: React.FC<{ label: string; value: boolean; onToggle: () => void }> = ({ label, value, onToggle }) => (
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-3">
      <span className="font-mono text-sm font-bold text-text-primary">{label}:</span>
      <span className={`px-2 py-0.5 rounded font-mono text-xs font-bold ${value ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-800 text-zinc-500'}`}>
        {value ? 'HIGH (1)' : 'LOW (0)'}
      </span>
    </div>
    <button type="button" onClick={onToggle} className="px-3 py-1 rounded bg-surface border border-border text-xs font-mono hover:bg-zinc-800 transition-colors">Toggle</button>
  </div>
);

const TimingRow: React.FC<{ label: string; data: boolean[]; color: string }> = ({ label, data, color }) => {
  const cellW = 40;
  const h = 28;
  const high = 6;
  const low = h - 6;

  return (
    <div className="flex items-center gap-3">
      <span className="w-8 text-right text-[10px] font-mono font-bold text-text-secondary shrink-0">{label}</span>
      <svg width={data.length * cellW} height={h} className="block">
        {data.map((val, i) => {
          const x = i * cellW;
          const y = val ? high : low;
          const prevY = i > 0 ? (data[i - 1] ? high : low) : y;
          return (
            <g key={i}>
              {/* Vertical transition */}
              {i > 0 && prevY !== y && (
                <line x1={x} y1={prevY} x2={x} y2={y} stroke={color} strokeWidth={1.5} />
              )}
              {/* Horizontal hold */}
              <line x1={x} y1={y} x2={x + cellW} y2={y} stroke={color} strokeWidth={1.5} />
            </g>
          );
        })}
      </svg>
    </div>
  );
};
