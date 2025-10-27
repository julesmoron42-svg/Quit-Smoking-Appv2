import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { 
  UserProfile, 
  AppSettings, 
  TimerSession, 
  DailyEntry, 
  StreakData, 
  FinancialGoal, 
  Achievement,
  ExportData,
  PanicStats
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
  PANIC_STATS: '@MyQuitZone:panicStats',
  SYNCED_ENTRIES: '@MyQuitZone:syncedEntries', // Nouvelles entrées synchronisées
  PENDING_SYNC: '@MyQuitZone:pendingSync', // Entrées en attente de synchronisation
  PLAN_VALIDATIONS: '@MyQuitZone:planValidations', // Validations des jours du plan
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
  hapticsEnabled: true,
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

const DEFAULT_PANIC_STATS: PanicStats = {
  panicCount: 0,
  successCount: 0,
};

// Interface pour les validations de plan
export interface PlanValidation {
  dayNumber: number;
  validatedDate: string; // Date au format YYYY-MM-DD
  planId: string;
}

const DEFAULT_PLAN_VALIDATIONS: Record<string, PlanValidation[]> = {};

// Stockage adapté selon la plateforme
const getStorage = () => {
  if (Platform.OS === 'web') {
    return {
      getItem: (key: string) => localStorage.getItem(key),
      setItem: (key: string, value: string) => localStorage.setItem(key, value),
      removeItem: (key: string) => localStorage.removeItem(key),
      clear: () => localStorage.clear(),
    };
  } else {
    return AsyncStorage;
  }
};

// Fonctions de stockage génériques
export const storage = {
  async get<T>(key: string, defaultValue: T): Promise<T> {
    try {
      const storage = getStorage();
      const value = await storage.getItem(key);
      if (value) {
        return JSON.parse(value);
      }
      
      // TEMPORAIREMENT DÉSACTIVÉ POUR ÉVITER LE SPAM
      // Si aucune valeur locale et que l'utilisateur est connecté, essayer de charger depuis Supabase
      // const userId = await getCurrentUserId();
      // if (userId && key === STORAGE_KEYS.PROFILE) {
      //   console.log('🔍 Tentative de chargement du profil depuis Supabase...');
      //   try {
      //     // Import statique pour éviter les problèmes sur web
      //     const { DataSyncService } = require('./dataSync');
      //     const { data: remoteProfile } = await DataSyncService.getProfile(userId);
      //     if (remoteProfile) {
      //       console.log('✅ Profil chargé depuis Supabase:', remoteProfile);
      //       // Sauvegarder localement pour éviter de recharger à chaque fois
      //       await storage.setItem(key, JSON.stringify(remoteProfile));
      //       return remoteProfile as T;
      //     }
      //   } catch (error) {
      //     console.log('⚠️ Impossible de charger le profil depuis Supabase:', error);
      //   }
      // }
      
      return defaultValue;
    } catch (error) {
      console.error(`Erreur lors de la lecture de ${key}:`, error);
      return defaultValue;
    }
  },

  async set<T>(key: string, value: T): Promise<void> {
    try {
      const storage = getStorage();
      await storage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Erreur lors de l'écriture de ${key}:`, error);
    }
  },

  async remove(key: string): Promise<void> {
    try {
      const storage = getStorage();
      await storage.removeItem(key);
    } catch (error) {
      console.error(`Erreur lors de la suppression de ${key}:`, error);
    }
  },

  async clear(): Promise<void> {
    try {
      const storage = getStorage();
      await storage.clear();
    } catch (error) {
      console.error('Erreur lors du nettoyage du stockage:', error);
    }
  },
};

// Fonction utilitaire pour obtenir l'userId depuis le contexte d'auth
import { supabase } from './supabase';

export const getCurrentUserId = async (): Promise<string | null> => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
      console.log('Erreur de session:', error);
      return null;
    }
    // Utiliser l'email comme user ID au lieu de l'UUID
    return session?.user?.email || null;
  } catch (error) {
    console.log('❌ Erreur de récupération utilisateur:', error);
    return null;
  }
};

// Fonctions spécifiques pour chaque type de données
export const profileStorage = {
  async get(): Promise<UserProfile> {
    // D'abord essayer de charger depuis le stockage local
    const localProfile = await storage.get(STORAGE_KEYS.PROFILE, DEFAULT_PROFILE);
    
    // Si l'onboarding n'est pas complété, essayer de charger depuis Supabase
    if (!localProfile.onboardingCompleted) {
      const userId = await getCurrentUserId();
      if (userId) {
        try {
          const { DataSyncService } = await import('./dataSync');
          const { data: remoteProfile } = await DataSyncService.getUserProfile(userId);
          if (remoteProfile) {
            console.log('📥 Profil chargé depuis Supabase:', remoteProfile);
            // Sauvegarder localement pour éviter de recharger à chaque fois
            await storage.set(STORAGE_KEYS.PROFILE, remoteProfile);
            return remoteProfile;
          }
        } catch (error) {
          console.log('⚠️ Impossible de charger le profil depuis Supabase:', error);
        }
      }
    }
    
    return localProfile;
  },

  async set(profile: UserProfile): Promise<void> {
    // Sauvegarder localement
    await storage.set(STORAGE_KEYS.PROFILE, profile);
    
    // Synchroniser avec Supabase
    const userId = await getCurrentUserId();
    if (userId) {
      console.log('💾 Sauvegarde du profil vers Supabase...', profile);
      try {
        const { DataSyncService } = require('./dataSync');
        const result = await DataSyncService.syncUserProfile(userId, profile);
        if (result.error) {
          console.error('❌ Erreur sauvegarde profil:', result.error);
        } else {
          console.log('✅ Profil sauvegardé dans Supabase');
        }
      } catch (error) {
        console.error('❌ Erreur lors de la sauvegarde profil:', error);
      }
    }
  },
};

