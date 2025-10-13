// Script de test pour vérifier la synchronisation des données par utilisateur
import { supabase } from './supabase';
import { 
  profileStorage, 
  settingsStorage, 
  dailyEntriesStorage, 
  streakStorage,
  getCurrentUserId,
  syncAllDataWithUser 
} from './storage';

export const testUserDataSync = async () => {
  console.log('🧪 Test de synchronisation des données par utilisateur');
  
  try {
    // 1. Vérifier l'utilisateur connecté
    const userId = await getCurrentUserId();
    console.log('👤 Utilisateur connecté:', userId ? `Oui (${userId})` : 'Non');
    
    if (!userId) {
      console.log('❌ Aucun utilisateur connecté - test ignoré');
      return;
    }
    
    // 2. Test de connexion Supabase
    console.log('🔍 Test de connexion Supabase...');
    try {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.error('❌ Erreur de connexion Supabase:', error);
        return;
      }
      console.log('✅ Connexion Supabase OK');
    } catch (error) {
      console.error('❌ Erreur de connexion Supabase:', error);
      return;
    }
    
    // 3. Charger les données locales
    console.log('📱 Chargement des données locales...');
    const [localProfile, localSettings, localEntries, localStreak] = await Promise.all([
      profileStorage.get(),
      settingsStorage.get(),
      dailyEntriesStorage.get(),
      streakStorage.get(),
    ]);
    
    console.log('📊 Données locales:');
    console.log('  - Profil:', localProfile ? '✅' : '❌', localProfile);
    console.log('  - Paramètres:', localSettings ? '✅' : '❌', localSettings);
    console.log('  - Entrées:', Object.keys(localEntries).length, 'entrées');
    console.log('  - Série:', localStreak.currentStreak, 'jours');
    
    // 4. Test de synchronisation manuelle
    console.log('🔄 Test de synchronisation manuelle...');
    try {
      await syncAllDataWithUser();
      console.log('✅ Synchronisation manuelle réussie');
    } catch (error) {
      console.error('❌ Erreur de synchronisation manuelle:', error);
    }
    
    console.log('✅ Test de synchronisation terminé');
    
  } catch (error) {
    console.error('❌ Erreur lors du test de synchronisation:', error);
  }
};

// Fonction pour simuler un changement d'utilisateur
export const simulateUserChange = async () => {
  console.log('🔄 Simulation d\'un changement d\'utilisateur...');
  
  // Simuler une déconnexion
  console.log('🚪 Déconnexion simulée...');
  await supabase.auth.signOut();
  
  // Attendre un peu
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Simuler une reconnexion (nécessite des identifiants valides)
  console.log('🔑 Reconnexion simulée...');
  // Note: En production, il faudrait des identifiants réels
  
  console.log('✅ Simulation terminée');
};
