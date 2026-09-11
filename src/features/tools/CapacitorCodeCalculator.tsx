import React, { useState, useMemo } from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { formatCapacitance } from '../../lib/utils';
import { HelpCircle } from 'lucide-react';

const TOLERANCE_CODES: Record<string, number> = {
  F: 1,
  G: 2,
  J: 5,
  K: 10,
  M: 20,
  Z: 80,
};

const VOLTAGE_CODES: Record<string, number> = {
  '1H': 50,
  '2A': 100,
  '2E': 250,
  '2V': 350,
  '2J': 630,
  '3A': 1000,
};

export const CapacitorCodeCalculator: React.FC = () => {
  const [code, setCode] = useState('104');
  const [toleranceCode, setToleranceCode] = useState('K');
  const [voltageCode, setVoltageCode] = useState('1H');

  const result = useMemo(() => {
    const cleanCode = code.trim();
    if (!/^\d{3}$/.test(cleanCode)) {
      return { isValid: false, pF: 0, nF: 0, uF: 0, tolPct: 0, voltage: 0 };
    }

    const d1 = parseInt(cleanCode[0], 10);
    const d2 = parseInt(cleanCode[1], 10);
    const mult = parseInt(cleanCode[2], 10);

    const pF = (d1 * 10 + d2) * Math.pow(10, mult);
    const nF = pF / 1000;
    const uF = pF / 1000000;
    const tolPct = TOLERANCE_CODES[toleranceCode] || 10;
    const voltage = VOLTAGE_CODES[voltageCode] || 50;

    return {
      isValid: true,
      pF,
      nF,
      uF,
      farads: uF * 1e-6,
      tolPct,
      voltage,
      minCap: pF * (1 - tolPct / 100),
      maxCap: pF * (1 + tolPct / 100),
    };
  }, [code, toleranceCode, voltageCode]);

  const presets = ['101', '102', '103', '104', '222', '473', '474', '105'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-6 space-y-6">
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold font-mono text-text-primary uppercase tracking-wider">
              3-Digit EIA Capacitor Code
            </h3>
            <Badge variant="info">EIA-198 STANDARD</Badge>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-text-secondary mb-1.5 block">
                3-Digit Code (Digits 1 & 2 + Multiplier)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  maxLength={3}
                  value={code}
                  onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
                  className="w-32 bg-surface border border-border rounded-lg px-3 py-2 text-center text-lg font-mono font-bold text-accent-cyan focus:outline-none focus:border-accent-cyan"
                  placeholder="104"
                />
                <span className="text-xs text-text-muted">e.g. 104 = 10 × 10⁴ pF</span>
              </div>
            </div>

            {/* Quick Presets */}
            <div>
              <label className="text-xs font-medium text-text-secondary mb-1.5 block">Common Presets</label>
              <div className="flex flex-wrap gap-1.5">
                {presets.map(p => (
                  <button
                    key={p}
                    onClick={() => setCode(p)}
                    className={`px-2.5 py-1 text-xs rounded font-mono transition-all border ${
                      code === p
                        ? 'bg-accent-cyan/20 text-accent-cyan border-accent-cyan/50 font-bold'
                        : 'bg-surface-elevated text-text-secondary border-border hover:border-zinc-600'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Tolerance & Voltage Code Selector */}
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div>
                <label className="text-xs font-medium text-text-secondary mb-1.5 block">Tolerance Letter</label>
                <select
                  value={toleranceCode}
                  onChange={e => setToleranceCode(e.target.value)}
                  className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-xs font-mono text-text-primary focus:outline-none focus:border-accent-cyan"
                >
                  {Object.entries(TOLERANCE_CODES).map(([letter, pct]) => (
                    <option key={letter} value={letter}>
                      {letter} (±{pct}%)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-text-secondary mb-1.5 block">Voltage Rating</label>
                <select
                  value={voltageCode}
                  onChange={e => setVoltageCode(e.target.value)}
                  className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-xs font-mono text-text-primary focus:outline-none focus:border-accent-cyan"
                >
                  {Object.entries(VOLTAGE_CODES).map(([vCod, volts]) => (
                    <option key={vCod} value={vCod}>
                      {vCod} ({volts} V)
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </Card>

        {/* Visual Capacitor Component Graphic */}
        <Card className="p-5 flex items-center justify-center bg-[#0e0e12]">
          <div className="flex flex-col items-center">
            {/* Ceramic disc capacitor SVG representation */}
            <div className="relative flex flex-col items-center">
              {/* Disc body */}
              <div className="w-28 h-28 rounded-full bg-[#d97706] border-2 border-[#b45309] shadow-lg flex flex-col items-center justify-center select-none text-zinc-900">
                <span className="text-xl font-bold font-mono tracking-wider">{code}</span>
                <span className="text-xs font-mono font-semibold">{toleranceCode} {voltageCode}</span>
              </div>
              {/* Lead pins */}
              <div className="flex justify-between w-14 mt-0">
                <div className="w-1.5 h-16 bg-zinc-400 rounded-b" />
                <div className="w-1.5 h-16 bg-zinc-400 rounded-b" />
              </div>
            </div>
            <span className="text-[11px] font-mono text-text-muted mt-2">Disc Ceramic Marking: {code}{toleranceCode}</span>
          </div>
        </Card>
      </div>

      {/* Results and Decode Table */}
      <div className="lg:col-span-6 space-y-6">
        <Card className="p-5">
          <h3 className="text-sm font-semibold font-mono text-text-primary uppercase tracking-wider mb-4">
            Decoded Capacitance Values
          </h3>

          {result.isValid ? (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-surface-elevated border border-accent-cyan/30 text-center">
                <span className="text-xs font-mono text-text-muted">STANDARD VALUE</span>
                <div className="text-3xl font-bold font-mono text-accent-cyan my-1">
                  {formatCapacitance(result.farads || 0)}
                </div>
                <div className="text-xs font-mono text-text-secondary">
                  {result.pF?.toLocaleString()} pF &bull; {result.nF} nF &bull; {result.uF} µF
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-3 rounded bg-surface-elevated border border-border">
                  <span className="text-text-muted">Tolerance:</span>
                  <div className="text-base font-bold text-text-primary">±{result.tolPct}%</div>
                </div>
                <div className="p-3 rounded bg-surface-elevated border border-border">
                  <span className="text-text-muted">Working Voltage:</span>
                  <div className="text-base font-bold text-amber-400">{result.voltage} V DC</div>
                </div>
                <div className="p-3 rounded bg-surface-elevated border border-border">
                  <span className="text-text-muted">Min Allowed:</span>
                  <div className="text-sm font-bold text-text-primary">
                    {formatCapacitance((result.minCap ?? 0) * 1e-12)}
                  </div>
                </div>
                <div className="p-3 rounded bg-surface-elevated border border-border">
                  <span className="text-text-muted">Max Allowed:</span>
                  <div className="text-sm font-bold text-text-primary">
                    {formatCapacitance((result.maxCap ?? 0) * 1e-12)}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 rounded-lg bg-surface-elevated border border-border text-center text-text-muted text-xs font-mono">
              Please enter a valid 3-digit number (e.g. 104).
            </div>
          )}
        </Card>

        <Card className="p-5 bg-surface-elevated/40">
          <div className="flex items-center gap-2 mb-2 text-xs font-mono text-accent-cyan">
            <HelpCircle className="w-4 h-4" />
            <span>HOW TO READ 3-DIGIT CAPACITOR CODES</span>
          </div>
          <p className="text-xs text-text-muted leading-relaxed">
            The first two digits represent significant figures, and the third digit is the power of 10 multiplier in <strong>picofarads (pF)</strong>.
            For example: <strong className="text-text-primary">104 = 10 × 10⁴ pF = 100,000 pF = 100 nF = 0.1 µF</strong>.
          </p>
        </Card>
      </div>
    </div>
  );
};