export const settingsStorage = {
  async get(): Promise<AppSettings> {
    // D'abord essayer de charger depuis le stockage local
    const localSettings = await storage.get(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
    
    // Si les paramètres sont par défaut, essayer de charger depuis Supabase
    if (localSettings.pricePerCig === DEFAULT_SETTINGS.pricePerCig && 
        localSettings.currency === DEFAULT_SETTINGS.currency) {
      const userId = await getCurrentUserId();
      if (userId) {
        try {
          const { DataSyncService } = await import('./dataSync');
          const { data: remoteSettings } = await DataSyncService.getSettings(userId);
          if (remoteSettings) {
            console.log('📥 Paramètres chargés depuis Supabase:', remoteSettings);
            // Sauvegarder localement pour éviter de recharger à chaque fois
            await storage.set(STORAGE_KEYS.SETTINGS, remoteSettings);
            return remoteSettings;
          }
        } catch (error) {
          console.log('⚠️ Impossible de charger les paramètres depuis Supabase:', error);
        }
      }
    }
    
    return localSettings;
  },

  async set(settings: AppSettings): Promise<void> {
    await storage.set(STORAGE_KEYS.SETTINGS, settings);
    
    // Synchroniser avec Supabase
    const userId = await getCurrentUserId();
    if (userId) {
      console.log('💾 Sauvegarde des paramètres vers Supabase...', settings);
      try {
        const { DataSyncService } = require('./dataSync');
        const result = await DataSyncService.syncSettings(userId, settings);
        if (result.error) {
          console.error('❌ Erreur sauvegarde paramètres:', result.error);
        } else {
          console.log('✅ Paramètres sauvegardés dans Supabase');
        }
      } catch (error) {
        console.error('❌ Erreur lors de la sauvegarde paramètres:', error);
      }
    }
  },
};

export const sessionStorage = {
  async get(): Promise<TimerSession> {
    // D'abord essayer de charger depuis le stockage local
    const localSession = await storage.get(STORAGE_KEYS.SESSION, DEFAULT_SESSION);
    
    // Si la session est par défaut, essayer de charger depuis Supabase
    if (localSession.isRunning === DEFAULT_SESSION.isRunning && 
        localSession.startTimestamp === DEFAULT_SESSION.startTimestamp &&
        localSession.elapsedBeforePause === DEFAULT_SESSION.elapsedBeforePause) {
      const userId = await getCurrentUserId();
      if (userId) {
        try {
          const { DataSyncService } = await import('./dataSync');
          const { data: remoteSession } = await DataSyncService.getTimerSession(userId);
          if (remoteSession) {
            console.log('📥 Session chrono chargée depuis Supabase:', remoteSession);
            // Sauvegarder localement pour éviter de recharger à chaque fois
            await storage.set(STORAGE_KEYS.SESSION, remoteSession);
            return remoteSession;
          }
        } catch (error) {
          console.log('⚠️ Impossible de charger la session depuis Supabase:', error);
        }
      }
    }
    
    return localSession;
  },

  async set(session: TimerSession): Promise<void> {
    await storage.set(STORAGE_KEYS.SESSION, session);
    
    // Synchroniser avec Supabase
    const userId = await getCurrentUserId();
    if (userId) {
      console.log('💾 Sauvegarde de la session chrono vers Supabase...', session);
      try {
        const { DataSyncService } = await import('./dataSync');
        const result = await DataSyncService.syncTimerSession(userId, session);
        if (result.error) {
          console.error('❌ Erreur sauvegarde session chrono:', result.error);
        } else {
          console.log('✅ Session chrono sauvegardée dans Supabase');
        }
      } catch (error) {
        console.error('❌ Erreur lors de la sauvegarde session chrono:', error);
      }
    }
  },

  // Fonction pour réinitialiser le chrono lors du changement d'utilisateur
  async resetForNewUser(): Promise<void> {
    await storage.set(STORAGE_KEYS.SESSION, DEFAULT_SESSION);
    console.log('🔄 Chrono réinitialisé pour le nouvel utilisateur');
  },
};

export const dailyEntriesStorage = {
  async get(): Promise<Record<string, DailyEntry>> {
    // D'abord essayer de charger depuis le stockage local
    const localEntries = await storage.get(STORAGE_KEYS.DAILY_ENTRIES, {});
    
    // Si aucune entrée locale, essayer de charger depuis Supabase
    if (Object.keys(localEntries).length === 0) {
      const userId = await getCurrentUserId();
      if (userId) {
        try {
          const { DataSyncService } = await import('./dataSync');
          const { data: remoteEntries } = await DataSyncService.getDailyEntries(userId);
          if (remoteEntries && Object.keys(remoteEntries).length > 0) {
            console.log('📥 Entrées chargées depuis Supabase:', Object.keys(remoteEntries).length, 'entrées');
            // Sauvegarder localement pour éviter de recharger à chaque fois
            await storage.set(STORAGE_KEYS.DAILY_ENTRIES, remoteEntries);
            // Marquer toutes les entrées comme synchronisées
            await storage.set(STORAGE_KEYS.SYNCED_ENTRIES, Object.keys(remoteEntries));
            return remoteEntries;
          }
        } catch (error) {
          console.log('⚠️ Impossible de charger les entrées depuis Supabase:', error);
        }
      }
    }
    
    return localEntries;
  },

  async set(entries: Record<string, DailyEntry>): Promise<void> {
    // Sauvegarder localement d'abord (instantané)
    await storage.set(STORAGE_KEYS.DAILY_ENTRIES, entries);
    
    // Marquer les entrées comme en attente de synchronisation
    const pendingDates = Object.keys(entries);
    await storage.set(STORAGE_KEYS.PENDING_SYNC, pendingDates);
    
    // Synchroniser en arrière-plan (non bloquant)
    this.syncPendingEntriesInBackground();
  },

  // Méthode optimisée pour ajouter une seule entrée
  async addEntry(date: string, entry: DailyEntry): Promise<void> {
    const entries = await this.get();
    entries[date] = entry;
    
    // Sauvegarder localement immédiatement
    await storage.set(STORAGE_KEYS.DAILY_ENTRIES, entries);
    
    // Synchroniser immédiatement cette nouvelle entrée
    const userId = await getCurrentUserId();
    if (userId) {
      try {
        console.log(`💾 Synchronisation immédiate de l'entrée ${date}...`);
        const { DataSyncService } = require('./dataSync');
        const result = await DataSyncService.syncSingleDailyEntry(userId, date, entry);
        if (result.error) {
          console.error(`❌ Erreur synchronisation immédiate pour ${date}:`, result.error);
          // Ajouter à la liste des entrées en attente
          const pendingDates = await storage.get(STORAGE_KEYS.PENDING_SYNC, []);
          if (!pendingDates.includes(date)) {
            pendingDates.push(date);
            await storage.set(STORAGE_KEYS.PENDING_SYNC, pendingDates);
          }
        } else {
          console.log(`✅ Entrée ${date} synchronisée immédiatement`);
          // Marquer comme synchronisée
          const syncedDates = await storage.get(STORAGE_KEYS.SYNCED_ENTRIES, []);
          if (!syncedDates.includes(date)) {
            syncedDates.push(date);
            await storage.set(STORAGE_KEYS.SYNCED_ENTRIES, syncedDates);
          }
        }
      } catch (error) {
        console.error(`❌ Erreur lors de la synchronisation immédiate pour ${date}:`, error);
        // Ajouter à la liste des entrées en attente
        const pendingDates = await storage.get(STORAGE_KEYS.PENDING_SYNC, []);
        if (!pendingDates.includes(date)) {
          pendingDates.push(date);
          await storage.set(STORAGE_KEYS.PENDING_SYNC, pendingDates);
        }
      }
    }
  },

  // Synchroniser les entrées en attente en arrière-plan
  async syncPendingEntriesInBackground(): Promise<void> {
    const userId = await getCurrentUserId();
    if (!userId) return;

    // Utiliser setTimeout pour ne pas bloquer l'interface
    setTimeout(async () => {
      try {
        const pendingDates = await storage.get(STORAGE_KEYS.PENDING_SYNC, []);
        const syncedDates = await storage.get(STORAGE_KEYS.SYNCED_ENTRIES, []);
        const entries = await storage.get(STORAGE_KEYS.DAILY_ENTRIES, {});
        
        // Filtrer les entrées qui ne sont pas encore synchronisées
        const unsyncedDates = pendingDates.filter(date => !syncedDates.includes(date));
        
        if (unsyncedDates.length > 0) {
          console.log(`💾 Synchronisation en arrière-plan de ${unsyncedDates.length} entrées...`);
          
          const { DataSyncService } = require('./dataSync');
          const newSyncedDates = [...syncedDates];
          
          // Synchroniser chaque entrée non synchronisée
          for (const date of unsyncedDates) {
            if (entries[date]) {
              const result = await DataSyncService.syncSingleDailyEntry(userId, date, entries[date]);
              if (result.data) {
                newSyncedDates.push(date);
                console.log(`✅ Entrée ${date} synchronisée en arrière-plan`);
              } else {
                console.warn(`⚠️ Échec synchronisation ${date}:`, result.error);
              }
            }
          }
          
          // Mettre à jour la liste des entrées synchronisées
          await storage.set(STORAGE_KEYS.SYNCED_ENTRIES, newSyncedDates);
          
          // Nettoyer la liste des entrées en attente
          const remainingPending = pendingDates.filter(date => !newSyncedDates.includes(date));
          await storage.set(STORAGE_KEYS.PENDING_SYNC, remainingPending);
          
          console.log(`✅ Synchronisation en arrière-plan terminée. ${newSyncedDates.length - syncedDates.length} nouvelles entrées synchronisées.`);
        }
      } catch (error) {
        console.error('❌ Erreur lors de la synchronisation en arrière-plan:', error);
      }
    }, 1000); // Délai de 1 seconde pour laisser l'interface se mettre à jour
  },

  // Méthode pour synchroniser sans délai (pour l'indicateur de sync)
  async syncNow(entries: Record<string, DailyEntry>): Promise<boolean> {
    const userId = await getCurrentUserId();
    if (!userId) return false;

    try {
      console.log('💾 Synchronisation immédiate des entrées...', Object.keys(entries).length, 'entrées');
      const { DataSyncService } = require('./dataSync');
      const result = await DataSyncService.syncDailyEntries(userId, entries);
      if (result.error) {
        console.error('❌ Erreur synchronisation immédiate:', result.error);
        return false;
      } else {
        console.log('✅ Entrées synchronisées immédiatement');
        // Marquer toutes les entrées comme synchronisées
        await storage.set(STORAGE_KEYS.SYNCED_ENTRIES, Object.keys(entries));
        await storage.set(STORAGE_KEYS.PENDING_SYNC, []);
        return true;
      }
    } catch (error) {
      console.error('❌ Erreur lors de la synchronisation immédiate:', error);
      return false;
    }
  },

  // Forcer le rechargement des données depuis Supabase (pour les écrans d'analytics)
  async refresh(): Promise<Record<string, DailyEntry>> {
    const userId = await getCurrentUserId();
    if (userId) {
      try {
        console.log('🔄 Rechargement des entrées depuis Supabase pour le graphique...');
        const { DataSyncService } = await import('./dataSync');
        const { data: remoteEntries } = await DataSyncService.getDailyEntries(userId);
        if (remoteEntries && Object.keys(remoteEntries).length > 0) {
          console.log('📥 Entrées rechargées depuis Supabase:', Object.keys(remoteEntries).length, 'entrées');
          // Sauvegarder localement pour éviter de recharger à chaque fois
          await storage.set(STORAGE_KEYS.DAILY_ENTRIES, remoteEntries);
          return remoteEntries;
        }
      } catch (error) {
        console.log('⚠️ Impossible de recharger les entrées depuis Supabase:', error);
      }
    }
    
    // Fallback sur les données locales si Supabase n'est pas disponible
    const localEntries = await storage.get(STORAGE_KEYS.DAILY_ENTRIES, {});
    return localEntries;
  },

  // Obtenir le statut de synchronisation
  async getSyncStatus(): Promise<{ synced: number; pending: number; total: number }> {
    const entries = await storage.get(STORAGE_KEYS.DAILY_ENTRIES, {});
    const syncedDates = await storage.get(STORAGE_KEYS.SYNCED_ENTRIES, []);
    const pendingDates = await storage.get(STORAGE_KEYS.PENDING_SYNC, []);
    
    return {
      synced: syncedDates.length,
      pending: pendingDates.length,
      total: Object.keys(entries).length
    };
  },
};

export const streakStorage = {
  async get(): Promise<StreakData> {
    // D'abord essayer de charger depuis le stockage local
    const localStreak = await storage.get(STORAGE_KEYS.STREAK, DEFAULT_STREAK);
    
    // Si la série est par défaut, essayer de charger depuis Supabase
    if (localStreak.currentStreak === DEFAULT_STREAK.currentStreak && 
        localStreak.lastDateConnected === DEFAULT_STREAK.lastDateConnected) {
      const userId = await getCurrentUserId();
      if (userId) {
        try {
          const { DataSyncService } = await import('./dataSync');
          const { data: remoteStreak } = await DataSyncService.getStreak(userId);
          if (remoteStreak) {
            console.log('📥 Série chargée depuis Supabase:', remoteStreak);
            // Sauvegarder localement pour éviter de recharger à chaque fois
            await storage.set(STORAGE_KEYS.STREAK, remoteStreak);
            return remoteStreak;
          }
        } catch (error) {
          console.log('⚠️ Impossible de charger la série depuis Supabase:', error);
        }
      }
    }
    
    return localStreak;
  },

  async set(streak: StreakData): Promise<void> {
    await storage.set(STORAGE_KEYS.STREAK, streak);
    console.log('Série sauvegardée localement');
  },
};

export const goalsStorage = {
  async get(): Promise<FinancialGoal[]> {
    return storage.get(STORAGE_KEYS.GOALS, []);
  },

  async set(goals: FinancialGoal[]): Promise<void> {
    await storage.set(STORAGE_KEYS.GOALS, goals);
    console.log('Objectifs sauvegardés localement');
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
    await storage.set(STORAGE_KEYS.ACHIEVEMENTS, achievements);
    console.log('Réalisations sauvegardées localement');
  },

  async addAchievement(achievement: Achievement): Promise<void> {
    const achievements = await this.get();
    achievements.push(achievement);
    return this.set(achievements);
  },
};

export const panicStatsStorage = {
  async get(): Promise<PanicStats> {
    // D'abord essayer de charger depuis le stockage local
    const localStats = await storage.get(STORAGE_KEYS.PANIC_STATS, DEFAULT_PANIC_STATS);
    
    // Si les stats sont par défaut, essayer de charger depuis Supabase
    if (localStats.panicCount === DEFAULT_PANIC_STATS.panicCount && 
        localStats.successCount === DEFAULT_PANIC_STATS.successCount) {
      const userId = await getCurrentUserId();
      if (userId) {
        try {
          const { DataSyncService } = await import('./dataSync');
          const { data: remoteStats } = await DataSyncService.getPanicStats(userId);
          if (remoteStats) {
            console.log('📥 Stats panique chargées depuis Supabase:', remoteStats);
            // Sauvegarder localement pour éviter de recharger à chaque fois
            await storage.set(STORAGE_KEYS.PANIC_STATS, remoteStats);
            return remoteStats;
          }
        } catch (error) {
          console.log('⚠️ Impossible de charger les stats panique depuis Supabase:', error);
        }
      }
    }
    
    return localStats;
  },

  async set(stats: PanicStats): Promise<void> {
    // Sauvegarder localement
    await storage.set(STORAGE_KEYS.PANIC_STATS, stats);
    
    // Synchroniser avec Supabase
    const userId = await getCurrentUserId();
    if (userId) {
      console.log('💾 Sauvegarde des stats panique vers Supabase...', stats);
      try {
        const { DataSyncService } = require('./dataSync');
        const result = await DataSyncService.syncPanicStats(userId, stats);
        if (result.error) {
          console.error('❌ Erreur sauvegarde stats panique:', result.error);
        } else {
          console.log('✅ Stats panique sauvegardées dans Supabase');
        }
      } catch (error) {
        console.error('❌ Erreur lors de la sauvegarde stats panique:', error);
      }
    }
  },

  async updateStats(newStats: PanicStats): Promise<void> {
    await this.set(newStats);
  },
};

export const planValidationsStorage = {
  async get(): Promise<Record<string, PlanValidation[]>> {
    // D'abord essayer de charger depuis le stockage local
    const localValidations = await storage.get(STORAGE_KEYS.PLAN_VALIDATIONS, DEFAULT_PLAN_VALIDATIONS);
    
    // Si aucune validation locale, essayer de charger depuis Supabase
    if (Object.keys(localValidations).length === 0) {
      const userId = await getCurrentUserId();
      if (userId) {
        try {
          const { DataSyncService } = await import('./dataSync');
          const { data: remoteValidations } = await DataSyncService.getPlanValidations(userId);
          if (remoteValidations && Object.keys(remoteValidations).length > 0) {
            console.log('📥 Validations de plan chargées depuis Supabase:', Object.keys(remoteValidations).length, 'plans');
            // Sauvegarder localement pour éviter de recharger à chaque fois
            await storage.set(STORAGE_KEYS.PLAN_VALIDATIONS, remoteValidations);
            return remoteValidations;
          }
        } catch (error) {
          console.log('⚠️ Impossible de charger les validations de plan depuis Supabase:', error);
        }
      }
    }
    
    return localValidations;
  },

  async set(validations: Record<string, PlanValidation[]>): Promise<void> {
    // Sauvegarder localement
    await storage.set(STORAGE_KEYS.PLAN_VALIDATIONS, validations);
    
    // Synchroniser avec Supabase
    const userId = await getCurrentUserId();
    if (userId) {
      console.log('💾 Sauvegarde des validations de plan vers Supabase...', validations);
      try {
        const { DataSyncService } = require('./dataSync');
        const result = await DataSyncService.syncPlanValidations(userId, validations);
        if (result.error) {
          console.error('❌ Erreur sauvegarde validations de plan:', result.error);
        } else {
          console.log('✅ Validations de plan sauvegardées dans Supabase');
        }
      } catch (error) {
        console.error('❌ Erreur lors de la sauvegarde validations de plan:', error);
      }
    }
  },

  async addValidation(planId: string, dayNumber: number): Promise<void> {
    const validations = await this.get();
    const today = new Date().toISOString().split('T')[0]; // Format YYYY-MM-DD
    
    if (!validations[planId]) {
      validations[planId] = [];
    }
    
    // Vérifier si ce jour n'est pas déjà validé aujourd'hui
    const existingValidation = validations[planId].find(
      v => v.dayNumber === dayNumber && v.validatedDate === today
    );
    
    if (!existingValidation) {
      validations[planId].push({
        dayNumber,
        validatedDate: today,
        planId,
      });
      
      await this.set(validations);
      console.log(`✅ Jour ${dayNumber} du plan ${planId} validé pour le ${today}`);
    } else {
      console.log(`⚠️ Jour ${dayNumber} du plan ${planId} déjà validé aujourd'hui`);
    }
  },

  async getValidatedDays(planId: string): Promise<number[]> {
    const validations = await this.get();
    return validations[planId]?.map(v => v.dayNumber) || [];
  },

  async getLastValidationDate(planId: string): Promise<string | null> {
    const validations = await this.get();
    const planValidations = validations[planId] || [];
    
    if (planValidations.length === 0) {
      return null;
    }
    
    // Trier par date de validation et retourner la plus récente
    const sortedValidations = planValidations.sort((a, b) => 
      new Date(b.validatedDate).getTime() - new Date(a.validatedDate).getTime()
    );
    
    return sortedValidations[0].validatedDate;
  },

  async canValidateDay(planId: string, dayNumber: number): Promise<boolean> {
    const validations = await this.get();
    const today = new Date().toISOString().split('T')[0];
    const lastValidationDate = await this.getLastValidationDate(planId);
    
    // Si c'est le premier jour, on peut toujours valider
    if (dayNumber === 1) {
      return true;
    }
    
    // Si aucun jour n'a été validé, on ne peut valider que le jour 1
    if (!lastValidationDate) {
      return dayNumber === 1;
    }
    
    // Vérifier si le jour précédent a été validé
    const previousDayValidated = validations[planId]?.some(
      v => v.dayNumber === dayNumber - 1
    );
    
    if (!previousDayValidated) {
      return false;
    }
    
    // Vérifier si on peut valider aujourd'hui (pas le même jour que la dernière validation)
    // Si la dernière validation était hier ou avant, on peut valider
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    return lastValidationDate <= yesterdayStr;
  },

  async getAvailableDays(planId: string): Promise<number[]> {
    const validations = await this.get();
    const planValidations = validations[planId] || [];
    
    // Si aucun jour n'a été validé, seul le jour 1 est disponible
    if (planValidations.length === 0) {
      return [1];
    }
    
    // Trouver le dernier jour validé
    const lastValidatedDay = Math.max(...planValidations.map(v => v.dayNumber));
    
    // Vérifier si on peut valider le jour suivant aujourd'hui
    const canValidateNext = await this.canValidateDay(planId, lastValidatedDay + 1);
    
    if (canValidateNext) {
      // On peut valider le jour suivant aujourd'hui - retourner seulement ce jour
      return [lastValidatedDay + 1];
    } else {
      // On ne peut pas encore valider le jour suivant, retourner seulement les jours validés
      return Array.from({ length: lastValidatedDay }, (_, i) => i + 1);
    }
  },

  // Forcer le rechargement des validations depuis Supabase
  async refresh(): Promise<Record<string, PlanValidation[]>> {
    const userId = await getCurrentUserId();
    if (userId) {
      try {
        console.log('🔄 Rechargement des validations de plan depuis Supabase...');
        const { DataSyncService } = await import('./dataSync');
        const { data: remoteValidations } = await DataSyncService.getPlanValidations(userId);
        if (remoteValidations && Object.keys(remoteValidations).length > 0) {
          console.log('📥 Validations de plan rechargées depuis Supabase:', Object.keys(remoteValidations).length, 'plans');
          // Sauvegarder localement pour éviter de recharger à chaque fois
          await storage.set(STORAGE_KEYS.PLAN_VALIDATIONS, remoteValidations);
          return remoteValidations;
        }
      } catch (error) {
        console.log('⚠️ Impossible de recharger les validations de plan depuis Supabase:', error);
      }
    }
    
    // Fallback sur les données locales si Supabase n'est pas disponible
    const localValidations = await storage.get(STORAGE_KEYS.PLAN_VALIDATIONS, DEFAULT_PLAN_VALIDATIONS);
    return localValidations;
  },
};

// Fonction d'export de toutes les données
export const exportAllData = async (): Promise<ExportData> => {
  const [profile, settings, session, dailyEntries, streak, goals, achievements, panicStats] = await Promise.all([
    profileStorage.get(),
    settingsStorage.get(),
    sessionStorage.get(),
    dailyEntriesStorage.get(),
    streakStorage.get(),
    goalsStorage.get(),
    achievementsStorage.get(),
    panicStatsStorage.get(),
  ]);

  return {
    profile,
    settings,
    session,
    dailyEntries,
    streak,
    goals,
    achievements,
    panicStats,
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
    data.panicStats ? panicStatsStorage.set(data.panicStats) : Promise.resolve(),
  ]);
};

