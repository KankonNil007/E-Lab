import React, { useState, useMemo } from 'react';
import { Card } from '../../components/ui/Card';
import { Slider } from '../../components/ui/Slider';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { MathematicalFormula } from '../../components/common/MathematicalFormula';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { Sliders, RotateCcw, Zap } from 'lucide-react';

export const BlockDiagramBuilder: React.FC = () => {
  // Controller parameters
  const [kp, setKp] = useState(2.0);
  const [ki, setKi] = useState(0.5);
  // Plant parameters
  const [wn, setWn] = useState(3.0);
  const [zeta, setZeta] = useState(0.6);
  // Feedback gain
  const [hGain, setHGain] = useState(1.0);
  // Input type
  const [inputType, setInputType] = useState<'step' | 'ramp'>('step');

  // Closed loop system analysis
  const systemMetrics = useMemo(() => {
    // Forward controller: C(s) = (Kp * s + Ki) / s
    // Plant: G(s) = wn^2 / (s^2 + 2*zeta*wn*s + wn^2)
    // For feedback H(s) = H:
    // Characteristic poly approx: s^3 + (2*zeta*wn)*s^2 + (wn^2 + H*Kp*wn^2)*s + H*Ki*wn^2
    const a2 = 2 * zeta * wn;
    const a1 = wn * wn + hGain * kp * wn * wn;
    const a0 = hGain * ki * wn * wn;

    // Routh-Hurwitz criterion for 3rd order: a2*a1 > a0 and all a_i > 0
    const isStable = a2 > 0 && a1 > 0 && a0 > 0 && (a2 * a1 > a0);

    // Steady state error for step input:
    // With integral action (Ki > 0), type 1 system has zero steady-state error to step!
    const ess = ki > 0.05 ? 0 : 1 / (1 + kp * hGain);

    return {
      isStable,
      ess: parseFloat(ess.toFixed(3)),
      a2: a2.toFixed(2),
      a1: a1.toFixed(2),
      a0: a0.toFixed(2),
    };
  }, [kp, ki, wn, zeta, hGain]);

  // Numerical simulation of closed loop ODE (Runge-Kutta 4)
  const simulationData = useMemo(() => {
    const tMax = 6.0;
    const numPoints = 200;
    const dt = tMax / numPoints;
    const points: { time: number; reference: number; closedLoop: number; openLoop: number }[] = [];

    // State variables for closed loop: [x1, x2, x3] where output y = x1
    // ODE: x1' = x2
    //      x2' = x3
    //      x3' = -a2*x2 - a1*x1 - a0*integral(e)
    let y_cl = 0;
    let v_cl = 0;
    let int_e = 0;

    // Open loop simulation
    let y_ol = 0;
    let v_ol = 0;

    for (let i = 0; i <= numPoints; i++) {
      const t = i * dt;
      const ref = inputType === 'step' ? 1.0 : t * 0.5;

      // Closed loop feedback error
      const error = ref - hGain * y_cl;
      int_e += error * dt;
      const u = kp * error + ki * int_e; // Control effort

      // 2nd order plant dynamics: y'' + 2*zeta*wn*y' + wn^2*y = wn^2 * u
      const accel_cl = wn * wn * (u - y_cl) - 2 * zeta * wn * v_cl;
      v_cl += accel_cl * dt;
      y_cl += v_cl * dt;

      // Open loop: u_ol = ref
      const accel_ol = wn * wn * (ref - y_ol) - 2 * zeta * wn * v_ol;
      v_ol += accel_ol * dt;
      y_ol += v_ol * dt;

      points.push({
        time: parseFloat(t.toFixed(2)),
        reference: parseFloat(ref.toFixed(2)),
        closedLoop: parseFloat(y_cl.toFixed(3)),
        openLoop: parseFloat(y_ol.toFixed(3)),
      });
    }

    return points;
  }, [kp, ki, wn, zeta, hGain, inputType]);

  const handleReset = () => {
    setKp(2.0);
    setKi(0.5);
    setWn(3.0);
    setZeta(0.6);
    setHGain(1.0);
    setInputType('step');
  };

  return (
    <div className="space-y-6">
      {/* Interactive Visual Block Diagram Canvas */}
      <Card className="p-3 sm:p-5 border border-border bg-[#0a0a0d] overflow-x-auto scrollbar-none">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2 text-xs font-mono text-accent-purple font-semibold">
            <Zap className="w-3.5 h-3.5 shrink-0" />
            <span>CLOSED-LOOP CONTROL TOPOLOGY (SISO)</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={systemMetrics.isStable ? 'success' : 'error'}>
              {systemMetrics.isStable ? 'SYSTEM STABLE (LHP)' : 'UNSTABLE (RHP POLES)'}
            </Badge>
            <Button size="sm" variant="ghost" onClick={handleReset}>
              <RotateCcw className="w-3.5 h-3.5 mr-1" /> Reset
            </Button>
          </div>
        </div>

        {/* SVG Schematic of Feedback Loop */}
        <div className="relative min-w-[700px] h-48 flex items-center justify-center select-none overflow-x-auto">
          <svg className="w-full h-full" viewBox="0 0 760 180">
            <defs>
              <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#8B5CF6" />
              </marker>
              <marker id="arrow-feedback" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#06B6D4" />
              </marker>
            </defs>

            {/* Input wire */}
            <line x1="20" y1="70" x2="90" y2="70" stroke="#8B5CF6" strokeWidth="2.5" markerEnd="url(#arrow)" />
            <text x="35" y="55" fill="#FAFAFA" fontSize="12" fontFamily="monospace" fontWeight="bold">R(s)</text>

            {/* Summing Junction */}
            <circle cx="110" cy="70" r="18" fill="#18181B" stroke="#8B5CF6" strokeWidth="2" />
            <text x="105" y="75" fill="#FAFAFA" fontSize="14" fontWeight="bold">Σ</text>
            <text x="85" y="65" fill="#10B981" fontSize="12" fontWeight="bold">+</text>
            <text x="106" y="102" fill="#EF4444" fontSize="13" fontWeight="bold">-</text>

            {/* Wire to Controller */}
            <line x1="128" y1="70" x2="175" y2="70" stroke="#8B5CF6" strokeWidth="2" markerEnd="url(#arrow)" />
            <text x="135" y="60" fill="#A1A1AA" fontSize="10" fontFamily="monospace">E(s)</text>

            {/* Controller Block C(s) */}
            <rect x="175" y="42" width="130" height="56" rx="8" fill="#18181B" stroke="#3B82F6" strokeWidth="2" />
            <text x="240" y="66" textAnchor="middle" fill="#FAFAFA" fontSize="12" fontFamily="monospace" fontWeight="bold">PI Controller</text>
            <text x="240" y="84" textAnchor="middle" fill="#60A5FA" fontSize="11" fontFamily="monospace">Kp + Ki/s</text>

            {/* Wire to Plant */}
            <line x1="305" y1="70" x2="355" y2="70" stroke="#8B5CF6" strokeWidth="2" markerEnd="url(#arrow)" />
            <text x="318" y="60" fill="#A1A1AA" fontSize="10" fontFamily="monospace">U(s)</text>

            {/* Plant Block G(s) */}
            <rect x="355" y="38" width="165" height="64" rx="8" fill="#18181B" stroke="#8B5CF6" strokeWidth="2" />
            <text x="437" y="62" textAnchor="middle" fill="#FAFAFA" fontSize="12" fontFamily="monospace" fontWeight="bold">Plant G(s)</text>
            <text x="437" y="82" textAnchor="middle" fill="#C084FC" fontSize="10" fontFamily="monospace">ωn² / (s² + 2ζωns + ωn²)</text>

            {/* Output Wire */}
            <line x1="520" y1="70" x2="680" y2="70" stroke="#8B5CF6" strokeWidth="2.5" markerEnd="url(#arrow)" />
            <circle cx="585" cy="70" r="3" fill="#8B5CF6" />
            <text x="690" y="74" fill="#FAFAFA" fontSize="12" fontFamily="monospace" fontWeight="bold">Y(s)</text>

            {/* Feedback Wire down */}
            <line x1="585" y1="70" x2="585" y2="145" stroke="#06B6D4" strokeWidth="2" />
            <line x1="585" y1="145" x2="480" y2="145" stroke="#06B6D4" strokeWidth="2" markerEnd="url(#arrow-feedback)" />

            {/* Feedback Block H(s) */}
            <rect x="375" y="122" width="105" height="46" rx="6" fill="#18181B" stroke="#06B6D4" strokeWidth="1.8" />
            <text x="427" y="142" textAnchor="middle" fill="#FAFAFA" fontSize="11" fontFamily="monospace" fontWeight="bold">Sensor H(s)</text>
            <text x="427" y="157" textAnchor="middle" fill="#22D3EE" fontSize="10" fontFamily="monospace">Gain = {hGain.toFixed(1)}</text>

            {/* Feedback Wire back to Summing junction */}
            <line x1="375" y1="145" x2="110" y2="145" stroke="#06B6D4" strokeWidth="2" />
            <line x1="110" y1="145" x2="110" y2="88" stroke="#06B6D4" strokeWidth="2" markerEnd="url(#arrow-feedback)" />
          </svg>
        </div>
      </Card>

      {/* Control Parameters and Live Simulation Graph */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sliders Panel */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="p-5">
            <h3 className="text-sm font-semibold font-mono text-text-primary uppercase tracking-wider mb-4">
              Controller & Feedback Settings
            </h3>
            <div className="space-y-4">
              <Slider
                label="Proportional Gain (Kp)"
                value={kp}
                min={0.1}
                max={10.0}
                step={0.1}
                onChange={setKp}
                formatValue={v => v.toFixed(1)}
              />
              <Slider
                label="Integral Gain (Ki)"
                value={ki}
                min={0.0}
                max={5.0}
                step={0.1}
                onChange={setKi}
                formatValue={v => v.toFixed(1)}
              />
              <Slider
                label="Feedback Factor (H)"
                value={hGain}
                min={0.1}
                max={2.0}
                step={0.1}
                onChange={setHGain}
                formatValue={v => v.toFixed(1)}
              />
              <div className="pt-2 border-t border-border">
                <label className="text-xs font-medium text-text-secondary mb-1.5 block">Reference Input Wave</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setInputType('step')}
                    className={`py-1.5 rounded text-xs font-mono transition-all border ${
                      inputType === 'step'
                        ? 'bg-accent-purple/20 text-accent-purple border-accent-purple/50 font-bold'
                        : 'bg-surface-elevated text-text-secondary border-border'
                    }`}
                  >
                    Unit Step 1(t)
                  </button>
                  <button
                    onClick={() => setInputType('ramp')}
                    className={`py-1.5 rounded text-xs font-mono transition-all border ${
                      inputType === 'ramp'
                        ? 'bg-accent-purple/20 text-accent-purple border-accent-purple/50 font-bold'
                        : 'bg-surface-elevated text-text-secondary border-border'
                    }`}
                  >
                    Ramp 0.5 t
                  </button>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="text-sm font-semibold font-mono text-text-primary uppercase tracking-wider mb-4">
              Physical Plant Parameters
            </h3>
            <div className="space-y-4">
              <Slider
                label="Natural Frequency (ωn)"
                value={wn}
                min={1.0}
                max={8.0}
                step={0.2}
                unit="rad/s"
                onChange={setWn}
                formatValue={v => `${v.toFixed(1)} rad/s`}
              />
              <Slider
                label="Damping Ratio (ζ)"
                value={zeta}
                min={0.1}
                max={2.0}
                step={0.05}
                onChange={setZeta}
                formatValue={v => v.toFixed(2)}
              />
            </div>
          </Card>
        </div>

        {/* Dynamic Closed-Loop Step Response Chart */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="p-5">
            <div className="flex items-center justify-between mb-3 text-xs font-mono text-text-muted">
              <span>TIME-DOMAIN CLOSED-LOOP DYNAMICS</span>
              <span className="text-accent-purple">ESS: {systemMetrics.ess}</span>
            </div>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={simulationData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272A" />
                  <XAxis dataKey="time" stroke="#71717A" fontSize={11} tickFormatter={v => `${v}s`} />
                  <YAxis stroke="#71717A" fontSize={11} domain={['auto', 'auto']} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#18181B', borderColor: '#27272A', borderRadius: '8px', fontSize: '11px', fontFamily: 'monospace' }}
                  />
                  <ReferenceLine y={1} stroke="#EAB308" strokeDasharray="4 4" label={{ value: 'Reference', fill: '#EAB308', fontSize: 10 }} />
                  <Line type="monotone" dataKey="openLoop" stroke="#71717A" strokeDasharray="3 3" strokeWidth={1.5} dot={false} name="Open Loop" />
                  <Line type="monotone" dataKey="closedLoop" stroke="#A855F7" strokeWidth={2.5} dot={false} name="Closed Loop Y(t)" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Governing Equations Card */}
          <Card className="p-5 bg-surface-elevated/40">
            <div className="flex items-center gap-2 mb-3 text-xs font-mono text-accent-purple">
              <Sliders className="w-4 h-4" />
              <span>TRANSFER FUNCTION & CLOSED-LOOP CHARACTERISTIC</span>
            </div>
            <div className="p-3 rounded-lg bg-surface border border-border text-center space-y-2">
              <MathematicalFormula
                formula="T(s) = \frac{C(s) G(s)}{1 + C(s) G(s) H(s)} = \frac{K_p s + K_i}{s^3 + a_2 s^2 + a_1 s + a_0}"
                block
              />
              <div className="text-xs font-mono text-text-muted">
                Denominator: s³ + {systemMetrics.a2} s² + {systemMetrics.a1} s + {systemMetrics.a0}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
