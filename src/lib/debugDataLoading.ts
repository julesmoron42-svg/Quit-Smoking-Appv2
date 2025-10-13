import { supabase } from './supabase';
import { getCurrentUserId, forceLoadAllDataFromSupabase } from './storage';
import { DataSyncService } from './dataSync';

// Script de debug pour diagnostiquer les problèmes de chargement des données
export const debugDataLoading = async () => {
  console.log('🔍 === DEBUG CHARGEMENT DES DONNÉES ===');
  
  try {
    // 1. Vérifier la session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('❌ Erreur de session:', sessionError);
      return;
    }
    
    if (!session?.user) {
      console.log('⚠️ Aucun utilisateur connecté');
      return;
    }
    
    console.log('✅ Session OK');
    console.log('📧 Email utilisateur:', session.user.email);
    console.log('🆔 UUID utilisateur:', session.user.id);
    
    // 2. Tester getCurrentUserId
    const userId = await getCurrentUserId();
    console.log('🔍 getCurrentUserId() retourne:', userId);
    
    if (!userId) {
      console.error('❌ getCurrentUserId() retourne null');
      return;
    }
    
    // 3. Tester l'accès direct aux données Supabase
    console.log('🧪 Test d\'accès direct aux données Supabase...');
    
    // Test profil
    const { data: profileData, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    console.log('📊 Profil:');
    console.log('  - Données:', profileData);
    console.log('  - Erreur:', profileError);
    
    // Test paramètres
    const { data: settingsData, error: settingsError } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    console.log('⚙️ Paramètres:');
    console.log('  - Données:', settingsData);
    console.log('  - Erreur:', settingsError);
    
    // Test entrées quotidiennes
    const { data: entriesData, error: entriesError } = await supabase
      .from('daily_entries')
      .select('*')
      .eq('user_id', userId)
      .limit(5);
    
    console.log('📅 Entrées quotidiennes (5 premières):');
    console.log('  - Données:', entriesData);
    console.log('  - Erreur:', entriesError);
    
    // 4. Tester DataSyncService
    console.log('🔄 Test DataSyncService...');
    
    const profileResult = await DataSyncService.getUserProfile(userId);
    console.log('📊 DataSyncService.getUserProfile:');
    console.log('  - Données:', profileResult.data);
    console.log('  - Erreur:', profileResult.error);
    
    const settingsResult = await DataSyncService.getSettings(userId);
    console.log('⚙️ DataSyncService.getSettings:');
    console.log('  - Données:', settingsResult.data);
    console.log('  - Erreur:', settingsResult.error);
    
    // 5. Tester le chargement forcé
    console.log('🚀 Test du chargement forcé...');
    await forceLoadAllDataFromSupabase();
    
    // 6. Vérifier les données locales après chargement
    console.log('💾 Vérification des données locales...');
    
    const { storage } = await import('./storage');
    const localProfile = await storage.get('@MyQuitZone:profile', null);
    const localSettings = await storage.get('@MyQuitZone:settings', null);
    const localEntries = await storage.get('@MyQuitZone:dailyEntries', null);
    
    console.log('📱 Données locales:');
    console.log('  - Profil:', localProfile);
    console.log('  - Paramètres:', localSettings);
    console.log('  - Entrées:', Object.keys(localEntries || {}).length, 'entrées');
    
    console.log('✅ Debug terminé');
    
  } catch (error) {
    console.error('❌ Erreur lors du debug:', error);
  }
};

// Fonction pour tester la création d'un profil de test
export const createTestProfile = async () => {
  console.log('🧪 Création d\'un profil de test...');
  
  try {
    const userId = await getCurrentUserId();
    
    if (!userId) {
      console.log('❌ Aucun utilisateur connecté');
      return;
    }
    
    const testProfile = {
      id: userId,
      started_smoking_years: 5,
      cigs_per_day: 20,
      objective_type: 'complete',
      onboarding_completed: true,
    };
    
    const { data, error } = await supabase
      .from('user_profiles')
      .upsert(testProfile)
      .select()
      .single();
    
    if (error) {
      console.error('❌ Erreur création profil:', error);
      return;
    }
    
    console.log('✅ Profil de test créé:', data);
    
    // Tester immédiatement le chargement
    console.log('🔄 Test de chargement immédiat...');
    await forceLoadAllDataFromSupabase();
    
  } catch (error) {
    console.error('❌ Erreur lors de la création du profil de test:', error);
  }
};

// Fonction pour nettoyer les données de test
export const cleanupTestData = async () => {
  console.log('🧹 Nettoyage des données de test...');
  
  try {
    const userId = await getCurrentUserId();
    
    if (!userId) {
      console.log('❌ Aucun utilisateur connecté');
      return;
    }
    
    // Supprimer le profil de test
    const { error } = await supabase
      .from('user_profiles')
      .delete()
      .eq('id', userId);
    
    if (error) {
      console.error('❌ Erreur suppression profil:', error);
      return;
    }
    
    console.log('✅ Données de test nettoyées');
    
  } catch (error) {
    console.error('❌ Erreur lors du nettoyage:', error);
  }
};
