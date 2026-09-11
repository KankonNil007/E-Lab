import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Calculator, History, Trash2, RotateCcw, Copy, Check, ChevronDown, ChevronUp } from 'lucide-react';

interface HistoryItem {
  id: string;
  expression: string;
  result: string;
  timestamp: string;
}

type MobileKeypadMode = 'basic' | 'scientific' | 'units' | 'full';

export const ScientificCalculator: React.FC = () => {
  const [expression, setExpression] = useState<string>('');
  const [result, setResult] = useState<string>('0');
  const [angleMode, setAngleMode] = useState<'deg' | 'rad'>('deg');
  const [memory, setMemory] = useState<number>(0);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [copied, setCopied] = useState<boolean>(false);
  const [mobileMode, setMobileMode] = useState<MobileKeypadMode>('basic');
  const [historyOpen, setHistoryOpen] = useState<boolean>(false);

  // Safe evaluation parser
  const evaluateExpression = (expr: string): number => {
    let sanitized = expr
      .replace(/×/g, '*')
      .replace(/÷/g, '/')
      .replace(/[−–—]/g, '-')
      .replace(/π/g, `${Math.PI}`)
      .replace(/\be\b/g, `${Math.E}`)
      .replace(/exp\(/g, 'Math.exp(')
      .replace(/cbrt\(/g, 'Math.cbrt(')
      .replace(/abs\(/g, 'Math.abs(')
      .replace(/%/g, '*(1/100)');

    // Convert trig functions depending on angleMode
    if (angleMode === 'deg') {
      sanitized = sanitized.replace(/sin\(([^)]+)\)/g, (_, val) => `Math.sin((${val}) * Math.PI / 180)`);
      sanitized = sanitized.replace(/cos\(([^)]+)\)/g, (_, val) => `Math.cos((${val}) * Math.PI / 180)`);
      sanitized = sanitized.replace(/tan\(([^)]+)\)/g, (_, val) => `Math.tan((${val}) * Math.PI / 180)`);
      sanitized = sanitized.replace(/asin\(([^)]+)\)/g, (_, val) => `(Math.asin(${val}) * 180 / Math.PI)`);
      sanitized = sanitized.replace(/acos\(([^)]+)\)/g, (_, val) => `(Math.acos(${val}) * 180 / Math.PI)`);
      sanitized = sanitized.replace(/atan\(([^)]+)\)/g, (_, val) => `(Math.atan(${val}) * 180 / Math.PI)`);
    } else {
      sanitized = sanitized.replace(/sin\(/g, 'Math.sin(');
      sanitized = sanitized.replace(/cos\(/g, 'Math.cos(');
      sanitized = sanitized.replace(/tan\(/g, 'Math.tan(');
      sanitized = sanitized.replace(/asin\(/g, 'Math.asin(');
      sanitized = sanitized.replace(/acos\(/g, 'Math.acos(');
      sanitized = sanitized.replace(/atan\(/g, 'Math.atan(');
    }

    sanitized = sanitized.replace(/ln\(/g, 'Math.log(');
    sanitized = sanitized.replace(/log\(/g, 'Math.log10(');
    sanitized = sanitized.replace(/sqrt\(/g, 'Math.sqrt(');
    sanitized = sanitized.replace(/\^/g, '**');

    // Engineering SI suffixes
    sanitized = sanitized.replace(/(\d+(\.\d+)?)T/g, '($1 * 1e12)');
    sanitized = sanitized.replace(/(\d+(\.\d+)?)G/g, '($1 * 1e9)');
    sanitized = sanitized.replace(/(\d+(\.\d+)?)M/g, '($1 * 1e6)');
    sanitized = sanitized.replace(/(\d+(\.\d+)?)k/g, '($1 * 1e3)');
    sanitized = sanitized.replace(/(\d+(\.\d+)?)m/g, '($1 * 1e-3)');
    sanitized = sanitized.replace(/(\d+(\.\d+)?)u/g, '($1 * 1e-6)');
    sanitized = sanitized.replace(/(\d+(\.\d+)?)n/g, '($1 * 1e-9)');
    sanitized = sanitized.replace(/(\d+(\.\d+)?)p/g, '($1 * 1e-12)');

    // Whitelist check
    if (!/^[0-9+\-*/().\s,MathPIEasincoqrtlogexp]+$/.test(sanitized)) {
      throw new Error('Invalid characters in expression');
    }

    // eslint-disable-next-line no-new-func
    const res = Function(`"use strict"; return (${sanitized});`)();
    if (typeof res !== 'number' || !Number.isFinite(res)) {
      throw new Error('Calculation undefined or overflow');
    }
    return res;
  };

  const handleCompute = () => {
    if (!expression.trim()) return;
    try {
      const numeric = evaluateExpression(expression);
      const formatted = Math.abs(numeric) > 1e7 || (Math.abs(numeric) < 1e-4 && numeric !== 0)
        ? numeric.toExponential(6)
        : Number(numeric.toFixed(8)).toString();

      setResult(formatted);
      setHistory((prev) => [
        {
          id: `hist-${Date.now()}`,
          expression,
          result: formatted,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
        ...prev.slice(0, 19),
      ]);
    } catch {
      setResult('Error');
    }
  };

  const append = (token: string) => {
    setExpression((prev) => prev + token);
  };

  const clearAll = () => {
    setExpression('');
    setResult('0');
  };

  const backspace = () => {
    setExpression((prev) => prev.slice(0, -1));
  };

  const toggleSign = () => {
    if (!expression) {
      setExpression('-');
      return;
    }
    if (expression.startsWith('-(') && expression.endsWith(')')) {
      setExpression(expression.slice(2, -1));
    } else if (expression.startsWith('-')) {
      setExpression(expression.slice(1));
    } else {
      setExpression(`-(${expression})`);
    }
  };

  const reciprocal = () => {
    if (!expression) {
      setExpression('1/(');
    } else {
      setExpression(`1/(${expression})`);
    }
  };

  const square = () => {
    if (!expression) return;
    setExpression(`(${expression})^2`);
  };

  const handleMemory = (action: 'MC' | 'MR' | 'M+' | 'M-') => {
    const currentNum = Number(result) || 0;
    if (action === 'MC') setMemory(0);
    else if (action === 'MR') append(memory.toString());
    else if (action === 'M+') setMemory((prev) => prev + currentNum);
    else if (action === 'M-') setMemory((prev) => prev - currentNum);
  };

  const copyResult = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl bg-surface-elevated border border-border">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 mb-1">
            <Calculator className="w-3.5 h-3.5" />
            <span>MATHEMATICS & ENGINEERING TOOLBOX</span>
          </div>
          <h2 className="text-base sm:text-lg font-bold text-text-primary">Scientific & Engineering Calculator</h2>
          <p className="text-xs text-text-muted hidden sm:block">
            Arithmetic (+, −, ×, ÷), Trigonometric, Exponential, Powers, and SI Units (G, M, k, m, μ, n, p).
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex rounded-lg bg-surface border border-border p-0.5">
            <button
              type="button"
              onClick={() => setAngleMode('deg')}
              className={`px-2.5 py-1 rounded text-xs font-mono font-medium transition-all ${
                angleMode === 'deg' ? 'bg-cyan-500 text-white shadow-sm' : 'text-text-muted hover:text-text-primary'
              }`}
            >
              DEG
            </button>
            <button
              type="button"
              onClick={() => setAngleMode('rad')}
              className={`px-2.5 py-1 rounded text-xs font-mono font-medium transition-all ${
                angleMode === 'rad' ? 'bg-cyan-500 text-white shadow-sm' : 'text-text-muted hover:text-text-primary'
              }`}
            >
              RAD
            </button>
          </div>

          <Badge variant="outline" className="font-mono text-xs">
            MEM: {memory !== 0 ? memory.toFixed(2) : '0'}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        {/* Calculator Main Body */}
        <Card className="p-3 sm:p-5 lg:col-span-8 flex flex-col justify-between">
          {/* LCD Display */}
          <div className="p-3 sm:p-4 rounded-xl bg-zinc-950 border border-zinc-800 font-mono shadow-inner mb-3 sm:mb-4">
            <input
              type="text"
              value={expression}
              onChange={(e) => setExpression(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCompute()}
              placeholder="0"
              className="w-full bg-transparent text-right text-xs sm:text-sm text-text-secondary focus:outline-none placeholder-zinc-700"
            />
            <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-cyan-400 text-right mt-1 tracking-tight overflow-x-auto select-all">
              {result}
            </div>
            <div className="flex justify-between items-center mt-2 sm:mt-3 pt-2 border-t border-zinc-800/80 text-[10px] text-zinc-500">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>{angleMode.toUpperCase()}</span>
                {memory !== 0 && <span className="text-cyan-400 font-bold ml-1">M</span>}
              </span>
              <button
                type="button"
                onClick={copyResult}
                className="flex items-center gap-1 hover:text-cyan-400 transition-colors"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Mobile Keypad Mode Switcher (< md) */}
          <div className="flex md:hidden items-center justify-between gap-1 p-1 mb-3 rounded-lg bg-surface border border-border">
            {[
              { id: 'basic' as const, label: '123 Basic' },
              { id: 'scientific' as const, label: 'f(x) Sci' },
              { id: 'units' as const, label: 'SI Units' },
              { id: 'full' as const, label: 'Full Grid' },
            ].map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setMobileMode(m.id)}
                className={`flex-1 py-1 text-[11px] font-mono font-medium rounded-md transition-all ${
                  mobileMode === m.id
                    ? 'bg-cyan-500 text-white shadow-sm'
                    : 'text-text-muted hover:text-text-primary'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* Quick Scientific Function Ribbon on Mobile for 'basic' mode */}
          <div className="flex md:hidden items-center gap-1.5 overflow-x-auto pb-2 mb-2 scrollbar-none">
            {['sin(', 'cos(', 'tan(', 'ln(', 'log(', 'sqrt(', '^', 'π', 'e', '(', ')'].map((fn) => (
              <button
                key={fn}
                type="button"
                onClick={() => append(fn)}
                className="px-2.5 py-1 rounded bg-surface border border-border text-xs font-mono text-cyan-400 whitespace-nowrap active:bg-surface-elevated"
              >
                {fn.replace('(', '')}
              </button>
            ))}
          </div>

          {/* ═══ MOBILE 4-COLUMN BASIC KEYPAD (< md & mobileMode === 'basic') ═══ */}
          {mobileMode === 'basic' && (
            <div className="grid md:hidden grid-cols-4 gap-2">
              <button type="button" onClick={clearAll} className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-sm font-mono font-bold text-red-400 active:bg-red-500/20">AC</button>
              <button type="button" onClick={backspace} className="p-3 rounded-lg bg-surface border border-border text-sm font-mono text-amber-400 active:bg-surface-elevated">DEL</button>
              <button type="button" onClick={() => append('%')} className="p-3 rounded-lg bg-surface border border-border text-sm font-mono text-text-secondary active:bg-surface-elevated">%</button>
              <button type="button" onClick={() => append('÷')} className="p-3 rounded-lg bg-cyan-500/15 border border-cyan-500/40 text-base font-mono font-bold text-cyan-400 active:bg-cyan-500/30">÷</button>

              <button type="button" onClick={() => append('7')} className="p-3 rounded-lg bg-surface-elevated border border-border text-base font-mono font-bold text-text-primary active:border-cyan-500/50">7</button>
              <button type="button" onClick={() => append('8')} className="p-3 rounded-lg bg-surface-elevated border border-border text-base font-mono font-bold text-text-primary active:border-cyan-500/50">8</button>
              <button type="button" onClick={() => append('9')} className="p-3 rounded-lg bg-surface-elevated border border-border text-base font-mono font-bold text-text-primary active:border-cyan-500/50">9</button>
              <button type="button" onClick={() => append('×')} className="p-3 rounded-lg bg-cyan-500/15 border border-cyan-500/40 text-base font-mono font-bold text-cyan-400 active:bg-cyan-500/30">×</button>

              <button type="button" onClick={() => append('4')} className="p-3 rounded-lg bg-surface-elevated border border-border text-base font-mono font-bold text-text-primary active:border-cyan-500/50">4</button>
              <button type="button" onClick={() => append('5')} className="p-3 rounded-lg bg-surface-elevated border border-border text-base font-mono font-bold text-text-primary active:border-cyan-500/50">5</button>
              <button type="button" onClick={() => append('6')} className="p-3 rounded-lg bg-surface-elevated border border-border text-base font-mono font-bold text-text-primary active:border-cyan-500/50">6</button>
              <button type="button" onClick={() => append('−')} className="p-3 rounded-lg bg-cyan-500/15 border border-cyan-500/40 text-base font-mono font-bold text-cyan-400 active:bg-cyan-500/30">−</button>

              <button type="button" onClick={() => append('1')} className="p-3 rounded-lg bg-surface-elevated border border-border text-base font-mono font-bold text-text-primary active:border-cyan-500/50">1</button>
              <button type="button" onClick={() => append('2')} className="p-3 rounded-lg bg-surface-elevated border border-border text-base font-mono font-bold text-text-primary active:border-cyan-500/50">2</button>
              <button type="button" onClick={() => append('3')} className="p-3 rounded-lg bg-surface-elevated border border-border text-base font-mono font-bold text-text-primary active:border-cyan-500/50">3</button>
              <button type="button" onClick={() => append('+')} className="p-3 rounded-lg bg-cyan-500/15 border border-cyan-500/40 text-base font-mono font-bold text-cyan-400 active:bg-cyan-500/30">+</button>

              <button type="button" onClick={toggleSign} className="p-3 rounded-lg bg-surface border border-border text-sm font-mono text-text-primary active:bg-surface-elevated">±</button>
              <button type="button" onClick={() => append('0')} className="p-3 rounded-lg bg-surface-elevated border border-border text-base font-mono font-bold text-text-primary active:border-cyan-500/50">0</button>
              <button type="button" onClick={() => append('.')} className="p-3 rounded-lg bg-surface-elevated border border-border text-base font-mono font-bold text-text-primary active:border-cyan-500/50">.</button>
              <button type="button" onClick={handleCompute} className="p-3 rounded-lg bg-cyan-500 text-white text-lg font-mono font-bold shadow-md shadow-cyan-500/30 active:bg-cyan-400">=</button>
            </div>
          )}

          {/* ═══ MOBILE 4-COLUMN SCIENTIFIC KEYPAD (< md & mobileMode === 'scientific') ═══ */}
          {mobileMode === 'scientific' && (
            <div className="grid md:hidden grid-cols-4 gap-2">
              <button type="button" onClick={() => append('sin(')} className="p-3 rounded-lg bg-surface border border-border text-xs font-mono text-text-secondary active:bg-surface-elevated">sin</button>
              <button type="button" onClick={() => append('cos(')} className="p-3 rounded-lg bg-surface border border-border text-xs font-mono text-text-secondary active:bg-surface-elevated">cos</button>
              <button type="button" onClick={() => append('tan(')} className="p-3 rounded-lg bg-surface border border-border text-xs font-mono text-text-secondary active:bg-surface-elevated">tan</button>
              <button type="button" onClick={backspace} className="p-3 rounded-lg bg-surface border border-border text-xs font-mono text-amber-400 active:bg-surface-elevated">DEL</button>

              <button type="button" onClick={() => append('asin(')} className="p-3 rounded-lg bg-surface border border-border text-xs font-mono text-text-secondary active:bg-surface-elevated">sin⁻¹</button>
              <button type="button" onClick={() => append('acos(')} className="p-3 rounded-lg bg-surface border border-border text-xs font-mono text-text-secondary active:bg-surface-elevated">cos⁻¹</button>
              <button type="button" onClick={() => append('atan(')} className="p-3 rounded-lg bg-surface border border-border text-xs font-mono text-text-secondary active:bg-surface-elevated">tan⁻¹</button>
              <button type="button" onClick={clearAll} className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-xs font-mono text-red-400 font-bold active:bg-red-500/20">AC</button>

              <button type="button" onClick={() => append('ln(')} className="p-3 rounded-lg bg-surface border border-border text-xs font-mono text-text-secondary active:bg-surface-elevated">ln</button>
              <button type="button" onClick={() => append('log(')} className="p-3 rounded-lg bg-surface border border-border text-xs font-mono text-text-secondary active:bg-surface-elevated">log₁₀</button>
              <button type="button" onClick={() => append('sqrt(')} className="p-3 rounded-lg bg-surface border border-border text-xs font-mono text-text-secondary active:bg-surface-elevated">√x</button>
              <button type="button" onClick={square} className="p-3 rounded-lg bg-surface border border-border text-xs font-mono text-text-secondary active:bg-surface-elevated">x²</button>

              <button type="button" onClick={() => append('^')} className="p-3 rounded-lg bg-surface border border-border text-xs font-mono text-text-secondary active:bg-surface-elevated">xʸ</button>
              <button type="button" onClick={() => append('exp(')} className="p-3 rounded-lg bg-surface border border-border text-xs font-mono text-text-secondary active:bg-surface-elevated">eˣ</button>
              <button type="button" onClick={() => append('10^(')} className="p-3 rounded-lg bg-surface border border-border text-xs font-mono text-text-secondary active:bg-surface-elevated">10ˣ</button>
              <button type="button" onClick={reciprocal} className="p-3 rounded-lg bg-surface border border-border text-xs font-mono text-text-secondary active:bg-surface-elevated">1/x</button>

              <button type="button" onClick={() => append('π')} className="p-3 rounded-lg bg-surface border border-border text-xs font-mono text-amber-400 font-bold active:bg-surface-elevated">π</button>
              <button type="button" onClick={() => append('e')} className="p-3 rounded-lg bg-surface border border-border text-xs font-mono text-amber-400 font-bold active:bg-surface-elevated">e</button>
              <button type="button" onClick={() => append('(')} className="p-3 rounded-lg bg-surface border border-border text-xs font-mono text-text-secondary active:bg-surface-elevated">(</button>
              <button type="button" onClick={() => append(')')} className="p-3 rounded-lg bg-surface border border-border text-xs font-mono text-text-secondary active:bg-surface-elevated">)</button>
            </div>
          )}

          {/* ═══ MOBILE SI UNITS (< md & mobileMode === 'units') ═══ */}
          {mobileMode === 'units' && (
            <div className="grid md:hidden grid-cols-2 gap-2">
              {[
                { label: 'G (Giga)', val: 'G', desc: '10⁹ (1,000,000,000)' },
                { label: 'M (Mega)', val: 'M', desc: '10⁶ (1,000,000)' },
                { label: 'k (Kilo)', val: 'k', desc: '10³ (1,000)' },
                { label: 'm (Milli)', val: 'm', desc: '10⁻³ (0.001)' },
                { label: 'μ (Micro)', val: 'u', desc: '10⁻⁶ (0.000001)' },
                { label: 'n (Nano)', val: 'n', desc: '10⁻⁹ (0.000000001)' },
                { label: 'p (Pico)', val: 'p', desc: '10⁻¹² (10⁻¹²)' },
                { label: 'π (Pi)', val: 'π', desc: '3.14159265...' },
              ].map((unit) => (
                <button
                  key={unit.val}
                  type="button"
                  onClick={() => append(unit.val)}
                  className="p-3 rounded-lg bg-surface border border-border text-left hover:border-cyan-500/40 active:bg-surface-elevated transition-all"
                >
                  <div className="text-xs font-mono font-bold text-cyan-400">{unit.label}</div>
                  <div className="text-[10px] font-mono text-text-muted mt-0.5">{unit.desc}</div>
                </button>
              ))}
            </div>
          )}

          {/* ═══ FULL 8-COLUMN ENGINEERING WORKSTATION KEYPAD (Desktop/Tablet & 'full' mode) ═══ */}
          <div className={`${mobileMode === 'full' ? 'block' : 'hidden md:block'} overflow-x-auto scrollbar-none`}>
            <div className="grid grid-cols-8 gap-1.5 sm:gap-2 min-w-[480px] md:min-w-0">
              {/* ROW 1: Memory & Editing */}
              <button type="button" onClick={() => handleMemory('MC')} className="p-2 sm:p-2.5 rounded-lg bg-surface border border-border text-xs font-mono text-text-muted hover:text-text-primary hover:bg-surface-elevated">MC</button>
              <button type="button" onClick={() => handleMemory('MR')} className="p-2 sm:p-2.5 rounded-lg bg-surface border border-border text-xs font-mono text-text-muted hover:text-text-primary hover:bg-surface-elevated">MR</button>
              <button type="button" onClick={() => handleMemory('M+')} className="p-2 sm:p-2.5 rounded-lg bg-surface border border-border text-xs font-mono text-text-muted hover:text-text-primary hover:bg-surface-elevated">M+</button>
              <button type="button" onClick={() => handleMemory('M-')} className="p-2 sm:p-2.5 rounded-lg bg-surface border border-border text-xs font-mono text-text-muted hover:text-text-primary hover:bg-surface-elevated">M−</button>
              <button type="button" onClick={() => append('(')} className="p-2 sm:p-2.5 rounded-lg bg-surface border border-border text-xs font-mono text-text-secondary hover:bg-surface-elevated">(</button>
              <button type="button" onClick={() => append(')')} className="p-2 sm:p-2.5 rounded-lg bg-surface border border-border text-xs font-mono text-text-secondary hover:bg-surface-elevated">)</button>
              <button type="button" onClick={backspace} className="p-2 sm:p-2.5 rounded-lg bg-surface border border-border text-xs font-mono text-amber-400 hover:bg-amber-500/10">DEL</button>
              <button type="button" onClick={clearAll} className="p-2 sm:p-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-xs font-mono text-red-400 hover:bg-red-500/20 font-bold">AC</button>

              {/* ROW 2: Trig & High Numbers */}
              <button type="button" onClick={() => append('sin(')} className="p-2 sm:p-2.5 rounded-lg bg-surface border border-border text-xs font-mono text-text-secondary hover:bg-surface-elevated">sin</button>
              <button type="button" onClick={() => append('cos(')} className="p-2 sm:p-2.5 rounded-lg bg-surface border border-border text-xs font-mono text-text-secondary hover:bg-surface-elevated">cos</button>
              <button type="button" onClick={() => append('tan(')} className="p-2 sm:p-2.5 rounded-lg bg-surface border border-border text-xs font-mono text-text-secondary hover:bg-surface-elevated">tan</button>
              <button type="button" onClick={() => append('7')} className="p-2 sm:p-2.5 rounded-lg bg-surface-elevated border border-border text-sm font-mono font-bold text-text-primary hover:border-cyan-500/50">7</button>
              <button type="button" onClick={() => append('8')} className="p-2 sm:p-2.5 rounded-lg bg-surface-elevated border border-border text-sm font-mono font-bold text-text-primary hover:border-cyan-500/50">8</button>
              <button type="button" onClick={() => append('9')} className="p-2 sm:p-2.5 rounded-lg bg-surface-elevated border border-border text-sm font-mono font-bold text-text-primary hover:border-cyan-500/50">9</button>
              <button type="button" onClick={() => append('÷')} className="p-2 sm:p-2.5 rounded-lg bg-cyan-500/15 border border-cyan-500/40 text-sm font-mono font-bold text-cyan-400 hover:bg-cyan-500/25">÷</button>
              <button type="button" onClick={() => append('%')} className="p-2 sm:p-2.5 rounded-lg bg-surface border border-border text-xs font-mono text-text-secondary hover:bg-surface-elevated">%</button>

              {/* ROW 3: Inverse Trig & Mid Numbers */}
              <button type="button" onClick={() => append('asin(')} className="p-2 sm:p-2.5 rounded-lg bg-surface border border-border text-xs font-mono text-text-secondary hover:bg-surface-elevated">sin⁻¹</button>
              <button type="button" onClick={() => append('acos(')} className="p-2 sm:p-2.5 rounded-lg bg-surface border border-border text-xs font-mono text-text-secondary hover:bg-surface-elevated">cos⁻¹</button>
              <button type="button" onClick={() => append('atan(')} className="p-2 sm:p-2.5 rounded-lg bg-surface border border-border text-xs font-mono text-text-secondary hover:bg-surface-elevated">tan⁻¹</button>
              <button type="button" onClick={() => append('4')} className="p-2 sm:p-2.5 rounded-lg bg-surface-elevated border border-border text-sm font-mono font-bold text-text-primary hover:border-cyan-500/50">4</button>
              <button type="button" onClick={() => append('5')} className="p-2 sm:p-2.5 rounded-lg bg-surface-elevated border border-border text-sm font-mono font-bold text-text-primary hover:border-cyan-500/50">5</button>
              <button type="button" onClick={() => append('6')} className="p-2 sm:p-2.5 rounded-lg bg-surface-elevated border border-border text-sm font-mono font-bold text-text-primary hover:border-cyan-500/50">6</button>
              <button type="button" onClick={() => append('×')} className="p-2 sm:p-2.5 rounded-lg bg-cyan-500/15 border border-cyan-500/40 text-sm font-mono font-bold text-cyan-400 hover:bg-cyan-500/25">×</button>
              <button type="button" onClick={reciprocal} className="p-2 sm:p-2.5 rounded-lg bg-surface border border-border text-xs font-mono text-text-secondary hover:bg-surface-elevated">1/x</button>

              {/* ROW 4: Logarithms & Low Numbers */}
              <button type="button" onClick={() => append('ln(')} className="p-2 sm:p-2.5 rounded-lg bg-surface border border-border text-xs font-mono text-text-secondary hover:bg-surface-elevated">ln</button>
              <button type="button" onClick={() => append('log(')} className="p-2 sm:p-2.5 rounded-lg bg-surface border border-border text-xs font-mono text-text-secondary hover:bg-surface-elevated">log₁₀</button>
              <button type="button" onClick={() => append('sqrt(')} className="p-2 sm:p-2.5 rounded-lg bg-surface border border-border text-xs font-mono text-text-secondary hover:bg-surface-elevated">√x</button>
              <button type="button" onClick={() => append('1')} className="p-2 sm:p-2.5 rounded-lg bg-surface-elevated border border-border text-sm font-mono font-bold text-text-primary hover:border-cyan-500/50">1</button>
              <button type="button" onClick={() => append('2')} className="p-2 sm:p-2.5 rounded-lg bg-surface-elevated border border-border text-sm font-mono font-bold text-text-primary hover:border-cyan-500/50">2</button>
              <button type="button" onClick={() => append('3')} className="p-2 sm:p-2.5 rounded-lg bg-surface-elevated border border-border text-sm font-mono font-bold text-text-primary hover:border-cyan-500/50">3</button>
              <button type="button" onClick={() => append('−')} className="p-2 sm:p-2.5 rounded-lg bg-cyan-500/15 border border-cyan-500/40 text-sm font-mono font-bold text-cyan-400 hover:bg-cyan-500/25">−</button>
              <button type="button" onClick={square} className="p-2 sm:p-2.5 rounded-lg bg-surface border border-border text-xs font-mono text-text-secondary hover:bg-surface-elevated">x²</button>

              {/* ROW 5: Powers, Zero & Plus / Equals */}
              <button type="button" onClick={() => append('^')} className="p-2 sm:p-2.5 rounded-lg bg-surface border border-border text-xs font-mono text-text-secondary hover:bg-surface-elevated">xʸ</button>
              <button type="button" onClick={() => append('exp(')} className="p-2 sm:p-2.5 rounded-lg bg-surface border border-border text-xs font-mono text-text-secondary hover:bg-surface-elevated">eˣ</button>
              <button type="button" onClick={() => append('10^(')} className="p-2 sm:p-2.5 rounded-lg bg-surface border border-border text-xs font-mono text-text-secondary hover:bg-surface-elevated">10ˣ</button>
              <button type="button" onClick={() => append('0')} className="p-2 sm:p-2.5 rounded-lg bg-surface-elevated border border-border text-sm font-mono font-bold text-text-primary hover:border-cyan-500/50">0</button>
              <button type="button" onClick={() => append('.')} className="p-2 sm:p-2.5 rounded-lg bg-surface-elevated border border-border text-sm font-mono font-bold text-text-primary hover:border-cyan-500/50">.</button>
              <button type="button" onClick={toggleSign} className="p-2 sm:p-2.5 rounded-lg bg-surface-elevated border border-border text-xs font-mono text-text-primary hover:bg-surface">±</button>
              <button type="button" onClick={() => append('+')} className="p-2 sm:p-2.5 rounded-lg bg-cyan-500/15 border border-cyan-500/40 text-sm font-mono font-bold text-cyan-400 hover:bg-cyan-500/25">+</button>
              <button
                type="button"
                onClick={handleCompute}
                className="p-2 sm:p-2.5 rounded-lg bg-cyan-500 text-white font-mono font-bold text-base shadow-md shadow-cyan-500/30 hover:bg-cyan-400 transition-all flex items-center justify-center"
              >
                =
              </button>

              {/* ROW 6: SI Units & Constants */}
              <button type="button" onClick={() => append('G')} className="p-2 sm:p-2.5 rounded-lg bg-surface border border-border text-xs font-mono text-purple-400 hover:bg-surface-elevated font-semibold">G (10⁹)</button>
              <button type="button" onClick={() => append('M')} className="p-2 sm:p-2.5 rounded-lg bg-surface border border-border text-xs font-mono text-purple-400 hover:bg-surface-elevated font-semibold">M (10⁶)</button>
              <button type="button" onClick={() => append('k')} className="p-2 sm:p-2.5 rounded-lg bg-surface border border-border text-xs font-mono text-purple-400 hover:bg-surface-elevated font-semibold">k (10³)</button>
              <button type="button" onClick={() => append('m')} className="p-2 sm:p-2.5 rounded-lg bg-surface border border-border text-xs font-mono text-purple-400 hover:bg-surface-elevated font-semibold">m (10⁻³)</button>
              <button type="button" onClick={() => append('u')} className="p-2 sm:p-2.5 rounded-lg bg-surface border border-border text-xs font-mono text-purple-400 hover:bg-surface-elevated font-semibold">μ (10⁻⁶)</button>
              <button type="button" onClick={() => append('n')} className="p-2 sm:p-2.5 rounded-lg bg-surface border border-border text-xs font-mono text-purple-400 hover:bg-surface-elevated font-semibold">n (10⁻⁹)</button>
              <button type="button" onClick={() => append('p')} className="p-2 sm:p-2.5 rounded-lg bg-surface border border-border text-xs font-mono text-purple-400 hover:bg-surface-elevated font-semibold">p (10⁻¹²)</button>
              <button type="button" onClick={() => append('π')} className="p-2 sm:p-2.5 rounded-lg bg-surface border border-border text-xs font-mono text-amber-400 hover:bg-surface-elevated font-bold">π</button>
            </div>
          </div>
        </Card>

        {/* Calculation History Reel (Desktop Side Panel / Mobile Collapsible Card) */}
        <Card className="p-3 sm:p-5 lg:col-span-4 flex flex-col justify-between">
          <div>
            <div
              onClick={() => setHistoryOpen(!historyOpen)}
              className="flex items-center justify-between border-b border-border pb-3 mb-3 cursor-pointer lg:cursor-default select-none"
            >
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-semibold text-text-primary">Calculation History</h3>
                <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-surface border border-border text-text-muted">
                  {history.length}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {history.length > 0 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setHistory([]);
                    }}
                    className="text-text-muted hover:text-red-400 text-xs flex items-center gap-1 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" /> Clear
                  </button>
                )}
                <div className="lg:hidden text-text-muted">
                  {historyOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </div>
            </div>

            {/* Content: Visible on desktop (lg:block), toggleable on mobile */}
            <div className={`${historyOpen ? 'block' : 'hidden lg:block'}`}>
              {history.length === 0 ? (
                <div className="text-center py-8 lg:py-12 text-text-muted text-xs">
                  No previous calculations.
                  <br />
                  Results will be archived here.
                </div>
              ) : (
                <div className="space-y-2 max-h-64 lg:max-h-80 overflow-y-auto pr-1">
                  {history.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => {
                        setExpression(item.expression);
                        setResult(item.result);
                      }}
                      className="p-2.5 rounded-lg bg-surface border border-border hover:border-cyan-500/40 cursor-pointer transition-all active:scale-[0.99]"
                    >
                      <div className="flex items-center justify-between text-[10px] text-text-muted font-mono mb-1">
                        <span>{item.timestamp}</span>
                        <RotateCcw className="w-2.5 h-2.5 opacity-50" />
                      </div>
                      <div className="text-xs font-mono text-text-secondary truncate">{item.expression}</div>
                      <div className="text-sm font-mono font-bold text-cyan-400 text-right mt-1">{item.result}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-border mt-3 text-[10px] sm:text-[11px] text-text-muted font-mono">
            Type <span className="text-cyan-400">10k</span> for 10,000,{' '}
            <span className="text-cyan-400">100u</span> for 0.0001. Press <kbd className="px-1 py-0.5 rounded bg-surface border border-border">Enter</kbd> to evaluate.
          </div>
        </Card>
      </div>
    </div>
  );
};
