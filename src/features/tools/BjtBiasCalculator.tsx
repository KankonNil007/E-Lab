import React, { useState, useMemo } from 'react';
import { Card } from '../../components/ui/Card';
import { Slider } from '../../components/ui/Slider';
import { Badge } from '../../components/ui/Badge';
import { MathematicalFormula } from '../../components/common/MathematicalFormula';
import { formatCurrent, formatResistance } from '../../lib/utils';
import { HelpCircle } from 'lucide-react';

export const BjtBiasCalculator: React.FC = () => {
  const [vcc, setVcc] = useState(12.0);
  const [r1, setR1] = useState(33000);   // 33 kΩ
  const [r2, setR2] = useState(10000);   // 10 kΩ
  const [rc, setRc] = useState(2200);    // 2.2 kΩ
  const [re, setRe] = useState(1000);    // 1 kΩ
  const [beta, setBeta] = useState(150); // hFE

  const biasResult = useMemo(() => {
    // Thevenin equivalent at base
    const vth = vcc * (r2 / (r1 + r2));
    const rth = (r1 * r2) / (r1 + r2);

    const vbe = 0.7; // Silicon Vbe

    if (vth < vbe) {
      // Cutoff
      return {
        vth,
        rth,
        vb: vth,
        ve: 0,
        ib: 0,
        ic: 0,
        ie: 0,
        vc: vcc,
        vce: vcc,
        region: 'Cutoff',
        isSaturated: false,
        isCutoff: true,
      };
    }

    // Base current: I_B = (V_th - V_be) / (R_th + (beta + 1) * R_E)
    const ib = (vth - vbe) / (rth + (beta + 1) * re);
    let ic = beta * ib;
    let ie = (beta + 1) * ib;
    let ve = ie * re;
    let vc = vcc - ic * rc;
    let vce = vc - ve;

    // Check for saturation: V_CE(sat) ~ 0.2V
    let isSaturated = false;
    if (vce < 0.2) {
      isSaturated = true;
      vce = 0.2;
      // Saturation collector current
      ic = (vcc - ve - 0.2) / rc;
      vc = ve + 0.2;
    }

    return {
      vth,
      rth,
      vb: ve + vbe,
      ve,
      ib,
      ic,
      ie,
      vc,
      vce,
      region: isSaturated ? 'Saturation' : 'Active Linear',
      isSaturated,
      isCutoff: false,
    };
  }, [vcc, r1, r2, rc, re, beta]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Parameters Panel */}
      <div className="lg:col-span-6 space-y-6">
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold font-mono text-text-primary uppercase tracking-wider">
              Voltage Divider BJT Bias Network (NPN)
            </h3>
            <Badge variant={biasResult.isSaturated ? 'warning' : biasResult.isCutoff ? 'error' : 'success'}>
              {biasResult.region.toUpperCase()}
            </Badge>
          </div>

          <div className="space-y-4">
            <Slider
              label="Supply Voltage (Vcc)"
              value={vcc}
              min={3}
              max={30}
              step={0.5}
              unit="V"
              onChange={setVcc}
              formatValue={v => `${v.toFixed(1)} V`}
            />
            <Slider
              label="Upper Base Resistor (R1)"
              value={r1}
              min={1000}
              max={100000}
              step={1000}
              unit="Ω"
              onChange={setR1}
              formatValue={formatResistance}
            />
            <Slider
              label="Lower Base Resistor (R2)"
              value={r2}
              min={1000}
              max={50000}
              step={500}
              unit="Ω"
              onChange={setR2}
              formatValue={formatResistance}
            />
            <Slider
              label="Collector Resistor (Rc)"
              value={rc}
              min={200}
              max={10000}
              step={100}
              unit="Ω"
              onChange={setRc}
              formatValue={formatResistance}
            />
            <Slider
              label="Emitter Resistor (Re)"
              value={re}
              min={100}
              max={5000}
              step={50}
              unit="Ω"
              onChange={setRe}
              formatValue={formatResistance}
            />
            <Slider
              label="DC Current Gain (β / hFE)"
              value={beta}
              min={50}
              max={400}
              step={10}
              onChange={setBeta}
              formatValue={b => `${b}`}
            />
          </div>
        </Card>
      </div>

      {/* Results and Q-Point Operating Point Panel */}
      <div className="lg:col-span-6 space-y-6">
        <Card className="p-5">
          <h3 className="text-sm font-semibold font-mono text-text-primary uppercase tracking-wider mb-4">
            Quiescent Operating Point (Q-Point)
          </h3>

          <div className="grid grid-cols-2 gap-3 text-xs font-mono mb-4">
            <div className="p-3 rounded-lg bg-surface-elevated border border-border">
              <span className="text-text-muted">Collector Current (Ic):</span>
              <div className="text-xl font-bold text-accent-blue mt-1">
                {formatCurrent(biasResult.ic)}
              </div>
            </div>
            <div className="p-3 rounded-lg bg-surface-elevated border border-border">
              <span className="text-text-muted">Collector-Emitter (Vce):</span>
              <div className="text-xl font-bold text-emerald-400 mt-1">
                {biasResult.vce.toFixed(2)} V
              </div>
            </div>
            <div className="p-3 rounded bg-surface-elevated border border-border">
              <span className="text-text-muted">Base Voltage (Vb):</span>
              <div className="text-sm font-bold text-text-primary mt-0.5">{biasResult.vb.toFixed(2)} V</div>
            </div>
            <div className="p-3 rounded bg-surface-elevated border border-border">
              <span className="text-text-muted">Emitter Voltage (Ve):</span>
              <div className="text-sm font-bold text-text-primary mt-0.5">{biasResult.ve.toFixed(2)} V</div>
            </div>
            <div className="p-3 rounded bg-surface-elevated border border-border">
              <span className="text-text-muted">Collector Voltage (Vc):</span>
              <div className="text-sm font-bold text-text-primary mt-0.5">{biasResult.vc.toFixed(2)} V</div>
            </div>
            <div className="p-3 rounded bg-surface-elevated border border-border">
              <span className="text-text-muted">Base Current (Ib):</span>
              <div className="text-sm font-bold text-text-primary mt-0.5">{formatCurrent(biasResult.ib)}</div>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-surface border border-border text-center space-y-2">
            <div className="text-xs font-mono text-text-muted">DC Load Line Condition:</div>
            <MathematicalFormula
              formula="V_{CE} = V_{CC} - I_C(R_C + R_E), \quad I_{C(\text{sat})} = \frac{V_{CC}}{R_C + R_E}"
              block
            />
          </div>
        </Card>

        <Card className="p-5 bg-surface-elevated/40">
          <div className="flex items-center gap-2 mb-2 text-xs font-mono text-accent-blue">
            <HelpCircle className="w-4 h-4" />
            <span>TRANSISTOR BIASING ANALYSIS</span>
          </div>
          <p className="text-xs text-text-muted leading-relaxed">
            Voltage divider bias provides excellent Q-point stability against temperature variations and transistor beta (β) spreads.
            For linear class-A amplification, design the circuit such that <strong className="text-text-primary">Vce ≈ Vcc / 2</strong>.
          </p>
        </Card>
      </div>
    </div>
  );
};