// Fonction pour nettoyer les données locales lors du changement d'utilisateur
export const clearLocalDataOnUserChange = async (): Promise<void> => {
  try {
    // Supprimer toutes les données utilisateur locales Y COMPRIS la session (chrono)
    // Le chrono doit être réinitialisé pour chaque nouvel utilisateur
    await Promise.all([
      storage.remove(STORAGE_KEYS.PROFILE),
      storage.remove(STORAGE_KEYS.SETTINGS),
      storage.remove(STORAGE_KEYS.SESSION), // Le chrono doit être réinitialisé pour chaque utilisateur
      storage.remove(STORAGE_KEYS.DAILY_ENTRIES),
      storage.remove(STORAGE_KEYS.STREAK),
      storage.remove(STORAGE_KEYS.GOALS),
      storage.remove(STORAGE_KEYS.ACHIEVEMENTS),
      storage.remove(STORAGE_KEYS.PANIC_STATS),
      storage.remove(STORAGE_KEYS.SYNCED_ENTRIES),
      storage.remove(STORAGE_KEYS.PENDING_SYNC),
      storage.remove(STORAGE_KEYS.PLAN_VALIDATIONS),
    ]);
    
    console.log('Données locales nettoyées pour le changement d\'utilisateur (chrono réinitialisé)');
  } catch (error) {
    console.error('Erreur lors du nettoyage des données locales:', error);
  }
};

