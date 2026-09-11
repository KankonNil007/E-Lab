import React, { useState, useMemo } from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Slider } from '../../components/ui/Slider';
import { MathematicalFormula } from '../../components/common/MathematicalFormula';
import { Cpu, Activity, Zap, CheckCircle2, AlertTriangle, ShieldAlert } from 'lucide-react';
import {
  calculateMosfetOperatingPoint,
  generateMosfetOutputCurves,
  generatePinchOffLocus,
  type MosfetType,
} from '../../lib/simulation/circuits/mosfet';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceDot,
} from 'recharts';

export const MosfetCalculator: React.FC = () => {
  const [type, setType] = useState<MosfetType>('NMOS');
  const [vgs, setVgs] = useState<number>(3.0); // V
  const [vds, setVds] = useState<number>(4.0); // V
  const [vth, setVth] = useState<number>(1.2); // V
  const [kn, setKn] = useState<number>(1.0);   // mA/V^2
  const [lambda, setLambda] = useState<number>(0.02); // 1/V

  // Calculate current operating point
  const op = useMemo(() => {
    return calculateMosfetOperatingPoint({
      type,
      vgs,
      vds,
      vth,
      kn,
      lambda,
    });
  }, [type, vgs, vds, vth, kn, lambda]);

  // Generate output characteristic curves (Id vs Vds) for multiple Vgs traces
  const vgsValues = useMemo(() => [1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0], []);
  const traces = useMemo(() => {
    return generateMosfetOutputCurves({ type, vth, kn, lambda }, vgsValues, 10, 40);
  }, [type, vth, kn, lambda, vgsValues]);

  // Combined chart data
  const chartData = useMemo(() => {
    const numPoints = 40;
    const maxVds = 10;
    const pinchOffPoints = generatePinchOffLocus({ type, vth, kn, lambda }, maxVds, numPoints);

    const rows: Record<string, number | null>[] = [];
    for (let i = 0; i <= numPoints; i++) {
      const vdsVal = Number(((i / numPoints) * maxVds).toFixed(2));
      const row: Record<string, number | null> = { vds: vdsVal };

      // Add traces for each Vgs
      traces.forEach((trace) => {
        const pt = trace.data.find((p) => Math.abs(p.vds - vdsVal) < 0.15) || trace.data[i];
        if (pt) {
          row[`vgs_${trace.vgs}`] = pt.id;
        }
      });

      // Add pinch-off boundary
      const po = pinchOffPoints.find((p) => Math.abs(p.vds - vdsVal) < 0.15) || pinchOffPoints[i];
      if (po && po.vds <= 10) {
        row['pinchOff'] = po.id;
      }

      rows.push(row);
    }
    return rows;
  }, [traces, type, vth, kn, lambda]);

  const regionBadge = () => {
    switch (op.region) {
      case 'Saturation':
        return (
          <Badge variant="success" className="gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> SATURATION / ACTIVE REGION
          </Badge>
        );
      case 'Triode':
        return (
          <Badge variant="warning" className="gap-1">
            <AlertTriangle className="w-3.5 h-3.5" /> TRIODE / LINEAR / OHMIC REGION
          </Badge>
        );
      case 'Cutoff':
        return (
          <Badge variant="error" className="gap-1">
            <ShieldAlert className="w-3.5 h-3.5" /> CUTOFF REGION (SUB-THRESHOLD)
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Type Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-surface-elevated border border-border">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 mb-1">
            <Cpu className="w-3.5 h-3.5" />
            <span>ELECTRONICS • SEMICONDUCTOR PHYSICS</span>
          </div>
          <h2 className="text-lg font-bold text-text-primary">MOSFET Characteristics & Operating Point</h2>
          <p className="text-xs text-text-muted">
            Analyze N-Channel & P-Channel Enhancement MOSFET DC transfer and output I-V curves.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {(['NMOS', 'PMOS'] as MosfetType[]).map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`px-4 py-2 rounded-lg text-xs font-mono font-semibold transition-all ${
                type === t
                  ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/25'
                  : 'bg-surface text-text-muted hover:text-text-primary border border-border'
              }`}
            >
              {t} Enhancement
            </button>
          ))}
        </div>
      </div>

      {/* Region Status Banner */}
      <div className="p-4 rounded-xl bg-surface border border-border flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="text-xs font-mono text-text-muted uppercase">Operating State:</div>
          {regionBadge()}
        </div>
        <div className="text-xs font-mono text-text-muted">
          Overdrive Voltage <span className="text-text-primary font-bold">Vov = {op.vov.toFixed(2)} V</span> |{' '}
          Vds,sat = <span className="text-text-primary font-bold">{op.vdsSat.toFixed(2)} V</span>
        </div>
      </div>

      {/* Main Grid: Controls + Graphs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sliders Panel */}
        <Card className="p-4 sm:p-6 lg:col-span-4 space-y-5">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <span className="text-xs font-mono text-text-muted uppercase">DC Bias Controls</span>
            <Badge variant="outline">
              Level 1 SPICE Model
            </Badge>
          </div>

          <Slider
            label="Gate-Source Voltage (Vgs)"
            unit=" V"
            value={vgs}
            min={0}
            max={6.0}
            step={0.1}
            onChange={setVgs}
          />

          <Slider
            label="Drain-Source Voltage (Vds)"
            unit=" V"
            value={vds}
            min={0}
            max={10.0}
            step={0.1}
            onChange={setVds}
          />

          <Slider
            label="Threshold Voltage (Vth)"
            unit=" V"
            value={vth}
            min={0.5}
            max={3.0}
            step={0.1}
            onChange={setVth}
          />

          <Slider
            label="Conduction Param (kn = 0.5·μ·Cox·W/L)"
            unit=" mA/V²"
            value={kn}
            min={0.2}
            max={4.0}
            step={0.1}
            onChange={setKn}
          />

          <Slider
            label="Channel Modulation (λ)"
            unit=" V⁻¹"
            value={lambda}
            min={0}
            max={0.1}
            step={0.005}
            onChange={setLambda}
          />

          {/* Quick Info */}
          <div className="p-3 rounded-lg bg-surface border border-border text-xs text-text-muted space-y-1">
            <div className="font-semibold text-text-primary">Pinch-Off Condition:</div>
            <div>
              {op.vds < op.vov
                ? `Vds (${op.vds.toFixed(2)}V) < Vgs - Vth (${op.vov.toFixed(2)}V) → Inversion channel continuous from source to drain.`
                : `Vds (${op.vds.toFixed(2)}V) ≥ Vgs - Vth (${op.vov.toFixed(2)}V) → Inversion channel pinched off at drain side.`}
            </div>
          </div>
        </Card>

        {/* Dynamic Readouts & I-V Chart */}
        <div className="lg:col-span-8 space-y-6">
          {/* Readout Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
            <div className="p-3 rounded-xl bg-surface-elevated border border-border text-center min-w-0">
              <div className="text-[10px] font-mono text-text-muted uppercase truncate">Drain Current (Id)</div>
              <div className="text-xl font-mono font-bold text-cyan-400 mt-1 truncate">{op.id.toFixed(3)} mA</div>
            </div>
            <div className="p-3 rounded-xl bg-surface-elevated border border-border text-center min-w-0">
              <div className="text-[10px] font-mono text-text-muted uppercase truncate">Transconductance (gm)</div>
              <div className="text-xl font-mono font-bold text-emerald-400 mt-1 truncate">{op.gm.toFixed(3)} mS</div>
            </div>
            <div className="p-3 rounded-xl bg-surface-elevated border border-border text-center min-w-0">
              <div className="text-[10px] font-mono text-text-muted uppercase truncate">Output Res (ro)</div>
              <div className="text-xl font-mono font-bold text-purple-400 mt-1 truncate">
                {op.ro > 5000 ? '∞' : `${op.ro.toFixed(1)} kΩ`}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-surface-elevated border border-border text-center min-w-0">
              <div className="text-[10px] font-mono text-text-muted uppercase truncate">Power Diss (Pd)</div>
              <div className="text-xl font-mono font-bold text-amber-400 mt-1 truncate">{op.powerDissipation.toFixed(2)} mW</div>
            </div>
          </div>

          {/* I-V Characteristic Curve */}
          <Card className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400 shrink-0" />
                <h3 className="text-sm font-semibold text-text-primary">Output Characteristics (Id vs Vds)</h3>
              </div>
              <div className="text-xs font-mono text-text-muted">
                Dashed Red: Pinch-off Locus (<span className="text-red-400">Vds = Vgs - Vth</span>)
              </div>
            </div>

            <p className="text-xs text-text-muted mb-4">
              Family of drain current curves across gate voltages from 1.5 V to 5.0 V. The cyan dot marks your active
              bias Q-point.
            </p>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 15, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" opacity={0.6} />
                  <XAxis
                    dataKey="vds"
                    stroke="#71717a"
                    fontSize={10}
                    tickFormatter={(v) => `${v}V`}
                    label={{ value: 'Drain-Source Voltage Vds (V)', position: 'insideBottom', offset: -2, fill: '#71717a', fontSize: 10 }}
                  />
                  <YAxis
                    stroke="#71717a"
                    fontSize={10}
                    tickFormatter={(v) => `${v}mA`}
                    label={{ value: 'Drain Current Id (mA)', angle: -90, position: 'insideLeft', fill: '#71717a', fontSize: 10 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#18181b',
                      borderColor: '#27272a',
                      borderRadius: '8px',
                      fontSize: '11px',
                      fontFamily: 'monospace',
                    }}
                  />

                  {/* Vgs traces */}
                  <Line type="monotone" dataKey="vgs_2" stroke="#3b82f6" strokeWidth={1} dot={false} isAnimationActive={false} name="Vgs=2.0V" />
                  <Line type="monotone" dataKey="vgs_2.5" stroke="#06b6d4" strokeWidth={1} dot={false} isAnimationActive={false} name="Vgs=2.5V" />
                  <Line type="monotone" dataKey="vgs_3" stroke="#10b981" strokeWidth={1.2} dot={false} isAnimationActive={false} name="Vgs=3.0V" />
                  <Line type="monotone" dataKey="vgs_3.5" stroke="#84cc16" strokeWidth={1.2} dot={false} isAnimationActive={false} name="Vgs=3.5V" />
                  <Line type="monotone" dataKey="vgs_4" stroke="#eab308" strokeWidth={1.2} dot={false} isAnimationActive={false} name="Vgs=4.0V" />
                  <Line type="monotone" dataKey="vgs_4.5" stroke="#f97316" strokeWidth={1.5} dot={false} isAnimationActive={false} name="Vgs=4.5V" />
                  <Line type="monotone" dataKey="vgs_5" stroke="#a855f7" strokeWidth={1.5} dot={false} isAnimationActive={false} name="Vgs=5.0V" />

                  {/* Parabolic Pinch-off locus */}
                  <Line
                    type="monotone"
                    dataKey="pinchOff"
                    stroke="#ef4444"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    dot={false}
                    name="Pinch-off Locus"
                    isAnimationActive={false}
                  />

                  {/* Q-point marker */}
                  <ReferenceDot
                    x={op.vds}
                    y={op.id}
                    r={6}
                    fill="#06b6d4"
                    stroke="#ffffff"
                    strokeWidth={2}
                    isFront
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Theoretical Formulas */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-semibold text-text-primary">Governing Equations & Physics</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-lg bg-surface border border-border">
                <span className="font-semibold text-text-primary block mb-1">Triode Region (Vds &lt; Vgs - Vth):</span>
                <MathematicalFormula formula="I_D = k_n \left[ 2(V_{GS} - V_{TH})V_{DS} - V_{DS}^2 \right](1 + \lambda V_{DS})" />
                <p className="mt-2 text-text-muted text-[11px]">
                  Acts as a voltage-controlled resistor with resistance controlled by gate-source potential.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-surface border border-border">
                <span className="font-semibold text-text-primary block mb-1">Saturation Region (Vds ≥ Vgs - Vth):</span>
                <MathematicalFormula formula="I_D = k_n (V_{GS} - V_{TH})^2 (1 + \lambda V_{DS}), \quad g_m = 2 k_n (V_{GS} - V_{TH})" />
                <p className="mt-2 text-text-muted text-[11px]">
                  Current saturates and becomes largely independent of Vds; operates as a voltage-controlled current source for amplification.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
