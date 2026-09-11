import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { EXPERIMENTS_CATALOG, LAB_MODULES } from '../../data/labsData';
import { useAppStore } from '../../store/useAppStore';
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { BookmarkCheck, Search, Download, ArrowRight, Trash2, CheckCircle2 } from 'lucide-react';

export const ExperimentsPage: React.FC = () => {
  const navigate = useNavigate();
  const { completedExperimentIds, recentExperiments, resetAllUserData } = useAppStore();

  const [search, setSearch] = useState('');
  const [selectedLab, setSelectedLab] = useState<string>('all');

  const filteredExperiments = useMemo(() => {
    return EXPERIMENTS_CATALOG.filter((exp) => {
      const matchesLab = selectedLab === 'all' || exp.labCategory === selectedLab;
      const matchesSearch =
        exp.title.toLowerCase().includes(search.toLowerCase()) ||
        exp.description.toLowerCase().includes(search.toLowerCase()) ||
        exp.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
      return matchesLab && matchesSearch;
    });
  }, [selectedLab, search]);

  const handleExportJSON = () => {
    const data = {
      exportDate: new Date().toISOString(),
      completedExperiments: completedExperimentIds,
      recentSessions: recentExperiments,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `e-lab-experiments-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Title', 'Lab Category', 'Difficulty', 'Status', 'Formula'];
    const rows = EXPERIMENTS_CATALOG.map(exp => [
      exp.id,
      `"${exp.title.replace(/"/g, '""')}"`,
      exp.labCategory,
      exp.difficulty,
      completedExperimentIds.includes(exp.id) ? 'Completed' : 'Pending',
      `"${(exp.formulaKatex || '').replace(/"/g, '""')}"`,
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `e-lab-curriculum-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-accent-blue mb-1">
            <BookmarkCheck className="w-3.5 h-3.5" />
            <span>LABORATORY CURRICULUM & SAVED DATA</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">
            Engineering Experiments Library
          </h1>
          <p className="text-xs sm:text-sm text-text-muted mt-1">
            Explore and launch simulations across all 5 engineering domains.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="secondary" size="sm" onClick={handleExportJSON} className="gap-1.5 font-mono text-xs">
            <Download className="w-3.5 h-3.5" />
            JSON
          </Button>
          <Button variant="secondary" size="sm" onClick={handleExportCSV} className="gap-1.5 font-mono text-xs">
            <Download className="w-3.5 h-3.5" />
            CSV
          </Button>
          <Button variant="ghost" size="sm" onClick={handlePrint} className="gap-1.5 font-mono text-xs border border-border">
            Print
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => {
              if (window.confirm('Reset all saved simulation sessions and progress?')) {
                resetAllUserData();
              }
            }}
            className="gap-1.5 font-mono text-xs"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Reset
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          <button
            onClick={() => setSelectedLab('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
              selectedLab === 'all'
                ? 'bg-accent-blue text-white font-semibold shadow-sm'
                : 'bg-surface-elevated text-text-secondary hover:text-text-primary border border-border'
            }`}
          >
            All Disciplines
          </button>
          {LAB_MODULES.map((lab) => (
            <button
              key={lab.id}
              onClick={() => setSelectedLab(lab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                selectedLab === lab.id
                  ? 'bg-accent-blue text-white font-semibold shadow-sm'
                  : 'bg-surface-elevated text-text-secondary hover:text-text-primary border border-border'
              }`}
            >
              {lab.shortTitle}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-3.5 h-3.5 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Filter by title or tag..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-surface-elevated border border-border rounded-lg pl-9 pr-3 py-1.5 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-blue font-mono"
          />
        </div>
      </div>

      {/* Experiment Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredExperiments.map((exp) => {
          const isDone = completedExperimentIds.includes(exp.id);

          return (
            <Card
              key={exp.id}
              hoverEffect
              className="flex flex-col justify-between cursor-pointer group border-border/80 hover:border-zinc-700"
              onClick={() => navigate(exp.route)}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-text-muted uppercase tracking-wider">
                    {exp.labCategory}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {isDone && (
                      <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3" />
                        COMPLETED
                      </span>
                    )}
                    <Badge variant={exp.difficulty === 'Beginner' ? 'success' : exp.difficulty === 'Intermediate' ? 'info' : 'warning'}>
                      {exp.difficulty}
                    </Badge>
                  </div>
                </div>

                <CardTitle className="mt-3 group-hover:text-accent-blue transition-colors text-base">
                  {exp.title}
                </CardTitle>
                <CardDescription className="line-clamp-2 text-xs">
                  {exp.description}
                </CardDescription>
              </CardHeader>

              <CardFooter className="flex items-center justify-between text-xs font-mono pt-3 border-t border-border/50">
                <div className="flex flex-wrap gap-1">
                  {exp.tags.slice(0, 2).map((t) => (
                    <span key={t} className="px-1.5 py-0.2 rounded bg-surface border border-border text-text-muted text-[10px]">
                      #{t}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-1 text-accent-blue group-hover:translate-x-1 transition-transform">
                  <span>Launch</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
