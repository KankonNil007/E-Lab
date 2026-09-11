import React from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useAppStore } from '../../store/useAppStore';
import { Settings, Moon, Sun, Laptop, Keyboard, Trash2 } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const {
    theme,
    setTheme,
    simulationSpeed,
    setSimulationSpeed,
    precision,
    setPrecision,
    resetAllUserData,
  } = useAppStore();

  return (
    <div className="space-y-6 max-w-4xl animate-in fade-in duration-300">
      <div className="pb-4 border-b border-border">
        <div className="flex items-center gap-2 text-xs font-mono text-accent-blue mb-1">
          <Settings className="w-3.5 h-3.5" />
          <span>SYSTEM PREFERENCES</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">
          Laboratory Configuration & Preferences
        </h1>
        <p className="text-xs sm:text-sm text-text-muted mt-1">
          Customize display theme, numerical precision, and keyboard workflow shortcuts.
        </p>
      </div>

      {/* Theme Selection */}
      <Card className="p-5">
        <h3 className="text-sm font-semibold font-mono text-text-primary uppercase tracking-wider mb-1">
          Interface Appearance
        </h3>
        <p className="text-xs text-text-muted mb-4">
          Select between dark engineering mode, high-contrast light mode, or match system settings.
        </p>

        <div className="grid grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => setTheme('dark')}
            className={`p-3 rounded-lg border flex flex-col items-center gap-2 transition-all font-mono text-xs ${
              theme === 'dark'
                ? 'bg-accent-blue/10 border-accent-blue text-accent-blue font-bold shadow-glow-blue'
                : 'bg-surface-elevated border-border text-text-secondary hover:text-text-primary'
            }`}
          >
            <Moon className="w-5 h-5" />
            <span>Dark Mode</span>
          </button>

          <button
            type="button"
            onClick={() => setTheme('light')}
            className={`p-3 rounded-lg border flex flex-col items-center gap-2 transition-all font-mono text-xs ${
              theme === 'light'
                ? 'bg-accent-blue/10 border-accent-blue text-accent-blue font-bold shadow-glow-blue'
                : 'bg-surface-elevated border-border text-text-secondary hover:text-text-primary'
            }`}
          >
            <Sun className="w-5 h-5" />
            <span>Light Mode</span>
          </button>

          <button
            type="button"
            onClick={() => setTheme('system')}
            className={`p-3 rounded-lg border flex flex-col items-center gap-2 transition-all font-mono text-xs ${
              theme === 'system'
                ? 'bg-accent-blue/10 border-accent-blue text-accent-blue font-bold shadow-glow-blue'
                : 'bg-surface-elevated border-border text-text-secondary hover:text-text-primary'
            }`}
          >
            <Laptop className="w-5 h-5" />
            <span>System Default</span>
          </button>
        </div>
      </Card>

      {/* Simulation Engine Parameters */}
      <Card className="p-5">
        <h3 className="text-sm font-semibold font-mono text-text-primary uppercase tracking-wider mb-1">
          Simulation Engine Settings
        </h3>
        <p className="text-xs text-text-muted mb-4">
          Configure real-time calculation precision and continuous sweep speed.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
          <div>
            <label className="block text-text-secondary mb-1">Significant Digits Precision</label>
            <select
              value={precision}
              onChange={(e) => setPrecision(parseInt(e.target.value))}
              className="w-full bg-surface-elevated border border-border rounded-lg p-2 text-text-primary focus:outline-none focus:border-accent-blue"
            >
              <option value={2}>2 Significant Digits (0.01)</option>
              <option value={3}>3 Significant Digits (0.001) [Recommended]</option>
              <option value={4}>4 Significant Digits (0.0001)</option>
              <option value={5}>5 Significant Digits (Scientific)</option>
            </select>
          </div>

          <div>
            <label className="block text-text-secondary mb-1">Waveform Sweep Speed</label>
            <select
              value={simulationSpeed}
              onChange={(e) => setSimulationSpeed(parseFloat(e.target.value))}
              className="w-full bg-surface-elevated border border-border rounded-lg p-2 text-text-primary focus:outline-none focus:border-accent-blue"
            >
              <option value={0.5}>0.5x (Slow Sweep)</option>
              <option value={1.0}>1.0x (Standard Real-Time)</option>
              <option value={1.5}>1.5x (Fast Transient)</option>
              <option value={2.0}>2.0x (Double Speed)</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Keyboard Shortcuts Reference */}
      <Card className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <Keyboard className="w-4 h-4 text-text-muted" />
          <h3 className="text-sm font-semibold font-mono text-text-primary uppercase tracking-wider">
            Keyboard Shortcuts
          </h3>
        </div>

        <div className="divide-y divide-border/40 text-xs font-mono">
          <div className="py-2.5 flex items-center justify-between">
            <span className="text-text-secondary">Open Global Command Palette</span>
            <kbd className="px-2 py-0.5 rounded bg-surface-elevated border border-border text-text-primary">
              Ctrl + K / ⌘ + K
            </kbd>
          </div>
          <div className="py-2.5 flex items-center justify-between">
            <span className="text-text-secondary">Save Experiment Snapshot</span>
            <kbd className="px-2 py-0.5 rounded bg-surface-elevated border border-border text-text-primary">
              Ctrl + S
            </kbd>
          </div>
          <div className="py-2.5 flex items-center justify-between">
            <span className="text-text-secondary">Close Dialog / Modal</span>
            <kbd className="px-2 py-0.5 rounded bg-surface-elevated border border-border text-text-primary">
              Esc
            </kbd>
          </div>
        </div>
      </Card>

      {/* Local Storage & Reset */}
      <Card className="p-4 sm:p-5 border-rose-500/20 bg-rose-500/5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-rose-400 font-mono flex items-center gap-1.5">
              <Trash2 className="w-4 h-4" />
              Reset Local Storage
            </h3>
            <p className="text-xs text-text-muted mt-0.5">
              Permanently wipe all locally persisted experiment histories, completions, and custom calibrations.
            </p>
          </div>
          <Button
            variant="danger"
            size="sm"
            className="shrink-0 self-start sm:self-auto"
            onClick={() => {
              if (window.confirm('Are you sure you want to reset all local laboratory progress?')) {
                resetAllUserData();
                alert('Local data successfully reset.');
              }
            }}
          >
            Clear Data
          </Button>
        </div>
      </Card>
    </div>
  );
};
