// Types pour le profil utilisateur
export interface UserProfile {
  id?: string; // ID de l'utilisateur Supabase
  startedSmokingYears: number;
  cigsPerDay: number;
  objectiveType: 'complete' | 'progressive';
  reductionFrequency?: number; // cigarettes à réduire par semaine
  
  // Nouvelles données d'onboarding
  age?: number;
  smokingYears?: number;
  firstCigaretteTime?: 'less_5min' | '5_30min' | '30_60min' | 'more_60min';
  smokingPeakTime?: 'morning' | 'after_meals' | 'work_breaks' | 'evening_alcohol' | 'all_day';
  mainGoal?: 'complete_stop' | 'progressive_reduction' | 'not_sure';
  targetDate?: string; // Pour arrêt complet
  mainMotivation?: 'health' | 'finance' | 'family' | 'sport' | 'independence';
  smokingTriggers?: ('stress' | 'boredom' | 'after_meals' | 'evening_alcohol' | 'social' | 'phone_work' | 'routine' | 'driving' | 'coffee_break')[];
  emotionHelp?: 'stress_anxiety' | 'concentration' | 'boredom' | 'social_pressure' | 'habit';
  stressLevel?: number; // 1-10
  previousAttempts?: 'first_time' | '1_2_times' | 'several_times' | 'relapse_quick';
  previousMethods?: ('cold_turkey' | 'patches' | 'gum' | 'vape' | 'medication' | 'other')[];
  relapseCause?: ('stress_emotion' | 'social' | 'morning_habit' | 'no_motivation' | 'no_support' | 'no_method')[];
  motivationLevel?: number; // 1-10
  wantSupportMessages?: boolean;
  onboardingCompleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Types pour les paramètres
export interface AppSettings {
  pricePerCig: number;
  currency: string;
  notificationsAllowed: boolean;
  language: string;
  animationsEnabled: boolean;
  hapticsEnabled: boolean;
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
  connectedOnDate?: string; // Date de connexion réelle (YYYY-MM-DD) - pour distinguer les saisies rétroactives
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
  panicStats?: PanicStats;
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
  userId?: string; // Pour la synchronisation Supabase
}

// Types pour les statistiques
export interface Statistics {
  cigarettesAvoided: number;
  moneySaved: number;
  daysOfGrowth: number;
  currentStreak: number;
  longestStreak: number;
}

// Types pour les statistiques de panique
export interface PanicStats {
  panicCount: number;
  successCount: number;
}

// Types pour le nouveau système d'onboarding
export interface OnboardingStepData {
  step: number;
  title: string;
  message: string;
  cta: string;
}

export interface OnboardingQuestionnaireData {
  // Section 1: Profil Fumeur
  smokingYears: number;
  cigsPerDay: number;
  firstCigaretteTime: 'less_5min' | '5_30min' | '30_60min' | 'more_60min';
  smokingPeakTime: 'morning' | 'after_meals' | 'work_breaks' | 'evening_alcohol' | 'all_day';
  age?: number; // Nouveau champ ajouté
  
  // Section 2: Objectifs
  mainGoal: 'complete_stop' | 'progressive_reduction' | 'not_sure';
  targetDate?: string; // Pour arrêt complet
  reductionFrequency?: number; // Pour réduction progressive (cigarettes par jour)
  mainMotivation: 'health' | 'finance' | 'family' | 'sport' | 'independence';
  
  // Section 3: Habitudes & Déclencheurs
  smokingTriggers: ('stress' | 'boredom' | 'after_meals' | 'evening_alcohol' | 'social' | 'phone_work' | 'routine' | 'driving' | 'coffee_break')[];
  emotionHelp: 'stress_anxiety' | 'concentration' | 'boredom' | 'social_pressure' | 'habit';
  stressLevel: number; // 1-10
  
  // Section 4: Historique
  previousAttempts: 'first_time' | '1_2_times' | 'several_times' | 'relapse_quick';
  previousMethods?: ('cold_turkey' | 'patches' | 'gum' | 'vape' | 'medication' | 'other')[]; // Nouveau champ
  relapseCause?: ('stress_emotion' | 'social' | 'morning_habit' | 'no_motivation' | 'no_support' | 'no_method')[];
  
  // Section 5: Motivation & Soutien
  motivationLevel: number; // 1-10
  wantSupportMessages: boolean;
}