// Fonction pour charger toutes les données depuis Supabase vers le local
let isLoading = false; // Garde pour éviter les boucles infinies
let lastLoadTime = 0; // Timestamp du dernier chargement

export const loadAllDataFromSupabase = async (): Promise<void> => {
  const now = Date.now();
  
  // Éviter les chargements trop fréquents (moins de 5 secondes entre deux loads)
  if (isLoading || (now - lastLoadTime < 5000)) {
    console.log('Chargement déjà en cours ou trop récent, ignoré');
    return;
  }

  const userId = await getCurrentUserId();
  
  if (!userId) {
    console.log('Aucun utilisateur connecté, chargement ignoré');
    return;
  }

  isLoading = true;
  lastLoadTime = now;
  
  try {
    console.log('📥 Début du chargement des données depuis Supabase pour l\'utilisateur:', userId);
    
    // Charger toutes les données depuis Supabase
    const { DataSyncService } = await import('./dataSync');
    const [profileResult, settingsResult, dailyEntriesResult, streakResult, goalsResult, achievementsResult, sessionResult] = await Promise.all([
      DataSyncService.getUserProfile(userId),
      DataSyncService.getSettings(userId),
      DataSyncService.getDailyEntries(userId),
      DataSyncService.getStreak(userId),
      DataSyncService.getFinancialGoals(userId),
      DataSyncService.getAchievements(userId),
      DataSyncService.getTimerSession(userId),
    ]);

    // Log des résultats
    console.log('📊 Résultats du chargement:');
    console.log('  - Profil:', profileResult.data ? '✅' : '❌', profileResult.error?.message || '');
    console.log('  - Paramètres:', settingsResult.data ? '✅' : '❌', settingsResult.error?.message || '');
    console.log('  - Entrées:', dailyEntriesResult.data ? '✅' : '❌', dailyEntriesResult.error?.message || '');
    console.log('  - Série:', streakResult.data ? '✅' : '❌', streakResult.error?.message || '');
    console.log('  - Objectifs:', goalsResult.data ? '✅' : '❌', goalsResult.error?.message || '');
    console.log('  - Réalisations:', achievementsResult.data ? '✅' : '❌', achievementsResult.error?.message || '');
    console.log('  - Session chrono:', sessionResult.data ? '✅' : '❌', sessionResult.error?.message || '');

    // Sauvegarder les données récupérées localement
    await Promise.all([
      profileResult.data ? storage.set(STORAGE_KEYS.PROFILE, profileResult.data) : Promise.resolve(),
      settingsResult.data ? storage.set(STORAGE_KEYS.SETTINGS, settingsResult.data) : Promise.resolve(),
      dailyEntriesResult.data ? storage.set(STORAGE_KEYS.DAILY_ENTRIES, dailyEntriesResult.data) : Promise.resolve(),
      streakResult.data ? storage.set(STORAGE_KEYS.STREAK, streakResult.data) : Promise.resolve(),
      goalsResult.data ? storage.set(STORAGE_KEYS.GOALS, goalsResult.data) : Promise.resolve(),
      achievementsResult.data ? storage.set(STORAGE_KEYS.ACHIEVEMENTS, achievementsResult.data) : Promise.resolve(),
      sessionResult.data ? storage.set(STORAGE_KEYS.SESSION, sessionResult.data) : Promise.resolve(),
    ]);

    console.log('✅ Toutes les données chargées depuis Supabase vers le local');
  } catch (error) {
    console.error('❌ Erreur lors du chargement:', error);
  } finally {
    isLoading = false;
  }
};

