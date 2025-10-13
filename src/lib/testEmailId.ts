import { supabase } from './supabase';
import { getCurrentUserId } from './storage';

// Script de test pour vérifier que l'email est utilisé comme user ID
export const testEmailIdConfiguration = async () => {
  console.log('🧪 Test de la configuration Email ID...');
  
  try {
    // 1. Vérifier la session actuelle
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('❌ Erreur de session:', sessionError);
      return false;
    }
    
    if (!session?.user) {
      console.log('⚠️ Aucun utilisateur connecté');
      return false;
    }
    
    console.log('✅ Session récupérée');
    console.log('📧 Email utilisateur:', session.user.email);
    console.log('🆔 UUID utilisateur:', session.user.id);
    
    // 2. Tester getCurrentUserId
    const userId = await getCurrentUserId();
    console.log('🔍 getCurrentUserId() retourne:', userId);
    
    if (userId !== session.user.email) {
      console.error('❌ getCurrentUserId() ne retourne pas l\'email');
      return false;
    }
    
    console.log('✅ getCurrentUserId() fonctionne correctement');
    
    // 3. Tester l'accès aux données avec l'email
    if (userId) {
      // Tester l'accès au profil utilisateur
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (profileError && profileError.code !== 'PGRST116') {
        console.error('❌ Erreur accès profil:', profileError);
        return false;
      }
      
      console.log('✅ Accès au profil utilisateur réussi');
      
      // Tester l'accès aux paramètres
      const { data: settings, error: settingsError } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (settingsError && settingsError.code !== 'PGRST116') {
        console.error('❌ Erreur accès paramètres:', settingsError);
        return false;
      }
      
      console.log('✅ Accès aux paramètres utilisateur réussi');
    }
    
    // 4. Tester les politiques RLS
    console.log('🔒 Test des politiques RLS...');
    
    // Essayer d'accéder aux données d'un autre utilisateur (devrait échouer)
    const { data: otherUserData, error: otherUserError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', 'autre@email.com')
      .single();
    
    if (otherUserError && otherUserError.code === 'PGRST116') {
      console.log('✅ Politiques RLS fonctionnent (accès refusé aux autres utilisateurs)');
    } else if (otherUserData) {
      console.error('❌ Problème de sécurité : accès aux données d\'un autre utilisateur');
      return false;
    }
    
    console.log('🎉 Tous les tests sont passés avec succès !');
    console.log('📋 Résumé :');
    console.log('   - Email utilisé comme user ID:', userId);
    console.log('   - Accès aux données utilisateur : OK');
    console.log('   - Politiques RLS : OK');
    
    return true;
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
    return false;
  }
};

// Fonction pour tester la création d'un profil avec l'email
export const testCreateProfileWithEmail = async () => {
  console.log('🧪 Test de création de profil avec email...');
  
  try {
    const userId = await getCurrentUserId();
    
    if (!userId) {
      console.log('⚠️ Aucun utilisateur connecté');
      return false;
    }
    
    // Créer un profil de test
    const testProfile = {
      id: userId, // Utiliser l'email comme ID
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
      return false;
    }
    
    console.log('✅ Profil créé avec succès');
    console.log('📊 Données du profil:', data);
    
    return true;
    
  } catch (error) {
    console.error('❌ Erreur lors du test de création:', error);
    return false;
  }
};

// Fonction pour nettoyer les données de test
export const cleanupTestData = async () => {
  console.log('🧹 Nettoyage des données de test...');
  
  try {
    const userId = await getCurrentUserId();
    
    if (!userId) {
      console.log('⚠️ Aucun utilisateur connecté');
      return false;
    }
    
    // Supprimer le profil de test
    const { error } = await supabase
      .from('user_profiles')
      .delete()
      .eq('id', userId);
    
    if (error) {
      console.error('❌ Erreur suppression profil:', error);
      return false;
    }
    
    console.log('✅ Données de test nettoyées');
    return true;
    
  } catch (error) {
    console.error('❌ Erreur lors du nettoyage:', error);
    return false;
  }
};
