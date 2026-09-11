export type ThemeMode = 'dark' | 'light' | 'system';

export type LabCategory = 'circuits' | 'signals' | 'digital' | 'control' | 'tools';

export interface LabModule {
  id: LabCategory;
  title: string;
  shortTitle: string;
  description: string;
  route: string;
  iconName: string;
  experimentCount: number;
  status: 'active' | 'beta' | 'planned';
  color: string;
  accentColor: string;
  popularExperiments: string[];
}

export interface Experiment {
  id: string;
  labCategory: LabCategory;
  title: string;
  description: string;
  objective: string;
  theory: string;
  formulaKatex?: string;
  route: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  tags: string[];
  isCompleted?: boolean;
}

export interface RecentExperimentSession {
  id: string;
  experimentId: string;
  title: string;
  labName: string;
  route: string;
  timestamp: string;
  summary: string;
}

export interface DisciplineProgress {
  category: LabCategory;
  name: string;
  percentage: number;
  completed: number;
  total: number;
}
