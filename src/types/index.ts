// Types pour le profil utilisateur
export interface UserProfile {
  startedSmokingYears: number;
  cigsPerDay: number;
  objectiveType: 'complete' | 'progressive';
  reductionFrequency?: number; // cigarettes à réduire tous les X jours
}

// Types pour les paramètres
export interface AppSettings {
  pricePerCig: number;
  currency: string;
  notificationsAllowed: boolean;
  language: string;
  animationsEnabled: boolean;
}

// Types pour la session du chronomètre
export interface TimerSession {
  isRunning: boolean;
  startTimestamp: number | null;
  elapsedBeforePause: number;
}

// Types pour les entrées quotidiennes
export interface DailyEntry {
  realCigs: number;
  goalCigs: number;
  date: string; // YYYY-MM-DD
  emotion?: EmotionType;
  objectiveMet: boolean;
}

// Types pour les émotions
export type EmotionType = 
  | 'happy' 
  | 'proud' 
  | 'frustrated' 
  | 'anxious' 
  | 'confident' 
  | 'disappointed' 
  | 'relieved' 
  | 'stressed';

export interface EmotionOption {
  type: EmotionType;
  emoji: string;
  label: string;
  color: string;
}

// Types pour la série (streak)
export interface StreakData {
  lastDateConnected: string; // YYYY-MM-DD
  currentStreak: number;
}

// Types pour les objectifs financiers
export interface FinancialGoal {
  id: string;
  title: string;
  price: number;
  createdAt: string;
  targetDate?: string;
}

// Types pour les réalisations
export interface Achievement {
  id: string;
  title: string;
  description: string;
  unlockedAt: string;
  icon: string;
}

// Types pour les données d'export
export interface ExportData {
  profile: UserProfile;
  settings: AppSettings;
  dailyEntries: Record<string, DailyEntry>;
  goals: FinancialGoal[];
  achievements: Achievement[];
  streak: StreakData;
  session: TimerSession;
  exportDate: string;
}

// Types pour les bénéfices santé
export interface HealthBenefit {
  id: string;
  title: string;
  description: string;
  timeRequired: number; // en minutes
  unlocked: boolean;
  unlockedAt?: string;
}

// Types pour les statistiques
export interface Statistics {
  cigarettesAvoided: number;
  moneySaved: number;
  daysOfGrowth: number;
  currentStreak: number;
  longestStreak: number;
}
