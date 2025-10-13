// Script de test pour vérifier la connexion Supabase
import { supabase } from './supabase';

export const testSupabaseConnection = async () => {
  console.log('🔍 Test de connexion Supabase...');
  
  try {
    // Test 1: Vérifier l'URL et la clé
    console.log('📡 URL Supabase:', supabase.supabaseUrl);
    console.log('🔑 Clé anonyme:', supabase.supabaseKey ? '✅ Présente' : '❌ Manquante');
    
    // Test 2: Vérifier l'utilisateur connecté
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) {
      console.error('❌ Erreur de récupération utilisateur:', userError);
    } else {
      console.log('👤 Utilisateur connecté:', user ? `Oui (${user.id})` : 'Non');
    }
    
    // Test 3: Vérifier les tables
    console.log('📊 Test des tables...');
    
    try {
      const { data: profiles, error: profilesError } = await supabase
        .from('user_profiles')
        .select('id')
        .limit(1);
      
      if (profilesError) {
        console.error('❌ Erreur table user_profiles:', profilesError);
      } else {
        console.log('✅ Table user_profiles accessible');
      }
    } catch (error) {
      console.error('❌ Erreur accès user_profiles:', error);
    }
    
    try {
      const { data: settings, error: settingsError } = await supabase
        .from('user_settings')
        .select('id')
        .limit(1);
      
      if (settingsError) {
        console.error('❌ Erreur table user_settings:', settingsError);
      } else {
        console.log('✅ Table user_settings accessible');
      }
    } catch (error) {
      console.error('❌ Erreur accès user_settings:', error);
    }
    
    try {
      const { data: entries, error: entriesError } = await supabase
        .from('daily_entries')
        .select('id')
        .limit(1);
      
      if (entriesError) {
        console.error('❌ Erreur table daily_entries:', entriesError);
      } else {
        console.log('✅ Table daily_entries accessible');
      }
    } catch (error) {
      console.error('❌ Erreur accès daily_entries:', error);
    }
    
    try {
      const { data: streaks, error: streaksError } = await supabase
        .from('user_streaks')
        .select('id')
        .limit(1);
      
      if (streaksError) {
        console.error('❌ Erreur table user_streaks:', streaksError);
      } else {
        console.log('✅ Table user_streaks accessible');
      }
    } catch (error) {
      console.error('❌ Erreur accès user_streaks:', error);
    }
    
    console.log('✅ Test de connexion terminé');
    
  } catch (error) {
    console.error('❌ Erreur générale de connexion:', error);
  }
};

