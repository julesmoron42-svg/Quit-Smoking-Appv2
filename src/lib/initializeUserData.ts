import { supabase } from './supabase';
import { getCurrentUserId } from './storage';

// Fonction pour initialiser les données utilisateur par défaut
export const initializeUserData = async () => {
  console.log('🚀 Initialisation des données utilisateur...');
  
  try {
    const userId = await getCurrentUserId();
    
    if (!userId) {
      console.log('❌ Aucun utilisateur connecté');
      return;
    }

    console.log('📧 Initialisation pour l\'utilisateur:', userId);

    // 1. Vérifier et créer les paramètres par défaut
    const { data: existingSettings, error: settingsError } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (settingsError && settingsError.code === 'PGRST116') {
      // Pas de paramètres, créer les paramètres par défaut
      console.log('⚙️ Création des paramètres par défaut...');
      
      const defaultSettings = {
        user_id: userId,
        price_per_cig: 0.6,
        currency: '€',
        notifications_allowed: true,
        language: 'fr',
        animations_enabled: true,
      };

      const { data: newSettings, error: createSettingsError } = await supabase
        .from('user_settings')
        .insert(defaultSettings)
        .select()
        .single();

      if (createSettingsError) {
        console.error('❌ Erreur création paramètres:', createSettingsError);
      } else {
        console.log('✅ Paramètres par défaut créés:', newSettings);
      }
    } else if (settingsError) {
      console.error('❌ Erreur vérification paramètres:', settingsError);
    } else {
      console.log('✅ Paramètres existants trouvés:', existingSettings);
    }

    // 2. Vérifier et créer la série par défaut
    const { data: existingStreak, error: streakError } = await supabase
      .from('user_streaks')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (streakError && streakError.code === 'PGRST116') {
      // Pas de série, créer la série par défaut
      console.log('🏃 Création de la série par défaut...');
      
      const defaultStreak = {
        user_id: userId,
        last_date_connected: new Date().toISOString().split('T')[0], // Date du jour
        current_streak: 0,
      };

      const { data: newStreak, error: createStreakError } = await supabase
        .from('user_streaks')
        .insert(defaultStreak)
        .select()
        .single();

      if (createStreakError) {
        console.error('❌ Erreur création série:', createStreakError);
      } else {
        console.log('✅ Série par défaut créée:', newStreak);
      }
    } else if (streakError) {
      console.error('❌ Erreur vérification série:', streakError);
    } else {
      console.log('✅ Série existante trouvée:', existingStreak);
    }

    console.log('✅ Initialisation terminée');

  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation:', error);
  }
};

// Fonction pour vérifier et corriger les données utilisateur
export const checkAndFixUserData = async () => {
  console.log('🔍 Vérification et correction des données utilisateur...');
  
  try {
    const userId = await getCurrentUserId();
    
    if (!userId) {
      console.log('❌ Aucun utilisateur connecté');
      return;
    }

    // Vérifier toutes les tables
    const tables = ['user_profiles', 'user_settings', 'user_streaks', 'daily_entries', 'financial_goals', 'achievements'];
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .eq(table === 'user_profiles' ? 'id' : 'user_id', userId)
          .limit(1);

        if (error) {
          console.error(`❌ Erreur table ${table}:`, error);
        } else {
          console.log(`✅ Table ${table}: ${data?.length || 0} enregistrement(s)`);
        }
      } catch (tableError) {
        console.error(`❌ Erreur accès table ${table}:`, tableError);
      }
    }

  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error);
  }
};
