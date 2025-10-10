import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// Clés Supabase configurées
const supabaseUrl = 'https://hdaqsjulitpzckaphujg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhkYXFzanVsaXRwemNrYXBodWpnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwOTkxOTgsImV4cCI6MjA3NTY3NTE5OH0.GlKNemwZoiISXiayFDg0KFaRt6NHD1doE3UdtYyNw6M';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
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
