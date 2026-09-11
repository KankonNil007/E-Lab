import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import { EXPERIMENTS_CATALOG, LAB_MODULES } from '../../data/labsData';
import {
  Search,
  Zap,
  Activity,
  Cpu,
  Sliders,
  Wrench,
  Bookmark,
  Settings,
  Moon,
  Sun,
  ArrowRight,
  X,
} from 'lucide-react';

export const CommandPalette: React.FC = () => {
  const { commandPaletteOpen, setCommandPaletteOpen, setTheme } = useAppStore();
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Keyboard shortcut listener: Ctrl + K or Cmd + K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(!commandPaletteOpen);
      } else if (e.key === 'Escape' && commandPaletteOpen) {
        e.preventDefault();
        setCommandPaletteOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [commandPaletteOpen, setCommandPaletteOpen]);

  // Focus input when opened
  useEffect(() => {
    if (commandPaletteOpen) {
      setSearch('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [commandPaletteOpen]);

  // Aggregate searchable items
  const items = React.useMemo(() => {
    const list: Array<{
      id: string;
      title: string;
      subtitle: string;
      category: string;
      icon: React.ReactNode;
      action: () => void;
    }> = [];

    // Labs
    LAB_MODULES.forEach((lab) => {
      const iconMap: Record<string, React.ReactNode> = {
        Zap: <Zap className="w-4 h-4 text-blue-400" />,
        Activity: <Activity className="w-4 h-4 text-cyan-400" />,
        Cpu: <Cpu className="w-4 h-4 text-emerald-400" />,
        Sliders: <Sliders className="w-4 h-4 text-purple-400" />,
        Wrench: <Wrench className="w-4 h-4 text-amber-400" />,
      };

      list.push({
        id: `lab-${lab.id}`,
        title: lab.title,
        subtitle: lab.description,
        category: 'Laboratories',
        icon: iconMap[lab.iconName] || <Zap className="w-4 h-4" />,
        action: () => {
          navigate(lab.route);
          setCommandPaletteOpen(false);
        },
      });
    });

    // Experiments
    EXPERIMENTS_CATALOG.forEach((exp) => {
      list.push({
        id: `exp-${exp.id}`,
        title: exp.title,
        subtitle: `${exp.difficulty} • ${exp.tags.join(', ')}`,
        category: 'Experiments',
        icon: <Bookmark className="w-4 h-4 text-zinc-400" />,
        action: () => {
          navigate(exp.route);
          setCommandPaletteOpen(false);
        },
      });
    });

    // System actions
    list.push(
      {
        id: 'nav-dashboard',
        title: 'Home Dashboard',
        subtitle: 'Overview, analytics & quick-launch',
        category: 'Navigation',
        icon: <ArrowRight className="w-4 h-4 text-zinc-400" />,
        action: () => {
          navigate('/');
          setCommandPaletteOpen(false);
        },
      },
      {
        id: 'nav-settings',
        title: 'Settings',
        subtitle: 'Configure simulation preferences and interface',
        category: 'Navigation',
        icon: <Settings className="w-4 h-4 text-zinc-400" />,
        action: () => {
          navigate('/settings');
          setCommandPaletteOpen(false);
        },
      },
      {
        id: 'theme-dark',
        title: 'Switch to Dark Mode',
        subtitle: 'Dark-first scientific interface',
        category: 'Preferences',
        icon: <Moon className="w-4 h-4 text-blue-400" />,
        action: () => {
          setTheme('dark');
          setCommandPaletteOpen(false);
        },
      },
      {
        id: 'theme-light',
        title: 'Switch to Light Mode',
        subtitle: 'High-contrast light interface',
        category: 'Preferences',
        icon: <Sun className="w-4 h-4 text-amber-400" />,
        action: () => {
          setTheme('light');
          setCommandPaletteOpen(false);
        },
      }
    );

    if (!search.trim()) return list;

    const query = search.toLowerCase();
    return list.filter(
      (item) =>
        item.title.toLowerCase().includes(query) ||
        item.subtitle.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query)
    );
  }, [search, navigate, setCommandPaletteOpen, setTheme]);

  // Handle keyboard navigation within the results
  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, items.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + items.length) % Math.max(1, items.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (items[selectedIndex]) {
        items[selectedIndex].action();
      }
    }
  };

  if (!commandPaletteOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-10 sm:pt-20 px-3 sm:px-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={() => setCommandPaletteOpen(false)}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-xl bg-surface border border-border rounded-xl shadow-2xl overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3 border-b border-border bg-surface-elevated">
          <Search className="w-4 h-4 text-text-muted mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search experiments, laboratories, tools, or actions..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleInputKeyDown}
            className="w-full bg-transparent text-sm text-text-primary placeholder:text-text-muted focus:outline-none"
          />
          {search ? (
            <button
              onClick={() => setSearch('')}
              className="text-text-muted hover:text-text-primary p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono text-text-muted bg-surface border border-border rounded">
              ESC
            </kbd>
          )}
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 divide-y divide-border/30">
          {items.length === 0 ? (
            <div className="py-8 text-center text-text-muted text-sm">
              No matching experiments or actions found for "{search}".
            </div>
          ) : (
            items.map((item, index) => {
              const isSelected = index === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={item.action}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
                    isSelected ? 'bg-surface-elevated text-text-primary' : 'text-text-secondary hover:bg-surface-subtle'
                  }`}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="p-1.5 rounded-md bg-surface border border-border/80 shrink-0">
                      {item.icon}
                    </div>
                    <div className="truncate">
                      <div className="text-sm font-medium text-text-primary truncate">{item.title}</div>
                      <div className="text-xs text-text-muted truncate">{item.subtitle}</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-text-muted uppercase tracking-wider px-1.5 py-0.5 bg-surface border border-border/60 rounded shrink-0">
                    {item.category}
                  </span>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer Keyhints */}
        <div className="px-3 sm:px-4 py-2 border-t border-border bg-surface-elevated/50 flex flex-wrap items-center justify-between text-[10px] sm:text-[11px] text-text-muted font-mono gap-1">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span>Use <kbd className="px-1 py-0.2 rounded bg-surface border border-border">↑</kbd> <kbd className="px-1 py-0.2 rounded bg-surface border border-border">↓</kbd> to navigate</span>
            <span>•</span>
            <span><kbd className="px-1 py-0.2 rounded bg-surface border border-border">↵</kbd> to select</span>
          </div>
          <span className="hidden xs:inline">E-Lab Command Hub</span>
        </div>
      </div>
    </div>
  );
};