// Fonction pour forcer le rechargement de toutes les données depuis Supabase
export const forceReloadAllDataFromSupabase = async (): Promise<void> => {
  console.log('🔄 Rechargement forcé de toutes les données depuis Supabase...');
  
  const userId = await getCurrentUserId();
  
  if (!userId) {
    console.log('❌ Aucun utilisateur connecté');
    return;
  }

  try {
    console.log('📥 Début du rechargement forcé pour l\'utilisateur:', userId);
    
    // Charger toutes les données depuis Supabase
    const { DataSyncService } = await import('./dataSync');
    const [profileResult, settingsResult, dailyEntriesResult, streakResult, goalsResult, achievementsResult, sessionResult] = await Promise.all([
      DataSyncService.getUserProfile(userId),
      DataSyncService.getSettings(userId),
      DataSyncService.getDailyEntries(userId),
      DataSyncService.getStreak(userId),
      DataSyncService.getFinancialGoals(userId),
      DataSyncService.getAchievements(userId),
      DataSyncService.getTimerSession(userId),
    ]);

    // Log des résultats
    console.log('📊 Résultats du rechargement forcé:');
    console.log('  - Profil:', profileResult.data ? '✅' : '❌', profileResult.error?.message || '');
    console.log('  - Paramètres:', settingsResult.data ? '✅' : '❌', settingsResult.error?.message || '');
    console.log('  - Entrées:', dailyEntriesResult.data ? '✅' : '❌', dailyEntriesResult.error?.message || '');
    console.log('  - Série:', streakResult.data ? '✅' : '❌', streakResult.error?.message || '');
    console.log('  - Objectifs:', goalsResult.data ? '✅' : '❌', goalsResult.error?.message || '');
    console.log('  - Réalisations:', achievementsResult.data ? '✅' : '❌', achievementsResult.error?.message || '');
    console.log('  - Session chrono:', sessionResult.data ? '✅' : '❌', sessionResult.error?.message || '');

    // Forcer la sauvegarde locale de toutes les données récupérées
    await Promise.all([
      profileResult.data ? storage.set(STORAGE_KEYS.PROFILE, profileResult.data) : Promise.resolve(),
      settingsResult.data ? storage.set(STORAGE_KEYS.SETTINGS, settingsResult.data) : Promise.resolve(),
      dailyEntriesResult.data ? storage.set(STORAGE_KEYS.DAILY_ENTRIES, dailyEntriesResult.data) : Promise.resolve(),
      streakResult.data ? storage.set(STORAGE_KEYS.STREAK, streakResult.data) : Promise.resolve(),
      goalsResult.data ? storage.set(STORAGE_KEYS.GOALS, goalsResult.data) : Promise.resolve(),
      achievementsResult.data ? storage.set(STORAGE_KEYS.ACHIEVEMENTS, achievementsResult.data) : Promise.resolve(),
      sessionResult.data ? storage.set(STORAGE_KEYS.SESSION, sessionResult.data) : Promise.resolve(),
    ]);

    console.log('✅ Rechargement forcé terminé - toutes les données sont maintenant synchronisées localement');
  } catch (error) {
    console.error('❌ Erreur lors du rechargement forcé:', error);
  }
};

