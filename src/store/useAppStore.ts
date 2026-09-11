import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ThemeMode, RecentExperimentSession, DisciplineProgress } from '../types';

interface AppState {
  // Theme
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;

  // Shell State
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;

  // Command Palette
  commandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;

  // Telemetry & Progress
  completedExperimentIds: string[];
  markExperimentCompleted: (id: string) => void;
  recentExperiments: RecentExperimentSession[];
  addRecentExperiment: (session: Omit<RecentExperimentSession, 'id' | 'timestamp'>) => void;

  // Settings
  simulationSpeed: number; // 0.5 to 2.0
  setSimulationSpeed: (speed: number) => void;
  precision: number;
  setPrecision: (p: number) => void;

  disciplineProgress: DisciplineProgress[];

  // Reset
  resetAllUserData: () => void;
}

export const defaultProgress: DisciplineProgress[] = [
  { category: 'circuits', name: 'Circuit Analysis', percentage: 60, completed: 3, total: 5 },
  { category: 'signals', name: 'Signals & Systems', percentage: 50, completed: 2, total: 4 },
  { category: 'digital', name: 'Digital Electronics', percentage: 50, completed: 3, total: 6 },
  { category: 'control', name: 'Control Systems', percentage: 50, completed: 2, total: 4 },
  { category: 'tools', name: 'Engineering Tools', percentage: 43, completed: 6, total: 14 },
];

const initialRecents: RecentExperimentSession[] = [
  {
    id: 'rec-1',
    experimentId: 'ohms-law',
    title: "Ohm's Law & Power Dissipation",
    labName: 'Circuit Lab',
    route: '/circuits',
    timestamp: '15 mins ago',
    summary: 'V = 12.0 V, R = 1.0 kΩ, I = 12.0 mA',
  },
  {
    id: 'rec-2',
    experimentId: 'signal-generator',
    title: 'Sine Wave Harmonic Analysis',
    labName: 'Signals & Systems',
    route: '/signals',
    timestamp: '2 hours ago',
    summary: 'f = 1.0 kHz, Vpk = 5.0 V, THD < 0.1%',
  },
  {
    id: 'rec-3',
    experimentId: 'logic-gates',
    title: 'XOR & Full Adder Verification',
    labName: 'Digital Electronics',
    route: '/digital',
    timestamp: 'Yesterday',
    summary: 'A=1, B=1 -> Sum=0, Cout=1',
  },
  {
    id: 'rec-4',
    experimentId: 'step-response',
    title: 'Second-Order Damping Response',
    labName: 'Control Systems',
    route: '/control',
    timestamp: '3 days ago',
    summary: 'ζ = 0.707 (Critically Damped), ωn = 10 rad/s',
  },
];

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      theme: 'dark',
      setTheme: (theme) => {
        set({ theme });
        applyThemeClass(theme);
      },

      sidebarCollapsed: false,
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),
      mobileMenuOpen: false,
      setMobileMenuOpen: (mobileMenuOpen) => set({ mobileMenuOpen }),

      commandPaletteOpen: false,
      setCommandPaletteOpen: (commandPaletteOpen) => set({ commandPaletteOpen }),

      completedExperimentIds: ['ohms-law', 'rc-filter', 'sine-wave', 'logic-gates'],
      disciplineProgress: defaultProgress,
      markExperimentCompleted: (id) =>
        set((state) => ({
          completedExperimentIds: state.completedExperimentIds.includes(id)
            ? state.completedExperimentIds
            : [...state.completedExperimentIds, id],
        })),

      recentExperiments: initialRecents,
      addRecentExperiment: (session) => {
        const newSession: RecentExperimentSession = {
          ...session,
          id: `rec-${Date.now()}`,
          timestamp: 'Just now',
        };
        const updated = [newSession, ...get().recentExperiments.filter((s) => s.experimentId !== session.experimentId)].slice(0, 8);
        set({ recentExperiments: updated });
      },

      simulationSpeed: 1.0,
      setSimulationSpeed: (simulationSpeed) => set({ simulationSpeed }),
      precision: 3,
      setPrecision: (precision) => set({ precision }),

      resetAllUserData: () =>
        set({
          completedExperimentIds: [],
          recentExperiments: [],
        }),
    }),
    {
      name: 'e-lab-settings-storage',
      partialize: (state) => ({
        theme: state.theme,
        sidebarCollapsed: state.sidebarCollapsed,
        completedExperimentIds: state.completedExperimentIds,
        recentExperiments: state.recentExperiments,
        simulationSpeed: state.simulationSpeed,
        precision: state.precision,
      }),
    }
  )
);

export function applyThemeClass(theme: ThemeMode) {
  const root = document.documentElement;
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  if (theme === 'dark' || (theme === 'system' && prefersDark)) {
    root.classList.add('dark');
    root.classList.remove('light');
  } else {
    root.classList.add('light');
    root.classList.remove('dark');
  }
}
