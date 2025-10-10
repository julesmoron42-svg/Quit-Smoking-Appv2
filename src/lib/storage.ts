import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  UserProfile, 
  AppSettings, 
  TimerSession, 
  DailyEntry, 
  StreakData, 
  FinancialGoal, 
  Achievement,
  ExportData 
} from '../types';
import { DataSyncService } from './dataSync';

// Clés de stockage
const STORAGE_KEYS = {
  PROFILE: '@MyQuitZone:profile',
  SETTINGS: '@MyQuitZone:settings',
  SESSION: '@MyQuitZone:session',
  DAILY_ENTRIES: '@MyQuitZone:dailyEntries',
  STREAK: '@MyQuitZone:streak',
  GOALS: '@MyQuitZone:goals',
  ACHIEVEMENTS: '@MyQuitZone:achievements',
} as const;

// Valeurs par défaut
const DEFAULT_PROFILE: UserProfile = {
  startedSmokingYears: 0,
  cigsPerDay: 20,
  objectiveType: 'complete',
  reductionFrequency: 1,
  onboardingCompleted: false,
};

const DEFAULT_SETTINGS: AppSettings = {
  pricePerCig: 0.6,
  currency: '€',
  notificationsAllowed: true,
  language: 'fr',
  animationsEnabled: true,
};

const DEFAULT_SESSION: TimerSession = {
  isRunning: false,
  startTimestamp: null,
  elapsedBeforePause: 0,
};

const DEFAULT_STREAK: StreakData = {
  lastDateConnected: '',
  currentStreak: 0,
};

// Fonctions de stockage génériques
export const storage = {
  async get<T>(key: string, defaultValue: T): Promise<T> {
    try {
      const value = await AsyncStorage.getItem(key);
      return value ? JSON.parse(value) : defaultValue;
    } catch (error) {
      console.error(`Erreur lors de la lecture de ${key}:`, error);
      return defaultValue;
    }
  },

  async set<T>(key: string, value: T): Promise<void> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Erreur lors de l'écriture de ${key}:`, error);
    }
  },

  async remove(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error(`Erreur lors de la suppression de ${key}:`, error);
    }
  },

  async clear(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Erreur lors du nettoyage du stockage:', error);
    }
  },
};

// Fonctions spécifiques pour chaque type de données
export const profileStorage = {
  async get(userId?: string): Promise<UserProfile> {
    const localProfile = await storage.get(STORAGE_KEYS.PROFILE, DEFAULT_PROFILE);
    
    // Si on a un userId, essayer de récupérer depuis Supabase
    if (userId) {
      try {
        const { data: remoteProfile } = await DataSyncService.getUserProfile(userId);
        if (remoteProfile) {
          // Fusionner les données locales et distantes
          const mergedProfile = { ...localProfile, ...remoteProfile };
          await storage.set(STORAGE_KEYS.PROFILE, mergedProfile);
          return mergedProfile;
        }
      } catch (error) {
        console.log('Utilisation des données locales pour le profil');
      }
    }
    
    return localProfile;
  },

  async set(profile: UserProfile, userId?: string): Promise<void> {
    // Sauvegarder localement
    await storage.set(STORAGE_KEYS.PROFILE, profile);
    
    // Synchroniser avec Supabase si on a un userId
    if (userId) {
      try {
        await DataSyncService.syncUserProfile(userId, profile);
      } catch (error) {
        console.log('Erreur de synchronisation du profil:', error);
      }
    }
  },
};

export const settingsStorage = {
  async get(): Promise<AppSettings> {
    return storage.get(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
  },

  async set(settings: AppSettings): Promise<void> {
    return storage.set(STORAGE_KEYS.SETTINGS, settings);
  },
};

export const sessionStorage = {
  async get(): Promise<TimerSession> {
    return storage.get(STORAGE_KEYS.SESSION, DEFAULT_SESSION);
  },

  async set(session: TimerSession): Promise<void> {
    return storage.set(STORAGE_KEYS.SESSION, session);
  },
};

export const dailyEntriesStorage = {
  async get(): Promise<Record<string, DailyEntry>> {
    return storage.get(STORAGE_KEYS.DAILY_ENTRIES, {});
  },

  async set(entries: Record<string, DailyEntry>): Promise<void> {
    return storage.set(STORAGE_KEYS.DAILY_ENTRIES, entries);
  },

  async addEntry(date: string, entry: DailyEntry): Promise<void> {
    const entries = await this.get();
    entries[date] = entry;
    return this.set(entries);
  },
};

export const streakStorage = {
  async get(): Promise<StreakData> {
    return storage.get(STORAGE_KEYS.STREAK, DEFAULT_STREAK);
  },

  async set(streak: StreakData): Promise<void> {
    return storage.set(STORAGE_KEYS.STREAK, streak);
  },
};

export const goalsStorage = {
  async get(): Promise<FinancialGoal[]> {
    return storage.get(STORAGE_KEYS.GOALS, []);
  },

  async set(goals: FinancialGoal[]): Promise<void> {
    return storage.set(STORAGE_KEYS.GOALS, goals);
  },

  async addGoal(goal: FinancialGoal): Promise<void> {
    const goals = await this.get();
    goals.push(goal);
    return this.set(goals);
  },

  async removeGoal(goalId: string): Promise<void> {
    const goals = await this.get();
    const filteredGoals = goals.filter(goal => goal.id !== goalId);
    return this.set(filteredGoals);
  },
};

export const achievementsStorage = {
  async get(): Promise<Achievement[]> {
    return storage.get(STORAGE_KEYS.ACHIEVEMENTS, []);
  },

  async set(achievements: Achievement[]): Promise<void> {
    return storage.set(STORAGE_KEYS.ACHIEVEMENTS, achievements);
  },

  async addAchievement(achievement: Achievement): Promise<void> {
    const achievements = await this.get();
    achievements.push(achievement);
    return this.set(achievements);
  },
};

// Fonction d'export de toutes les données
export const exportAllData = async (): Promise<ExportData> => {
  const [profile, settings, session, dailyEntries, streak, goals, achievements] = await Promise.all([
    profileStorage.get(),
    settingsStorage.get(),
    sessionStorage.get(),
    dailyEntriesStorage.get(),
    streakStorage.get(),
    goalsStorage.get(),
    achievementsStorage.get(),
  ]);

  return {
    profile,
    settings,
    session,
    dailyEntries,
    streak,
    goals,
    achievements,
    exportDate: new Date().toISOString(),
  };
};

// Fonction d'import de données
export const importData = async (data: ExportData): Promise<void> => {
  await Promise.all([
    profileStorage.set(data.profile),
    settingsStorage.set(data.settings),
    sessionStorage.set(data.session),
    dailyEntriesStorage.set(data.dailyEntries),
    streakStorage.set(data.streak),
    goalsStorage.set(data.goals),
    achievementsStorage.set(data.achievements),
  ]);
};
