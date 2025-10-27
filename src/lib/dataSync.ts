import { supabase } from './supabase';
import { UserProfile, AppSettings, DailyEntry, FinancialGoal, Achievement, StreakData, TimerSession, HealthBenefit, PanicStats } from '../types';
import { PlanValidation } from './storage';

export class DataSyncService {
  // Synchroniser le profil utilisateur
  static async syncUserProfile(userId: string, profile: UserProfile) {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .upsert({
          id: userId, // userId est maintenant l'email
          started_smoking_years: profile.startedSmokingYears,
          cigs_per_day: profile.cigsPerDay,
          objective_type: profile.objectiveType,
          reduction_frequency: profile.reductionFrequency,
          smoking_years: profile.smokingYears,
          smoking_peak_time: profile.smokingPeakTime,
          main_goal: profile.mainGoal,
          target_date: profile.targetDate,
          main_motivation: profile.mainMotivation,
          previous_attempts: profile.previousAttempts,
          smoking_triggers: profile.smokingTriggers,
          smoking_situations: profile.smokingSituations,
          onboarding_completed: profile.onboardingCompleted,
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
        .eq('id', userId) // userId est maintenant l'email
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = pas de données
      
      // Convertir les noms de colonnes de snake_case vers camelCase
      const profile: UserProfile = data ? {
        id: data.id, // L'ID est maintenant l'email
        startedSmokingYears: data.started_smoking_years,
        cigsPerDay: data.cigs_per_day,
        objectiveType: data.objective_type,
        reductionFrequency: data.reduction_frequency,
        smokingYears: data.smoking_years,
        smokingPeakTime: data.smoking_peak_time,
        mainGoal: data.main_goal,
        targetDate: data.target_date,
        mainMotivation: data.main_motivation,
        previousAttempts: data.previous_attempts,
        smokingTriggers: data.smoking_triggers,
        smokingSituations: data.smoking_situations,
        onboardingCompleted: data.onboarding_completed,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      } : null;
      
      return { data: profile, error: null };
    } catch (error) {
      console.error('Erreur lors de la récupération du profil:', error);
      return { data: null, error };
    }
  }

  // Synchroniser les paramètres
  static async syncSettings(userId: string, settings: AppSettings) {
    try {
      // D'abord, essayer de récupérer l'enregistrement existant
      const { data: existingData } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', userId) // userId est maintenant l'email // userId est maintenant l'email
        .single();

      if (existingData) {
        // Mettre à jour l'enregistrement existant
        const { data, error } = await supabase
          .from('user_settings')
          .update({
            price_per_cig: settings.pricePerCig,
            currency: settings.currency,
            notifications_allowed: settings.notificationsAllowed,
            language: settings.language,
            animations_enabled: settings.animationsEnabled,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', userId) // userId est maintenant l'email // userId est maintenant l'email
          .select()
          .single();

        if (error) throw error;
        return { data, error: null };
      } else {
        // Créer un nouvel enregistrement
        const { data, error } = await supabase
          .from('user_settings')
          .insert({
            user_id: userId, // userId est maintenant l'email
            price_per_cig: settings.pricePerCig,
            currency: settings.currency,
            notifications_allowed: settings.notificationsAllowed,
            language: settings.language,
            animations_enabled: settings.animationsEnabled,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (error) throw error;
        return { data, error: null };
      }
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
        .eq('user_id', userId) // userId est maintenant l'email
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Erreur détaillée paramètres:', error);
        throw error;
      }
      
      // Convertir les noms de colonnes de snake_case vers camelCase
      const settings: AppSettings = data ? {
        pricePerCig: data.price_per_cig,
        currency: data.currency,
        notificationsAllowed: data.notifications_allowed,
        language: data.language,
        animationsEnabled: data.animations_enabled,
      } : null;
      
      // console.log('Paramètres récupérés:', { data, settings, error });
      return { data: settings, error: null };
    } catch (error) {
      console.error('Erreur lors de la récupération des paramètres:', error);
      return { data: null, error };
    }
  }

  // Synchroniser une seule entrée quotidienne (optimisé)
  static async syncSingleDailyEntry(userId: string, date: string, entry: DailyEntry) {
    try {
      const entryData = {
        user_id: userId,
        date,
        real_cigs: entry.realCigs,
        goal_cigs: entry.goalCigs,
        emotion: entry.emotion,
        objective_met: entry.objectiveMet,
        connected_on_date: entry.connectedOnDate,
        updated_at: new Date().toISOString(),
      };

      // Essayer d'abord un upsert avec gestion de conflit
      const { data, error } = await supabase
        .from('daily_entries')
        .upsert(entryData, { 
          onConflict: 'user_id,date',
          ignoreDuplicates: false 
        })
        .select()
        .single();

      if (error) {
        console.warn(`⚠️ Erreur upsert pour ${date}:`, error.message);
        
        // Si upsert échoue, essayer une mise à jour directe
        const { data: updateData, error: updateError } = await supabase
          .from('daily_entries')
          .update({
            real_cigs: entryData.real_cigs,
            goal_cigs: entryData.goal_cigs,
            emotion: entryData.emotion,
            objective_met: entryData.objective_met,
            updated_at: entryData.updated_at,
          })
          .eq('user_id', userId)
          .eq('date', date)
          .select()
          .single();

        if (updateError) {
          console.error(`❌ Erreur mise à jour pour ${date}:`, updateError);
          // Si la mise à jour échoue aussi, essayer une insertion
          const { data: insertData, error: insertError } = await supabase
            .from('daily_entries')
            .insert(entryData)
            .select()
            .single();
          
          if (insertError) {
            console.error(`❌ Erreur insertion pour ${date}:`, insertError);
            return { data: null, error: insertError };
          } else {
            console.log(`✅ Entrée insérée pour ${date}`);
            return { data: insertData, error: null };
          }
        } else {
          console.log(`✅ Entrée mise à jour pour ${date}`);
          return { data: updateData, error: null };
        }
      } else {
        console.log(`✅ Entrée synchronisée pour ${date}`);
        return { data, error: null };
      }
    } catch (error) {
      console.error(`❌ Erreur de synchronisation pour ${date}:`, error);
      return { data: null, error };
    }
  }

  // Synchroniser les entrées quotidiennes (version optimisée)
  static async syncDailyEntries(userId: string, entries: Record<string, DailyEntry>) {
    try {
      // Traiter chaque entrée individuellement pour éviter les conflits
      const results = [];
      
      for (const [date, entry] of Object.entries(entries)) {
        const result = await this.syncSingleDailyEntry(userId, date, entry);
        if (result.data) {
          results.push(result.data);
        }
      }

      return { data: results, error: null };
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
        .eq('user_id', userId) // userId est maintenant l'email
        .order('date', { ascending: false });

      if (error) throw error;
      
      // Convertir en format Record<string, DailyEntry>
      const entries: Record<string, DailyEntry> = {};
      data?.forEach((entry: any) => {
        entries[entry.date] = {
          realCigs: entry.real_cigs,
          goalCigs: entry.goal_cigs,
          date: entry.date,
          emotion: entry.emotion,
          objectiveMet: entry.objective_met,
          connectedOnDate: entry.connected_on_date,
        };
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
        id: goal.id,
        user_id: userId, // userId est maintenant l'email
        title: goal.title,
        price: goal.price,
        target_date: goal.targetDate,
        created_at: goal.createdAt,
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
        .eq('user_id', userId) // userId est maintenant l'email
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Convertir les noms de colonnes de snake_case vers camelCase
      const goals: FinancialGoal[] = data?.map((goal: any) => ({
        id: goal.id,
        title: goal.title,
        price: goal.price,
        createdAt: goal.created_at,
        targetDate: goal.target_date,
      })) || [];
      
      return { data: goals, error: null };
    } catch (error) {
      console.error('Erreur lors de la récupération des objectifs:', error);
      return { data: null, error };
    }
  }

  // Synchroniser les réalisations
  static async syncAchievements(userId: string, achievements: Achievement[]) {
    try {
      const achievementsWithUserId = achievements.map(achievement => ({
        id: achievement.id,
        user_id: userId, // userId est maintenant l'email
        title: achievement.title,
        description: achievement.description,
        icon: achievement.icon,
        unlocked_at: achievement.unlockedAt,
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
        .eq('user_id', userId) // userId est maintenant l'email
        .order('unlocked_at', { ascending: false });

      if (error) throw error;
      
      // Convertir les noms de colonnes de snake_case vers camelCase
      const achievements: Achievement[] = data?.map((achievement: any) => ({
        id: achievement.id,
        title: achievement.title,
        description: achievement.description,
        icon: achievement.icon,
        unlockedAt: achievement.unlocked_at,
      })) || [];
      
      return { data: achievements, error: null };
    } catch (error) {
      console.error('Erreur lors de la récupération des réalisations:', error);
      return { data: null, error };
    }
  }

  // Synchroniser la série (streak)
  static async syncStreak(userId: string, streak: StreakData) {
    try {
      // Valider et nettoyer la date
      const lastDateConnected = streak.lastDateConnected && streak.lastDateConnected.trim() !== '' 
        ? streak.lastDateConnected 
        : new Date().toISOString().split('T')[0]; // Date du jour si vide

      // D'abord, essayer de récupérer l'enregistrement existant
      const { data: existingData } = await supabase
        .from('user_streaks')
        .select('*')
        .eq('user_id', userId) // userId est maintenant l'email
        .single();

      if (existingData) {
        // Mettre à jour l'enregistrement existant
        const { data, error } = await supabase
          .from('user_streaks')
          .update({
            last_date_connected: lastDateConnected,
            current_streak: streak.currentStreak,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', userId) // userId est maintenant l'email // userId est maintenant l'email
          .select()
          .single();

        if (error) throw error;
        return { data, error: null };
      } else {
        // Créer un nouvel enregistrement
        const { data, error } = await supabase
          .from('user_streaks')
          .insert({
            user_id: userId, // userId est maintenant l'email
            last_date_connected: lastDateConnected,
            current_streak: streak.currentStreak,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (error) throw error;
        return { data, error: null };
      }
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
        .eq('user_id', userId) // userId est maintenant l'email
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Erreur détaillée série:', error);
        throw error;
      }
      
      // Convertir les noms de colonnes de snake_case vers camelCase
      const streak: StreakData = data ? {
        lastDateConnected: data.last_date_connected,
        currentStreak: data.current_streak,
      } : null;
      
      // console.log('Série récupérée:', { data, streak, error });
      return { data: streak, error: null };
    } catch (error) {
      console.error('Erreur lors de la récupération de la série:', error);
      return { data: null, error };
    }
  }

  // Synchroniser les bienfaits santé
  static async syncHealthBenefits(userId: string, benefits: HealthBenefit[]) {
    try {
      const benefitsWithUserId = benefits.map(benefit => ({
        id: benefit.id,
        user_id: userId, // userId est maintenant l'email
        title: benefit.title,
        description: benefit.description,
        time_required: benefit.timeRequired,
        unlocked: benefit.unlocked,
        unlocked_at: benefit.unlockedAt,
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
        .eq('user_id', userId) // userId est maintenant l'email
        .order('time_required', { ascending: true });

      if (error) throw error;
      
      // Convertir les noms de colonnes de snake_case vers camelCase
      const benefits: HealthBenefit[] = data?.map((benefit: any) => ({
        id: benefit.id,
        title: benefit.title,
        description: benefit.description,
        timeRequired: benefit.time_required,
        unlocked: benefit.unlocked,
        unlockedAt: benefit.unlocked_at,
        userId: benefit.user_id,
      })) || [];
      
      return { data: benefits, error: null };
    } catch (error) {
      console.error('Erreur lors de la récupération des bienfaits santé:', error);
      return { data: null, error };
    }
  }

  // Synchroniser la session du chrono
  static async syncTimerSession(userId: string, session: TimerSession) {
    try {
      const { data, error } = await supabase
        .from('user_timer_sessions')
        .upsert({
          user_id: userId, // userId est maintenant l'email
          is_running: session.isRunning,
          start_timestamp: session.startTimestamp,
          elapsed_before_pause: session.elapsedBeforePause,
          updated_at: new Date().toISOString(),
        }, { 
          onConflict: 'user_id' // Spécifier la colonne de conflit
        })
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Erreur lors de la synchronisation de la session:', error);
      return { data: null, error };
    }
  }

  // Récupérer la session du chrono
  static async getTimerSession(userId: string) {
    try {
      const { data, error } = await supabase
        .from('user_timer_sessions')
        .select('*')
        .eq('user_id', userId) // userId est maintenant l'email
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Erreur détaillée session chrono:', error);
        throw error;
      }
      
      // Convertir les noms de colonnes de snake_case vers camelCase
      const session: TimerSession = data ? {
        isRunning: data.is_running,
        startTimestamp: data.start_timestamp,
        elapsedBeforePause: data.elapsed_before_pause,
      } : {
        isRunning: false,
        startTimestamp: null,
        elapsedBeforePause: 0,
      };
      
      console.log('Session chrono récupérée:', { data, session, error });
      return { data: session, error: null };
    } catch (error) {
      console.error('Erreur lors de la récupération de la session:', error);
      return { data: null, error };
    }
  }

  // Synchroniser les statistiques de panique
  static async syncPanicStats(userId: string, stats: PanicStats) {
    try {
      // D'abord, essayer de récupérer l'enregistrement existant
      const { data: existingData } = await supabase
        .from('user_panic_stats')
        .select('*')
        .eq('user_id', userId) // userId est maintenant l'email
        .single();

      if (existingData) {
        // Mettre à jour l'enregistrement existant
        const { data, error } = await supabase
          .from('user_panic_stats')
          .update({
            panic_count: stats.panicCount,
            success_count: stats.successCount,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', userId) // userId est maintenant l'email
          .select()
          .single();

        if (error) throw error;
        return { data, error: null };
      } else {
        // Créer un nouvel enregistrement
        const { data, error } = await supabase
          .from('user_panic_stats')
          .insert({
            user_id: userId, // userId est maintenant l'email
            panic_count: stats.panicCount,
            success_count: stats.successCount,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (error) throw error;
        return { data, error: null };
      }
    } catch (error) {
      console.error('Erreur lors de la synchronisation des stats panique:', error);
      return { data: null, error };
    }
  }

  // Récupérer les statistiques de panique
  static async getPanicStats(userId: string) {
    try {
      const { data, error } = await supabase
        .from('user_panic_stats')
        .select('*')
        .eq('user_id', userId) // userId est maintenant l'email
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Erreur détaillée stats panique:', error);
        throw error;
      }
      
      // Convertir les noms de colonnes de snake_case vers camelCase
      const stats: PanicStats = data ? {
        panicCount: data.panic_count,
        successCount: data.success_count,
      } : null;
      
      console.log('Stats panique récupérées:', { data, stats, error });
      return { data: stats, error: null };
    } catch (error) {
      console.error('Erreur lors de la récupération des stats panique:', error);
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
    session: TimerSession;
    panicStats: PanicStats;
  }) {
    try {
      await Promise.all([
        this.syncUserProfile(userId, appData.profile),
        this.syncSettings(userId, appData.settings),
        this.syncDailyEntries(userId, appData.dailyEntries),
        this.syncFinancialGoals(userId, appData.goals),
        this.syncAchievements(userId, appData.achievements),
        this.syncStreak(userId, appData.streak),
        this.syncTimerSession(userId, appData.session),
        this.syncPanicStats(userId, appData.panicStats),
      ]);

      return { success: true, error: null };
    } catch (error) {
      console.error('Erreur lors de la synchronisation complète:', error);
      return { success: false, error };
    }
  }

  // Synchroniser les validations de plan de sevrage
  static async syncPlanValidations(userId: string, validations: Record<string, PlanValidation[]>) {
    try {
      console.log('💾 Synchronisation des validations de plan pour:', userId);
      
      // Supprimer toutes les validations existantes pour cet utilisateur
      const { error: deleteError } = await supabase
        .from('plan_validations')
        .delete()
        .eq('user_id', userId);

      if (deleteError) {
        console.warn('⚠️ Erreur lors de la suppression des validations existantes:', deleteError);
      }

      // Insérer toutes les nouvelles validations
      const validationsToInsert = [];
      for (const [planId, planValidations] of Object.entries(validations)) {
        for (const validation of planValidations) {
          validationsToInsert.push({
            user_id: userId,
            plan_id: validation.planId,
            day_number: validation.dayNumber,
            validated_date: validation.validatedDate,
          });
        }
      }

      if (validationsToInsert.length > 0) {
        const { data, error } = await supabase
          .from('plan_validations')
          .insert(validationsToInsert)
          .select();

        if (error) throw error;
        console.log(`✅ ${validationsToInsert.length} validations de plan synchronisées`);
      }

      return { data: validationsToInsert, error: null };
    } catch (error) {
      console.error('Erreur lors de la synchronisation des validations de plan:', error);
      return { data: null, error };
    }
  }

  // Récupérer les validations de plan de sevrage
  static async getPlanValidations(userId: string) {
    try {
      const { data, error } = await supabase
        .from('plan_validations')
        .select('*')
        .eq('user_id', userId)
        .order('validated_date', { ascending: true });

      if (error) throw error;

      // Transformer les données en format attendu par l'app
      const validations: Record<string, PlanValidation[]> = {};
      if (data) {
        for (const row of data) {
          if (!validations[row.plan_id]) {
            validations[row.plan_id] = [];
          }
          validations[row.plan_id].push({
            dayNumber: row.day_number,
            validatedDate: row.validated_date,
            planId: row.plan_id,
          });
        }
      }

      return { data: validations, error: null };
    } catch (error) {
      console.error('Erreur lors de la récupération des validations de plan:', error);
      return { data: null, error };
    }
  }
}
