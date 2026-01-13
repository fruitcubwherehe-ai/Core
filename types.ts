
export type ColorTheme = {
  id: string;
  name: string;
  hex: string;
  cost: number;
  unlocked: boolean;
};

export type Proof = {
  id: string; // Unique ID to link to IndexedDB
  habitId: string;
  date: string; // ISO string
};

export type Habit = {
  id: string;
  title: string;
  completedDays: string[]; // YYYY-MM-DD
  createdAt: string;
};

export type UserStats = {
  points: number;
  totalXP: number;
  rankIndex: number;
};

export type GameState = {
  habits: Habit[];
  stats: UserStats;
  themes: ColorTheme[];
  activeThemeId: string;
  proofLog: Proof[];
  lastCheckDate?: string;
  volume: number; // 0.0 to 1.0
};

export enum AppScreen {
  SPLASH = 'SPLASH',
  MENU = 'MENU',
  DASHBOARD = 'DASHBOARD',
  SETTINGS = 'SETTINGS',
  PROOFLOG = 'PROOFLOG',
  PROGRESS = 'PROGRESS',
  EXIT = 'EXIT'
}
