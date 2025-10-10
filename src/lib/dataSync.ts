import { supabase } from './supabase';
import { UserProfile, AppSettings, DailyEntry, FinancialGoal, Achievement, StreakData, TimerSession, HealthBenefit } from '../types';

export class DataSyncService {
  // Synchroniser le profil utilisateur
  static async syncUserProfile(userId: string, profile: UserProfile) {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .upsert({
          id: userId,
          ...profile,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Erreur lors de la synchronisation du profil:', error);
      return { data: null, error };
    }
  }

  // Récupérer le profil utilisateur
  static async getUserProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = pas de données
      return { data, error: null };
    } catch (error) {
      console.error('Erreur lors de la récupération du profil:', error);
      return { data: null, error };
    }
  }

  // Synchroniser les paramètres
  static async syncSettings(userId: string, settings: AppSettings) {
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: userId,
          ...settings,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Erreur lors de la synchronisation des paramètres:', error);
      return { data: null, error };
    }
  }

  // Récupérer les paramètres
  static async getSettings(userId: string) {
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Erreur lors de la récupération des paramètres:', error);
      return { data: null, error };
    }
  }

  // Synchroniser les entrées quotidiennes
  static async syncDailyEntries(userId: string, entries: Record<string, DailyEntry>) {
    try {
      const entriesArray = Object.entries(entries).map(([date, entry]) => ({
        user_id: userId,
        date,
        ...entry,
        updated_at: new Date().toISOString(),
      }));

      const { data, error } = await supabase
        .from('daily_entries')
        .upsert(entriesArray)
        .select();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Erreur lors de la synchronisation des entrées:', error);
      return { data: null, error };
    }
  }

  // Récupérer les entrées quotidiennes
  static async getDailyEntries(userId: string) {
    try {
      const { data, error } = await supabase
        .from('daily_entries')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });

      if (error) throw error;
      
      // Convertir en format Record<string, DailyEntry>
      const entries: Record<string, DailyEntry> = {};
      data?.forEach((entry: any) => {
        const { user_id, date, updated_at, ...entryData } = entry;
        entries[date] = entryData;
      });

      return { data: entries, error: null };
    } catch (error) {
      console.error('Erreur lors de la récupération des entrées:', error);
      return { data: null, error };
    }
  }

  // Synchroniser les objectifs financiers
  static async syncFinancialGoals(userId: string, goals: FinancialGoal[]) {
    try {
      const goalsWithUserId = goals.map(goal => ({
        ...goal,
        user_id: userId,
        updated_at: new Date().toISOString(),
      }));

      const { data, error } = await supabase
        .from('financial_goals')
        .upsert(goalsWithUserId)
        .select();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Erreur lors de la synchronisation des objectifs:', error);
      return { data: null, error };
    }
  }

  // Récupérer les objectifs financiers
  static async getFinancialGoals(userId: string) {
    try {
      const { data, error } = await supabase
        .from('financial_goals')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Erreur lors de la récupération des objectifs:', error);
      return { data: null, error };
    }
  }

  // Synchroniser les réalisations
  static async syncAchievements(userId: string, achievements: Achievement[]) {
    try {
      const achievementsWithUserId = achievements.map(achievement => ({
        ...achievement,
        user_id: userId,
        updated_at: new Date().toISOString(),
      }));

      const { data, error } = await supabase
        .from('achievements')
        .upsert(achievementsWithUserId)
        .select();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Erreur lors de la synchronisation des réalisations:', error);
      return { data: null, error };
    }
  }

  // Récupérer les réalisations
  static async getAchievements(userId: string) {
    try {
      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .eq('user_id', userId)
        .order('unlocked_at', { ascending: false });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Erreur lors de la récupération des réalisations:', error);
      return { data: null, error };
    }
  }

  // Synchroniser la série (streak)
  static async syncStreak(userId: string, streak: StreakData) {
    try {
      const { data, error } = await supabase
        .from('user_streaks')
        .upsert({
          user_id: userId,
          ...streak,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Erreur lors de la synchronisation de la série:', error);
      return { data: null, error };
    }
  }

  // Récupérer la série
  static async getStreak(userId: string) {
    try {
      const { data, error } = await supabase
        .from('user_streaks')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Erreur lors de la récupération de la série:', error);
      return { data: null, error };
    }
  }

  // Synchroniser les bienfaits santé
  static async syncHealthBenefits(userId: string, benefits: HealthBenefit[]) {
    try {
      const benefitsWithUserId = benefits.map(benefit => ({
        ...benefit,
        user_id: userId,
        updated_at: new Date().toISOString(),
      }));

      const { data, error } = await supabase
        .from('health_benefits')
        .upsert(benefitsWithUserId)
        .select();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Erreur lors de la synchronisation des bienfaits santé:', error);
      return { data: null, error };
    }
  }

  // Récupérer les bienfaits santé
  static async getHealthBenefits(userId: string) {
    try {
      const { data, error } = await supabase
        .from('health_benefits')
        .select('*')
        .eq('user_id', userId)
        .order('time_required', { ascending: true });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Erreur lors de la récupération des bienfaits santé:', error);
      return { data: null, error };
    }
  }

  // Synchroniser toutes les données utilisateur
  static async syncAllUserData(userId: string, appData: {
    profile: UserProfile;
    settings: AppSettings;
    dailyEntries: Record<string, DailyEntry>;
    goals: FinancialGoal[];
    achievements: Achievement[];
    streak: StreakData;
  }) {
    try {
      await Promise.all([
        this.syncUserProfile(userId, appData.profile),
        this.syncSettings(userId, appData.settings),
        this.syncDailyEntries(userId, appData.dailyEntries),
        this.syncFinancialGoals(userId, appData.goals),
        this.syncAchievements(userId, appData.achievements),
        this.syncStreak(userId, appData.streak),
      ]);

      return { success: true, error: null };
    } catch (error) {
      console.error('Erreur lors de la synchronisation complète:', error);
      return { success: false, error };
    }
  }
}
