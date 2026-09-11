import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import { LAB_MODULES } from '../../data/labsData';
import { WaveformVisualizer } from '../../components/common/WaveformVisualizer';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import {
  Zap,
  Activity,
  Cpu,
  Sliders,
  Wrench,
  ArrowRight,
  Play,
  CheckCircle2,
  TrendingUp,
  History,
  Compass,
  Sparkles,
  SlidersHorizontal,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { completedExperimentIds, recentExperiments } = useAppStore();

  // Dynamic greeting based on user's current hour
  const greeting = React.useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning, Engineer.';
    if (hour < 18) return 'Good afternoon, Engineer.';
    return 'Good evening, Engineer.';
  }, []);

  // Waveform hero interactive state
  const [heroWaveform, setHeroWaveform] = useState<'sine' | 'square' | 'triangle' | 'sawtooth'>('sine');
  const [heroFreq, setHeroFreq] = useState(2.5);

  const iconMap: Record<string, React.ElementType> = {
    Zap,
    Activity,
    Cpu,
    Sliders,
    Wrench,
  };

  const domainProgress = [
    { name: 'Signals & Systems', percentage: 64, color: 'bg-cyan-500' },
    { name: 'Digital Electronics', percentage: 82, color: 'bg-emerald-500' },
    { name: 'Circuit Analysis', percentage: 71, color: 'bg-blue-500' },
    { name: 'Control Systems', percentage: 38, color: 'bg-purple-500' },
  ];

  const continueExp = recentExperiments[0] || {
    experimentId: 'ohms-law',
    title: "Ohm's Law & Power Dissipation",
    labName: 'Circuit Lab',
    route: '/circuits',
    summary: 'Linear DC V-I characteristic curve simulation',
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* HERO SECTION */}
      <div className="relative rounded-2xl border border-border bg-surface-elevated/70 p-6 md:p-8 overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-accent-blue/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-10 w-80 h-80 bg-accent-cyan/5 rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Hero Left Content */}
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono bg-surface border border-border text-accent-cyan">
              <Sparkles className="w-3.5 h-3.5" />
              <span>v1.0 • Browser-Based Scientific Environment</span>
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-text-primary">
                {greeting}
              </h1>
              <p className="text-xl sm:text-2xl font-medium text-text-secondary tracking-tight">
                Explore. Experiment. Understand.
              </p>
            </div>

            <p className="text-sm text-text-muted max-w-xl leading-relaxed">
              Your interactive engineering laboratory. Build digital circuits, analyze frequency spectra, verify Ohm's and Kirchhoff's laws, and explore control responses with instant mathematical feedback.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button
                variant="primary"
                size="md"
                onClick={() => navigate('/circuits')}
                className="gap-2"
              >
                <Play className="w-4 h-4 fill-white" />
                Start Experiment
              </Button>
              <Button
                variant="secondary"
                size="md"
                onClick={() => navigate('/experiments')}
                className="gap-2"
              >
                <Compass className="w-4 h-4" />
                Explore All Labs
              </Button>
            </div>
          </div>

          {/* Hero Right: Live Interactive Simulation Preview */}
          <div className="lg:col-span-5 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono text-text-muted px-1">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <span>Live Signal Trace</span>
              </span>
              <div className="flex items-center gap-1">
                {(['sine', 'square', 'triangle', 'sawtooth'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setHeroWaveform(type)}
                    className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-mono transition-colors ${
                      heroWaveform === type
                        ? 'bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/40 font-bold'
                        : 'bg-surface border border-border text-text-muted hover:text-text-primary'
                    }`}
                  >
                    {type.slice(0, 3)}
                  </button>
                ))}
              </div>
            </div>

            <WaveformVisualizer
              waveformType={heroWaveform}
              frequency={heroFreq}
              amplitude={2.8}
              color="#06B6D4"
              className="h-44 shadow-lg"
            />

            <div className="flex items-center justify-between text-[11px] font-mono text-text-muted px-1">
              <span>Modulation: Continuous</span>
              <div className="flex items-center gap-2">
                <span>Freq: {heroFreq.toFixed(1)} Hz</span>
                <input
                  type="range"
                  min="0.5"
                  max="6.0"
                  step="0.5"
                  value={heroFreq}
                  onChange={(e) => setHeroFreq(parseFloat(e.target.value))}
                  className="w-16 h-1 bg-zinc-800 rounded appearance-none cursor-pointer accent-accent-cyan"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* QUICK LAUNCH: LAB MODULES */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-text-primary flex items-center gap-2">
              <SlidersHorizontal className="w-5 h-5 text-accent-blue" />
              Laboratory Modules
            </h2>
            <p className="text-xs text-text-muted">
              Select a specialized engineering laboratory to begin simulated experiments.
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/experiments')}
            className="text-xs font-mono"
          >
            Catalog View →
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {LAB_MODULES.map((lab) => {
            const Icon = iconMap[lab.iconName] || Zap;
            return (
              <Card
                key={lab.id}
                hoverEffect
                className="flex flex-col justify-between group cursor-pointer border-border/80 hover:border-zinc-700"
                onClick={() => navigate(lab.route)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className={`p-2.5 rounded-lg border ${lab.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <Badge variant="outline" className="text-[10px]">
                      {lab.experimentCount} Experiments
                    </Badge>
                  </div>
                  <CardTitle className="mt-3 group-hover:text-accent-blue transition-colors">
                    {lab.title}
                  </CardTitle>
                  <CardDescription className="line-clamp-2">
                    {lab.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-2">
                  <div className="text-[11px] font-mono text-text-muted uppercase tracking-wider">
                    Key Simulators
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {lab.popularExperiments.map((expName) => (
                      <span
                        key={expName}
                        className="px-2 py-0.5 rounded text-[11px] bg-surface-elevated border border-border/60 text-text-secondary font-mono"
                      >
                        {expName}
                      </span>
                    ))}
                  </div>
                </CardContent>

                <CardFooter className="flex items-center justify-between text-xs font-medium text-text-secondary group-hover:text-text-primary">
                  <span>Enter Laboratory</span>
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>

      {/* DASHBOARD ANALYTICS & RECENT SESSIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Col: Analytics & Mastery Progress */}
        <div className="lg:col-span-7 space-y-6">
          {/* Key Metrics Row */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <Card className="p-4 bg-surface-elevated/40">
              <div className="flex items-center gap-2 text-text-muted text-xs font-mono">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Completed</span>
              </div>
              <div className="text-2xl font-bold font-mono text-text-primary mt-1">
                {27 + completedExperimentIds.length}
              </div>
              <div className="text-[11px] text-emerald-400 font-mono mt-0.5 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                <span>+4 this week</span>
              </div>
            </Card>

            <Card className="p-4 bg-surface-elevated/40">
              <div className="flex items-center gap-2 text-text-muted text-xs font-mono">
                <Activity className="w-4 h-4 text-cyan-400" />
                <span>Simulation Time</span>
              </div>
              <div className="text-2xl font-bold font-mono text-text-primary mt-1">
                14.8 h
              </div>
              <div className="text-[11px] text-text-muted font-mono mt-0.5">
                Deterministic cycles
              </div>
            </Card>

            <Card className="p-4 bg-surface-elevated/40 col-span-2 sm:col-span-1">
              <div className="flex items-center gap-2 text-text-muted text-xs font-mono">
                <Sliders className="w-4 h-4 text-purple-400" />
                <span>Overall Mastery</span>
              </div>
              <div className="text-2xl font-bold font-mono text-text-primary mt-1">
                68%
              </div>
              <div className="text-[11px] text-text-muted font-mono mt-0.5">
                Across 5 domains
              </div>
            </Card>
          </div>

          {/* Current Domain Progress */}
          <Card className="p-5">
            <h3 className="text-sm font-semibold tracking-tight text-text-primary mb-4 flex items-center justify-between">
              <span>Domain Mastery Breakdown</span>
              <span className="text-xs font-mono text-text-muted">Target: 100%</span>
            </h3>

            <div className="space-y-4">
              {domainProgress.map((item) => (
                <div key={item.name} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-text-secondary">{item.name}</span>
                    <span className="font-semibold text-text-primary">{item.percentage}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-surface-elevated overflow-hidden border border-border/40">
                    <div
                      className={`h-full rounded-full ${item.color} transition-all duration-500`}
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Col: Continue Experiment & Recent Activity */}
        <div className="lg:col-span-5 space-y-6">
          {/* Continue Experiment Panel */}
          <Card className="p-5 border-accent-blue/30 bg-accent-blue/5">
            <div className="flex items-center justify-between text-xs font-mono text-accent-blue mb-2">
              <span className="flex items-center gap-1.5 font-semibold">
                <Play className="w-3.5 h-3.5 fill-current" />
                CONTINUE EXPERIMENT
              </span>
              <span>Active State</span>
            </div>

            <h4 className="text-base font-bold text-text-primary">
              {continueExp.title}
            </h4>
            <p className="text-xs text-text-muted font-mono mt-1">
              Lab: {continueExp.labName} • {continueExp.summary}
            </p>

            <div className="mt-4 pt-3 border-t border-accent-blue/20 flex items-center justify-between">
              <span className="text-[11px] font-mono text-text-muted">Resume where you left off</span>
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate(continueExp.route)}
                className="text-xs font-mono gap-1.5"
              >
                Resume
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </Card>

          {/* Recent Experiments List */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold tracking-tight text-text-primary flex items-center gap-2">
                <History className="w-4 h-4 text-text-muted" />
                Recent Experiments
              </h3>
              <span className="text-[10px] font-mono text-text-muted">LOCAL STORAGE</span>
            </div>

            <div className="space-y-3 divide-y divide-border/40">
              {recentExperiments.slice(0, 4).map((rec) => (
                <div
                  key={rec.id}
                  onClick={() => navigate(rec.route)}
                  className="pt-2.5 first:pt-0 flex items-center justify-between group cursor-pointer"
                >
                  <div className="truncate pr-2">
                    <div className="text-xs font-medium text-text-primary group-hover:text-accent-blue transition-colors truncate">
                      {rec.title}
                    </div>
                    <div className="text-[11px] font-mono text-text-muted truncate">
                      {rec.labName} • {rec.summary}
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-text-muted shrink-0">
                    {rec.timestamp}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