// Fonction pour charger les données depuis Supabase (version forcée, ignore les protections)
export const forceLoadAllDataFromSupabase = async (): Promise<void> => {
  console.log('🔄 Chargement forcé des données depuis Supabase...');
  
  const userId = await getCurrentUserId();
  
  if (!userId) {
    console.log('❌ Aucun utilisateur connecté');
    return;
  }

  try {
    console.log('📥 Début du chargement forcé pour l\'utilisateur:', userId);
    
    // Charger toutes les données depuis Supabase
    const { DataSyncService } = await import('./dataSync');
    const [profileResult, settingsResult, dailyEntriesResult, streakResult, goalsResult, achievementsResult] = await Promise.all([
      DataSyncService.getUserProfile(userId),
      DataSyncService.getSettings(userId),
      DataSyncService.getDailyEntries(userId),
      DataSyncService.getStreak(userId),
      DataSyncService.getFinancialGoals(userId),
      DataSyncService.getAchievements(userId),
    ]);

    // Log des résultats
    console.log('📊 Résultats du chargement forcé:');
    console.log('  - Profil:', profileResult.data ? '✅' : '❌', profileResult.error?.message || '');
    console.log('  - Paramètres:', settingsResult.data ? '✅' : '❌', settingsResult.error?.message || '');
    console.log('  - Entrées:', dailyEntriesResult.data ? '✅' : '❌', dailyEntriesResult.error?.message || '');
    console.log('  - Série:', streakResult.data ? '✅' : '❌', streakResult.error?.message || '');
    console.log('  - Objectifs:', goalsResult.data ? '✅' : '❌', goalsResult.error?.message || '');
    console.log('  - Réalisations:', achievementsResult.data ? '✅' : '❌', achievementsResult.error?.message || '');

    // Sauvegarder les données récupérées localement
    await Promise.all([
      profileResult.data ? storage.set(STORAGE_KEYS.PROFILE, profileResult.data) : Promise.resolve(),
      settingsResult.data ? storage.set(STORAGE_KEYS.SETTINGS, settingsResult.data) : Promise.resolve(),
      dailyEntriesResult.data ? storage.set(STORAGE_KEYS.DAILY_ENTRIES, dailyEntriesResult.data) : Promise.resolve(),
      streakResult.data ? storage.set(STORAGE_KEYS.STREAK, streakResult.data) : Promise.resolve(),
      goalsResult.data ? storage.set(STORAGE_KEYS.GOALS, goalsResult.data) : Promise.resolve(),
      achievementsResult.data ? storage.set(STORAGE_KEYS.ACHIEVEMENTS, achievementsResult.data) : Promise.resolve(),
    ]);

    console.log('✅ Chargement forcé terminé');
  } catch (error) {
    console.error('❌ Erreur lors du chargement forcé:', error);
  }
};

// Fonction pour synchroniser toutes les données avec l'utilisateur connecté
let isSyncing = false; // Garde pour éviter les boucles infinies
let lastSyncTime = 0; // Timestamp de la dernière synchronisation

export const syncAllDataWithUser = async (): Promise<void> => {
  console.log('🚫 syncAllDataWithUser DÉSACTIVÉ pour éviter le spam');
  return;
  // FONCTION COMPLÈTEMENT DÉSACTIVÉE
};
