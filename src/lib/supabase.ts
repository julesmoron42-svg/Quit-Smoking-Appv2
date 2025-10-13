import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

// Clés Supabase configurées
const supabaseUrl = 'https://hdaqsjulitpzckaphujg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhkYXFzanVsaXRwemNrYXBodWpnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwOTkxOTgsImV4cCI6MjA3NTY3NTE5OH0.GlKNemwZoiISXiayFDg0KFaRt6NHD1doE3UdtYyNw6M';

// Configuration adaptée selon la plateforme
const authConfig = Platform.OS === 'web' 
  ? {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    }
  : {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    };

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: authConfig,
});

// Types pour l'authentification
export interface AuthUser {
  id: string;
  email: string;
  created_at: string;
}

export interface AuthError {
  message: string;
  status?: number;
}
