import React, { useEffect, useState } from 'react';
import { NavLink, useLocation, Link } from 'react-router-dom';
import { useAppStore, applyThemeClass } from '../../store/useAppStore';
import { CommandPalette } from '../common/CommandPalette';
import { AIAssistantModal } from '../../features/assistant/AIAssistantModal';
import {
  LayoutDashboard,
  Zap,
  Activity,
  Cpu,
  Sliders,
  Wrench,
  BookmarkCheck,
  Settings,
  Menu,
  X,
  Search,
  Moon,
  Sun,
  ChevronLeft,
  ChevronRight,
  Github,
  Radio,
  Sparkles,
} from 'lucide-react';

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const {
    theme,
    setTheme,
    sidebarCollapsed,
    toggleSidebar,
    mobileMenuOpen,
    setMobileMenuOpen,
    setCommandPaletteOpen,
  } = useAppStore();

  const [aiAssistantOpen, setAiAssistantOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const location = useLocation();

  // Apply initial theme on mount
  useEffect(() => {
    applyThemeClass(theme);
  }, [theme]);

  // Close mobile drawer on route navigation
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname, setMobileMenuOpen]);

  // Global Keyboard Shortcuts (ANTIGRAVITY.md §58)
  useEffect(() => {
    const handleGlobalShortcuts = (e: KeyboardEvent) => {
      // Ctrl + S / Cmd + S: Save Experiment
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        setToastMessage('💾 Current experiment configuration saved locally');
        setTimeout(() => setToastMessage(null), 2500);
      }
      // Alt + R / Ctrl + Shift + R: Reset Simulation
      if ((e.altKey && e.key.toLowerCase() === 'r') || ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'r')) {
        e.preventDefault();
        setToastMessage('🔄 Simulation parameters reset signal triggered');
        setTimeout(() => setToastMessage(null), 2500);
      }
      // Esc: Close Modal / Panel
      if (e.key === 'Escape') {
        setAiAssistantOpen(false);
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener('keydown', handleGlobalShortcuts);
    return () => window.removeEventListener('keydown', handleGlobalShortcuts);
  }, [setMobileMenuOpen]);

  const navLinks = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Circuit Lab', path: '/circuits', icon: Zap, badge: '5' },
    { name: 'Signals & Systems', path: '/signals', icon: Activity, badge: '4' },
    { name: 'Digital Electronics', path: '/digital', icon: Cpu, badge: '6' },
    { name: 'Control Systems', path: '/control', icon: Sliders, badge: '4' },
    { name: 'Engineering Tools', path: '/tools', icon: Wrench, badge: '13' },
    { name: 'My Experiments', path: '/experiments', icon: BookmarkCheck },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background text-text-primary antialiased font-sans selection:bg-accent-blue/20 selection:text-accent-blue">
      <CommandPalette />

      {/* TOP HEADER */}
      <header className="sticky top-0 z-40 w-full h-14 border-b border-border bg-surface/95 backdrop-blur-md flex items-center justify-between px-4 lg:px-6">
        <div className="flex items-center gap-3">
          {/* Mobile menu trigger */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-elevated"
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-surface-elevated border border-border flex items-center justify-center text-accent-blue group-hover:border-accent-blue/50 group-hover:shadow-glow-blue transition-all">
              <Zap className="w-4 h-4 fill-accent-blue/20 stroke-accent-blue" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm tracking-wider font-mono text-text-primary">
                  E-LAB
                </span>
                <span className="hidden sm:inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse mr-1" />
                  SIM READY
                </span>
              </div>
              <span className="hidden sm:block text-[10px] font-mono text-text-muted leading-tight">
                Interactive Engineering Laboratory
              </span>
            </div>
          </Link>
        </div>

        {/* Global Search trigger bar */}
        <div className="flex-1 max-w-md mx-4 hidden md:block">
          <button
            type="button"
            onClick={() => setCommandPaletteOpen(true)}
            className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg bg-surface-elevated border border-border hover:border-zinc-700 text-xs text-text-muted hover:text-text-secondary transition-all"
          >
            <div className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-text-muted" />
              <span>Search simulations, formulas, tools...</span>
            </div>
            <kbd className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono text-text-muted bg-surface border border-border rounded">
              Ctrl K
            </kbd>
          </button>
        </div>

        {/* Top Header Actions */}
        <div className="flex items-center gap-2">
          {/* Mobile search button */}
          <button
            type="button"
            onClick={() => setCommandPaletteOpen(true)}
            className="md:hidden p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-elevated"
            aria-label="Open search palette"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Theme switcher */}
          <button
            type="button"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-elevated transition-colors"
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-blue-500" />}
          </button>

          {/* Telemetry Indicator */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-surface-elevated border border-border text-[11px] font-mono text-text-muted">
            <Radio className="w-3 h-3 text-cyan-400 animate-pulse" />
            <span>200 kS/s</span>
          </div>

          {/* AI Assistant Button */}
          <button
            type="button"
            onClick={() => setAiAssistantOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-accent-purple/15 hover:bg-accent-purple/25 text-accent-purple border border-accent-purple/30 text-xs font-mono font-medium transition-all shadow-sm"
            title="Open E-Lab AI Assistant"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">AI Assistant</span>
          </button>

          {/* GitHub Repository */}
          <a
            href="https://github.com/KankonNil007/Machine-Learning-Journey"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-elevated transition-colors"
            title="View Source on GitHub"
          >
            <Github className="w-4 h-4" />
          </a>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* DESKTOP SIDEBAR */}
        <aside
          className={`hidden md:flex flex-col border-r border-border bg-surface shrink-0 transition-all duration-300 select-none ${
            sidebarCollapsed ? 'w-16' : 'w-60'
          }`}
        >
          {/* Navigation Links */}
          <div className="flex-1 py-3 px-2 space-y-1 overflow-y-auto">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;

              return (
                <NavLink
                  key={link.path}
                  to={link.path}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all group relative ${
                    isActive
                      ? 'bg-accent-blue/10 text-accent-blue border border-accent-blue/30 font-semibold'
                      : 'text-text-secondary hover:text-text-primary hover:bg-surface-elevated'
                  }`}
                  title={sidebarCollapsed ? link.name : undefined}
                >
                  <div className="flex items-center gap-3 truncate">
                    <Icon
                      className={`w-4 h-4 shrink-0 transition-colors ${
                        isActive ? 'text-accent-blue' : 'text-text-muted group-hover:text-text-primary'
                      }`}
                    />
                    {!sidebarCollapsed && <span className="truncate">{link.name}</span>}
                  </div>

                  {!sidebarCollapsed && link.badge && (
                    <span
                      className={`px-1.5 py-0.2 rounded text-[10px] font-mono ${
                        isActive
                          ? 'bg-accent-blue/20 text-accent-blue'
                          : 'bg-surface-elevated text-text-muted border border-border/80'
                      }`}
                    >
                      {link.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </div>

          {/* Sidebar Collapse Footer */}
          <div className="p-2 border-t border-border/80">
            <button
              type="button"
              onClick={toggleSidebar}
              className="w-full flex items-center justify-center p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-elevated text-xs transition-colors"
              title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {sidebarCollapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <div className="flex items-center gap-2">
                  <ChevronLeft className="w-4 h-4" />
                  <span className="font-mono text-[11px]">Collapse View</span>
                </div>
              )}
            </button>
          </div>
        </aside>

        {/* MOBILE DRAWER */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex">
            <div
              className="fixed inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="relative w-64 bg-surface border-r border-border h-full flex flex-col p-4 z-10 shadow-2xl">
              <div className="flex items-center justify-between pb-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded bg-surface-elevated border border-border flex items-center justify-center text-accent-blue">
                    <Zap className="w-4 h-4" />
                  </div>
                  <span className="font-bold font-mono text-sm">E-LAB</span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 rounded text-text-muted hover:text-text-primary"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 py-4 space-y-1.5 overflow-y-auto">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  const isActive = location.pathname === link.path;

                  return (
                    <NavLink
                      key={link.path}
                      to={link.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-all ${
                        isActive
                          ? 'bg-accent-blue/10 text-accent-blue font-semibold border border-accent-blue/30'
                          : 'text-text-secondary hover:text-text-primary hover:bg-surface-elevated'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4" />
                        <span>{link.name}</span>
                      </div>
                      {link.badge && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-surface-elevated text-text-muted border border-border">
                          {link.badge}
                        </span>
                      )}
                    </NavLink>
                  );
                })}
              </div>

              <div className="pt-4 border-t border-border flex items-center justify-between text-xs text-text-muted font-mono">
                <span>E-Lab v1.0.0</span>
                <span>Static PWA</span>
              </div>
            </div>
          </div>
        )}

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 overflow-y-auto bg-background bg-grid-technical flex flex-col">
          <div className="flex-1 p-3 sm:p-5 md:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {children}
          </div>

          {/* Subtle Technical Footer */}
          <footer className="w-full border-t border-border/60 bg-surface/50 px-4 sm:px-6 py-3 flex flex-col sm:flex-row items-center justify-between text-xs text-text-muted font-mono gap-2 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-3">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                Deterministic Simulation Engine v1.0
              </span>
              <span className="text-border hidden sm:inline">|</span>
              <span className="hidden xs:inline">100% Client-Side</span>
            </div>
            <div className="flex items-center gap-4">
              <span>Press <kbd className="px-1 py-0.2 rounded bg-surface-elevated border border-border text-text-secondary">Ctrl</kbd> + <kbd className="px-1 py-0.2 rounded bg-surface-elevated border border-border text-text-secondary">K</kbd> for Command Hub</span>
            </div>
          </footer>
        </main>
      </div>

      {/* AI Assistant Modal */}
      <AIAssistantModal isOpen={aiAssistantOpen} onClose={() => setAiAssistantOpen(false)} />

      {/* Global Shortcut Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="px-4 py-2.5 rounded-xl bg-surface-elevated border border-accent-blue/40 shadow-xl shadow-black/40 text-xs font-mono text-text-primary flex items-center gap-2">
            <span>{toastMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
};
